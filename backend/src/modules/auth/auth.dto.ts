import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'testator@decentrawill.org' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecureP@ssw0rd!2026' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'testator@decentrawill.org' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecureP@ssw0rd!2026' })
  @IsString()
  password!: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class StepUpDto {
  @ApiProperty({ description: 'Current user password or MFA code for verification' })
  @IsString()
  @IsNotEmpty()
  verificationProof!: string;
}

export class ConnectWalletDto {
  @ApiProperty({ example: '0x1234567890abcdef1234567890abcdef12345678' })
  @IsString()
  @IsNotEmpty()
  walletAddress!: string;

  @ApiProperty({ example: '0xsignature...' })
  @IsString()
  @IsNotEmpty()
  signature!: string;
}
