import { Module } from '@nestjs/common';
import { AttestationsService } from './attestations.service';
import { AttestationsController } from './attestations.controller';

@Module({
  controllers: [AttestationsController],
  providers: [AttestationsService],
  exports: [AttestationsService],
})
export class AttestationsModule {}
