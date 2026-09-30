import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException, NotFoundException, ConflictException } from '../../common/exceptions';
import { CreateAttestationDto } from './attestations.dto';
import { AttestationStatus, RoleType } from '@prisma/client';

@Injectable()
export class AttestationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async createAttestation(userId: string, versionId: string, dto: CreateAttestationDto) {
    const version = await this.prisma.willVersion.findUnique({
      where: { id: versionId },
      include: { will: true },
    });
    if (!version) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Will version not found');

    if (version.status === 'SUPERSEDED' || version.status === 'ARCHIVED') {
      throw new ConflictException('VERSION_SUPERSEDED', 'Cannot attest to a superseded or archived will version');
    }

    // 1. Mutual exclusion / Conflict of Interest: An advocate cannot act as witness on the same contract
    if (dto.role === RoleType.WITNESS) {
      const isAdvocate = await this.prisma.estateMembership.findFirst({
        where: {
          estateId: version.estateId,
          userId,
          role: RoleType.ADVOCATE,
          status: 'ACTIVE',
        },
      });
      if (isAdvocate) {
        throw new ForbiddenException(
          'CONFLICT_OF_INTEREST',
          'A legal advocate cannot act as an attesting witness on the same will contract'
        );
      }
    }

    if (dto.role === RoleType.ADVOCATE) {
      const isWitness = await this.prisma.estateMembership.findFirst({
        where: {
          estateId: version.estateId,
          userId,
          role: RoleType.WITNESS,
          status: 'ACTIVE',
        },
      });
      if (isWitness) {
        throw new ForbiddenException(
          'CONFLICT_OF_INTEREST',
          'An attesting witness cannot act as an advocate on the same will contract'
        );
      }
    }

    // 2. Verify user is active participant in this estate with this role
    const membership = await this.prisma.estateMembership.findFirst({
      where: {
        estateId: version.estateId,
        userId,
        role: dto.role,
        status: 'ACTIVE',
      },
    });

    if (!membership) {
      throw new ForbiddenException('WITNESS_NOT_ELIGIBLE', `User does not have an active ${dto.role} membership for this estate`);
    }

    const status = dto.confirmed ? AttestationStatus.ACCEPTED : AttestationStatus.REJECTED;

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

  async listAttestations(userId: string, versionId: string) {
    const version = await this.prisma.willVersion.findUnique({ where: { id: versionId } });
    if (!version) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Will version not found');

    return this.prisma.attestation.findMany({
      where: { versionId },
      include: {
        user: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
      },
    });
  }
}
