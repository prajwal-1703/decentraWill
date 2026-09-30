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
exports.GovernanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const governance_service_1 = require("./governance.service");
const governance_dto_1 = require("./governance.dto");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
let GovernanceController = class GovernanceController {
    constructor(governanceService) {
        this.governanceService = governanceService;
    }
    async createProposal(userId, estateId, dto) {
        return this.governanceService.createProposal(userId, estateId, dto);
    }
    async castVote(userId, proposalId, dto, stepUpToken) {
        return this.governanceService.castVote(userId, proposalId, dto, stepUpToken);
    }
    async getProposal(userId, proposalId) {
        return this.governanceService.getProposal(userId, proposalId);
    }
    async listEstateProposals(userId, estateId) {
        return this.governanceService.listEstateProposals(userId, estateId);
    }
};
exports.GovernanceController = GovernanceController;
__decorate([
    (0, common_1.Post)('estates/:estateId/proposals'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new estate governance proposal' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('estateId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, governance_dto_1.CreateProposalDto]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "createProposal", null);
__decorate([
    (0, common_1.Post)('proposals/:proposalId/vote'),
    (0, swagger_1.ApiOperation)({ summary: 'Cast an auditable vote on a proposal' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('proposalId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Headers)('x-step-up-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, governance_dto_1.CastVoteDto, String]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "castVote", null);
__decorate([
    (0, common_1.Get)('proposals/:proposalId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details, vote tally, and outcome of a proposal' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('proposalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "getProposal", null);
__decorate([
    (0, common_1.Get)('estates/:estateId/proposals'),
    (0, swagger_1.ApiOperation)({ summary: 'List all proposals for an estate' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('estateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "listEstateProposals", null);
exports.GovernanceController = GovernanceController = __decorate([
    (0, swagger_1.ApiTags)('Governance & Voting'),
    (0, common_1.Controller)('api/v1'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [governance_service_1.GovernanceService])
], GovernanceController);
//# sourceMappingURL=governance.controller.js.map