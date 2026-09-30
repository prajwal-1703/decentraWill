import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException, NotFoundException, ConflictException, DomainException } from '../../common/exceptions';
import { CreateActivationCaseDto } from './inheritance.dto';
import { ActivationStatus, RoleType, WillStatus, AccessStatus } from '@prisma/client';

@Injectable()
export class InheritanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async submitActivation(userId: string, dto: CreateActivationCaseDto) {
    const membership = await this.prisma.estateMembership.findFirst({
      where: {
        estateId: dto.estateId,
        userId,
        status: 'ACTIVE',
        role: { in: [RoleType.EXECUTOR, RoleType.ADVOCATE, RoleType.ADMIN] },
      },
    });

    if (!membership) {
      throw new ForbiddenException('ACTIVATION_NOT_AUTHORIZED', 'Only an authorized Executor or Advocate can trigger estate activation');
    }

    // Verify estate has an ACTIVE will version
    const activeVersion = await this.prisma.willVersion.findFirst({
      where: { estateId: dto.estateId, status: WillStatus.ACTIVE },
    });
    if (!activeVersion) {
      throw new DomainException('NO_ACTIVE_WILL', 'Cannot activate an estate without a finalized ACTIVE will');
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
        status: ActivationStatus.GRACE,
        evidenceRef: dto.evidenceRef,
        gracePeriodEndsAt,
      },
    });

    // Update will status to GRACE_PERIOD
    await this.prisma.will.updateMany({
      where: { estateId: dto.estateId },
      data: { status: WillStatus.GRACE_PERIOD },
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

  async approveActivation(userId: string, caseId: string) {
    const activationCase = await this.prisma.activationCase.findUnique({
      where: { id: caseId },
      include: { estate: true },
    });
    if (!activationCase) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Activation case not found');

    const estateId = activationCase.estateId;

    // Check governance proposal status: Must have a PASSED proposal for this estate
    const passedProposal = await this.prisma.proposal.findFirst({
      where: { estateId, status: 'PASSED' },
    });

    if (!passedProposal) {
      throw new DomainException('GOVERNANCE_APPROVAL_REQUIRED', 'Policy requires an approved governance proposal before activation release');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Update Activation Case to APPROVED
      const approvedCase = await tx.activationCase.update({
        where: { id: caseId },
        data: {
          status: ActivationStatus.APPROVED,
          approvedAt: new Date(),
        },
      });

      // 2. Transition Will to CONTROLLED_RELEASE
      await tx.will.updateMany({
        where: { estateId },
        data: { status: WillStatus.CONTROLLED_RELEASE },
      });

      // 3. Create Controlled Release AccessGrants for each beneficiary according to their allocations
      const allocations = await tx.assetAllocation.findMany({
        where: { asset: { estateId } },
        include: { asset: { include: { documents: true } } },
      });

      const grantExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days access

      for (const alloc of allocations) {
        // Grant access to asset information
        await tx.accessGrant.create({
          data: {
            estateId,
            userId: alloc.beneficiaryId,
            resourceType: 'ASSET',
            resourceId: alloc.assetId,
            scope: 'READ',
            status: AccessStatus.ACTIVE,
            reason: `Controlled release for allocation of ${alloc.asset.label}`,
            expiresAt: grantExpiresAt,
          },
        });

        // Grant access to associated asset documents
        for (const ad of alloc.asset.documents) {
          await tx.accessGrant.create({
            data: {
              estateId,
              userId: alloc.beneficiaryId,
              resourceType: 'DOCUMENT',
              resourceId: ad.documentId,
              scope: 'DOWNLOAD',
              status: AccessStatus.ACTIVE,
              reason: `Authorized document release for ${alloc.asset.label}`,
              expiresAt: grantExpiresAt,
            },
          });
        }
      }

      // 4. Create Executor task to coordinate transfers
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
          assignedRole: RoleType.EXECUTOR,
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

  async closeExecution(userId: string, caseId: string) {
    const activationCase = await this.prisma.activationCase.findUnique({ where: { id: caseId } });
    if (!activationCase) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Activation case not found');

    const updated = await this.prisma.$transaction(async (tx) => {
      const closedCase = await tx.activationCase.update({
        where: { id: caseId },
        data: { status: ActivationStatus.CLOSED },
      });

      await tx.estate.update({
        where: { id: activationCase.estateId },
        data: { status: 'ARCHIVED' },
      });

      await tx.will.updateMany({
        where: { estateId: activationCase.estateId },
        data: { status: WillStatus.CLOSED },
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

  async listActivationCases(estateId: string) {
    return this.prisma.activationCase.findMany({
      where: { estateId },
      orderBy: { submittedAt: 'desc' },
    });
  }
}
