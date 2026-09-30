import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto, CreateAllocationDto, CreateTransferCaseDto } from './assets.dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Assets')
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('estates/:estateId/assets')
  @ApiOperation({ summary: 'Register a physical, financial, or digital asset to an estate' })
  async createAsset(
    @CurrentUser('id') userId: string,
    @Param('estateId') estateId: string,
    @Body() dto: CreateAssetDto
  ) {
    return this.assetsService.createAsset(userId, estateId, dto);
  }

  @Get('estates/:estateId/assets')
  @ApiOperation({ summary: 'List assets in an estate with role-based visibility' })
  async listEstateAssets(
    @CurrentUser('id') userId: string,
    @Param('estateId') estateId: string
  ) {
    return this.assetsService.listEstateAssets(userId, estateId);
  }

  @Post('assets/:assetId/allocations')
  @ApiOperation({ summary: 'Allocate an asset share or specific amount to a beneficiary' })
  async createAllocation(
    @CurrentUser('id') userId: string,
    @Param('assetId') assetId: string,
    @Body() dto: CreateAllocationDto
  ) {
    return this.assetsService.createAllocation(userId, assetId, dto);
  }

  @Post('assets/:assetId/transfer-cases')
  @ApiOperation({ summary: 'Initiate a physical/legal or blockchain-native asset transfer case' })
  async createTransferCase(
    @CurrentUser('id') userId: string,
    @Param('assetId') assetId: string,
    @Body() dto: CreateTransferCaseDto
  ) {
    return this.assetsService.createTransferCase(userId, assetId, dto);
  }
}
