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
exports.IdentityService = exports.MockKycProvider = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
let MockKycProvider = class MockKycProvider {
    async startVerification(userId) {
        return {
            providerRef: `mock_kyc_${(0, uuid_1.v4)().slice(0, 8)}`,
            status: client_1.KycStatus.PENDING,
        };
    }
    async checkStatus(providerRef) {
        return {
            status: client_1.KycStatus.VERIFIED,
            verifiedAt: new Date(),
        };
    }
};
exports.MockKycProvider = MockKycProvider;
exports.MockKycProvider = MockKycProvider = __decorate([
    (0, common_1.Injectable)()
], MockKycProvider);
let IdentityService = class IdentityService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
        this.kycProvider = new MockKycProvider();
    }
    async startKyc(userId) {
        const res = await this.kycProvider.startVerification(userId);
        const profile = await this.prisma.userProfile.upsert({
            where: { userId },
            update: {
                kycStatus: res.status,
                kycReference: res.providerRef,
            },
            create: {
                userId,
                kycStatus: res.status,
                kycReference: res.providerRef,
            },
        });
        await this.audit.logEvent({
            actorId: userId,
            eventType: 'KYC_STARTED',
            resourceType: 'IDENTITY',
            resourceId: profile.id,
            metadata: { providerRef: res.providerRef },
        });
        return { kycStatus: profile.kycStatus, providerRef: profile.kycReference };
    }
    async getKycStatus(userId) {
        const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
        return {
            kycStatus: profile?.kycStatus || client_1.KycStatus.NOT_STARTED,
            kycReference: profile?.kycReference || null,
            kycVerifiedAt: profile?.kycVerifiedAt || null,
        };
    }
    async verifyKycMock(userId) {
        const profile = await this.prisma.userProfile.update({
            where: { userId },
            data: {
                kycStatus: client_1.KycStatus.VERIFIED,
                kycVerifiedAt: new Date(),
            },
        });
        await this.audit.logEvent({
            actorId: userId,
            eventType: 'KYC_VERIFIED',
            resourceType: 'IDENTITY',
            resourceId: profile.id,
        });
        return { kycStatus: profile.kycStatus, verifiedAt: profile.kycVerifiedAt };
    }
};
exports.IdentityService = IdentityService;
exports.IdentityService = IdentityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], IdentityService);
//# sourceMappingURL=kyc.service.js.map