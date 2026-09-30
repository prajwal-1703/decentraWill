import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { RoleType } from '@prisma/client';
import { Request } from 'express';

@ApiTags('Admin & Operations')
@Controller('api/v1')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditService: AuditService
  ) {}

  @Get('admin/health')
  @ApiOperation({ summary: 'System component health check' })
  async getHealth() {
    return this.adminService.getHealthStatus();
  }

  @Get('health')
  @ApiOperation({ summary: 'Standard live check' })
  async getLive() {
    return { status: 'UP', timestamp: new Date().toISOString() };
  }

  @Get('health/ready')
  @ApiOperation({ summary: 'Readiness probe' })
  async getReady() {
    return this.adminService.getHealthStatus();
  }

  @Get('admin/audit-verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cryptographically verify the tamper-evident SHA-256 audit log chain' })
  async verifyAuditChain() {
    return this.adminService.verifyAuditChain();
  }

  @Get('admin/security-events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inspect security alerts and anomaly events' })
  async getSecurityEvents() {
    return this.adminService.getSecurityEvents();
  }

  @Post('admin/blockchain/reconcile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger on-chain transaction reconciliation worker' })
  async reconcile() {
    return this.adminService.reconcileBlockchain();
  }

  @Get('estates/:estateId/audit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get auditable event trail for an estate' })
  async getEstateAudit(@Param('estateId') estateId: string) {
    return this.auditService.getEstateAuditTrail(estateId);
  }

  @Post('admin/exceptional-access')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Exceptional audited document access for administrative investigation' })
  async exceptionalAccess(
    @CurrentUser('id') adminId: string,
    @Body('documentId') documentId: string,
    @Body('reason') reason: string,
    @Req() req: Request
  ) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    return this.adminService.exceptionalDocumentAccess(adminId, documentId, reason, ip);
  }
}
