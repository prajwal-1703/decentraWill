"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const crypto_service_1 = require("../../common/crypto.service");
const audit_service_1 = require("../audit/audit.service");
const exceptions_1 = require("../../common/exceptions");
const jwt = require("jsonwebtoken");
const uuid_1 = require("uuid");
let AuthService = class AuthService {
    constructor(prisma, crypto, audit) {
        this.prisma = prisma;
        this.crypto = crypto;
        this.audit = audit;
    }
    async register(dto, ipAddress, correlationId) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) {
            throw new exceptions_1.ConflictException('USER_EXISTS', 'Email address is already registered');
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
    async login(dto, userAgent, ipAddress, correlationId) {
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
            throw new exceptions_1.AuthException('AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            await this.audit.logSecurityEvent('HIGH', 'LOGIN_LOCKED', `Attempt on locked account ${dto.email}`, user.id, ipAddress);
            throw new exceptions_1.ForbiddenException('ACCOUNT_LOCKED', 'Account is temporarily locked due to multiple failed login attempts');
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
            throw new exceptions_1.AuthException('AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { failedLogins: 0, lockedUntil: null },
        });
        const accessSecret = process.env.JWT_ACCESS_SECRET || 'decentrawill_jwt_access_secret_super_secure_key_12345';
        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'decentrawill_jwt_refresh_secret_super_secure_key_67890';
        const accessToken = jwt.sign({ sub: user.id, email: user.email, roles: user.memberships.map((m) => m.role) }, accessSecret, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ sub: user.id, jti: (0, uuid_1.v4)() }, refreshSecret, { expiresIn: '7d' });
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
    async refresh(dto) {
        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'decentrawill_jwt_refresh_secret_super_secure_key_67890';
        let payload;
        try {
            payload = jwt.verify(dto.refreshToken, refreshSecret);
        }
        catch {
            throw new exceptions_1.AuthException('AUTH_INVALID_CREDENTIALS', 'Invalid or expired refresh token');
        }
        const session = await this.prisma.session.findUnique({
            where: { refreshToken: dto.refreshToken },
            include: { user: { include: { memberships: true } } },
        });
        if (!session || session.isRevoked || session.expiresAt < new Date()) {
            throw new exceptions_1.AuthException('AUTH_INVALID_CREDENTIALS', 'Session revoked or expired');
        }
        const accessSecret = process.env.JWT_ACCESS_SECRET || 'decentrawill_jwt_access_secret_super_secure_key_12345';
        const newAccessToken = jwt.sign({ sub: session.user.id, email: session.user.email, roles: session.user.memberships.map((m) => m.role) }, accessSecret, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign({ sub: session.user.id, jti: (0, uuid_1.v4)() }, refreshSecret, { expiresIn: '7d' });
        await this.prisma.session.update({
            where: { id: session.id },
            data: {
                token: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
    async logout(token) {
        await this.prisma.session.updateMany({
            where: { token },
            data: { isRevoked: true },
        });
        return { success: true };
    }
    async stepUp(userId, dto, ipAddress, correlationId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new exceptions_1.AuthException('AUTH_INVALID_CREDENTIALS', 'User not found');
        const isMatch = await this.crypto.verifyPassword(user.passwordHash, dto.verificationProof);
        if (!isMatch) {
            await this.audit.logSecurityEvent('MEDIUM', 'STEP_UP_FAILED', `Step-up auth failed for user ${userId}`, userId, ipAddress);
            throw new exceptions_1.AuthException('AUTH_STEP_UP_REQUIRED', 'Invalid verification proof for step-up authentication');
        }
        const stepUpToken = this.crypto.generateSecureToken(32);
        const stepUpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
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
    async connectWallet(userId, dto) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        crypto_service_1.CryptoService,
        audit_service_1.AuditService])
], AuthService);
//# sourceMappingURL=auth.service.js.map