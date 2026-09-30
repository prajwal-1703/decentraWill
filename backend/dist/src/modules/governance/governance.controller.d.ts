import { GovernanceService } from './governance.service';
import { CreateProposalDto, CastVoteDto } from './governance.dto';
export declare class GovernanceController {
    private readonly governanceService;
    constructor(governanceService: GovernanceService);
    createProposal(userId: string, estateId: string, dto: CreateProposalDto): Promise<{
        id: string;
        estateId: string;
        createdAt: Date;
        description: string;
        status: import(".prisma/client").$Enums.ProposalStatus;
        updatedAt: Date;
        title: string;
        expiresAt: Date;
        quorum: number;
        threshold: number;
        votesFor: number;
        votesAgainst: number;
        executedAt: Date | null;
        resolution: string | null;
    }>;
    castVote(userId: string, proposalId: string, dto: CastVoteDto, stepUpToken?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.VoteStatus;
        stepUpToken: string | null;
        choice: import(".prisma/client").$Enums.VoteChoice;
        proposalId: string;
        voterId: string;
        weight: number;
        castAt: Date;
    }>;
    getProposal(userId: string, proposalId: string): Promise<{
        votes: ({
            voter: {
                id: string;
                email: string;
                profile: {
                    fullName: string;
                };
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.VoteStatus;
            stepUpToken: string | null;
            choice: import(".prisma/client").$Enums.VoteChoice;
            proposalId: string;
            voterId: string;
            weight: number;
            castAt: Date;
        })[];
    } & {
        id: string;
        estateId: string;
        createdAt: Date;
        description: string;
        status: import(".prisma/client").$Enums.ProposalStatus;
        updatedAt: Date;
        title: string;
        expiresAt: Date;
        quorum: number;
        threshold: number;
        votesFor: number;
        votesAgainst: number;
        executedAt: Date | null;
        resolution: string | null;
    }>;
    listEstateProposals(userId: string, estateId: string): Promise<({
        votes: {
            id: string;
            status: import(".prisma/client").$Enums.VoteStatus;
            stepUpToken: string | null;
            choice: import(".prisma/client").$Enums.VoteChoice;
            proposalId: string;
            voterId: string;
            weight: number;
            castAt: Date;
        }[];
    } & {
        id: string;
        estateId: string;
        createdAt: Date;
        description: string;
        status: import(".prisma/client").$Enums.ProposalStatus;
        updatedAt: Date;
        title: string;
        expiresAt: Date;
        quorum: number;
        threshold: number;
        votesFor: number;
        votesAgainst: number;
        executedAt: Date | null;
        resolution: string | null;
    })[]>;
}
