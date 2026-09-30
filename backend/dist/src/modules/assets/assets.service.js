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
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const exceptions_1 = require("../../common/exceptions");
const client_1 = require("@prisma/client");
let AssetsService = class AssetsService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async createAsset(userId, estateId, dto) {
        const membership = await this.prisma.estateMembership.findFirst({
            where: {
                estateId,
                userId,
                status: 'ACTIVE',
                role: { in: [client_1.RoleType.TESTATOR, client_1.RoleType.ADVOCATE, client_1.RoleType.ADMIN] },
            },
        });
        if (!membership)
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'Only Testator or Advocate can register assets');
        const asset = await this.prisma.asset.create({
            data: {
                estateId,
                label: dto.label,
                category: dto.category,
                valuation: dto.valuation,
                currency: dto.currency || 'USD',
                isDigital: dto.isDigital,
                tokenAddress: dto.tokenAddress,
                tokenId: dto.tokenId,
                chainId: dto.chainId,
                details: dto.details,
            },
        });
        await this.audit.logEvent({
            actorId: userId,
            estateId,
            eventType: 'ASSET_CREATED',
            resourceType: 'ASSET',
            resourceId: asset.id,
            metadata: { label: asset.label, category: asset.category, isDigital: asset.isDigital },
        });
        return asset;
    }
    async listEstateAssets(userId, estateId) {
        const membership = await this.prisma.estateMembership.findFirst({
            where: { estateId, userId, status: 'ACTIVE' },
        });
        if (!membership)
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'Unauthorized to view estate assets');
        if (membership.role === client_1.RoleType.BENEFICIARY) {
            return this.prisma.asset.findMany({
                where: {
                    estateId,
                    allocations: { some: { beneficiaryId: userId } },
                },
                include: { allocations: { where: { beneficiaryId: userId } } },
            });
        }
        return this.prisma.asset.findMany({
            where: { estateId },
            include: {
                allocations: true,
                transferCases: true,
            },
        });
    }
    async createAllocation(userId, assetId, dto) {
        const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Asset not found');
        const membership = await this.prisma.estateMembership.findFirst({
            where: {
                estateId: asset.estateId,
                userId,
                status: 'ACTIVE',
                role: { in: [client_1.RoleType.TESTATOR, client_1.RoleType.ADVOCATE, client_1.RoleType.ADMIN] },
            },
        });
        if (!membership)
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'Only Testator or Advocate can allocate assets');
        if (dto.percentage) {
            const existingAllocations = await this.prisma.assetAllocation.findMany({ where: { assetId } });
            const currentSum = existingAllocations.reduce((acc, a) => acc + (a.percentage ? Number(a.percentage) : 0), 0);
            if (currentSum + dto.percentage > 100) {
                throw new exceptions_1.DomainException('INVALID_ALLOCATION', `Total percentage allocation exceeds 100% (currently ${currentSum}%, attempted to add ${dto.percentage}%)`);
            }
        }
        const allocation = await this.prisma.assetAllocation.create({
            data: {
                assetId,
                beneficiaryId: dto.beneficiaryId,
                percentage: dto.percentage,
                fixedAmount: dto.fixedAmount,
                instructions: dto.instructions,
            },
        });
        await this.audit.logEvent({
            actorId: userId,
            estateId: asset.estateId,
            eventType: 'ASSET_ALLOCATED',
            resourceType: 'ASSET',
            resourceId: assetId,
            metadata: { beneficiaryId: dto.beneficiaryId, percentage: dto.percentage },
        });
        return allocation;
    }
    async createTransferCase(userId, assetId, dto) {
        const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Asset not found');
        const membership = await this.prisma.estateMembership.findFirst({
            where: {
                estateId: asset.estateId,
                userId,
                status: 'ACTIVE',
                role: { in: [client_1.RoleType.TESTATOR, client_1.RoleType.EXECUTOR, client_1.RoleType.ADMIN] },
            },
        });
        if (!membership) {
            throw new exceptions_1.ForbiddenException('TRANSFER_NOT_AUTHORIZED', 'Only Executor or Testator can create an asset transfer case');
        }
        const transferCase = await this.prisma.transferCase.create({
            data: {
                assetId,
                estateId: asset.estateId,
                type: dto.type,
                status: client_1.TransferStatus.READY,
                beneficiaryId: dto.beneficiaryId,
                executorId: dto.executorId || userId,
                externalRef: dto.externalRef,
                evidence: dto.evidence,
            },
        });
        await this.audit.logEvent({
            actorId: userId,
            estateId: asset.estateId,
            eventType: 'ASSET_TRANSFER_INITIATED',
            resourceType: 'TRANSFER_CASE',
            resourceId: transferCase.id,
            metadata: { type: dto.type, beneficiaryId: dto.beneficiaryId },
        });
        return transferCase;
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map