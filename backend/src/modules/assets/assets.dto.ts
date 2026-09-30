import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetDto {
  @ApiProperty({ example: 'Downtown Residence Property' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({ example: 'REAL_ESTATE', enum: ['REAL_ESTATE', 'BANK_ACCOUNT', 'CRYPTO', 'STOCKS', 'VEHICLE', 'VALUABLES', 'IP'] })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({ example: 450000.00, required: false })
  @IsOptional()
  @IsNumber()
  valuation?: number;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isDigital!: boolean;

  @ApiProperty({ required: false, example: '0x1234567890abcdef1234567890abcdef12345678' })
  @IsOptional()
  @IsString()
  tokenAddress?: string;

  @ApiProperty({ required: false, example: '1' })
  @IsOptional()
  @IsString()
  tokenId?: string;

  @ApiProperty({ required: false, example: 11155111 })
  @IsOptional()
  @IsNumber()
  chainId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  details?: any;
}

export class CreateAllocationDto {
  @ApiProperty({ description: 'Beneficiary user ID' })
  @IsString()
  @IsNotEmpty()
  beneficiaryId!: string;

  @ApiProperty({ example: 50.0, required: false })
  @IsOptional()
  @IsNumber()
  percentage?: number;

  @ApiProperty({ example: 25000.0, required: false })
  @IsOptional()
  @IsNumber()
  fixedAmount?: number;

  @ApiProperty({ example: 'Transfer upon completion of probate and identity verification', required: false })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreateTransferCaseDto {
  @ApiProperty({ example: 'PHYSICAL_LEGAL', enum: ['PHYSICAL_LEGAL', 'BLOCKCHAIN_NATIVE'] })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ description: 'Target beneficiary user ID' })
  @IsString()
  @IsNotEmpty()
  beneficiaryId!: string;

  @ApiProperty({ required: false, description: 'Assigned executor user ID' })
  @IsOptional()
  @IsString()
  executorId?: string;

  @ApiProperty({ required: false, example: 'Probate Court Doc #8892' })
  @IsOptional()
  @IsString()
  externalRef?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  evidence?: any;
}
