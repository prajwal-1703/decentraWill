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
exports.IdentityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const kyc_service_1 = require("./kyc.service");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
let IdentityController = class IdentityController {
    constructor(identityService) {
        this.identityService = identityService;
    }
    async startKyc(userId) {
        return this.identityService.startKyc(userId);
    }
    async getKycStatus(userId) {
        return this.identityService.getKycStatus(userId);
    }
    async mockVerify(userId) {
        return this.identityService.verifyKycMock(userId);
    }
};
exports.IdentityController = IdentityController;
__decorate([
    (0, common_1.Post)('start'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate KYC verification workflow' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IdentityController.prototype, "startKyc", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve KYC status for the current user' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IdentityController.prototype, "getKycStatus", null);
__decorate([
    (0, common_1.Post)('mock-verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete mock KYC verification for testing' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IdentityController.prototype, "mockVerify", null);
exports.IdentityController = IdentityController = __decorate([
    (0, swagger_1.ApiTags)('Identity / KYC'),
    (0, common_1.Controller)('api/v1/kyc'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [kyc_service_1.IdentityService])
], IdentityController);
//# sourceMappingURL=identity.controller.js.map