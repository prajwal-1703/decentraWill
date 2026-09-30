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
exports.WillsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const wills_service_1 = require("./wills.service");
const wills_dto_1 = require("./wills.dto");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
let WillsController = class WillsController {
    constructor(willsService) {
        this.willsService = willsService;
    }
    async createWill(userId, dto) {
        return this.willsService.createWill(userId, dto);
    }
    async createVersion(userId, willId, dto) {
        return this.willsService.createVersion(userId, willId, dto);
    }
    async addClause(userId, versionId, dto) {
        return this.willsService.addClause(userId, versionId, dto);
    }
    async getVersion(userId, versionId) {
        return this.willsService.getVersion(userId, versionId);
    }
    async finalizeVersion(userId, versionId, dto, idempotencyKey, req) {
        const corrId = req.headers['x-correlation-id'];
        return this.willsService.finalizeVersion(userId, versionId, dto, idempotencyKey, corrId);
    }
    async getBlockchainProof(versionId) {
        return this.willsService.getBlockchainProof(versionId);
    }
};
exports.WillsController = WillsController;
__decorate([
    (0, common_1.Post)('wills'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new will container in an estate' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, wills_dto_1.CreateWillDto]),
    __metadata("design:returntype", Promise)
], WillsController.prototype, "createWill", null);
__decorate([
    (0, common_1.Post)('wills/:willId/versions'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new draft version for a will' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('willId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, wills_dto_1.CreateWillVersionDto]),
    __metadata("design:returntype", Promise)
], WillsController.prototype, "createVersion", null);
__decorate([
    (0, common_1.Post)('versions/:versionId/clauses'),
    (0, swagger_1.ApiOperation)({ summary: 'Add structured clause to a draft will version' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('versionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, wills_dto_1.CreateClauseDto]),
    __metadata("design:returntype", Promise)
], WillsController.prototype, "addClause", null);
__decorate([
    (0, common_1.Get)('versions/:versionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get full details of a specific will version' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('versionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WillsController.prototype, "getVersion", null);
__decorate([
    (0, common_1.Post)('versions/:versionId/finalize'),
    (0, decorators_1.RequireStepUp)(),
    (0, swagger_1.ApiOperation)({ summary: 'Finalize a will version with step-up verification and audit anchoring' }),
    (0, swagger_1.ApiHeader)({ name: 'x-step-up-token', required: true, description: 'Step-up authentication proof token' }),
    (0, swagger_1.ApiHeader)({ name: 'idempotency-key', required: false, description: 'Client idempotency key' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('versionId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Headers)('idempotency-key')),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, wills_dto_1.FinalizeVersionDto, String, Object]),
    __metadata("design:returntype", Promise)
], WillsController.prototype, "finalizeVersion", null);
__decorate([
    (0, common_1.Get)('versions/:versionId/blockchain-proof'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve on-chain cryptographic anchor proof for a finalized version' }),
    __param(0, (0, common_1.Param)('versionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WillsController.prototype, "getBlockchainProof", null);
exports.WillsController = WillsController = __decorate([
    (0, swagger_1.ApiTags)('Wills'),
    (0, common_1.Controller)('api/v1'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [wills_service_1.WillsService])
], WillsController);
//# sourceMappingURL=wills.controller.js.map