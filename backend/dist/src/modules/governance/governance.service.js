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
exports.GovernanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const exceptions_1 = require("../../common/exceptions");
const client_1 = require("@prisma/client");
let GovernanceService = class GovernanceService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async createProposal(userId, estateId, dto) {
        const membership = await this.prisma.estateMembership.findFirst({
            where: { estateId, userId, status: 'ACTIVE' },
        });
        if (!membership)
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'Unauthorized to create proposals');
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
                status: client_1.ProposalStatus.OPEN,
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
    async castVote(userId, proposalId, dto, stepUpToken) {
        const proposal = await this.prisma.proposal.findUnique({
            where: { id: proposalId },
            include: { votes: true },
        });
        if (!proposal)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Proposal not found');
        if (proposal.status !== client_1.ProposalStatus.OPEN) {
            throw new exceptions_1.ConflictException('PROPOSAL_CLOSED', `Proposal is already ${proposal.status.toLowerCase()}`);
        }
        if (proposal.expiresAt < new Date()) {
            await this.prisma.proposal.update({ where: { id: proposalId }, data: { status: client_1.ProposalStatus.EXPIRED } });
            throw new exceptions_1.ConflictException('PROPOSAL_EXPIRED', 'Voting period has expired');
        }
        const membership = await this.prisma.estateMembership.findFirst({
            where: { estateId: proposal.estateId, userId, status: 'ACTIVE' },
        });
        if (!membership) {
            throw new exceptions_1.ForbiddenException('VOTE_NOT_ELIGIBLE', 'User is not an active participant in this estate');
        }
        const policy = await this.prisma.workflowPolicy.findFirst({
            where: { estateId: proposal.estateId, isActive: true },
        });
        const eligibleRoles = policy?.eligibleRoles || ['ADVOCATE', 'EXECUTOR', 'BENEFICIARY'];
        if (!eligibleRoles.includes(membership.role)) {
            throw new exceptions_1.ForbiddenException('VOTE_NOT_ELIGIBLE', `Role ${membership.role} is not eligible to vote on this estate proposal`);
        }
        const existingVote = await this.prisma.vote.findUnique({
            where: { proposalId_voterId: { proposalId, voterId: userId } },
        });
        if (existingVote) {
            throw new exceptions_1.ConflictException('VOTE_ALREADY_CAST', 'User has already cast a vote for this proposal');
        }
        try {
            const voteResult = await this.prisma.$transaction(async (tx) => {
                const vote = await tx.vote.create({
                    data: {
                        proposalId,
                        voterId: userId,
                        choice: dto.choice,
                        status: client_1.VoteStatus.CAST,
                        weight: 1,
                        stepUpToken,
                    },
                });
                const isFor = dto.choice === client_1.VoteChoice.FOR;
                const isAgainst = dto.choice === client_1.VoteChoice.AGAINST;
                const updatedProposal = await tx.proposal.update({
                    where: { id: proposalId },
                    data: {
                        votesFor: { increment: isFor ? 1 : 0 },
                        votesAgainst: { increment: isAgainst ? 1 : 0 },
                    },
                });
                const totalVotes = updatedProposal.votesFor + updatedProposal.votesAgainst;
                if (totalVotes >= updatedProposal.quorum) {
                    if (updatedProposal.votesFor >= updatedProposal.threshold) {
                        await tx.proposal.update({
                            where: { id: proposalId },
                            data: {
                                status: client_1.ProposalStatus.PASSED,
                                executedAt: new Date(),
                                resolution: `Passed with ${updatedProposal.votesFor} votes in favor meeting threshold ${updatedProposal.threshold}`,
                            },
                        });
                    }
                    else if (updatedProposal.votesAgainst > updatedProposal.quorum - updatedProposal.threshold) {
                        await tx.proposal.update({
                            where: { id: proposalId },
                            data: {
                                status: client_1.ProposalStatus.REJECTED,
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
        }
        catch (err) {
            if (err.code === 'P2002' || err.message?.includes('unique')) {
                throw new exceptions_1.ConflictException('VOTE_ALREADY_CAST', 'User has already cast a vote for this proposal');
            }
            throw err;
        }
    }
    async getProposal(userId, proposalId) {
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
        if (!proposal)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Proposal not found');
        const membership = await this.prisma.estateMembership.findFirst({
            where: { estateId: proposal.estateId, userId, status: 'ACTIVE' },
        });
        if (!membership)
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'Unauthorized to view this proposal');
        return proposal;
    }
    async listEstateProposals(userId, estateId) {
        const membership = await this.prisma.estateMembership.findFirst({
            where: { estateId, userId, status: 'ACTIVE' },
        });
        if (!membership)
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'Unauthorized to view estate proposals');
        return this.prisma.proposal.findMany({
            where: { estateId },
            include: { votes: true },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.GovernanceService = GovernanceService;
exports.GovernanceService = GovernanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], GovernanceService);
//# sourceMappingURL=governance.service.js.map