import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateAttestationDto } from './attestations.dto';
export declare class AttestationsService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    createAttestation(userId: string, versionId: string, dto: CreateAttestationDto): Promise<{
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
    }>;
    listAttestations(userId: string, versionId: string): Promise<({
        user: {
            id: string;
            email: string;
            profile: {
                fullName: string;
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
    })[]>;
}
