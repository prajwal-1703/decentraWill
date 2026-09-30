import { PrismaService } from '../../database/prisma.service';
import { CryptoService } from '../../common/crypto.service';
import { SecuritySeverity } from '@prisma/client';
export interface CreateAuditDto {
    estateId?: string;
    actorId?: string;
    eventType: string;
    resourceType: string;
    resourceId: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    correlationId?: string;
}
export declare class AuditService {
    private readonly prisma;
    private readonly crypto;
    constructor(prisma: PrismaService, crypto: CryptoService);
    logEvent(dto: CreateAuditDto): Promise<{
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
    }>;
    logSecurityEvent(severity: SecuritySeverity, eventType: string, description: string, userId?: string, ipAddress?: string, metadata?: Record<string, any>): Promise<{
        id: string;
        eventType: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        createdAt: Date;
        severity: import(".prisma/client").$Enums.SecuritySeverity;
        description: string;
        userId: string | null;
    }>;
    verifyChain(): Promise<{
        valid: boolean;
        verifiedCount: number;
        brokenEventId?: string;
    }>;
    getEstateAuditTrail(estateId: string, limit?: number, cursor?: string): Promise<({
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
}
