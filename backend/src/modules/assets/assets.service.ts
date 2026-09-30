import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException, NotFoundException, DomainException } from '../../common/exceptions';
import { CreateAssetDto, CreateAllocationDto, CreateTransferCaseDto } from './assets.dto';
import { RoleType, TransferStatus } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async createAsset(userId: string, estateId: string, dto: CreateAssetDto) {
    const membership = await this.prisma.estateMembership.findFirst({
      where: {
        estateId,
        userId,
        status: 'ACTIVE',
        role: { in: [RoleType.TESTATOR, RoleType.ADVOCATE, RoleType.ADMIN] },
      },
    });
    if (!membership) throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'Only Testator or Advocate can register assets');

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

  async listEstateAssets(userId: string, estateId: string) {
    const membership = await this.prisma.estateMembership.findFirst({
      where: { estateId, userId, status: 'ACTIVE' },
    });
    if (!membership) throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'Unauthorized to view estate assets');

    // Beneficiaries only see assets specifically allocated to them unless authorized
    if (membership.role === RoleType.BENEFICIARY) {
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

  async createAllocation(userId: string, assetId: string, dto: CreateAllocationDto) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Asset not found');

    const membership = await this.prisma.estateMembership.findFirst({
      where: {
        estateId: asset.estateId,
        userId,
        status: 'ACTIVE',
        role: { in: [RoleType.TESTATOR, RoleType.ADVOCATE, RoleType.ADMIN] },
      },
    });
    if (!membership) throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'Only Testator or Advocate can allocate assets');

    // Validate percentage total does not exceed 100%
    if (dto.percentage) {
      const existingAllocations = await this.prisma.assetAllocation.findMany({ where: { assetId } });
      const currentSum = existingAllocations.reduce((acc, a) => acc + (a.percentage ? Number(a.percentage) : 0), 0);
      if (currentSum + dto.percentage > 100) {
        throw new DomainException(
          'INVALID_ALLOCATION',
          `Total percentage allocation exceeds 100% (currently ${currentSum}%, attempted to add ${dto.percentage}%)`
        );
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

  async createTransferCase(userId: string, assetId: string, dto: CreateTransferCaseDto) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Asset not found');

    const membership = await this.prisma.estateMembership.findFirst({
      where: {
        estateId: asset.estateId,
        userId,
        status: 'ACTIVE',
        role: { in: [RoleType.TESTATOR, RoleType.EXECUTOR, RoleType.ADMIN] },
      },
    });
    if (!membership) {
      throw new ForbiddenException('TRANSFER_NOT_AUTHORIZED', 'Only Executor or Testator can create an asset transfer case');
    }

    const transferCase = await this.prisma.transferCase.create({
      data: {
        assetId,
        estateId: asset.estateId,
        type: dto.type,
        status: TransferStatus.READY,
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
}
