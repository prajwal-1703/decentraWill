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
exports.InheritanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inheritance_service_1 = require("./inheritance.service");
const inheritance_dto_1 = require("./inheritance.dto");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
let InheritanceController = class InheritanceController {
    constructor(inheritanceService) {
        this.inheritanceService = inheritanceService;
    }
    async submitActivation(userId, dto) {
        return this.inheritanceService.submitActivation(userId, dto);
    }
    async approveActivation(userId, caseId) {
        return this.inheritanceService.approveActivation(userId, caseId);
    }
    async closeExecution(userId, caseId) {
        return this.inheritanceService.closeExecution(userId, caseId);
    }
    async listActivationCases(estateId) {
        return this.inheritanceService.listActivationCases(estateId);
    }
};
exports.InheritanceController = InheritanceController;
__decorate([
    (0, common_1.Post)('activation-cases'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit estate activation request with death/trigger evidence' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inheritance_dto_1.CreateActivationCaseDto]),
    __metadata("design:returntype", Promise)
], InheritanceController.prototype, "submitActivation", null);
__decorate([
    (0, common_1.Post)('activation-cases/:caseId/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve activation following governance validation and start controlled release' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InheritanceController.prototype, "approveActivation", null);
__decorate([
    (0, common_1.Post)('activation-cases/:caseId/close'),
    (0, swagger_1.ApiOperation)({ summary: 'Close execution case and archive estate upon complete distribution' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InheritanceController.prototype, "closeExecution", null);
__decorate([
    (0, common_1.Get)('estates/:estateId/activation-cases'),
    (0, swagger_1.ApiOperation)({ summary: 'List activation cases for an estate' }),
    __param(0, (0, common_1.Param)('estateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InheritanceController.prototype, "listActivationCases", null);
exports.InheritanceController = InheritanceController = __decorate([
    (0, swagger_1.ApiTags)('Inheritance & Activation'),
    (0, common_1.Controller)('api/v1'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [inheritance_service_1.InheritanceService])
], InheritanceController);
//# sourceMappingURL=inheritance.controller.js.map