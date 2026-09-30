import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Workflows')
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post('estates/:estateId/workflow/trigger')
  @ApiOperation({ summary: 'Trigger a workflow instance for an estate' })
  async triggerWorkflow(
    @CurrentUser('id') userId: string,
    @Param('estateId') estateId: string,
    @Body('type') type: string,
    @Body('metadata') metadata: any
  ) {
    return this.workflowsService.triggerWorkflow(userId, estateId, type || 'ESTATE_ACTIVATION', metadata);
  }

  @Get('workflows/:workflowId')
  @ApiOperation({ summary: 'Get details and pending tasks of a workflow instance' })
  async getWorkflow(@CurrentUser('id') userId: string, @Param('workflowId') workflowId: string) {
    return this.workflowsService.getWorkflow(userId, workflowId);
  }

  @Post('tasks/:taskId/approve')
  @ApiOperation({ summary: 'Approve a workflow task' })
  async approveTask(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
    @Body() actionDetails: any
  ) {
    return this.workflowsService.approveTask(userId, taskId, actionDetails);
  }

  @Post('tasks/:taskId/reject')
  @ApiOperation({ summary: 'Reject a workflow task' })
  async rejectTask(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
    @Body('reason') reason: string
  ) {
    return this.workflowsService.rejectTask(userId, taskId, reason);
  }
}
