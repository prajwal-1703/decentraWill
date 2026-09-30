import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { OutboxService } from './jobs/outbox.service';
import { BlockchainService } from './modules/blockchain/blockchain.service';

async function bootstrapWorker() {
  const logger = new Logger('DecentraWillWorker');
  logger.log('Starting DecentraWill background worker daemon...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const outboxService = app.get(OutboxService);
  const blockchainService = app.get(BlockchainService);

  // Background polling loop for Outbox events & Reconciliation
  const interval = setInterval(async () => {
    try {
      await outboxService.processPendingEvents();
      await blockchainService.reconcile();
    } catch (err: any) {
      logger.error(`Worker error: ${err.message}`);
    }
  }, 5000);

  const shutdown = async () => {
    clearInterval(interval);
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  logger.log('DecentraWill worker daemon is active.');
}

bootstrapWorker();
