import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActivationCaseDto {
  @ApiProperty({ example: 'estate-uuid' })
  @IsString()
  @IsNotEmpty()
  estateId!: string;

  @ApiProperty({ example: 'Executor initiation following official death certificate issuance' })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiProperty({ example: 'cert_doc_uuid_or_external_hash', required: false })
  @IsOptional()
  @IsString()
  evidenceRef?: string;
}
