import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EstatesService } from './estates.service';
import { CreateEstateDto, InviteParticipantDto } from './estates.dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Estates')
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EstatesController {
  constructor(private readonly estatesService: EstatesService) {}

  @Post('estates')
  @ApiOperation({ summary: 'Create a new estate container' })
  async createEstate(@CurrentUser('id') userId: string, @Body() dto: CreateEstateDto) {
    return this.estatesService.createEstate(userId, dto);
  }

  @Get('estates')
  @ApiOperation({ summary: 'List all estates for the authenticated user' })
  async listUserEstates(@CurrentUser('id') userId: string) {
    return this.estatesService.listUserEstates(userId);
  }

  @Get('estates/:estateId')
  @ApiOperation({ summary: 'Get details of an estate including participants' })
  async getEstate(@CurrentUser('id') userId: string, @Param('estateId') estateId: string) {
    return this.estatesService.getEstate(userId, estateId);
  }

  @Post('estates/:estateId/participants/invite')
  @ApiOperation({ summary: 'Invite a participant (Advocate, Witness, Executor, Beneficiary)' })
  async inviteParticipant(
    @CurrentUser('id') userId: string,
    @Param('estateId') estateId: string,
    @Body() dto: InviteParticipantDto
  ) {
    return this.estatesService.inviteParticipant(userId, estateId, dto);
  }

  @Post('invitations/:token/accept')
  @ApiOperation({ summary: 'Accept an estate participant invitation token' })
  async acceptInvitation(@CurrentUser('id') userId: string, @Param('token') token: string) {
    return this.estatesService.acceptInvitation(userId, token);
  }

  @Delete('estates/:estateId/participants/:membershipId')
  @ApiOperation({ summary: 'Revoke estate participant membership' })
  async revokeMembership(
    @CurrentUser('id') userId: string,
    @Param('estateId') estateId: string,
    @Param('membershipId') membershipId: string
  ) {
    return this.estatesService.revokeMembership(userId, estateId, membershipId);
  }
}
