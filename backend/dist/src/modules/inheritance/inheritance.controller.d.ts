import { InheritanceService } from './inheritance.service';
import { CreateActivationCaseDto } from './inheritance.dto';
export declare class InheritanceController {
    private readonly inheritanceService;
    constructor(inheritanceService: InheritanceService);
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
