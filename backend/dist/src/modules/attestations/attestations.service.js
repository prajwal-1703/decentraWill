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
exports.AttestationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const exceptions_1 = require("../../common/exceptions");
const client_1 = require("@prisma/client");
let AttestationsService = class AttestationsService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async createAttestation(userId, versionId, dto) {
        const version = await this.prisma.willVersion.findUnique({
            where: { id: versionId },
            include: { will: true },
        });
        if (!version)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Will version not found');
        if (version.status === 'SUPERSEDED' || version.status === 'ARCHIVED') {
            throw new exceptions_1.ConflictException('VERSION_SUPERSEDED', 'Cannot attest to a superseded or archived will version');
        }
        const membership = await this.prisma.estateMembership.findFirst({
            where: {
                estateId: version.estateId,
                userId,
                role: dto.role,
                status: 'ACTIVE',
            },
        });
        if (!membership) {
            throw new exceptions_1.ForbiddenException('WITNESS_NOT_ELIGIBLE', `User does not have an active ${dto.role} membership for this estate`);
        }
        if (dto.role === client_1.RoleType.WITNESS) {
            const isAdvocate = await this.prisma.estateMembership.findFirst({
                where: {
                    estateId: version.estateId,
                    userId,
                    role: client_1.RoleType.ADVOCATE,
                    status: 'ACTIVE',
                },
            });
            if (isAdvocate) {
                throw new exceptions_1.ForbiddenException('CONFLICT_OF_INTEREST', 'A legal advocate cannot act as an attesting witness on the same will contract');
            }
        }
        if (dto.role === client_1.RoleType.ADVOCATE) {
            const isWitness = await this.prisma.estateMembership.findFirst({
                where: {
                    estateId: version.estateId,
                    userId,
                    role: client_1.RoleType.WITNESS,
                    status: 'ACTIVE',
                },
            });
            if (isWitness) {
                throw new exceptions_1.ForbiddenException('CONFLICT_OF_INTEREST', 'An attesting witness cannot act as an advocate on the same will contract');
            }
        }
        const status = dto.confirmed ? client_1.AttestationStatus.ACCEPTED : client_1.AttestationStatus.REJECTED;
        const attestation = await this.prisma.attestation.upsert({
            where: {
                versionId_userId_role: {
                    versionId,
                    userId,
                    role: dto.role,
                },
            },
            update: {
                type: dto.type,
                signature: dto.signature,
                status,
                attestedAt: new Date(),
                rejectionReason: dto.rejectionReason,
            },
            create: {
                versionId,
                userId,
                role: dto.role,
                type: dto.type,
                signature: dto.signature,
                status,
                attestedAt: new Date(),
                rejectionReason: dto.rejectionReason,
            },
        });
        await this.audit.logEvent({
            actorId: userId,
            estateId: version.estateId,
            eventType: 'ATTESTATION_CREATED',
            resourceType: 'ATTESTATION',
            resourceId: attestation.id,
            metadata: { role: dto.role, status, versionNo: version.versionNo },
        });
        return attestation;
    }
    async listAttestations(userId, versionId) {
        const version = await this.prisma.willVersion.findUnique({ where: { id: versionId } });
        if (!version)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Will version not found');
        return this.prisma.attestation.findMany({
            where: { versionId },
            include: {
                user: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
            },
        });
    }
};
exports.AttestationsService = AttestationsService;
exports.AttestationsService = AttestationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], AttestationsService);
//# sourceMappingURL=attestations.service.js.map