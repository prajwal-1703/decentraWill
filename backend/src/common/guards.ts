import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../database/prisma.service';
import { ROLES_KEY, REQUIRE_STEP_UP_KEY } from './decorators';
import { RoleType } from '@prisma/client';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({ code: 'AUTH_INVALID_CREDENTIALS', message: 'Missing or invalid authorization token' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_ACCESS_SECRET || 'decentrawill_jwt_access_secret_super_secure_key_12345';

    let payload: any;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      throw new UnauthorizedException({ code: 'AUTH_INVALID_CREDENTIALS', message: 'Token expired or invalid' });
    }

    // Verify session in DB
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            profile: true,
            memberships: true,
          },
        },
      },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException({ code: 'AUTH_INVALID_CREDENTIALS', message: 'Session revoked or expired' });
    }

    if (session.user.status === 'LOCKED' || session.user.status === 'SUSPENDED') {
      throw new ForbiddenException({ code: 'ACCESS_DENIED', message: `User account is ${session.user.status.toLowerCase()}` });
    }

    request.user = {
      id: session.user.id,
      email: session.user.email,
      status: session.user.status,
      profile: session.user.profile,
      memberships: session.user.memberships,
      roles: session.user.memberships.map((m) => m.role),
    };

    // Check Step-Up requirement if decorated
    const requireStepUp = this.reflector.getAllAndOverride<boolean>(REQUIRE_STEP_UP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requireStepUp) {
      const stepUpToken = request.headers['x-step-up-token'] as string;
      if (!stepUpToken) {
        throw new ForbiddenException({ code: 'AUTH_STEP_UP_REQUIRED', message: 'Step-up authentication token required' });
      }

      const profile = session.user.profile;
      if (!profile || !profile.stepUpToken || profile.stepUpToken !== stepUpToken || !profile.stepUpExpiresAt || profile.stepUpExpiresAt < new Date()) {
        throw new ForbiddenException({ code: 'AUTH_STEP_UP_EXPIRED', message: 'Step-up proof expired or invalid' });
      }
    }

    // Check Roles requirement if decorated
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      const estateId = request.params.estateId || request.body?.estateId || request.query?.estateId;
      let userRolesInScope: RoleType[] = [];

      if (estateId) {
        userRolesInScope = session.user.memberships
          .filter((m) => m.estateId === estateId && m.status === 'ACTIVE')
          .map((m) => m.role);
      } else {
        userRolesInScope = session.user.memberships.filter((m) => m.status === 'ACTIVE').map((m) => m.role);
      }

      // Check if user is an ADMIN (global role) or has the required role
      const hasRole = requiredRoles.some((role) => userRolesInScope.includes(role));
      if (!hasRole) {
        throw new ForbiddenException({ code: 'ESTATE_ACCESS_DENIED', message: 'Insufficient role permissions for this resource' });
      }
    }

    return true;
  }
}
