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
  async login(@Body() body: any, @Req() req: Request) {
    return this.proxyService.forwardPost(`${this.getUsersUrl()}/auth/login`, body, this.getPassHeaders(req));
  }

  @Post('auth/register')
  async register(@Body() body: any, @Req() req: Request) {
    return this.proxyService.forwardPost(`${this.getUsersUrl()}/auth/register`, body, this.getPassHeaders(req));
  }

  @Get('users/me')
  async getCurrentUser(@Req() req: Request) {
    return this.proxyService.forwardGet(`${this.getUsersUrl()}/users/me`, this.getPassHeaders(req));
  }

  @Patch('users/me')
  async updateProfile(@Body() body: any, @Req() req: Request) {
    return this.proxyService.forwardPost(`${this.getUsersUrl()}/users/me`, body, this.getPassHeaders(req));
  }

  // --- COMPLAINTS PROXY ---
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

  @Get('complaints/:id')
  async getComplaintById(@Param('id') id: string, @Req() req: Request) {
    return this.proxyService.forwardGet(`${this.getComplaintsUrl()}/complaints/${id}`, this.getPassHeaders(req));
  }

  @Post('complaints')
  async createComplaint(@Body() body: any, @Req() req: Request) {
    const mediaIds = Array.isArray(body?.mediaIds)
      ? body.mediaIds
      : Array.isArray(body?.media)
      ? body.media.map((m: any) => m.id || m.mediaId).filter(Boolean)
      : undefined;

    const payload = {
      category: body?.category ? String(body.category).replace(/\s+/g, '_').toUpperCase() : undefined,
      title: body?.title ? String(body.title).trim() : undefined,
      description: body?.description ? String(body.description).trim() : undefined,
      severity: body?.severity ? String(body.severity).toUpperCase() : undefined,
      latitude: body?.latitude !== undefined && body?.latitude !== null ? Number(body.latitude) : undefined,
      longitude: body?.longitude !== undefined && body?.longitude !== null ? Number(body.longitude) : undefined,
      address: body?.address ? String(body.address).trim() : undefined,
      mediaIds,
    };

    return this.proxyService.forwardPost(`${this.getComplaintsUrl()}/complaints`, payload, this.getPassHeaders(req));
  }

  @Patch('complaints/:id/status')
  async updateComplaintStatus(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
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
    if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'] as string;

    const user = (req as any).user;
    if (user) {
      headers['x-user-id'] = user.userId;
      headers['x-user-role'] = user.role;
    }

    return headers;
  }
}
