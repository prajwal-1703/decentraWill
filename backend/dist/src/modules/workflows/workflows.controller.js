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
exports.WorkflowsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const workflows_service_1 = require("./workflows.service");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
let WorkflowsController = class WorkflowsController {
    constructor(workflowsService) {
        this.workflowsService = workflowsService;
    }
    async triggerWorkflow(userId, estateId, type, metadata) {
        return this.workflowsService.triggerWorkflow(userId, estateId, type || 'ESTATE_ACTIVATION', metadata);
    }
    async getWorkflow(userId, workflowId) {
        return this.workflowsService.getWorkflow(userId, workflowId);
    }
    async approveTask(userId, taskId, actionDetails) {
        return this.workflowsService.approveTask(userId, taskId, actionDetails);
    }
    async rejectTask(userId, taskId, reason) {
        return this.workflowsService.rejectTask(userId, taskId, reason);
    }
};
exports.WorkflowsController = WorkflowsController;
__decorate([
    (0, common_1.Post)('estates/:estateId/workflow/trigger'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger a workflow instance for an estate' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('estateId')),
    __param(2, (0, common_1.Body)('type')),
    __param(3, (0, common_1.Body)('metadata')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "triggerWorkflow", null);
__decorate([
    (0, common_1.Get)('workflows/:workflowId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details and pending tasks of a workflow instance' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('workflowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "getWorkflow", null);
__decorate([
    (0, common_1.Post)('tasks/:taskId/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a workflow task' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "approveTask", null);
__decorate([
    (0, common_1.Post)('tasks/:taskId/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a workflow task' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "rejectTask", null);
exports.WorkflowsController = WorkflowsController = __decorate([
    (0, swagger_1.ApiTags)('Workflows'),
    (0, common_1.Controller)('api/v1'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [workflows_service_1.WorkflowsService])
], WorkflowsController);
//# sourceMappingURL=workflows.controller.js.map