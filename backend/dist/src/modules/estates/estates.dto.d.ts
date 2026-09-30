import { RoleType } from '@prisma/client';
export declare class CreateEstateDto {
    name: string;
    description?: string;
}
export declare class InviteParticipantDto {
    email: string;
    role: RoleType;
}
