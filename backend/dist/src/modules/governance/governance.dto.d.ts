import { VoteChoice } from '@prisma/client';
export declare class CreateProposalDto {
    title: string;
    description: string;
    quorum?: number;
    threshold?: number;
    votingDays?: number;
}
export declare class CastVoteDto {
    choice: VoteChoice;
}
