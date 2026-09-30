"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const outbox_service_1 = require("./jobs/outbox.service");
const blockchain_service_1 = require("./modules/blockchain/blockchain.service");
async function bootstrapWorker() {
    const logger = new common_1.Logger('DecentraWillWorker');
    logger.log('Starting DecentraWill background worker daemon...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const outboxService = app.get(outbox_service_1.OutboxService);
    const blockchainService = app.get(blockchain_service_1.BlockchainService);
    const interval = setInterval(async () => {
        try {
            await outboxService.processPendingEvents();
            await blockchainService.reconcile();
        }
        catch (err) {
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
//# sourceMappingURL=worker.js.map