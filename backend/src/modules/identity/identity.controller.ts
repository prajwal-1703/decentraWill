import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IdentityService } from './kyc.service';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Identity / KYC')
@Controller('api/v1/kyc')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post('start')
  @ApiOperation({ summary: 'Initiate KYC verification workflow' })
  async startKyc(@CurrentUser('id') userId: string) {
    return this.identityService.startKyc(userId);
  }

  @Get('status')
  @ApiOperation({ summary: 'Retrieve KYC status for the current user' })
  async getKycStatus(@CurrentUser('id') userId: string) {
    return this.identityService.getKycStatus(userId);
  }

  @Post('mock-verify')
  @ApiOperation({ summary: 'Complete mock KYC verification for testing' })
  async mockVerify(@CurrentUser('id') userId: string) {
    return this.identityService.verifyKycMock(userId);
  }
}
