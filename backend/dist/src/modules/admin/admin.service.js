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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const blockchain_service_1 = require("../blockchain/blockchain.service");
const documents_service_1 = require("../documents/documents.service");
let AdminService = class AdminService {
    constructor(prisma, audit, blockchain, documents) {
        this.prisma = prisma;
        this.audit = audit;
        this.blockchain = blockchain;
        this.documents = documents;
    }
    async getHealthStatus() {
        let dbStatus = 'DOWN';
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            dbStatus = 'UP';
        }
        catch {
            dbStatus = 'DOWN';
        }
        return {
            status: dbStatus === 'UP' ? 'OK' : 'ERROR',
            timestamp: new Date().toISOString(),
            services: {
                database: dbStatus,
                storage: 'UP',
                redis: 'UP',
                blockchain: 'UP',
            },
        };
    }
    async verifyAuditChain() {
        return this.audit.verifyChain();
    }
    async getSecurityEvents(limit = 50) {
        return this.prisma.securityEvent.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
    }
    async reconcileBlockchain() {
        return this.blockchain.reconcile();
    }
    async exceptionalDocumentAccess(adminUserId, documentId, reason, ipAddress) {
        await this.audit.logEvent({
            actorId: adminUserId,
            eventType: 'ADMIN_EXCEPTIONAL_DOCUMENT_ACCESS',
            resourceType: 'DOCUMENT',
            resourceId: documentId,
            metadata: { reason },
            ipAddress,
        });
        return this.documents.downloadDocument(adminUserId, documentId, ipAddress);
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        blockchain_service_1.BlockchainService,
        documents_service_1.DocumentsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map