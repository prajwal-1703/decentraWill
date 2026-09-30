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
exports.AttestationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const attestations_service_1 = require("./attestations.service");
const attestations_dto_1 = require("./attestations.dto");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
let AttestationsController = class AttestationsController {
    constructor(attestationsService) {
        this.attestationsService = attestationsService;
    }
    async createAttestation(userId, versionId, dto) {
        return this.attestationsService.createAttestation(userId, versionId, dto);
    }
    async listAttestations(userId, versionId) {
        return this.attestationsService.listAttestations(userId, versionId);
    }
};
exports.AttestationsController = AttestationsController;
__decorate([
    (0, common_1.Post)('versions/:versionId/attestations'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit witness or advocate attestation for a will version' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('versionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, attestations_dto_1.CreateAttestationDto]),
    __metadata("design:returntype", Promise)
], AttestationsController.prototype, "createAttestation", null);
__decorate([
    (0, common_1.Get)('versions/:versionId/attestations'),
    (0, swagger_1.ApiOperation)({ summary: 'List all recorded attestations for a will version' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('versionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttestationsController.prototype, "listAttestations", null);
exports.AttestationsController = AttestationsController = __decorate([
    (0, swagger_1.ApiTags)('Attestations'),
    (0, common_1.Controller)('api/v1'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [attestations_service_1.AttestationsService])
], AttestationsController);
//# sourceMappingURL=attestations.controller.js.map