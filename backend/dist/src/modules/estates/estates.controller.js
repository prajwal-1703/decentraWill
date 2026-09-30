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
exports.EstatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const estates_service_1 = require("./estates.service");
const estates_dto_1 = require("./estates.dto");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
let EstatesController = class EstatesController {
    constructor(estatesService) {
        this.estatesService = estatesService;
    }
    async createEstate(userId, dto) {
        return this.estatesService.createEstate(userId, dto);
    }
    async listUserEstates(userId) {
        return this.estatesService.listUserEstates(userId);
    }
    async getEstate(userId, estateId) {
        return this.estatesService.getEstate(userId, estateId);
    }
    async inviteParticipant(userId, estateId, dto) {
        return this.estatesService.inviteParticipant(userId, estateId, dto);
    }
    async acceptInvitation(userId, token) {
        return this.estatesService.acceptInvitation(userId, token);
    }
    async revokeMembership(userId, estateId, membershipId) {
        return this.estatesService.revokeMembership(userId, estateId, membershipId);
    }
};
exports.EstatesController = EstatesController;
__decorate([
    (0, common_1.Post)('estates'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new estate container' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, estates_dto_1.CreateEstateDto]),
    __metadata("design:returntype", Promise)
], EstatesController.prototype, "createEstate", null);
__decorate([
    (0, common_1.Get)('estates'),
    (0, swagger_1.ApiOperation)({ summary: 'List all estates for the authenticated user' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EstatesController.prototype, "listUserEstates", null);
__decorate([
    (0, common_1.Get)('estates/:estateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details of an estate including participants' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('estateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EstatesController.prototype, "getEstate", null);
__decorate([
    (0, common_1.Post)('estates/:estateId/participants/invite'),
    (0, swagger_1.ApiOperation)({ summary: 'Invite a participant (Advocate, Witness, Executor, Beneficiary)' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('estateId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, estates_dto_1.InviteParticipantDto]),
    __metadata("design:returntype", Promise)
], EstatesController.prototype, "inviteParticipant", null);
__decorate([
    (0, common_1.Post)('invitations/:token/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept an estate participant invitation token' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EstatesController.prototype, "acceptInvitation", null);
__decorate([
    (0, common_1.Delete)('estates/:estateId/participants/:membershipId'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke estate participant membership' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('estateId')),
    __param(2, (0, common_1.Param)('membershipId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EstatesController.prototype, "revokeMembership", null);
exports.EstatesController = EstatesController = __decorate([
    (0, swagger_1.ApiTags)('Estates'),
    (0, common_1.Controller)('api/v1'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [estates_service_1.EstatesService])
], EstatesController);
//# sourceMappingURL=estates.controller.js.map