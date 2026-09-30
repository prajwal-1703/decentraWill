import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InheritanceService } from './inheritance.service';
import { CreateActivationCaseDto } from './inheritance.dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Inheritance & Activation')
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InheritanceController {
  constructor(private readonly inheritanceService: InheritanceService) {}

  @Post('activation-cases')
  @ApiOperation({ summary: 'Submit estate activation request with death/trigger evidence' })
  async submitActivation(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateActivationCaseDto
  ) {
    return this.inheritanceService.submitActivation(userId, dto);
  }

  @Post('activation-cases/:caseId/approve')
  @ApiOperation({ summary: 'Approve activation following governance validation and start controlled release' })
  async approveActivation(
    @CurrentUser('id') userId: string,
    @Param('caseId') caseId: string
  ) {
    return this.inheritanceService.approveActivation(userId, caseId);
  }

  @Post('activation-cases/:caseId/close')
  @ApiOperation({ summary: 'Close execution case and archive estate upon complete distribution' })
  async closeExecution(
    @CurrentUser('id') userId: string,
    @Param('caseId') caseId: string
  ) {
    return this.inheritanceService.closeExecution(userId, caseId);
  }

  @Get('estates/:estateId/activation-cases')
  @ApiOperation({ summary: 'List activation cases for an estate' })
  async listActivationCases(@Param('estateId') estateId: string) {
    return this.inheritanceService.listActivationCases(estateId);
  }
}
