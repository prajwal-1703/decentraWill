import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CryptoService } from '../../common/crypto.service';
import { AuditService } from '../audit/audit.service';
import { OutboxService } from '../../jobs/outbox.service';
import {
  ForbiddenException,
  NotFoundException,
  ConflictException,
  DomainException,
} from '../../common/exceptions';
import { CreateWillDto, CreateWillVersionDto, CreateClauseDto, FinalizeVersionDto } from './wills.dto';
import { WillStatus, RoleType, BlockchainStatus } from '@prisma/client';

@Injectable()
export class WillsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly audit: AuditService,
    private readonly outbox: OutboxService
  ) {}

  async createWill(userId: string, dto: CreateWillDto) {
    const membership = await this.prisma.estateMembership.findFirst({
      where: {
        estateId: dto.estateId,
        userId,
        status: 'ACTIVE',
        role: { in: [RoleType.TESTATOR, RoleType.ADVOCATE, RoleType.ADMIN] },
      },
    });

    if (!membership) {
      throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'Only Testator or Advocate can create a will in this estate');
    }

    const will = await this.prisma.$transaction(async (tx) => {
      const w = await tx.will.create({
        data: {
          estateId: dto.estateId,
          title: dto.title,
          mode: dto.mode || 'TESTATOR_LED',
          status: WillStatus.DRAFT,
        },
      });

      // Create initial V1 Draft version
      await tx.willVersion.create({
        data: {
          willId: w.id,
          estateId: dto.estateId,
          versionNo: 1,
          status: WillStatus.DRAFT,
        },
      });

      return w;
    });

    await this.audit.logEvent({
      actorId: userId,
      estateId: dto.estateId,
      eventType: 'WILL_CREATED',
      resourceType: 'WILL',
      resourceId: will.id,
      metadata: { title: will.title },
    });

    return will;
  }

  async createVersion(userId: string, willId: string, dto: CreateWillVersionDto) {
    const will = await this.prisma.will.findUnique({ where: { id: willId } });
    if (!will) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Will not found');

    const membership = await this.prisma.estateMembership.findFirst({
      where: {
        estateId: will.estateId,
        userId,
        status: 'ACTIVE',
        role: { in: [RoleType.TESTATOR, RoleType.ADVOCATE, RoleType.ADMIN] },
      },
    });
    if (!membership) throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'Unauthorized to create will version');

    // Get max version number for this estate
    const latest = await this.prisma.willVersion.findFirst({
      where: { estateId: will.estateId },
      orderBy: { versionNo: 'desc' },
    });
    const nextVersionNo = (latest?.versionNo || 0) + 1;

    const version = await this.prisma.$transaction(async (tx) => {
      const v = await tx.willVersion.create({
        data: {
          willId,
          estateId: will.estateId,
          versionNo: nextVersionNo,
          status: WillStatus.DRAFT,
          documentId: dto.documentId,
        },
      });

      if (dto.clauses && dto.clauses.length > 0) {
        for (const c of dto.clauses) {
          await tx.willClause.create({
            data: {
              versionId: v.id,
              clauseNo: c.clauseNo,
              title: c.title,
              content: c.content,
              metadata: c.metadata,
            },
          });
        }
      }

      return v;
    });

    await this.audit.logEvent({
      actorId: userId,
      estateId: will.estateId,
      eventType: 'VERSION_CREATED',
      resourceType: 'WILL_VERSION',
      resourceId: version.id,
      metadata: { versionNo: version.versionNo },
    });

    return version;
  }

  async addClause(userId: string, versionId: string, dto: CreateClauseDto) {
    const version = await this.prisma.willVersion.findUnique({ where: { id: versionId } });
    if (!version) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Will version not found');

    if (version.status !== WillStatus.DRAFT && version.status !== WillStatus.VERIFICATION_PENDING) {
      throw new ConflictException('WILL_FINALIZED', 'Finalized will versions cannot be modified');
    }

    return this.prisma.willClause.create({
      data: {
        versionId,
        clauseNo: dto.clauseNo,
        title: dto.title,
        content: dto.content,
        metadata: dto.metadata,
      },
    });
  }

  async getVersion(userId: string, versionId: string) {
    const version = await this.prisma.willVersion.findUnique({
      where: { id: versionId },
      include: {
        will: true,
        clauses: { orderBy: { clauseNo: 'asc' } },
        documents: true,
        attestations: { include: { user: { select: { id: true, email: true, profile: true } } } },
        blockchainAnchors: true,
      },
    });

    if (!version) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Will version not found');

    const membership = await this.prisma.estateMembership.findFirst({
      where: { estateId: version.estateId, userId, status: 'ACTIVE' },
    });

    // Check if witness is invited to attest or user is estate member
    if (!membership) {
      throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'Unauthorized to view this will version');
    }

    return version;
  }

  async finalizeVersion(
    userId: string,
    versionId: string,
    dto: FinalizeVersionDto,
    idempotencyKey?: string,
    correlationId?: string
  ) {
    const version = await this.prisma.willVersion.findUnique({
      where: { id: versionId },
      include: {
        clauses: true,
        documents: true,
        attestations: true,
      },
    });

    if (!version) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Will version not found');

    // 1. Immutability check
    if (version.status === WillStatus.FINALIZED || version.status === WillStatus.ACTIVE) {
      throw new ConflictException('VERSION_ALREADY_FINALIZED', 'This version is already finalized and immutable');
    }

    // 2. Requester check
    const membership = await this.prisma.estateMembership.findFirst({
      where: {
        estateId: version.estateId,
        userId,
        status: 'ACTIVE',
        role: { in: [RoleType.TESTATOR, RoleType.ADMIN] },
      },
    });
    if (!membership) {
      throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'Only the Testator can finalize a will version');
    }

    // 3. Policy validation (attestations check)
    const policy = await this.prisma.workflowPolicy.findFirst({
      where: { estateId: version.estateId, isActive: true },
    });

    if (policy) {
      if (policy.requiredAdvocate) {
        const hasAdvocate = version.attestations.some(
          (a) => a.role === RoleType.ADVOCATE && a.status === 'ACCEPTED'
        );
        if (!hasAdvocate) {
          throw new DomainException('ATTESTATION_REQUIRED', 'Policy requires accepted advocate attestation before finalization');
        }
      }

      // Self-advocacy rule: An advocate can represent their own will,
      // but in that scenario, at least one additional independent co-advocate attestation is mandatory
      const testatorMembership = await this.prisma.estateMembership.findFirst({
        where: { estateId: version.estateId, role: RoleType.TESTATOR, status: 'ACTIVE' },
      });
      if (testatorMembership) {
        const isTestatorAlsoAdvocate = await this.prisma.estateMembership.findFirst({
          where: {
            estateId: version.estateId,
            userId: testatorMembership.userId,
            role: RoleType.ADVOCATE,
            status: 'ACTIVE',
          },
        });
        if (isTestatorAlsoAdvocate) {
          const independentAdvocate = version.attestations.find(
            (a) => a.role === RoleType.ADVOCATE && a.status === 'ACCEPTED' && a.userId !== testatorMembership.userId
          );
          if (!independentAdvocate) {
            throw new DomainException(
              'INDEPENDENT_CO_ADVOCATE_REQUIRED',
              'When the testator acts as advocate for their own will, at least one additional independent co-advocate attestation is legally required before finalization'
            );
          }
        }
      }

      // Mutual exclusion check: No user can act as both advocate and witness on the same will
      const advocateUserIds = version.attestations
        .filter((a) => a.role === RoleType.ADVOCATE && a.status === 'ACCEPTED')
        .map((a) => a.userId);
      const witnessUserIds = version.attestations
        .filter((a) => a.role === RoleType.WITNESS && a.status === 'ACCEPTED')
        .map((a) => a.userId);
      const dualRoleUser = advocateUserIds.find((id) => witnessUserIds.includes(id));
      if (dualRoleUser) {
        throw new DomainException(
          'CONFLICT_OF_INTEREST',
          'An individual cannot serve as both advocate and witness on the same will contract'
        );
      }

      if (policy.requiredWitnesses > 0) {
        const witnessCount = version.attestations.filter(
          (a) => a.role === RoleType.WITNESS && a.status === 'ACCEPTED'
        ).length;
        if (witnessCount < policy.requiredWitnesses) {
          throw new DomainException(
            'ATTESTATION_REQUIRED',
            `Policy requires at least ${policy.requiredWitnesses} accepted witness attestations (found ${witnessCount})`
          );
        }
      }
    }

    // 4. Calculate deterministic SHA-256 for this version
    const payloadToHash = {
      estateId: version.estateId,
      willId: version.willId,
      versionNo: version.versionNo,
      clauses: version.clauses.map((c) => ({ no: c.clauseNo, title: c.title, content: c.content })),
      documents: version.documents.map((d) => ({ id: d.id, sha256: d.sha256 })),
      attestations: version.attestations.map((a) => ({ userId: a.userId, role: a.role, type: a.type })),
    };
    const sha256 = this.crypto.sha256(JSON.stringify(payloadToHash));

    // 5. ATOMIC DB TRANSACTION with Outbox & Superseding
    try {
      const finalized = await this.prisma.$transaction(async (tx) => {
        // Mark any current ACTIVE version for this estate as SUPERSEDED
        await tx.willVersion.updateMany({
          where: { estateId: version.estateId, status: WillStatus.ACTIVE },
          data: { status: WillStatus.SUPERSEDED },
        });

        // Mark this version as ACTIVE & FINALIZED
        const updatedVersion = await tx.willVersion.update({
          where: { id: versionId },
          data: {
            status: WillStatus.ACTIVE,
            sha256,
            finalizedAt: new Date(),
          },
        });

        // Update parent will status
        await tx.will.update({
          where: { id: version.willId },
          data: { status: WillStatus.ACTIVE },
        });

        // Create BlockchainAnchor record
        await tx.blockchainAnchor.create({
          data: {
            estateId: version.estateId,
            versionId: version.id,
            anchorType: 'WILL_FINALIZATION',
            status: BlockchainStatus.PENDING,
            documentHash: sha256,
            versionRef: `v${version.versionNo}`,
          },
        });

        // Create Outbox event in same transaction
        await this.outbox.createEvent(
          tx,
          'WILL_VERSION',
          version.id,
          'FINALIZED',
          {
            estateId: version.estateId,
            versionNo: version.versionNo,
            sha256,
          },
          correlationId
        );

        return updatedVersion;
      });

      await this.audit.logEvent({
        actorId: userId,
        estateId: version.estateId,
        eventType: 'VERSION_FINALIZED',
        resourceType: 'WILL_VERSION',
        resourceId: finalized.id,
        metadata: { versionNo: finalized.versionNo, sha256 },
        correlationId,
      });

      return {
        versionId: finalized.id,
        status: finalized.status,
        sha256: finalized.sha256,
        blockchainAnchorStatus: BlockchainStatus.PENDING,
        correlationId: correlationId || `req_${Date.now()}`,
      };
    } catch (err: any) {
      if (err.code === 'P2002' || err.message?.includes('unique')) {
        throw new ConflictException('ACTIVE_VERSION_EXISTS', 'A conflicting active will version already exists');
      }
      throw err;
    }
  }

  async getBlockchainProof(versionId: string) {
    const anchor = await this.prisma.blockchainAnchor.findFirst({
      where: { versionId, anchorType: 'WILL_FINALIZATION' },
    });
    if (!anchor) {
      throw new NotFoundException('RESOURCE_NOT_FOUND', 'No blockchain anchor found for this version');
    }
    return anchor;
  }
}
