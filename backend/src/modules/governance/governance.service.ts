import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException, NotFoundException, ConflictException } from '../../common/exceptions';
import { CreateProposalDto, CastVoteDto } from './governance.dto';
import { ProposalStatus, VoteChoice, VoteStatus } from '@prisma/client';

@Injectable()
export class GovernanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async createProposal(userId: string, estateId: string, dto: CreateProposalDto) {
    const membership = await this.prisma.estateMembership.findFirst({
      where: { estateId, userId, status: 'ACTIVE' },
    });
    if (!membership) throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'Unauthorized to create proposals');

    const policy = await this.prisma.workflowPolicy.findFirst({
      where: { estateId, isActive: true },
    });

    const quorum = dto.quorum ?? (policy?.quorum || 2);
    const threshold = dto.threshold ?? (policy?.threshold || 2);
    const votingDays = dto.votingDays || 7;
    const expiresAt = new Date(Date.now() + votingDays * 24 * 60 * 60 * 1000);

    const proposal = await this.prisma.proposal.create({
      data: {
        estateId,
        title: dto.title,
        description: dto.description,
        status: ProposalStatus.OPEN,
        quorum,
        threshold,
        expiresAt,
      },
    });

    await this.audit.logEvent({
      actorId: userId,
      estateId,
      eventType: 'PROPOSAL_CREATED',
      resourceType: 'PROPOSAL',
      resourceId: proposal.id,
      metadata: { title: proposal.title, quorum, threshold },
    });

    return proposal;
  }

  async castVote(userId: string, proposalId: string, dto: CastVoteDto, stepUpToken?: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { votes: true },
    });
    if (!proposal) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Proposal not found');

    if (proposal.status !== ProposalStatus.OPEN) {
      throw new ConflictException('PROPOSAL_CLOSED', `Proposal is already ${proposal.status.toLowerCase()}`);
    }

    if (proposal.expiresAt < new Date()) {
      await this.prisma.proposal.update({ where: { id: proposalId }, data: { status: ProposalStatus.EXPIRED } });
      throw new ConflictException('PROPOSAL_EXPIRED', 'Voting period has expired');
    }

    // Role eligibility check against Policy
    const membership = await this.prisma.estateMembership.findFirst({
      where: { estateId: proposal.estateId, userId, status: 'ACTIVE' },
    });

    if (!membership) {
      throw new ForbiddenException('VOTE_NOT_ELIGIBLE', 'User is not an active participant in this estate');
    }

    const policy = await this.prisma.workflowPolicy.findFirst({
      where: { estateId: proposal.estateId, isActive: true },
    });

    const eligibleRoles = (policy?.eligibleRoles as string[]) || ['ADVOCATE', 'EXECUTOR', 'BENEFICIARY'];
    if (!eligibleRoles.includes(membership.role)) {
      throw new ForbiddenException('VOTE_NOT_ELIGIBLE', `Role ${membership.role} is not eligible to vote on this estate proposal`);
    }

    // Check duplicate vote in application + DB unique constraint
    const existingVote = await this.prisma.vote.findUnique({
      where: { proposalId_voterId: { proposalId, voterId: userId } },
    });
    if (existingVote) {
      throw new ConflictException('VOTE_ALREADY_CAST', 'User has already cast a vote for this proposal');
    }

    try {
      const voteResult = await this.prisma.$transaction(async (tx) => {
        // 1. Cast vote
        const vote = await tx.vote.create({
          data: {
            proposalId,
            voterId: userId,
            choice: dto.choice,
            status: VoteStatus.CAST,
            weight: 1,
            stepUpToken,
          },
        });

        // 2. Tally votes
        const isFor = dto.choice === VoteChoice.FOR;
        const isAgainst = dto.choice === VoteChoice.AGAINST;

        const updatedProposal = await tx.proposal.update({
          where: { id: proposalId },
          data: {
            votesFor: { increment: isFor ? 1 : 0 },
            votesAgainst: { increment: isAgainst ? 1 : 0 },
          },
        });

        const totalVotes = updatedProposal.votesFor + updatedProposal.votesAgainst;

        // 3. Evaluate Quorum and Threshold
        if (totalVotes >= updatedProposal.quorum) {
          if (updatedProposal.votesFor >= updatedProposal.threshold) {
            await tx.proposal.update({
              where: { id: proposalId },
              data: {
                status: ProposalStatus.PASSED,
                executedAt: new Date(),
                resolution: `Passed with ${updatedProposal.votesFor} votes in favor meeting threshold ${updatedProposal.threshold}`,
              },
            });
          } else if (updatedProposal.votesAgainst > updatedProposal.quorum - updatedProposal.threshold) {
            await tx.proposal.update({
              where: { id: proposalId },
              data: {
                status: ProposalStatus.REJECTED,
                resolution: `Rejected with ${updatedProposal.votesAgainst} opposing votes`,
              },
            });
          }
        }

        return vote;
      });

      await this.audit.logEvent({
        actorId: userId,
        estateId: proposal.estateId,
        eventType: 'VOTE_CAST',
        resourceType: 'PROPOSAL',
        resourceId: proposalId,
        metadata: { choice: dto.choice },
      });

      return voteResult;
    } catch (err: any) {
      if (err.code === 'P2002' || err.message?.includes('unique')) {
        throw new ConflictException('VOTE_ALREADY_CAST', 'User has already cast a vote for this proposal');
      }
      throw err;
    }
  }

  async getProposal(userId: string, proposalId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        votes: {
          include: {
            voter: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
          },
        },
      },
    });

    if (!proposal) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Proposal not found');

    const membership = await this.prisma.estateMembership.findFirst({
      where: { estateId: proposal.estateId, userId, status: 'ACTIVE' },
    });
    if (!membership) throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'Unauthorized to view this proposal');

    return proposal;
  }

  async listEstateProposals(userId: string, estateId: string) {
    const membership = await this.prisma.estateMembership.findFirst({
      where: { estateId, userId, status: 'ACTIVE' },
    });
    if (!membership) throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'Unauthorized to view estate proposals');

    return this.prisma.proposal.findMany({
      where: { estateId },
      include: { votes: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
