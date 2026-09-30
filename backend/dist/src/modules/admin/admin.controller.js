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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const audit_service_1 = require("../audit/audit.service");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
const client_1 = require("@prisma/client");
let AdminController = class AdminController {
    constructor(adminService, auditService) {
        this.adminService = adminService;
        this.auditService = auditService;
    }
    async getHealth() {
        return this.adminService.getHealthStatus();
    }
    async getLive() {
        return { status: 'UP', timestamp: new Date().toISOString() };
    }
    async getReady() {
        return this.adminService.getHealthStatus();
    }
    async verifyAuditChain() {
        return this.adminService.verifyAuditChain();
    }
    async getSecurityEvents() {
        return this.adminService.getSecurityEvents();
    }
    async reconcile() {
        return this.adminService.reconcileBlockchain();
    }
    async getEstateAudit(estateId) {
        return this.auditService.getEstateAuditTrail(estateId);
    }
    async exceptionalAccess(adminId, documentId, reason, req) {
        const ip = req.ip || req.headers['x-forwarded-for'];
        return this.adminService.exceptionalDocumentAccess(adminId, documentId, reason, ip);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('admin/health'),
    (0, swagger_1.ApiOperation)({ summary: 'System component health check' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Standard live check' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getLive", null);
__decorate([
    (0, common_1.Get)('health/ready'),
    (0, swagger_1.ApiOperation)({ summary: 'Readiness probe' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getReady", null);
__decorate([
    (0, common_1.Get)('admin/audit-verify'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cryptographically verify the tamper-evident SHA-256 audit log chain' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "verifyAuditChain", null);
__decorate([
    (0, common_1.Get)('admin/security-events'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Inspect security alerts and anomaly events' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSecurityEvents", null);
__decorate([
    (0, common_1.Post)('admin/blockchain/reconcile'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger on-chain transaction reconciliation worker' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reconcile", null);
__decorate([
    (0, common_1.Get)('estates/:estateId/audit'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get auditable event trail for an estate' }),
    __param(0, (0, common_1.Param)('estateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getEstateAudit", null);
__decorate([
    (0, common_1.Post)('admin/exceptional-access'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, decorators_1.Roles)(client_1.RoleType.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Exceptional audited document access for administrative investigation' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)('documentId')),
    __param(2, (0, common_1.Body)('reason')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exceptionalAccess", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin & Operations'),
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        audit_service_1.AuditService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map