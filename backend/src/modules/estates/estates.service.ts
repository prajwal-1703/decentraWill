import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CryptoService } from '../../common/crypto.service';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException, NotFoundException, ConflictException } from '../../common/exceptions';
import { CreateEstateDto, InviteParticipantDto } from './estates.dto';
import { RoleType } from '@prisma/client';

@Injectable()
export class EstatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly audit: AuditService
  ) {}

  async createEstate(userId: string, dto: CreateEstateDto) {
    const estate = await this.prisma.$transaction(async (tx) => {
      // 1. Create Estate
      const est = await tx.estate.create({
        data: {
          name: dto.name,
          description: dto.description,
          ownerId: userId,
        },
      });

      // 2. Add owner as TESTATOR
      await tx.estateMembership.create({
        data: {
          estateId: est.id,
          userId,
          role: RoleType.TESTATOR,
          status: 'ACTIVE',
        },
      });

      // 3. Create default Workflow Policy
      await tx.workflowPolicy.create({
        data: {
          estateId: est.id,
          requiredAdvocate: true,
          requiredWitnesses: 2,
          quorum: 2,
          threshold: 2,
          gracePeriodDays: 30,
          proofOfLifeDays: 90,
          reminderEveryDays: 7,
          eligibleRoles: ['ADVOCATE', 'EXECUTOR', 'BENEFICIARY'],
        },
      });

      // 4. Create initial Proof of Life cycle
      await tx.proofOfLifeCycle.create({
        data: {
          estateId: est.id,
          testatorId: userId,
          nextCheckAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      });

      return est;
    });

    await this.audit.logEvent({
      actorId: userId,
      estateId: estate.id,
      eventType: 'ESTATE_CREATED',
      resourceType: 'ESTATE',
      resourceId: estate.id,
    });

    return estate;
  }

  async getEstate(userId: string, estateId: string) {
    const membership = await this.prisma.estateMembership.findFirst({
      where: { estateId, userId, status: 'ACTIVE' },
    });

    if (!membership) {
      throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'You do not have active membership in this estate');
    }

    const estate = await this.prisma.estate.findUnique({
      where: { id: estateId },
      include: {
        memberships: {
          include: {
            user: {
              select: { id: true, email: true, profile: { select: { fullName: true } } },
            },
          },
        },
        policies: { where: { isActive: true } },
        wills: { include: { versions: { orderBy: { versionNo: 'desc' } } } },
      },
    });

    if (!estate) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Estate not found');
    return estate;
  }

  async listUserEstates(userId: string) {
    const memberships = await this.prisma.estateMembership.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        estate: {
          include: {
            wills: {
              include: {
                versions: {
                  orderBy: { versionNo: 'desc' },
                },
              },
            },
            memberships: {
              include: {
                user: {
                  select: { id: true, email: true, profile: { select: { fullName: true } } },
                },
              },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      estate: m.estate,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  async inviteParticipant(userId: string, estateId: string, dto: InviteParticipantDto) {
    // Check if requester has authority (TESTATOR or ADVOCATE)
    const membership = await this.prisma.estateMembership.findFirst({
      where: {
        estateId,
        userId,
        status: 'ACTIVE',
        role: { in: [RoleType.TESTATOR, RoleType.ADVOCATE, RoleType.ADMIN] },
      },
    });

    if (!membership) {
      throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'Only Testator or Advocate can invite participants');
    }

    // Conflict of interest check: An advocate on this estate cannot be a witness on the same contract
    const targetUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (targetUser) {
      if (dto.role === RoleType.WITNESS) {
        const isAdvocate = await this.prisma.estateMembership.findFirst({
          where: { estateId, userId: targetUser.id, role: RoleType.ADVOCATE, status: 'ACTIVE' },
        });
        if (isAdvocate) {
          throw new ConflictException(
            'CONFLICT_OF_INTEREST',
            'A legal advocate cannot also be assigned as a witness on the same will contract'
          );
        }
      }
      if (dto.role === RoleType.ADVOCATE) {
        const isWitness = await this.prisma.estateMembership.findFirst({
          where: { estateId, userId: targetUser.id, role: RoleType.WITNESS, status: 'ACTIVE' },
        });
        if (isWitness) {
          throw new ConflictException(
            'CONFLICT_OF_INTEREST',
            'An attesting witness cannot also be assigned as an advocate on the same will contract'
          );
        }
      }
    }

    // High entropy single-use token
    const rawToken = this.crypto.generateSecureToken(32);
    const tokenHash = this.crypto.sha256(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await this.prisma.participantInvitation.create({
      data: {
        estateId,
        email: dto.email,
        role: dto.role,
        tokenHash,
        expiresAt,
        invitedBy: userId,
      },
    });

    await this.audit.logEvent({
      actorId: userId,
      estateId,
      eventType: 'PARTICIPANT_INVITED',
      resourceType: 'INVITATION',
      resourceId: invitation.id,
      metadata: { email: dto.email, role: dto.role },
    });

    // In a real environment, send email notification; return rawToken for demo/invitation link
    return {
      invitationId: invitation.id,
      email: invitation.email,
      role: invitation.role,
      invitationToken: rawToken, // Return raw token to caller once for link generation
      expiresAt: invitation.expiresAt,
    };
  }

  async acceptInvitation(userId: string, rawToken: string) {
    const tokenHash = this.crypto.sha256(rawToken);

    const invitation = await this.prisma.participantInvitation.findUnique({
      where: { tokenHash },
    });

    if (!invitation) {
      throw new NotFoundException('RESOURCE_NOT_FOUND', 'Invalid invitation token');
    }

    if (invitation.isAccepted) {
      throw new ConflictException('INVITATION_ALREADY_ACCEPTED', 'This invitation has already been accepted');
    }

    if (invitation.expiresAt < new Date()) {
      throw new ForbiddenException('INVITATION_EXPIRED', 'This invitation has expired');
    }

    // Conflict of interest check upon acceptance
    if (invitation.role === RoleType.WITNESS) {
      const existingAdvocate = await this.prisma.estateMembership.findFirst({
        where: { estateId: invitation.estateId, userId, role: RoleType.ADVOCATE, status: 'ACTIVE' },
      });
      if (existingAdvocate) {
        throw new ConflictException(
          'CONFLICT_OF_INTEREST',
          'An advocate on this contract cannot also accept an appointment as a witness on the same will'
        );
      }
    }
    if (invitation.role === RoleType.ADVOCATE) {
      const existingWitness = await this.prisma.estateMembership.findFirst({
        where: { estateId: invitation.estateId, userId, role: RoleType.WITNESS, status: 'ACTIVE' },
      });
      if (existingWitness) {
        throw new ConflictException(
          'CONFLICT_OF_INTEREST',
          'An existing witness on this contract cannot also accept an appointment as an advocate on the same will'
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      // Create or update membership
      await tx.estateMembership.upsert({
        where: {
          estateId_userId_role: {
            estateId: invitation.estateId,
            userId,
            role: invitation.role,
          },
        },
        update: { status: 'ACTIVE' },
        create: {
          estateId: invitation.estateId,
          userId,
          role: invitation.role,
          status: 'ACTIVE',
        },
      });

      // Mark invitation accepted
      await tx.participantInvitation.update({
        where: { id: invitation.id },
        data: {
          isAccepted: true,
          acceptedAt: new Date(),
          acceptedBy: userId,
        },
      });
    });

    await this.audit.logEvent({
      actorId: userId,
      estateId: invitation.estateId,
      eventType: 'INVITATION_ACCEPTED',
      resourceType: 'ESTATE',
      resourceId: invitation.estateId,
      metadata: { role: invitation.role },
    });

    return { success: true, estateId: invitation.estateId, role: invitation.role };
  }

  async revokeMembership(requesterId: string, estateId: string, membershipId: string) {
    const requester = await this.prisma.estateMembership.findFirst({
      where: { estateId, userId: requesterId, role: RoleType.TESTATOR, status: 'ACTIVE' },
    });

    if (!requester) {
      throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'Only Testator can revoke memberships');
    }

    const target = await this.prisma.estateMembership.update({
      where: { id: membershipId },
      data: { status: 'REVOKED' },
    });

    await this.audit.logEvent({
      actorId: requesterId,
      estateId,
      eventType: 'PARTICIPANT_REVOKED',
      resourceType: 'MEMBERSHIP',
      resourceId: target.id,
      metadata: { revokedUserId: target.userId, role: target.role },
    });

    return { success: true, status: 'REVOKED' };
  }
}
