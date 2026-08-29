import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  Res,
  Query,
  Param,
  Body,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from './proxy.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('api')
export class ProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  private getUsersUrl(): string {
    return this.configService.get<string>('USERS_SERVICE_URL') || 'http://localhost:3001';
  }

  private getComplaintsUrl(): string {
    return this.configService.get<string>('COMPLAINTS_SERVICE_URL') || 'http://localhost:3002';
  }

  private getMediaUrl(): string {
    return this.configService.get<string>('MEDIA_SERVICE_URL') || 'http://localhost:3003';
  }

  private getMapsUrl(): string {
    return this.configService.get<string>('MAPS_SERVICE_URL') || 'http://localhost:3004';
  }

  // --- AUTH & USERS PROXY ---
  @Post('auth/login')
  async login(@Body() body: LoginDto, @Req() req: Request) {
    return this.proxyService.forwardPost(`${this.getUsersUrl()}/auth/login`, body, this.getPassHeaders(req));
  }

  @Post('auth/register')
  async register(@Body() body: RegisterDto, @Req() req: Request) {
    return this.proxyService.forwardPost(`${this.getUsersUrl()}/auth/register`, body, this.getPassHeaders(req));
  }

  @Get('users/me')
  async getCurrentUser(@Req() req: Request) {
    return this.proxyService.forwardGet(`${this.getUsersUrl()}/users/me`, this.getPassHeaders(req));
  }

  @Patch('users/me')
  async updateProfile(@Body() body: UpdateUserDto, @Req() req: Request) {
    return this.proxyService.forwardPost(`${this.getUsersUrl()}/users/me`, body, this.getPassHeaders(req));
  }

  @Get('users/me/notification-preferences')
  async getNotificationPreferences(@Req() req: Request) {
    return this.proxyService.forwardGet(`${this.getUsersUrl()}/users/me/notification-preferences`, this.getPassHeaders(req));
  }

  @Patch('users/me/notification-preferences')
  async updateNotificationPreferences(@Body() body: any, @Req() req: Request) {
    return this.proxyService.forwardPost(`${this.getUsersUrl()}/users/me/notification-preferences`, body, this.getPassHeaders(req));
  }

  // --- COMPLAINTS PROXY ---
  @Get('admin/stats')
  async getAdminStats(@Req() req: Request) {
    return this.proxyService.forwardGet(`${this.getComplaintsUrl()}/complaints/stats`, this.getPassHeaders(req));
  }

  @Get('admin/analytics/overview')
  async getAdminAnalyticsOverview(@Req() req: Request) {
    return this.proxyService.forwardGet(`${this.getComplaintsUrl()}/complaints/analytics/overview`, this.getPassHeaders(req));
  }

  @Get('admin/analytics/hotspots')
  async getAdminAnalyticsHotspots(@Req() req: Request) {
    return this.proxyService.forwardGet(`${this.getComplaintsUrl()}/complaints/analytics/hotspots`, this.getPassHeaders(req));
  }

  @Get('departments')
  async getDepartments(@Req() req: Request) {
    return this.proxyService.forwardGet(`${this.getComplaintsUrl()}/complaints/departments`, this.getPassHeaders(req));
  }

  @Get('complaints/viewport')
  async getViewportComplaints(@Query() query: any, @Req() req: Request) {
    const qp = new URLSearchParams(query).toString();
    return this.proxyService.forwardGet(`${this.getComplaintsUrl()}/complaints/viewport?${qp}`, this.getPassHeaders(req));
  }

  @Get('complaints/nearby')
  async getNearbyComplaints(@Query() query: any, @Req() req: Request) {
    const qp = new URLSearchParams(query).toString();
    return this.proxyService.forwardGet(`${this.getComplaintsUrl()}/complaints/nearby?${qp}`, this.getPassHeaders(req));
  }

  @Get('complaints')
  async getAllComplaints(@Query() query: any, @Req() req: Request) {
    const qp = new URLSearchParams(query).toString();
    return this.proxyService.forwardGet(`${this.getComplaintsUrl()}/complaints?${qp}`, this.getPassHeaders(req));
  }

  @Post('complaints/duplicates')
  async findDuplicateCandidates(@Body() body: any, @Req() req: Request) {
    return this.proxyService.forwardPost(`${this.getComplaintsUrl()}/complaints/duplicates`, body, this.getPassHeaders(req));
  }

  @Post('complaints/:id/confirm')
  async confirmComplaint(@Param('id') id: string, @Req() req: Request) {
    return this.proxyService.forwardPost(`${this.getComplaintsUrl()}/complaints/${id}/confirm`, {}, this.getPassHeaders(req));
  }

  @Get('complaints/:id/confirmations')
  async getConfirmationCount(@Param('id') id: string, @Req() req: Request) {
    return this.proxyService.forwardGet(`${this.getComplaintsUrl()}/complaints/${id}/confirmations`, this.getPassHeaders(req));
  }

  @Get('complaints/:id')
  async getComplaintById(@Param('id') id: string, @Req() req: Request) {
    return this.proxyService.forwardGet(`${this.getComplaintsUrl()}/complaints/${id}`, this.getPassHeaders(req));
  }

  @Get('complaints/:id/audit')
  async getComplaintAudit(@Param('id') id: string, @Req() req: Request) {
    return this.proxyService.forwardGet(`${this.getComplaintsUrl()}/complaints/${id}/audit`, this.getPassHeaders(req));
  }

  @Post('complaints/:id/assign')
  async assignComplaintDepartment(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    return this.proxyService.forwardPost(`${this.getComplaintsUrl()}/complaints/${id}/assign`, body, this.getPassHeaders(req));
  }

  @Post('complaints/:id/resolution-evidence')
  async addResolutionEvidence(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    return this.proxyService.forwardPost(`${this.getComplaintsUrl()}/complaints/${id}/resolution-evidence`, body, this.getPassHeaders(req));
  }

  @Post('complaints')
  async createComplaint(@Body() body: any, @Req() req: Request) {
    const raw = (body && Object.keys(body).length > 0) ? body : ((req as any).body || {});

    const mediaIds = Array.isArray(raw.mediaIds) && raw.mediaIds.length > 0
      ? raw.mediaIds
      : Array.isArray(raw.media)
      ? raw.media.map((m: any) => m.id || m.mediaId).filter(Boolean)
      : undefined;

    const rawCategory = raw.category || raw.categoryName || raw.type || 'OTHER';
    const rawTitle = raw.title || raw.complaintTitle || '';
    const rawDesc = raw.description || raw.details || '';
    const rawSeverity = raw.severity || raw.priority || 'MEDIUM';
    const rawLat = raw.latitude ?? raw.lat;
    const rawLng = raw.longitude ?? raw.lng;
    const rawAddress = raw.address || raw.location || '';

    const payload: any = {
      category: String(rawCategory).replace(/\s+/g, '_').toUpperCase(),
      title: String(rawTitle).trim(),
      description: String(rawDesc).trim(),
      severity: String(rawSeverity).toUpperCase(),
      latitude: rawLat !== undefined && rawLat !== null && !isNaN(Number(rawLat)) ? Number(rawLat) : undefined,
      longitude: rawLng !== undefined && rawLng !== null && !isNaN(Number(rawLng)) ? Number(rawLng) : undefined,
      address: String(rawAddress).trim(),
    };

    if (mediaIds) {
      payload.mediaIds = mediaIds;
    }

    return this.proxyService.forwardPost(`${this.getComplaintsUrl()}/complaints`, payload, this.getPassHeaders(req));
  }

  @Patch('complaints/:id/status')
  async updateComplaintStatusPatch(@Param('id') id: string, @Body() body: UpdateStatusDto, @Req() req: Request) {
    return this.proxyService.forwardPost(`${this.getComplaintsUrl()}/complaints/${id}/status`, body, this.getPassHeaders(req));
  }

  @Post('complaints/:id/status')
  async updateComplaintStatusPost(@Param('id') id: string, @Body() body: UpdateStatusDto, @Req() req: Request) {
    return this.proxyService.forwardPost(`${this.getComplaintsUrl()}/complaints/${id}/status`, body, this.getPassHeaders(req));
  }


  // --- MAPS PROXY ---
  @Get('maps/search')
  async searchPlaces(@Query('q') q: string, @Req() req: Request) {
    return this.proxyService.forwardGet(`${this.getMapsUrl()}/maps/search?q=${encodeURIComponent(q || '')}`, this.getPassHeaders(req));
  }

  @Get('maps/reverse')
  async reverseGeocode(@Query('lat') lat: string, @Query('lng') lng: string, @Req() req: Request) {
    return this.proxyService.forwardGet(`${this.getMapsUrl()}/maps/reverse?lat=${lat}&lng=${lng}`, this.getPassHeaders(req));
  }

  // --- MEDIA PROXY (Binary Streaming & Upload Forwarding) ---
  @Post('media')
  async uploadMedia(@Req() req: Request, @Res() res: Response) {
    try {
      const targetUrl = `${this.getMediaUrl()}/media`;
      const passHeaders = { ...this.getPassHeaders(req) };
      delete passHeaders['host'];
      if (req.headers['content-type']) {
        passHeaders['content-type'] = req.headers['content-type'] as string;
      }

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: passHeaders,
        body: req as any,
        duplex: 'half',
      } as any);

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err: any) {
      res.status(500).json({ statusCode: 500, message: `Media upload proxy failed: ${err.message}` });
    }
  }

  @Get('media/:id')
  async streamMedia(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const targetUrl = `${this.getMediaUrl()}/media/${id}`;
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: this.getPassHeaders(req),
      });

      if (!response.ok) {
        res.status(response.status).json({ statusCode: response.status, message: 'Media binary stream error' });
        return;
      }

      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const contentLength = response.headers.get('content-length');

      res.setHeader('Content-Type', contentType);
      if (contentLength) res.setHeader('Content-Length', contentLength);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      res.status(500).json({ statusCode: 500, message: `Media stream proxy failed: ${err.message}` });
    }
  }

  @Get('media/:id/metadata')
  async getMediaMetadata(@Param('id') id: string, @Req() req: Request) {
    return this.proxyService.forwardGet(`${this.getMediaUrl()}/media/${id}/metadata`, this.getPassHeaders(req));
  }

  @Delete('media/:id')
  async deleteMedia(@Param('id') id: string, @Req() req: Request) {
    return this.proxyService.forwardGet(`${this.getMediaUrl()}/media/${id}`, this.getPassHeaders(req));
  }

  private getPassHeaders(req: Request): Record<string, string> {
    const headers: Record<string, string> = {};
    if (req.headers.authorization) headers['authorization'] = req.headers.authorization as string;
    if (req.headers['x-request-id']) headers['x-request-id'] = req.headers['x-request-id'] as string;

    const user = (req as any).user;
    if (user) {
      headers['x-user-id'] = user.userId;
      headers['x-user-role'] = user.role;
    }

    return headers;
  }
}
