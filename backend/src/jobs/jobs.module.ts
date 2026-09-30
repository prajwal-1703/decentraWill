import { Global, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { OutboxService } from './outbox.service';

@Global()
@Module({
  providers: [QueueService, OutboxService],
  exports: [QueueService, OutboxService],
})
export class JobsModule {}
