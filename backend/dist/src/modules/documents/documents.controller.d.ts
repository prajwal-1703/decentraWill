import { DocumentsService } from './documents.service';
import { Response, Request } from 'express';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    uploadVersionDocument(userId: string, versionId: string, estateId: string, file: any, req: Request): Promise<{
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
    uploadEstateDocument(userId: string, estateId: string, file: any, req: Request): Promise<{
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
    downloadDocument(userId: string, documentId: string, res: Response, req: Request): Promise<void>;
    verifyDocument(documentId: string): Promise<{
        documentId: string;
        verified: boolean;
        recordedSha256: string;
        actualSha256: string;
        reason: string;
    }>;
    testCorrupt(documentId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
