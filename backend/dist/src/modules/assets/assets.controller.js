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
exports.AssetsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const assets_service_1 = require("./assets.service");
const assets_dto_1 = require("./assets.dto");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
let AssetsController = class AssetsController {
    constructor(assetsService) {
        this.assetsService = assetsService;
    }
    async createAsset(userId, estateId, dto) {
        return this.assetsService.createAsset(userId, estateId, dto);
    }
    async listEstateAssets(userId, estateId) {
        return this.assetsService.listEstateAssets(userId, estateId);
    }
    async createAllocation(userId, assetId, dto) {
        return this.assetsService.createAllocation(userId, assetId, dto);
    }
    async createTransferCase(userId, assetId, dto) {
        return this.assetsService.createTransferCase(userId, assetId, dto);
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Post)('estates/:estateId/assets'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a physical, financial, or digital asset to an estate' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('estateId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, assets_dto_1.CreateAssetDto]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "createAsset", null);
__decorate([
    (0, common_1.Get)('estates/:estateId/assets'),
    (0, swagger_1.ApiOperation)({ summary: 'List assets in an estate with role-based visibility' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('estateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "listEstateAssets", null);
__decorate([
    (0, common_1.Post)('assets/:assetId/allocations'),
    (0, swagger_1.ApiOperation)({ summary: 'Allocate an asset share or specific amount to a beneficiary' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('assetId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, assets_dto_1.CreateAllocationDto]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "createAllocation", null);
__decorate([
    (0, common_1.Post)('assets/:assetId/transfer-cases'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate a physical/legal or blockchain-native asset transfer case' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('assetId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, assets_dto_1.CreateTransferCaseDto]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "createTransferCase", null);
exports.AssetsController = AssetsController = __decorate([
    (0, swagger_1.ApiTags)('Assets'),
    (0, common_1.Controller)('api/v1'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [assets_service_1.AssetsService])
], AssetsController);
//# sourceMappingURL=assets.controller.js.map