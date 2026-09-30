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
exports.ProofOfLifeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const proof_of_life_service_1 = require("./proof-of-life.service");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
let ProofOfLifeController = class ProofOfLifeController {
    constructor(polService) {
        this.polService = polService;
    }
    async respond(userId, estateId) {
        return this.polService.respondCheck(userId, estateId);
    }
    async getStatus(userId, estateId) {
        return this.polService.getStatus(userId, estateId);
    }
    async simulateMissed(estateId) {
        return this.polService.simulateMissedCheck(estateId);
    }
};
exports.ProofOfLifeController = ProofOfLifeController;
__decorate([
    (0, common_1.Post)('respond'),
    (0, swagger_1.ApiOperation)({ summary: 'Testator check-in to confirm activity' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('estateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProofOfLifeController.prototype, "respond", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve proof of life status and check-in history' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('estateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProofOfLifeController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('simulate-missed'),
    (0, swagger_1.ApiOperation)({ summary: 'Simulate missed check to test escalation logic' }),
    __param(0, (0, common_1.Param)('estateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProofOfLifeController.prototype, "simulateMissed", null);
exports.ProofOfLifeController = ProofOfLifeController = __decorate([
    (0, swagger_1.ApiTags)('Proof of Life'),
    (0, common_1.Controller)('api/v1/estates/:estateId/proof-of-life'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [proof_of_life_service_1.ProofOfLifeService])
], ProofOfLifeController);
//# sourceMappingURL=proof-of-life.controller.js.map