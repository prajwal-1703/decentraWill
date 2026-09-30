import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttestationsService } from './attestations.service';
import { CreateAttestationDto } from './attestations.dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Attestations')
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttestationsController {
  constructor(private readonly attestationsService: AttestationsService) {}

  @Post('versions/:versionId/attestations')
  @ApiOperation({ summary: 'Submit witness or advocate attestation for a will version' })
  async createAttestation(
    @CurrentUser('id') userId: string,
    @Param('versionId') versionId: string,
    @Body() dto: CreateAttestationDto
  ) {
    return this.attestationsService.createAttestation(userId, versionId, dto);
  }

  @Get('versions/:versionId/attestations')
  @ApiOperation({ summary: 'List all recorded attestations for a will version' })
  async listAttestations(
    @CurrentUser('id') userId: string,
    @Param('versionId') versionId: string
  ) {
    return this.attestationsService.listAttestations(userId, versionId);
  }
}
