import { IdentityService } from './kyc.service';
export declare class IdentityController {
    private readonly identityService;
    constructor(identityService: IdentityService);
    startKyc(userId: string): Promise<{
        kycStatus: import(".prisma/client").$Enums.KycStatus;
        providerRef: string;
    }>;
    getKycStatus(userId: string): Promise<{
        kycStatus: import(".prisma/client").$Enums.KycStatus;
        kycReference: string;
        kycVerifiedAt: Date;
    }>;
    mockVerify(userId: string): Promise<{
        kycStatus: import(".prisma/client").$Enums.KycStatus;
        verifiedAt: Date;
    }>;
}
