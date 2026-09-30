import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CryptoService } from '../../common/crypto.service';
import { AuditService } from '../audit/audit.service';
import { AuthException, ForbiddenException, ConflictException } from '../../common/exceptions';
import * as jwt from 'jsonwebtoken';
import { RegisterDto, LoginDto, RefreshDto, StepUpDto, ConnectWalletDto } from './auth.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly audit: AuditService
  ) {}

  async register(dto: RegisterDto, ipAddress?: string, correlationId?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('USER_EXISTS', 'Email address is already registered');
    }

    const passwordHash = await this.crypto.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        profile: {
          create: {
            fullName: dto.fullName,
            phone: dto.phone,
          },
        },
      },
      include: { profile: true },
    });

    await this.audit.logEvent({
      actorId: user.id,
      eventType: 'USER_REGISTERED',
      resourceType: 'USER',
      resourceId: user.id,
      ipAddress,
      correlationId,
    });

    return { id: user.id, email: user.email, profile: user.profile };
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string, correlationId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true, memberships: true },
    });

    if (!user) {
      await this.audit.logEvent({
        eventType: 'LOGIN_FAILURE',
        resourceType: 'AUTH',
        resourceId: dto.email,
        metadata: { reason: 'USER_NOT_FOUND' },
        ipAddress,
        correlationId,
      });
      throw new AuthException('AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.audit.logSecurityEvent('HIGH', 'LOGIN_LOCKED', `Attempt on locked account ${dto.email}`, user.id, ipAddress);
      throw new ForbiddenException('ACCOUNT_LOCKED', 'Account is temporarily locked due to multiple failed login attempts');
    }

    const isMatch = await this.crypto.verifyPassword(user.passwordHash, dto.password);
    if (!isMatch) {
      const failedCount = user.failedLogins + 1;
      const lockedUntil = failedCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLogins: failedCount, lockedUntil },
      });

      await this.audit.logEvent({
        actorId: user.id,
        eventType: 'LOGIN_FAILURE',
        resourceType: 'AUTH',
        resourceId: user.id,
        metadata: { failedLogins: failedCount },
        ipAddress,
        correlationId,
      });

      if (lockedUntil) {
        await this.audit.logSecurityEvent('HIGH', 'ACCOUNT_LOCKOUT', `Account ${dto.email} locked`, user.id, ipAddress);
      }

      throw new AuthException('AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Reset failed attempts
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: 0, lockedUntil: null },
    });

    // Generate tokens
    const accessSecret = process.env.JWT_ACCESS_SECRET || 'decentrawill_jwt_access_secret_super_secure_key_12345';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'decentrawill_jwt_refresh_secret_super_secure_key_67890';

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, roles: user.memberships.map((m) => m.role) },
      accessSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { sub: user.id, jti: uuidv4() },
      refreshSecret,
      { expiresIn: '7d' }
    );

    // Save session
    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await this.audit.logEvent({
      actorId: user.id,
      eventType: 'LOGIN_SUCCESS',
      resourceType: 'AUTH',
      resourceId: user.id,
      ipAddress,
      correlationId,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
        memberships: user.memberships,
      },
    };
  }

  async refresh(dto: RefreshDto) {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'decentrawill_jwt_refresh_secret_super_secure_key_67890';
    let payload: any;
    try {
      payload = jwt.verify(dto.refreshToken, refreshSecret);
    } catch {
      throw new AuthException('AUTH_INVALID_CREDENTIALS', 'Invalid or expired refresh token');
    }

    const session = await this.prisma.session.findUnique({
      where: { refreshToken: dto.refreshToken },
      include: { user: { include: { memberships: true } } },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new AuthException('AUTH_INVALID_CREDENTIALS', 'Session revoked or expired');
    }

    // Token rotation
    const accessSecret = process.env.JWT_ACCESS_SECRET || 'decentrawill_jwt_access_secret_super_secure_key_12345';
    const newAccessToken = jwt.sign(
      { sub: session.user.id, email: session.user.email, roles: session.user.memberships.map((m) => m.role) },
      accessSecret,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { sub: session.user.id, jti: uuidv4() },
      refreshSecret,
      { expiresIn: '7d' }
    );

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(token: string) {
    await this.prisma.session.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
    return { success: true };
  }

  async stepUp(userId: string, dto: StepUpDto, ipAddress?: string, correlationId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AuthException('AUTH_INVALID_CREDENTIALS', 'User not found');

    const isMatch = await this.crypto.verifyPassword(user.passwordHash, dto.verificationProof);
    if (!isMatch) {
      await this.audit.logSecurityEvent('MEDIUM', 'STEP_UP_FAILED', `Step-up auth failed for user ${userId}`, userId, ipAddress);
      throw new AuthException('AUTH_STEP_UP_REQUIRED', 'Invalid verification proof for step-up authentication');
    }

    const stepUpToken = this.crypto.generateSecureToken(32);
    const stepUpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.userProfile.update({
      where: { userId },
      data: { stepUpToken, stepUpExpiresAt },
    });

    await this.audit.logEvent({
      actorId: userId,
      eventType: 'STEP_UP_AUTHENTICATED',
      resourceType: 'AUTH',
      resourceId: userId,
      ipAddress,
      correlationId,
    });

    return { stepUpToken, expiresAt: stepUpExpiresAt };
  }

  async connectWallet(userId: string, dto: ConnectWalletDto) {
    // In production or tests, verify that signature matches wallet address
    const identity = await this.prisma.authIdentity.upsert({
      where: { provider_providerId: { provider: 'wallet', providerId: dto.walletAddress.toLowerCase() } },
      update: { walletAddress: dto.walletAddress.toLowerCase() },
      create: {
        userId,
        provider: 'wallet',
        providerId: dto.walletAddress.toLowerCase(),
        walletAddress: dto.walletAddress.toLowerCase(),
      },
    });

    await this.audit.logEvent({
      actorId: userId,
      eventType: 'WALLET_CONNECTED',
      resourceType: 'IDENTITY',
      resourceId: identity.id,
      metadata: { walletAddress: dto.walletAddress },
    });

    return { success: true, walletAddress: dto.walletAddress };
  }
}
