import { Controller, Post, Get, Body, Param, Headers, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { WillsService } from './wills.service';
import { CreateWillDto, CreateWillVersionDto, CreateClauseDto, FinalizeVersionDto } from './wills.dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser, RequireStepUp } from '../../common/decorators';
import { Request } from 'express';

@ApiTags('Wills')
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WillsController {
  constructor(private readonly willsService: WillsService) {}

  @Post('wills')
  @ApiOperation({ summary: 'Create a new will container in an estate' })
  async createWill(@CurrentUser('id') userId: string, @Body() dto: CreateWillDto) {
    return this.willsService.createWill(userId, dto);
  }

  @Post('wills/:willId/versions')
  @ApiOperation({ summary: 'Create a new draft version for a will' })
  async createVersion(
    @CurrentUser('id') userId: string,
    @Param('willId') willId: string,
    @Body() dto: CreateWillVersionDto
  ) {
    return this.willsService.createVersion(userId, willId, dto);
  }

  @Post('versions/:versionId/clauses')
  @ApiOperation({ summary: 'Add structured clause to a draft will version' })
  async addClause(
    @CurrentUser('id') userId: string,
    @Param('versionId') versionId: string,
    @Body() dto: CreateClauseDto
  ) {
    return this.willsService.addClause(userId, versionId, dto);
  }

  @Get('versions/:versionId')
  @ApiOperation({ summary: 'Get full details of a specific will version' })
  async getVersion(@CurrentUser('id') userId: string, @Param('versionId') versionId: string) {
    return this.willsService.getVersion(userId, versionId);
  }

  @Post('versions/:versionId/finalize')
  @RequireStepUp()
  @ApiOperation({ summary: 'Finalize a will version with step-up verification and audit anchoring' })
  @ApiHeader({ name: 'x-step-up-token', required: true, description: 'Step-up authentication proof token' })
  @ApiHeader({ name: 'idempotency-key', required: false, description: 'Client idempotency key' })
  async finalizeVersion(
    @CurrentUser('id') userId: string,
    @Param('versionId') versionId: string,
    @Body() dto: FinalizeVersionDto,
    @Headers('idempotency-key') idempotencyKey: string,
    @Req() req: Request
  ) {
    const corrId = req.headers['x-correlation-id'] as string;
    return this.willsService.finalizeVersion(userId, versionId, dto, idempotencyKey, corrId);
  }

  @Get('versions/:versionId/blockchain-proof')
  @ApiOperation({ summary: 'Retrieve on-chain cryptographic anchor proof for a finalized version' })
  async getBlockchainProof(@Param('versionId') versionId: string) {
    return this.willsService.getBlockchainProof(versionId);
  }
}
