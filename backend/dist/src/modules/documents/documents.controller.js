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
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const documents_service_1 = require("./documents.service");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
let DocumentsController = class DocumentsController {
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async uploadVersionDocument(userId, versionId, estateId, file, req) {
        const ip = req.ip || req.headers['x-forwarded-for'];
        const corrId = req.headers['x-correlation-id'];
        return this.documentsService.uploadDocument(userId, estateId, file, versionId, ip, corrId);
    }
    async uploadEstateDocument(userId, estateId, file, req) {
        const ip = req.ip || req.headers['x-forwarded-for'];
        const corrId = req.headers['x-correlation-id'];
        return this.documentsService.uploadDocument(userId, estateId, file, undefined, ip, corrId);
    }
    async downloadDocument(userId, documentId, res, req) {
        const ip = req.ip || req.headers['x-forwarded-for'];
        const corrId = req.headers['x-correlation-id'];
        const result = await this.documentsService.downloadDocument(userId, documentId, ip, corrId);
        res.set({
            'Content-Type': result.mimeType,
            'Content-Disposition': `attachment; filename="${result.fileName}"`,
            'X-Document-SHA256': result.sha256,
        });
        res.send(result.buffer);
    }
    async verifyDocument(documentId) {
        return this.documentsService.verifyDocumentIntegrity(documentId);
    }
    async testCorrupt(documentId) {
        return this.documentsService.corruptDocumentForTest(documentId);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)('versions/:versionId/documents'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload legal document to a specific will version' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('versionId')),
    __param(2, (0, common_1.Body)('estateId')),
    __param(3, (0, common_1.UploadedFile)()),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadVersionDocument", null);
__decorate([
    (0, common_1.Post)('estates/:estateId/documents'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload document directly to an estate vault' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('estateId')),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadEstateDocument", null);
__decorate([
    (0, common_1.Get)('documents/:documentId/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Controlled authenticated download of encrypted document' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('documentId')),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "downloadDocument", null);
__decorate([
    (0, common_1.Post)('documents/:documentId/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify cryptographic SHA-256 integrity of stored document' }),
    __param(0, (0, common_1.Param)('documentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "verifyDocument", null);
__decorate([
    (0, common_1.Post)('documents/:documentId/test-corrupt'),
    (0, swagger_1.ApiOperation)({ summary: 'Corrupt document byte for automated test validation' }),
    __param(0, (0, common_1.Param)('documentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "testCorrupt", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, swagger_1.ApiTags)('Document Vault'),
    (0, common_1.Controller)('api/v1'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map