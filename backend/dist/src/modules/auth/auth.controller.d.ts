import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto, StepUpDto, ConnectWalletDto } from './auth.dto';
import { Request } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, req: Request): Promise<{
        id: string;
        email: string;
        profile: {
            id: string;
            createdAt: Date;
            userId: string;
            updatedAt: Date;
            fullName: string | null;
            phone: string | null;
            address: string | null;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            kycReference: string | null;
            kycVerifiedAt: Date | null;
            stepUpToken: string | null;
            stepUpExpiresAt: Date | null;
        };
    }>;
    login(dto: LoginDto, req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            profile: {
                id: string;
                createdAt: Date;
                userId: string;
                updatedAt: Date;
                fullName: string | null;
                phone: string | null;
                address: string | null;
                kycStatus: import(".prisma/client").$Enums.KycStatus;
                kycReference: string | null;
                kycVerifiedAt: Date | null;
                stepUpToken: string | null;
                stepUpExpiresAt: Date | null;
            };
            memberships: {
                id: string;
                estateId: string;
                userId: string;
                status: string;
                updatedAt: Date;
                role: import(".prisma/client").$Enums.RoleType;
                joinedAt: Date;
            }[];
        };
    }>;
    refresh(dto: RefreshDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(authHeader: string): Promise<{
        success: boolean;
    }>;
    stepUp(userId: string, dto: StepUpDto, req: Request): Promise<{
        stepUpToken: string;
        expiresAt: Date;
    }>;
    connectWallet(userId: string, dto: ConnectWalletDto): Promise<{
        success: boolean;
        walletAddress: string;
    }>;
}
