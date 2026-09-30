import { Module } from '@nestjs/common';
import { InheritanceService } from './inheritance.service';
import { InheritanceController } from './inheritance.controller';

@Module({
  controllers: [InheritanceController],
  providers: [InheritanceService],
  exports: [InheritanceService],
})
export class InheritanceModule {}
