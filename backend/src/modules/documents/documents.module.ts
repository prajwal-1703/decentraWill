import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { StorageService } from './storage.service';
import { MalwareScannerService } from './malware-scanner.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, StorageService, MalwareScannerService],
  exports: [DocumentsService, StorageService],
})
export class DocumentsModule {}
