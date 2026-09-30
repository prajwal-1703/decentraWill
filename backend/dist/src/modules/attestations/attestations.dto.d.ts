import { RoleType } from '@prisma/client';
export declare class CreateAttestationDto {
    role: RoleType;
    type: string;
    signature?: string;
    confirmed: boolean;
    rejectionReason?: string;
}
