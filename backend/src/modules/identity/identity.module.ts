import { Module } from '@nestjs/common';
import { IdentityService, MockKycProvider } from './kyc.service';
import { IdentityController } from './identity.controller';

@Module({
  controllers: [IdentityController],
  providers: [IdentityService, MockKycProvider],
  exports: [IdentityService],
})
export class IdentityModule {}
