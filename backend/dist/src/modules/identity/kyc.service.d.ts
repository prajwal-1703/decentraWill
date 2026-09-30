import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { KycStatus } from '@prisma/client';
export interface KycProvider {
    startVerification(userId: string): Promise<{
        providerRef: string;
        status: KycStatus;
    }>;
    checkStatus(providerRef: string): Promise<{
        status: KycStatus;
        verifiedAt?: Date;
    }>;
}
export declare class MockKycProvider implements KycProvider {
    startVerification(userId: string): Promise<{
        providerRef: string;
        status: "PENDING";
    }>;
    checkStatus(providerRef: string): Promise<{
        status: "VERIFIED";
        verifiedAt: Date;
    }>;
}
export declare class IdentityService {
    private readonly prisma;
    private readonly audit;
    private kycProvider;
    constructor(prisma: PrismaService, audit: AuditService);
    startKyc(userId: string): Promise<{
        kycStatus: import(".prisma/client").$Enums.KycStatus;
        providerRef: string;
    }>;
    getKycStatus(userId: string): Promise<{
        kycStatus: import(".prisma/client").$Enums.KycStatus;
        kycReference: string;
        kycVerifiedAt: Date;
    }>;
    verifyKycMock(userId: string): Promise<{
        kycStatus: import(".prisma/client").$Enums.KycStatus;
        verifiedAt: Date;
    }>;
}
