import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Response,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response as ExpressResponse } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaService } from './media.service';
import { AssociateMediaDto } from './dto/associate-media.dto';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required under form field name "file".');
    }

    const ownerUserId = req.user?.userId || 'citizen-anon-001';
    const record = await this.mediaService.uploadMedia(file, ownerUserId);

    const baseUrl = process.env.PUBLIC_MEDIA_URL || '';
    return {
      id: record.mediaId,
      mediaId: record.mediaId,
      owner: record.owner,
      status: record.processingStatus,
      mimeType: record.mimeType,
      fileName: record.fileName,
      size: record.size,
      dimensions: record.dimensions,
      checksum: record.checksum,
      url: `${baseUrl}/media/${record.mediaId}`,
      createdAt: record.createdAt,
    };
  }

  @Get(':id')
  async streamMedia(
    @Param('id') id: string,
    @Response() res: ExpressResponse,
  ) {
    const { stream, record } = await this.mediaService.getMediaStream(id);

    res.setHeader('Content-Type', record.mimeType || 'image/jpeg');
    res.setHeader('Content-Length', record.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Disposition', `inline; filename="${record.fileName}"`);

    stream.pipe(res);
  }

  @Get(':id/metadata')
  async getMetadata(@Param('id') id: string) {
    const record = await this.mediaService.getMediaMetadata(id);
    const baseUrl = process.env.PUBLIC_MEDIA_URL || '';
    return {
      id: record.mediaId,
      mediaId: record.mediaId,
      owner: record.owner,
      complaintId: record.complaintId || null,
      status: record.processingStatus,
      mimeType: record.mimeType,
      fileName: record.fileName,
      size: record.size,
      dimensions: record.dimensions,
      checksum: record.checksum,
      url: `${baseUrl}/media/${record.mediaId}`,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/associate')
  async associateComplaint(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AssociateMediaDto,
  ) {
    const actorUserId = req.user?.userId || 'citizen-anon-001';
    const updated = await this.mediaService.associateComplaint(id, dto.complaintId, actorUserId);
    return {
      mediaId: updated.mediaId,
      complaintId: updated.complaintId,
      status: updated.processingStatus,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteMedia(@Request() req: any, @Param('id') id: string) {
    const requester = {
      userId: req.user?.userId || 'citizen-anon-001',
      role: req.user?.role || 'CITIZEN',
    };
    return this.mediaService.deleteMedia(id, requester);
  }
}
