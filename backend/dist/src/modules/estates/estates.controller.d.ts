import { EstatesService } from './estates.service';
import { CreateEstateDto, InviteParticipantDto } from './estates.dto';
export declare class EstatesController {
    private readonly estatesService;
    constructor(estatesService: EstatesService);
    createEstate(userId: string, dto: CreateEstateDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }>;
    listUserEstates(userId: string): Promise<{
        estate: {
            memberships: ({
                user: {
                    id: string;
                    email: string;
                    profile: {
                        fullName: string;
                    };
                };
            } & {
                id: string;
                status: string;
                updatedAt: Date;
                userId: string;
                estateId: string;
                role: import(".prisma/client").$Enums.RoleType;
                joinedAt: Date;
            })[];
            wills: ({
                versions: {
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
                }[];
            } & {
                id: string;
                status: import(".prisma/client").$Enums.WillStatus;
                createdAt: Date;
                updatedAt: Date;
                estateId: string;
                title: string;
                mode: string;
            })[];
        } & {
            id: string;
            name: string;
            description: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
        };
        role: import(".prisma/client").$Enums.RoleType;
        joinedAt: Date;
    }[]>;
    getEstate(userId: string, estateId: string): Promise<{
        memberships: ({
            user: {
                id: string;
                email: string;
                profile: {
                    fullName: string;
                };
            };
        } & {
            id: string;
            status: string;
            updatedAt: Date;
            userId: string;
            estateId: string;
            role: import(".prisma/client").$Enums.RoleType;
            joinedAt: Date;
        })[];
        wills: ({
            versions: {
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
            }[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.WillStatus;
            createdAt: Date;
            updatedAt: Date;
            estateId: string;
            title: string;
            mode: string;
        })[];
        policies: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            estateId: string;
            version: number;
            requiredAdvocate: boolean;
            requiredWitnesses: number;
            quorum: number;
            threshold: number;
            gracePeriodDays: number;
            proofOfLifeDays: number;
            reminderEveryDays: number;
            eligibleRoles: import("@prisma/client/runtime/library").JsonValue;
            rawJson: import("@prisma/client/runtime/library").JsonValue | null;
            isActive: boolean;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }>;
    inviteParticipant(userId: string, estateId: string, dto: InviteParticipantDto): Promise<{
        invitationId: string;
        email: string;
        role: import(".prisma/client").$Enums.RoleType;
        invitationToken: string;
        expiresAt: Date;
    }>;
    acceptInvitation(userId: string, token: string): Promise<{
        success: boolean;
        estateId: string;
        role: import(".prisma/client").$Enums.RoleType;
    }>;
    revokeMembership(userId: string, estateId: string, membershipId: string): Promise<{
        success: boolean;
        status: string;
    }>;
}
