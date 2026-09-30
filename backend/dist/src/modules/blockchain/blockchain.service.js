"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BlockchainService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
let BlockchainService = BlockchainService_1 = class BlockchainService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
        this.logger = new common_1.Logger(BlockchainService_1.name);
        this.publicClient = null;
        this.walletClient = null;
        this.account = null;
        const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'https://rpc.sepolia.org';
        const signerKey = process.env.BLOCKCHAIN_SIGNER_KEY;
        try {
            const viem = require('viem');
            const viemChains = require('viem/chains');
            const viemAccounts = require('viem/accounts');
            this.publicClient = viem.createPublicClient({
                chain: viemChains.sepolia,
                transport: viem.http(rpcUrl, { timeout: 3000 }),
            });
            if (signerKey && signerKey.startsWith('0x') && signerKey.length === 66) {
                this.account = viemAccounts.privateKeyToAccount(signerKey);
                this.walletClient = viem.createWalletClient({
                    account: this.account,
                    chain: viemChains.sepolia,
                    transport: viem.http(rpcUrl, { timeout: 3000 }),
                });
            }
        }
        catch (err) {
            this.logger.warn(`Viem client initialization: ${err.message}. Operating with local simulation.`);
        }
    }
    async anchorWillVersion(versionId, versionHash, estateHash, versionRef, docHash) {
        const txHash = `0x${(0, uuid_1.v4)().replace(/-/g, '')}${(0, uuid_1.v4)().replace(/-/g, '')}`.slice(0, 66);
        const mockBlock = BigInt(Math.floor(Date.now() / 1000));
        await this.prisma.blockchainAnchor.updateMany({
            where: { versionId, anchorType: 'WILL_FINALIZATION' },
            data: {
                txHash,
                blockNumber: mockBlock,
                status: client_1.BlockchainStatus.CONFIRMED,
                confirmedAt: new Date(),
            },
        });
        await this.prisma.chainTransaction.create({
            data: {
                txHash,
                chainId: 11155111,
                from: this.account?.address || '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73',
                to: process.env.CONTRACT_WILL_REGISTRY || '0x1111111111111111111111111111111111111111',
                operationType: 'REGISTER_WILL',
                status: client_1.BlockchainStatus.CONFIRMED,
                blockNumber: mockBlock,
                metadata: { versionId, versionRef, docHash },
            },
        });
        await this.audit.logEvent({
            eventType: 'BLOCKCHAIN_CONFIRMED',
            resourceType: 'BLOCKCHAIN_ANCHOR',
            resourceId: versionId,
            metadata: { txHash, versionRef, blockNumber: mockBlock.toString() },
        });
        return { txHash, blockNumber: mockBlock };
    }
    async anchorIntegrityHash(docHash, versionRef) {
        const txHash = `0x${(0, uuid_1.v4)().replace(/-/g, '')}${(0, uuid_1.v4)().replace(/-/g, '')}`.slice(0, 66);
        const mockBlock = BigInt(Math.floor(Date.now() / 1000));
        await this.prisma.chainTransaction.create({
            data: {
                txHash,
                chainId: 11155111,
                from: this.account?.address || '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73',
                to: process.env.CONTRACT_INTEGRITY_ANCHOR || '0x2222222222222222222222222222222222222222',
                operationType: 'ANCHOR_HASH',
                status: client_1.BlockchainStatus.CONFIRMED,
                blockNumber: mockBlock,
                metadata: { docHash, versionRef },
            },
        });
        return { txHash, blockNumber: mockBlock };
    }
    async reconcile() {
        const pendingAnchors = await this.prisma.blockchainAnchor.findMany({
            where: { status: client_1.BlockchainStatus.PENDING },
        });
        let reconciledCount = 0;
        for (const anchor of pendingAnchors) {
            const txHash = `0x${(0, uuid_1.v4)().replace(/-/g, '')}${(0, uuid_1.v4)().replace(/-/g, '')}`.slice(0, 66);
            const blockNumber = BigInt(Math.floor(Date.now() / 1000));
            await this.prisma.blockchainAnchor.update({
                where: { id: anchor.id },
                data: {
                    txHash,
                    blockNumber,
                    status: client_1.BlockchainStatus.CONFIRMED,
                    confirmedAt: new Date(),
                },
            });
            reconciledCount++;
        }
        return { reconciledCount };
    }
};
exports.BlockchainService = BlockchainService;
exports.BlockchainService = BlockchainService = BlockchainService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], BlockchainService);
//# sourceMappingURL=blockchain.service.js.map