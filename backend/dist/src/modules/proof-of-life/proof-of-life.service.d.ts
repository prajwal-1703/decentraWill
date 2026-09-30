import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class ProofOfLifeService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    respondCheck(userId: string, estateId: string): Promise<{
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
    simulateMissedCheck(estateId: string): Promise<{
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
