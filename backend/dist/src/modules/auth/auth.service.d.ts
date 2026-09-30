import { PrismaService } from '../../database/prisma.service';
import { CryptoService } from '../../common/crypto.service';
import { AuditService } from '../audit/audit.service';
import { RegisterDto, LoginDto, RefreshDto, StepUpDto, ConnectWalletDto } from './auth.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly crypto;
    private readonly audit;
    constructor(prisma: PrismaService, crypto: CryptoService, audit: AuditService);
    register(dto: RegisterDto, ipAddress?: string, correlationId?: string): Promise<{
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
    login(dto: LoginDto, userAgent?: string, ipAddress?: string, correlationId?: string): Promise<{
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
    logout(token: string): Promise<{
        success: boolean;
    }>;
    stepUp(userId: string, dto: StepUpDto, ipAddress?: string, correlationId?: string): Promise<{
        stepUpToken: string;
        expiresAt: Date;
    }>;
    connectWallet(userId: string, dto: ConnectWalletDto): Promise<{
        success: boolean;
        walletAddress: string;
    }>;
}
