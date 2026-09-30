import { Module } from '@nestjs/common';
import { WillsService } from './wills.service';
import { WillsController } from './wills.controller';

@Module({
  controllers: [WillsController],
  providers: [WillsService],
  exports: [WillsService],
})
export class WillsModule {}
