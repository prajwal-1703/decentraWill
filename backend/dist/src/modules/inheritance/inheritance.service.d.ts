import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateActivationCaseDto } from './inheritance.dto';
export declare class InheritanceService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    submitActivation(userId: string, dto: CreateActivationCaseDto): Promise<{
        id: string;
        estateId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ActivationStatus;
        updatedAt: Date;
        reason: string;
        evidenceRef: string | null;
        requesterId: string;
        gracePeriodEndsAt: Date | null;
        submittedAt: Date;
        approvedAt: Date | null;
    }>;
    approveActivation(userId: string, caseId: string): Promise<{
        id: string;
        estateId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ActivationStatus;
        updatedAt: Date;
        reason: string;
        evidenceRef: string | null;
        requesterId: string;
        gracePeriodEndsAt: Date | null;
        submittedAt: Date;
        approvedAt: Date | null;
    }>;
    closeExecution(userId: string, caseId: string): Promise<{
        id: string;
        estateId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ActivationStatus;
        updatedAt: Date;
        reason: string;
        evidenceRef: string | null;
        requesterId: string;
        gracePeriodEndsAt: Date | null;
        submittedAt: Date;
        approvedAt: Date | null;
    }>;
    listActivationCases(estateId: string): Promise<{
        id: string;
        estateId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ActivationStatus;
        updatedAt: Date;
        reason: string;
        evidenceRef: string | null;
        requesterId: string;
        gracePeriodEndsAt: Date | null;
        submittedAt: Date;
        approvedAt: Date | null;
    }[]>;
}
