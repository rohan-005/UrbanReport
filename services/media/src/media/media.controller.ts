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
      url: record.cloudinaryUrl,
      createdAt: record.createdAt,
    };
  }

  @Get(':id')
  async streamMedia(
    @Param('id') id: string,
    @Response() res: ExpressResponse,
  ) {
    try {
      const resource = await this.mediaService.getMediaResource(id);
      if (resource.redirectUrl) {
        return res.redirect(302, resource.redirectUrl);
      }

      if (resource.buffer) {
        res.setHeader('Content-Type', resource.mimeType || 'image/jpeg');
        res.setHeader('Content-Length', resource.buffer.length);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.end(resource.buffer);
      }
    } catch {
      // Fall back to clean SVG placeholder image when requested media resource is missing or unresolvable
    }

    const fallbackSvg = this.mediaService.generateFallbackSvg(id);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache');
    return res.end(fallbackSvg);
  }

  @Get(':id/metadata')
  async getMetadata(@Param('id') id: string) {
    const record = await this.mediaService.getMediaMetadata(id);
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
      url: record.cloudinaryUrl,
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
      url: updated.cloudinaryUrl,
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
