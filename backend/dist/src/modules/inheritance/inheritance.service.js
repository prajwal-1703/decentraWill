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
exports.InheritanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const exceptions_1 = require("../../common/exceptions");
const client_1 = require("@prisma/client");
let InheritanceService = class InheritanceService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async submitActivation(userId, dto) {
        const membership = await this.prisma.estateMembership.findFirst({
            where: {
                estateId: dto.estateId,
                userId,
                status: 'ACTIVE',
                role: { in: [client_1.RoleType.EXECUTOR, client_1.RoleType.ADVOCATE, client_1.RoleType.ADMIN] },
            },
        });
        if (!membership) {
            throw new exceptions_1.ForbiddenException('ACTIVATION_NOT_AUTHORIZED', 'Only an authorized Executor or Advocate can trigger estate activation');
        }
        const activeVersion = await this.prisma.willVersion.findFirst({
            where: { estateId: dto.estateId, status: client_1.WillStatus.ACTIVE },
        });
        if (!activeVersion) {
            throw new exceptions_1.DomainException('NO_ACTIVE_WILL', 'Cannot activate an estate without a finalized ACTIVE will');
        }
        const policy = await this.prisma.workflowPolicy.findFirst({
            where: { estateId: dto.estateId, isActive: true },
        });
        const graceDays = policy?.gracePeriodDays ?? 30;
        const gracePeriodEndsAt = new Date(Date.now() + graceDays * 24 * 60 * 60 * 1000);
        const activationCase = await this.prisma.activationCase.create({
            data: {
                estateId: dto.estateId,
                requesterId: userId,
                reason: dto.reason,
                status: client_1.ActivationStatus.GRACE,
                evidenceRef: dto.evidenceRef,
                gracePeriodEndsAt,
            },
        });
        await this.prisma.will.updateMany({
            where: { estateId: dto.estateId },
            data: { status: client_1.WillStatus.GRACE_PERIOD },
        });
        await this.audit.logEvent({
            actorId: userId,
            estateId: dto.estateId,
            eventType: 'ACTIVATION_REQUESTED',
            resourceType: 'ACTIVATION_CASE',
            resourceId: activationCase.id,
            metadata: { reason: dto.reason, gracePeriodEndsAt },
        });
        return activationCase;
    }
    async approveActivation(userId, caseId) {
        const activationCase = await this.prisma.activationCase.findUnique({
            where: { id: caseId },
            include: { estate: true },
        });
        if (!activationCase)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Activation case not found');
        const estateId = activationCase.estateId;
        const passedProposal = await this.prisma.proposal.findFirst({
            where: { estateId, status: 'PASSED' },
        });
        if (!passedProposal) {
            throw new exceptions_1.DomainException('GOVERNANCE_APPROVAL_REQUIRED', 'Policy requires an approved governance proposal before activation release');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const approvedCase = await tx.activationCase.update({
                where: { id: caseId },
                data: {
                    status: client_1.ActivationStatus.APPROVED,
                    approvedAt: new Date(),
                },
            });
            await tx.will.updateMany({
                where: { estateId },
                data: { status: client_1.WillStatus.CONTROLLED_RELEASE },
            });
            const allocations = await tx.assetAllocation.findMany({
                where: { asset: { estateId } },
                include: { asset: { include: { documents: true } } },
            });
            const grantExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
            for (const alloc of allocations) {
                await tx.accessGrant.create({
                    data: {
                        estateId,
                        userId: alloc.beneficiaryId,
                        resourceType: 'ASSET',
                        resourceId: alloc.assetId,
                        scope: 'READ',
                        status: client_1.AccessStatus.ACTIVE,
                        reason: `Controlled release for allocation of ${alloc.asset.label}`,
                        expiresAt: grantExpiresAt,
                    },
                });
                for (const ad of alloc.asset.documents) {
                    await tx.accessGrant.create({
                        data: {
                            estateId,
                            userId: alloc.beneficiaryId,
                            resourceType: 'DOCUMENT',
                            resourceId: ad.documentId,
                            scope: 'DOWNLOAD',
                            status: client_1.AccessStatus.ACTIVE,
                            reason: `Authorized document release for ${alloc.asset.label}`,
                            expiresAt: grantExpiresAt,
                        },
                    });
                }
            }
            await tx.workflowTask.create({
                data: {
                    workflowInstance: {
                        create: {
                            estateId,
                            type: 'INHERITANCE_EXECUTION',
                            state: 'ACTIVE',
                        },
                    },
                    title: 'Coordinate Physical and Digital Asset Distributions',
                    type: 'EXECUTION_COORDINATION',
                    assignedRole: client_1.RoleType.EXECUTOR,
                    status: 'PENDING',
                },
            });
            return approvedCase;
        });
        await this.audit.logEvent({
            actorId: userId,
            estateId,
            eventType: 'CONTROLLED_RELEASE',
            resourceType: 'ACTIVATION_CASE',
            resourceId: caseId,
        });
        return result;
    }
    async closeExecution(userId, caseId) {
        const activationCase = await this.prisma.activationCase.findUnique({ where: { id: caseId } });
        if (!activationCase)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Activation case not found');
        const updated = await this.prisma.$transaction(async (tx) => {
            const closedCase = await tx.activationCase.update({
                where: { id: caseId },
                data: { status: client_1.ActivationStatus.CLOSED },
            });
            await tx.estate.update({
                where: { id: activationCase.estateId },
                data: { status: 'ARCHIVED' },
            });
            await tx.will.updateMany({
                where: { estateId: activationCase.estateId },
                data: { status: client_1.WillStatus.CLOSED },
            });
            return closedCase;
        });
        await this.audit.logEvent({
            actorId: userId,
            estateId: activationCase.estateId,
            eventType: 'ESTATE_CLOSED_ARCHIVED',
            resourceType: 'ESTATE',
            resourceId: activationCase.estateId,
        });
        return updated;
    }
    async listActivationCases(estateId) {
        return this.prisma.activationCase.findMany({
            where: { estateId },
            orderBy: { submittedAt: 'desc' },
        });
    }
};
exports.InheritanceService = InheritanceService;
exports.InheritanceService = InheritanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], InheritanceService);
//# sourceMappingURL=inheritance.service.js.map