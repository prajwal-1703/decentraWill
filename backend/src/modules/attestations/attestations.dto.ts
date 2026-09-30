import { IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';

export class CreateAttestationDto {
  @ApiProperty({ enum: RoleType, example: RoleType.WITNESS })
  @IsEnum(RoleType)
  role!: RoleType;

  @ApiProperty({ example: 'STEP_UP', enum: ['OTP', 'WALLET_SIGNATURE', 'STEP_UP', 'E_SIGN'] })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ required: false, example: '0xsignature...' })
  @IsOptional()
  @IsString()
  signature?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  confirmed!: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
