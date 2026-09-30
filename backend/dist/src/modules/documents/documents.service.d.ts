import { PrismaService } from '../../database/prisma.service';
import { CryptoService } from '../../common/crypto.service';
import { StorageService } from './storage.service';
import { MalwareScannerService } from './malware-scanner.service';
import { AuditService } from '../audit/audit.service';
export declare class DocumentsService {
    private readonly prisma;
    private readonly crypto;
    private readonly storage;
    private readonly scanner;
    private readonly audit;
    constructor(prisma: PrismaService, crypto: CryptoService, storage: StorageService, scanner: MalwareScannerService, audit: AuditService);
    uploadDocument(userId: string, estateId: string, file: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
        size: number;
    }, versionId?: string, ipAddress?: string, correlationId?: string): Promise<{
        sha256: string;
        id: string;
        estateId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        status: import(".prisma/client").$Enums.DocumentStatus;
        updatedAt: Date;
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
    }>;
    downloadDocument(userId: string, documentId: string, ipAddress?: string, correlationId?: string): Promise<{
        buffer: Buffer<ArrayBufferLike>;
        fileName: string;
        mimeType: string;
        sha256: string;
    }>;
    verifyDocumentIntegrity(documentId: string): Promise<{
        documentId: string;
        verified: boolean;
        recordedSha256: string;
        actualSha256: string;
        reason: string;
    }>;
    corruptDocumentForTest(documentId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
