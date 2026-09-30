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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt = require("jsonwebtoken");
const prisma_service_1 = require("../database/prisma.service");
const decorators_1 = require("./decorators");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(prisma, reflector) {
        this.prisma = prisma;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException({ code: 'AUTH_INVALID_CREDENTIALS', message: 'Missing or invalid authorization token' });
        }
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_ACCESS_SECRET || 'decentrawill_jwt_access_secret_super_secure_key_12345';
        let payload;
        try {
            payload = jwt.verify(token, secret);
        }
        catch (err) {
            throw new common_1.UnauthorizedException({ code: 'AUTH_INVALID_CREDENTIALS', message: 'Token expired or invalid' });
        }
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
            throw new common_1.UnauthorizedException({ code: 'AUTH_INVALID_CREDENTIALS', message: 'Session revoked or expired' });
        }
        if (session.user.status === 'LOCKED' || session.user.status === 'SUSPENDED') {
            throw new common_1.ForbiddenException({ code: 'ACCESS_DENIED', message: `User account is ${session.user.status.toLowerCase()}` });
        }
        request.user = {
            id: session.user.id,
            email: session.user.email,
            status: session.user.status,
            profile: session.user.profile,
            memberships: session.user.memberships,
            roles: session.user.memberships.map((m) => m.role),
        };
        const requireStepUp = this.reflector.getAllAndOverride(decorators_1.REQUIRE_STEP_UP_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (requireStepUp) {
            const stepUpToken = request.headers['x-step-up-token'];
            if (!stepUpToken) {
                throw new common_1.ForbiddenException({ code: 'AUTH_STEP_UP_REQUIRED', message: 'Step-up authentication token required' });
            }
            const profile = session.user.profile;
            if (!profile || !profile.stepUpToken || profile.stepUpToken !== stepUpToken || !profile.stepUpExpiresAt || profile.stepUpExpiresAt < new Date()) {
                throw new common_1.ForbiddenException({ code: 'AUTH_STEP_UP_EXPIRED', message: 'Step-up proof expired or invalid' });
            }
        }
        const requiredRoles = this.reflector.getAllAndOverride(decorators_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (requiredRoles && requiredRoles.length > 0) {
            const estateId = request.params.estateId || request.body?.estateId || request.query?.estateId;
            let userRolesInScope = [];
            if (estateId) {
                userRolesInScope = session.user.memberships
                    .filter((m) => m.estateId === estateId && m.status === 'ACTIVE')
                    .map((m) => m.role);
            }
            else {
                userRolesInScope = session.user.memberships.filter((m) => m.status === 'ACTIVE').map((m) => m.role);
            }
            const hasRole = requiredRoles.some((role) => userRolesInScope.includes(role));
            if (!hasRole) {
                throw new common_1.ForbiddenException({ code: 'ESTATE_ACCESS_DENIED', message: 'Insufficient role permissions for this resource' });
            }
        }
        return true;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        core_1.Reflector])
], JwtAuthGuard);
//# sourceMappingURL=guards.js.map