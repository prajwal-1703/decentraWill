import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { DocumentsService } from '../documents/documents.service';
export declare class AdminService {
    private readonly prisma;
    private readonly audit;
    private readonly blockchain;
    private readonly documents;
    constructor(prisma: PrismaService, audit: AuditService, blockchain: BlockchainService, documents: DocumentsService);
    getHealthStatus(): Promise<{
        status: string;
        timestamp: string;
        services: {
            database: string;
            storage: string;
            redis: string;
            blockchain: string;
        };
    }>;
    verifyAuditChain(): Promise<{
        valid: boolean;
        verifiedCount: number;
        brokenEventId?: string;
    }>;
    getSecurityEvents(limit?: number): Promise<{
        id: string;
        eventType: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        createdAt: Date;
        severity: import(".prisma/client").$Enums.SecuritySeverity;
        description: string;
        userId: string | null;
    }[]>;
    reconcileBlockchain(): Promise<{
        reconciledCount: number;
    }>;
    exceptionalDocumentAccess(adminUserId: string, documentId: string, reason: string, ipAddress?: string): Promise<{
        buffer: Buffer<ArrayBufferLike>;
        fileName: string;
        mimeType: string;
        sha256: string;
    }>;
}
