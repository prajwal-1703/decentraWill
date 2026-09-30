import { PrismaService } from '../../database/prisma.service';
import { CryptoService } from '../../common/crypto.service';
import { AuditService } from '../audit/audit.service';
import { OutboxService } from '../../jobs/outbox.service';
import { CreateWillDto, CreateWillVersionDto, CreateClauseDto, FinalizeVersionDto } from './wills.dto';
export declare class WillsService {
    private readonly prisma;
    private readonly crypto;
    private readonly audit;
    private readonly outbox;
    constructor(prisma: PrismaService, crypto: CryptoService, audit: AuditService, outbox: OutboxService);
    createWill(userId: string, dto: CreateWillDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.WillStatus;
        createdAt: Date;
        updatedAt: Date;
        estateId: string;
        title: string;
        mode: string;
    }>;
    createVersion(userId: string, willId: string, dto: CreateWillVersionDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.WillStatus;
        createdAt: Date;
        updatedAt: Date;
        versionNo: number;
        willId: string;
        estateId: string;
        clausesJson: import("@prisma/client/runtime/library").JsonValue | null;
        sha256: string | null;
        documentId: string | null;
        finalizedAt: Date | null;
    }>;
    addClause(userId: string, versionId: string, dto: CreateClauseDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        clauseNo: number;
        content: string;
        versionId: string;
    }>;
    getVersion(userId: string, versionId: string): Promise<{
        will: {
            id: string;
            status: import(".prisma/client").$Enums.WillStatus;
            createdAt: Date;
            updatedAt: Date;
            estateId: string;
            title: string;
            mode: string;
        };
        documents: {
            id: string;
            status: import(".prisma/client").$Enums.DocumentStatus;
            createdAt: Date;
            updatedAt: Date;
            estateId: string;
            sha256: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            versionId: string | null;
            objectKey: string;
            originalName: string;
            mimeType: string;
            sizeBytes: number;
            encryptedDek: string;
            dekIv: string;
            authTag: string | null;
            isQuarantined: boolean;
            scanResult: string | null;
            uploadedBy: string;
        }[];
        blockchainAnchors: {
            id: string;
            status: import(".prisma/client").$Enums.BlockchainStatus;
            createdAt: Date;
            updatedAt: Date;
            estateId: string;
            versionId: string;
            anchorType: string;
            txHash: string | null;
            blockNumber: bigint | null;
            documentHash: string;
            versionRef: string;
            confirmedAt: Date | null;
        }[];
        attestations: ({
            user: {
                id: string;
                email: string;
                profile: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string;
                    fullName: string | null;
                    phone: string | null;
                    address: string | null;
                    kycStatus: import(".prisma/client").$Enums.KycStatus;
                    kycReference: string | null;
                    kycVerifiedAt: Date | null;
                    stepUpToken: string | null;
                    stepUpExpiresAt: Date | null;
                };
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.AttestationStatus;
            createdAt: Date;
            userId: string;
            role: import(".prisma/client").$Enums.RoleType;
            versionId: string;
            type: string;
            signature: string | null;
            attestedAt: Date | null;
            rejectionReason: string | null;
        })[];
        clauses: {
            id: string;
            createdAt: Date;
            title: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            clauseNo: number;
            content: string;
            versionId: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.WillStatus;
        createdAt: Date;
        updatedAt: Date;
        versionNo: number;
        willId: string;
        estateId: string;
        clausesJson: import("@prisma/client/runtime/library").JsonValue | null;
        sha256: string | null;
        documentId: string | null;
        finalizedAt: Date | null;
    }>;
    finalizeVersion(userId: string, versionId: string, dto: FinalizeVersionDto, idempotencyKey?: string, correlationId?: string): Promise<{
        versionId: string;
        status: import(".prisma/client").$Enums.WillStatus;
        sha256: string;
        blockchainAnchorStatus: "PENDING";
        correlationId: string;
    }>;
    getBlockchainProof(versionId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.BlockchainStatus;
        createdAt: Date;
        updatedAt: Date;
        estateId: string;
        versionId: string;
        anchorType: string;
        txHash: string | null;
        blockNumber: bigint | null;
        documentHash: string;
        versionRef: string;
        confirmedAt: Date | null;
    }>;
}
