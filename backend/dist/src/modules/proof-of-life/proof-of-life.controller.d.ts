import { ProofOfLifeService } from './proof-of-life.service';
export declare class ProofOfLifeController {
    private readonly polService;
    constructor(polService: ProofOfLifeService);
    respond(userId: string, estateId: string): Promise<{
        id: string;
        estateId: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        testatorId: string;
        cycleNo: number;
        intervalDays: number;
        lastCheckAt: Date | null;
        nextCheckAt: Date;
        missedChecksCount: number;
        escalated: boolean;
    }>;
    getStatus(userId: string, estateId: string): Promise<{
        checks: {
            id: string;
            createdAt: Date;
            status: string;
            scheduledAt: Date;
            respondedAt: Date | null;
            channel: string;
            cycleId: string;
        }[];
    } & {
        id: string;
        estateId: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        testatorId: string;
        cycleNo: number;
        intervalDays: number;
        lastCheckAt: Date | null;
        nextCheckAt: Date;
        missedChecksCount: number;
        escalated: boolean;
    }>;
    simulateMissed(estateId: string): Promise<{
        id: string;
        estateId: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        testatorId: string;
        cycleNo: number;
        intervalDays: number;
        lastCheckAt: Date | null;
        nextCheckAt: Date;
        missedChecksCount: number;
        escalated: boolean;
    }>;
}
