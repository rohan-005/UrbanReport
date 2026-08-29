import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger('ProxyService');

  constructor(private readonly configService: ConfigService) {}

  private getUsersServiceUrl(): string {
    return this.configService.get<string>('USERS_SERVICE_URL') || 'http://localhost:5001';
  }

  private getComplaintsServiceUrl(): string {
    return this.configService.get<string>('COMPLAINTS_SERVICE_URL') || 'http://localhost:5002';
  }

  private getMediaServiceUrl(): string {
    return this.configService.get<string>('MEDIA_SERVICE_URL') || 'http://localhost:5003';
  }

  private getMapsServiceUrl(): string {
    return this.configService.get<string>('MAPS_SERVICE_URL') || 'http://localhost:5004';
  }

  private buildHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extraHeaders,
    };
    headers['Content-Type'] = 'application/json';
    delete headers['content-type'];
    return headers;
  }

  async login(email: string, password?: string): Promise<any> {
    const url = `${this.getUsersServiceUrl()}/auth/login`;
    return this.forwardPost(url, { email, password });
  }

  async register(input: any): Promise<any> {
    const url = `${this.getUsersServiceUrl()}/auth/register`;
    return this.forwardPost(url, {
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: input.password,
      confirmPassword: input.password,
      aadhaar: input.aadhaarNumber || input.aadhaar,
    });
  }

  async getCurrentUser(authHeader?: string): Promise<any> {
    const url = `${this.getUsersServiceUrl()}/users/me`;
    return this.forwardGet(url, authHeader ? { Authorization: authHeader } : undefined);
  }

  async listComplaints(filters?: any): Promise<any> {
    const queryParams = new URLSearchParams();
    if (filters?.category && filters.category !== 'ALL') queryParams.append('category', filters.category);
    if (filters?.severity && filters.severity !== 'ALL') queryParams.append('severity', filters.severity);
    if (filters?.status && filters.status !== 'ALL') queryParams.append('status', filters.status);
    if (filters?.search) queryParams.append('search', filters.search);

    const url = `${this.getComplaintsServiceUrl()}/complaints?${queryParams.toString()}`;
    return this.forwardGet(url);
  }

  async getComplaintById(id: string): Promise<any> {
    const url = `${this.getComplaintsServiceUrl()}/complaints/${id}`;
    return this.forwardGet(url);
  }

  async getViewportComplaints(bounds: any): Promise<any> {
    const queryParams = new URLSearchParams({
      minLat: bounds.minLat.toString(),
      minLng: bounds.minLng.toString(),
      maxLat: bounds.maxLat.toString(),
      maxLng: bounds.maxLng.toString(),
    });
    if (bounds.category && bounds.category !== 'ALL') queryParams.append('category', bounds.category);
    if (bounds.severity && bounds.severity !== 'ALL') queryParams.append('severity', bounds.severity);
    if (bounds.status && bounds.status !== 'ALL') queryParams.append('status', bounds.status);

    const url = `${this.getComplaintsServiceUrl()}/complaints/viewport?${queryParams.toString()}`;
    return this.forwardGet(url);
  }

  async getNearbyComplaints(lat: number, lng: number, radius = 5000): Promise<any> {
    const url = `${this.getComplaintsServiceUrl()}/complaints/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
    return this.forwardGet(url);
  }

  async createComplaint(input: any, headers?: Record<string, string>): Promise<any> {
    const url = `${this.getComplaintsServiceUrl()}/complaints`;
    return this.forwardPost(url, input, headers);
  }

  async findDuplicateCandidates(input: any, headers?: Record<string, string>): Promise<any> {
    const url = `${this.getComplaintsServiceUrl()}/complaints/duplicates`;
    return this.forwardPost(url, input, headers);
  }

  async confirmComplaint(complaintId: string, headers?: Record<string, string>): Promise<any> {
    const url = `${this.getComplaintsServiceUrl()}/complaints/${complaintId}/confirm`;
    return this.forwardPost(url, {}, headers);
  }

  async getAdminAnalyticsOverview(headers?: Record<string, string>): Promise<any> {
    const url = `${this.getComplaintsServiceUrl()}/complaints/analytics/overview`;
    return this.forwardGet(url, headers);
  }

  async getGeographicHotspots(headers?: Record<string, string>): Promise<any> {
    const url = `${this.getComplaintsServiceUrl()}/complaints/analytics/hotspots`;
    return this.forwardGet(url, headers);
  }

  async searchPlaces(q: string): Promise<any> {
    const url = `${this.getMapsServiceUrl()}/maps/search?q=${encodeURIComponent(q)}`;
    return this.forwardGet(url);
  }

  async reverseGeocode(lat: number, lng: number): Promise<any> {
    const url = `${this.getMapsServiceUrl()}/maps/reverse?lat=${lat}&lng=${lng}`;
    return this.forwardGet(url);
  }

  async forwardGet(url: string, headers?: Record<string, string>): Promise<any> {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: this.buildHeaders(headers),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new HttpException(err, res.status);
      }
      return await res.json();
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      this.logger.error(`Forward GET failed (${url}): ${err.message}`);
      throw new ServiceUnavailableException(`Downstream service at ${url} unavailable.`);
    }
  }

  async forwardPatch(url: string, body: any, headers?: Record<string, string>): Promise<any> {
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: this.buildHeaders(headers),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new HttpException(err, res.status);
      }
      return await res.json();
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      this.logger.error(`Forward PATCH failed (${url}): ${err.message}`);
      throw new ServiceUnavailableException(`Downstream service at ${url} unavailable.`);
    }
  }

  async forwardPost(url: string, body: any, headers?: Record<string, string>): Promise<any> {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(headers),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new HttpException(err, res.status);
      }
      return await res.json();
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      this.logger.error(`Forward POST failed (${url}): ${err.message}`);
      throw new ServiceUnavailableException(`Downstream service at ${url} unavailable.`);
    }
  }

  async forwardDelete(url: string, headers?: Record<string, string>): Promise<any> {
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: this.buildHeaders(headers),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new HttpException(err, res.status);
      }
      return await res.json();
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      this.logger.error(`Forward DELETE failed (${url}): ${err.message}`);
      throw new ServiceUnavailableException(`Downstream service at ${url} unavailable.`);
    }
  }
}
