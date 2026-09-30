import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProofOfLifeService } from './proof-of-life.service';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Proof of Life')
@Controller('api/v1/estates/:estateId/proof-of-life')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProofOfLifeController {
  constructor(private readonly polService: ProofOfLifeService) {}

  @Post('respond')
  @ApiOperation({ summary: 'Testator check-in to confirm activity' })
  async respond(@CurrentUser('id') userId: string, @Param('estateId') estateId: string) {
    return this.polService.respondCheck(userId, estateId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve proof of life status and check-in history' })
  async getStatus(@CurrentUser('id') userId: string, @Param('estateId') estateId: string) {
    return this.polService.getStatus(userId, estateId);
  }

  @Post('simulate-missed')
  @ApiOperation({ summary: 'Simulate missed check to test escalation logic' })
  async simulateMissed(@Param('estateId') estateId: string) {
    return this.polService.simulateMissedCheck(estateId);
  }
}
