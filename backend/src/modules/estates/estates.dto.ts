import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';

export class CreateEstateDto {
  @ApiProperty({ example: 'The Alexander Family Trust Estate' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Primary estate for family inheritance and digital trust', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class InviteParticipantDto {
  @ApiProperty({ example: 'advocate@lawfirm.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: RoleType, example: RoleType.ADVOCATE })
  @IsEnum(RoleType)
  role!: RoleType;
}
