import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
export interface BlockchainAdapter {
    anchorWillVersion(versionId: string, versionHash: string, estateHash: string, versionRef: string, docHash: string): Promise<{
        txHash: string;
        blockNumber?: bigint;
    }>;
    anchorIntegrityHash(docHash: string, versionRef: string): Promise<{
        txHash: string;
        blockNumber?: bigint;
    }>;
    reconcile(): Promise<{
        reconciledCount: number;
    }>;
}
export declare class BlockchainService implements BlockchainAdapter {
    private readonly prisma;
    private readonly audit;
    private readonly logger;
    private publicClient;
    private walletClient;
    private account;
    constructor(prisma: PrismaService, audit: AuditService);
    anchorWillVersion(versionId: string, versionHash: string, estateHash: string, versionRef: string, docHash: string): Promise<{
        txHash: string;
        blockNumber?: bigint;
    }>;
    anchorIntegrityHash(docHash: string, versionRef: string): Promise<{
        txHash: string;
        blockNumber?: bigint;
    }>;
    reconcile(): Promise<{
        reconciledCount: number;
    }>;
}
