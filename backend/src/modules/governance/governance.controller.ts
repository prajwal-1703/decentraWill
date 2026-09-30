import { Controller, Post, Get, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GovernanceService } from './governance.service';
import { CreateProposalDto, CastVoteDto } from './governance.dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Governance & Voting')
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Post('estates/:estateId/proposals')
  @ApiOperation({ summary: 'Create a new estate governance proposal' })
  async createProposal(
    @CurrentUser('id') userId: string,
    @Param('estateId') estateId: string,
    @Body() dto: CreateProposalDto
  ) {
    return this.governanceService.createProposal(userId, estateId, dto);
  }

  @Post('proposals/:proposalId/vote')
  @ApiOperation({ summary: 'Cast an auditable vote on a proposal' })
  async castVote(
    @CurrentUser('id') userId: string,
    @Param('proposalId') proposalId: string,
    @Body() dto: CastVoteDto,
    @Headers('x-step-up-token') stepUpToken?: string
  ) {
    return this.governanceService.castVote(userId, proposalId, dto, stepUpToken);
  }

  @Get('proposals/:proposalId')
  @ApiOperation({ summary: 'Get details, vote tally, and outcome of a proposal' })
  async getProposal(
    @CurrentUser('id') userId: string,
    @Param('proposalId') proposalId: string
  ) {
    return this.governanceService.getProposal(userId, proposalId);
  }

  @Get('estates/:estateId/proposals')
  @ApiOperation({ summary: 'List all proposals for an estate' })
  async listEstateProposals(
    @CurrentUser('id') userId: string,
    @Param('estateId') estateId: string
  ) {
    return this.governanceService.listEstateProposals(userId, estateId);
  }
}
