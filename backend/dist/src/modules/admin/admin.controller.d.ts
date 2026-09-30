import { AdminService } from './admin.service';
import { AuditService } from '../audit/audit.service';
import { Request } from 'express';
export declare class AdminController {
    private readonly adminService;
    private readonly auditService;
    constructor(adminService: AdminService, auditService: AuditService);
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        services: {
            database: string;
            storage: string;
            redis: string;
            blockchain: string;
        };
    }>;
    getLive(): Promise<{
        status: string;
        timestamp: string;
    }>;
    getReady(): Promise<{
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
    getSecurityEvents(): Promise<{
        id: string;
        eventType: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        createdAt: Date;
        severity: import(".prisma/client").$Enums.SecuritySeverity;
        description: string;
        userId: string | null;
    }[]>;
    reconcile(): Promise<{
        reconciledCount: number;
    }>;
    getEstateAudit(estateId: string): Promise<({
        actor: {
            id: string;
            email: string;
        };
    } & {
        id: string;
        estateId: string | null;
        actorId: string | null;
        eventType: string;
        resourceType: string;
        resourceId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        previousHash: string;
        currentHash: string;
        ipAddress: string | null;
        correlationId: string | null;
        createdAt: Date;
    })[]>;
    exceptionalAccess(adminId: string, documentId: string, reason: string, req: Request): Promise<{
        buffer: Buffer<ArrayBufferLike>;
        fileName: string;
        mimeType: string;
        sha256: string;
    }>;
}
