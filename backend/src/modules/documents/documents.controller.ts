import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { Response, Request } from 'express';

@ApiTags('Document Vault')
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('versions/:versionId/documents')
  @ApiOperation({ summary: 'Upload legal document to a specific will version' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVersionDocument(
    @CurrentUser('id') userId: string,
    @Param('versionId') versionId: string,
    @Body('estateId') estateId: string,
    @UploadedFile() file: any,
    @Req() req: Request
  ) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    const corrId = req.headers['x-correlation-id'] as string;
    return this.documentsService.uploadDocument(userId, estateId, file, versionId, ip, corrId);
  }

  @Post('estates/:estateId/documents')
  @ApiOperation({ summary: 'Upload document directly to an estate vault' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadEstateDocument(
    @CurrentUser('id') userId: string,
    @Param('estateId') estateId: string,
    @UploadedFile() file: any,
    @Req() req: Request
  ) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    const corrId = req.headers['x-correlation-id'] as string;
    return this.documentsService.uploadDocument(userId, estateId, file, undefined, ip, corrId);
  }

  @Get('documents/:documentId/download')
  @ApiOperation({ summary: 'Controlled authenticated download of encrypted document' })
  async downloadDocument(
    @CurrentUser('id') userId: string,
    @Param('documentId') documentId: string,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    const corrId = req.headers['x-correlation-id'] as string;
    const result = await this.documentsService.downloadDocument(userId, documentId, ip, corrId);

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.fileName}"`,
      'X-Document-SHA256': result.sha256,
    });
    res.send(result.buffer);
  }

  @Post('documents/:documentId/verify')
  @ApiOperation({ summary: 'Verify cryptographic SHA-256 integrity of stored document' })
  async verifyDocument(@Param('documentId') documentId: string) {
    return this.documentsService.verifyDocumentIntegrity(documentId);
  }

  @Post('documents/:documentId/test-corrupt')
  @ApiOperation({ summary: 'Corrupt document byte for automated test validation' })
  async testCorrupt(@Param('documentId') documentId: string) {
    return this.documentsService.corruptDocumentForTest(documentId);
  }
}
