import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [BlockchainModule, DocumentsModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
