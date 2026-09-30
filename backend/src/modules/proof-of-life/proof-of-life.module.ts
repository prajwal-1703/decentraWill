import { Module } from '@nestjs/common';
import { ProofOfLifeService } from './proof-of-life.service';
import { ProofOfLifeController } from './proof-of-life.controller';

@Module({
  controllers: [ProofOfLifeController],
  providers: [ProofOfLifeService],
  exports: [ProofOfLifeService],
})
export class ProofOfLifeModule {}
