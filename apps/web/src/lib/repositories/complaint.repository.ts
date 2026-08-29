import {
  Complaint,
  ComplaintFilters,
  ComplaintStatus,
  Category,
  Severity,
  TimelineEvent,
  Assignment,
} from '../types';
import { MOCK_COMPLAINTS } from '../data/mock-complaints';
import { MediaService } from '../services/mediaService';

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3005';
const API_BASE = `${GATEWAY_URL}/api`;

export interface IComplaintRepository {
  getAllComplaints(filters?: ComplaintFilters): Promise<Complaint[]>;
  getComplaintById(id: string): Promise<Complaint | null>;
  createComplaint(
    payload: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'upvotesCount'>
  ): Promise<Complaint>;
  updateStatus(
    id: string,
    status: ComplaintStatus,
    actorName: string,
    actorRole: 'CITIZEN' | 'ADMIN' | 'OFFICER' | 'SYSTEM',
    notes?: string
  ): Promise<Complaint | null>;
  assignDepartment(
    id: string,
    assignment: Assignment,
    actorName: string
  ): Promise<Complaint | null>;
  upvoteComplaint(id: string, userId: string): Promise<Complaint | null>;
  getStats(): Promise<{
    total: number;
    submitted: number;
    underReview: number;
    verified: number;
    assigned: number;
    inProgress: number;
    resolved: number;
    reopened: number;
    rejected: number;
    critical: number;
  }>;
  getViewportComplaints(
    bounds: { minLat: number; minLng: number; maxLat: number; maxLng: number },
    filters?: ComplaintFilters
  ): Promise<Complaint[]>;
  getNearbyComplaints(lat: number, lng: number, radiusMeters?: number): Promise<Complaint[]>;
  subscribe(listener: () => void): () => void;
}

class MockComplaintRepositoryImpl implements IComplaintRepository {
  private complaints: Complaint[] = [];
  private listeners: Set<() => void> = new Set();
  private storageKey = 'urbanreports_mock_complaints_v1';

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        try {
          this.complaints = JSON.parse(saved);
          return;
        } catch {
          // fallback
        }
      }
    }
    this.complaints = [...MOCK_COMPLAINTS];
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.complaints));
      } catch {
        // ignore
      }
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async getAllComplaints(filters?: ComplaintFilters): Promise<Complaint[]> {
    let result = [...this.complaints];
    if (!filters) return result;

    if (filters.category && filters.category !== 'ALL') {
      result = result.filter((c) => c.category === filters.category);
    }
    if (filters.severity && filters.severity !== 'ALL') {
      result = result.filter((c) => c.severity === filters.severity);
    }
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((c) => c.status === filters.status);
    }
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public async getComplaintById(id: string): Promise<Complaint | null> {
    const item = this.complaints.find((c) => c.id.toLowerCase() === id.toLowerCase());
    return item ? { ...item } : null;
  }

  public async createComplaint(
    payload: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'upvotesCount'>
  ): Promise<Complaint> {
    const now = new Date().toISOString();
    const idNumber = Math.floor(1000 + Math.random() * 9000);
    const newId = `URB-2026-${idNumber}`;

    const newComplaint: Complaint = {
      ...payload,
      id: newId,
      status: payload.status || 'SUBMITTED',
      createdAt: now,
      updatedAt: now,
      timeline: [],
      upvotesCount: 0,
    };

    this.complaints.unshift(newComplaint);
    this.persist();
    return newComplaint;
  }

  public async updateStatus(
    id: string,
    status: ComplaintStatus,
    actorName: string,
    actorRole: 'CITIZEN' | 'ADMIN' | 'OFFICER' | 'SYSTEM',
    notes?: string
  ): Promise<Complaint | null> {
    const index = this.complaints.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
    if (index === -1) return null;

    const complaint = this.complaints[index];
    const updated: Complaint = {
      ...complaint,
      status,
      updatedAt: new Date().toISOString(),
    };

    this.complaints[index] = updated;
    this.persist();
    return updated;
  }

  public async assignDepartment(
    id: string,
    assignment: Assignment,
    actorName: string
  ): Promise<Complaint | null> {
    const index = this.complaints.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
    if (index === -1) return null;

    const complaint = this.complaints[index];
    const updated: Complaint = {
      ...complaint,
      status: 'ASSIGNED',
      assignment,
      updatedAt: new Date().toISOString(),
    };

    this.complaints[index] = updated;
    this.persist();
    return updated;
  }

  public async upvoteComplaint(id: string, userId: string): Promise<Complaint | null> {
    const index = this.complaints.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
    if (index === -1) return null;

    const complaint = this.complaints[index];
    const userIds = complaint.upvotedByUserIds || [];
    const hasUpvoted = userIds.includes(userId);
    const newUpvotedIds = hasUpvoted ? userIds.filter((uid) => uid !== userId) : [...userIds, userId];

    const updated: Complaint = {
      ...complaint,
      upvotedByUserIds: newUpvotedIds,
      upvotesCount: hasUpvoted ? Math.max(0, complaint.upvotesCount - 1) : complaint.upvotesCount + 1,
    };

    this.complaints[index] = updated;
    this.persist();
    return updated;
  }

  public async getStats() {
    return {
      total: this.complaints.length,
      submitted: this.complaints.filter((c) => c.status === 'SUBMITTED').length,
      underReview: this.complaints.filter((c) => c.status === 'UNDER_REVIEW').length,
      verified: this.complaints.filter((c) => c.status === 'VERIFIED').length,
      assigned: this.complaints.filter((c) => c.status === 'ASSIGNED').length,
      inProgress: this.complaints.filter((c) => c.status === 'IN_PROGRESS').length,
      resolved: this.complaints.filter((c) => c.status === 'RESOLVED').length,
      reopened: this.complaints.filter((c) => c.status === 'REOPENED').length,
      rejected: this.complaints.filter((c) => c.status === 'REJECTED').length,
      critical: this.complaints.filter((c) => c.severity === 'CRITICAL').length,
    };
  }

  public async getViewportComplaints(
    bounds: { minLat: number; minLng: number; maxLat: number; maxLng: number },
    filters?: ComplaintFilters
  ): Promise<Complaint[]> {
    let result = this.complaints.filter(
      (c) =>
        c.latitude >= bounds.minLat &&
        c.latitude <= bounds.maxLat &&
        c.longitude >= bounds.minLng &&
        c.longitude <= bounds.maxLng
    );
    if (!filters) return result;
    if (filters.category && filters.category !== 'ALL') {
      result = result.filter((c) => c.category === filters.category);
    }
    if (filters.severity && filters.severity !== 'ALL') {
      result = result.filter((c) => c.severity === filters.severity);
    }
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((c) => c.status === filters.status);
    }
    return result;
  }

  public async getNearbyComplaints(lat: number, lng: number, radiusMeters = 5000): Promise<Complaint[]> {
    return this.complaints.filter((c) => {
      const dist = Math.hypot(c.latitude - lat, c.longitude - lng) * 111000;
      return dist <= radiusMeters;
    });
  }
}

class ApiComplaintRepositoryImpl implements IComplaintRepository {
  private fallbackMock = new MockComplaintRepositoryImpl();

  public subscribe(listener: () => void): () => void {
    return this.fallbackMock.subscribe(listener);
  }

  public async getAllComplaints(filters?: ComplaintFilters): Promise<Complaint[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.category && filters.category !== 'ALL') queryParams.append('category', filters.category.toUpperCase());
      if (filters?.severity && filters.severity !== 'ALL') queryParams.append('severity', filters.severity);
      if (filters?.status && filters.status !== 'ALL') queryParams.append('status', filters.status);
      if (filters?.searchQuery) queryParams.append('search', filters.searchQuery);
      if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);

      const res = await fetch(`${API_BASE}/complaints?${queryParams.toString()}`);
      if (!res.ok) return this.fallbackMock.getAllComplaints(filters);
      const data = await res.json();

      if (data.items && Array.isArray(data.items)) {
        return data.items.map((item: any) => this.mapToFrontendComplaint(item));
      }
      return this.fallbackMock.getAllComplaints(filters);
    } catch {
      return this.fallbackMock.getAllComplaints(filters);
    }
  }

  public async getComplaintById(id: string): Promise<Complaint | null> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}`);
      if (!res.ok) return this.fallbackMock.getComplaintById(id);
      const item = await res.json();
      return this.mapToFrontendComplaint(item);
    } catch {
      return this.fallbackMock.getComplaintById(id);
    }
  }

  public async createComplaint(
    payload: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'upvotesCount'>
  ): Promise<Complaint> {
    const mediaIds = (payload.media || [])
      .map((m: any) => m.id || m.mediaId)
      .filter(Boolean);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('urbanreports_access_token') : null;
      const res = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          category: payload.category ? payload.category.replace(/\s+/g, '_').toUpperCase() : 'OTHER',
          title: payload.title,
          description: payload.description,
          severity: payload.severity,
          latitude: Number(payload.latitude),
          longitude: Number(payload.longitude),
          address: payload.address,
          mediaIds,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const rawMsg = Array.isArray(errData)
          ? errData.join(' | ')
          : Array.isArray(errData.message)
          ? errData.message.join(' | ')
          : errData.message || 'Failed to submit complaint to server.';
        throw new Error(rawMsg);
      }

      const item = await res.json();
      return this.mapToFrontendComplaint(item);
    } catch (err: any) {
      if (err.message && err.message.includes('fetch failed')) {
        return this.fallbackMock.createComplaint(payload);
      }
      throw err;
    }
  }

  public async updateStatus(
    id: string,
    status: ComplaintStatus,
    actorName: string,
    actorRole: 'CITIZEN' | 'ADMIN' | 'OFFICER' | 'SYSTEM',
    notes?: string
  ): Promise<Complaint | null> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('urbanreports_access_token') : null;
      const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ nextStatus: status, note: notes }),
      });

      if (!res.ok) return this.fallbackMock.updateStatus(id, status, actorName, actorRole, notes);
      const item = await res.json();
      return this.mapToFrontendComplaint(item);
    } catch {
      return this.fallbackMock.updateStatus(id, status, actorName, actorRole, notes);
    }
  }

  public async assignDepartment(
    id: string,
    assignment: Assignment,
    actorName: string
  ): Promise<Complaint | null> {
    return null;
  }

  public async upvoteComplaint(id: string, userId: string): Promise<Complaint | null> {
    return null;
  }

  public async getStats() {
    const all = await this.getAllComplaints();
    return {
      total: all.length,
      submitted: all.filter((c) => c.status === 'SUBMITTED').length,
      underReview: all.filter((c) => c.status === 'UNDER_REVIEW').length,
      verified: all.filter((c) => c.status === 'VERIFIED').length,
      assigned: all.filter((c) => c.status === 'ASSIGNED').length,
      inProgress: all.filter((c) => c.status === 'IN_PROGRESS').length,
      resolved: all.filter((c) => c.status === 'RESOLVED').length,
      reopened: all.filter((c) => c.status === 'REOPENED').length,
      rejected: all.filter((c) => c.status === 'REJECTED').length,
      critical: all.filter((c) => c.severity === 'CRITICAL').length,
    };
  }

  public async getViewportComplaints(
    bounds: { minLat: number; minLng: number; maxLat: number; maxLng: number },
    filters?: ComplaintFilters
  ): Promise<Complaint[]> {
    try {
      const queryParams = new URLSearchParams({
        minLat: bounds.minLat.toString(),
        minLng: bounds.minLng.toString(),
        maxLat: bounds.maxLat.toString(),
        maxLng: bounds.maxLng.toString(),
      });
      if (filters?.category && filters.category !== 'ALL') queryParams.append('category', filters.category.toUpperCase());
      if (filters?.severity && filters.severity !== 'ALL') queryParams.append('severity', filters.severity);
      if (filters?.status && filters.status !== 'ALL') queryParams.append('status', filters.status);

      const res = await fetch(`${API_BASE}/complaints/viewport?${queryParams.toString()}`);
      if (!res.ok) return this.fallbackMock.getViewportComplaints(bounds, filters);
      const items = await res.json();
      if (Array.isArray(items)) {
        return items.map((item: any) => this.mapToFrontendComplaint(item));
      }
      return this.fallbackMock.getViewportComplaints(bounds, filters);
    } catch {
      return this.fallbackMock.getViewportComplaints(bounds, filters);
    }
  }

  public async getNearbyComplaints(lat: number, lng: number, radiusMeters = 5000): Promise<Complaint[]> {
    try {
      const res = await fetch(`${API_BASE}/complaints/nearby?lat=${lat}&lng=${lng}&radius=${radiusMeters}`);
      if (!res.ok) return this.fallbackMock.getNearbyComplaints(lat, lng, radiusMeters);
      const items = await res.json();
      if (Array.isArray(items)) {
        return items.map((item: any) => this.mapToFrontendComplaint(item));
      }
      return this.fallbackMock.getNearbyComplaints(lat, lng, radiusMeters);
    } catch {
      return this.fallbackMock.getNearbyComplaints(lat, lng, radiusMeters);
    }
  }

  private mapToFrontendComplaint(item: any): Complaint {
    const categoryMap: Record<string, Category> = {
      POTHOLE: 'Pothole',
      GARBAGE: 'Garbage',
      STREETLIGHT: 'Streetlight',
      DRAINAGE: 'Drainage',
      ROAD_DAMAGE: 'Road Damage',
      WATER_SUPPLY: 'Water Supply',
      TRAFFIC: 'Traffic',
      OTHER: 'Other',
    };

    const statusHistory = item.statusHistory || [];
    const timeline: TimelineEvent[] = statusHistory.map((h: any) => ({
      id: h.id || `tl-${Math.random()}`,
      status: (h.to_status || 'SUBMITTED') as ComplaintStatus,
      title: `Status: ${h.to_status}`,
      description: h.note || `Transitioned to ${h.to_status}`,
      timestamp: h.created_at || item.created_at || new Date().toISOString(),
      actor: {
        name: h.actor_user_id || 'System Actor',
        role: 'ADMIN',
      },
    }));

    const mediaList = (item.media || []).map((m: any) => ({
      id: m.id || m.mediaId || `med-${Math.random()}`,
      url: MediaService.getMediaUrl(m.url || m.mediaId || m.id),
      type: (m.type || 'image') as 'image' | 'video',
      caption: m.caption || 'Evidence photo',
    }));

    return {
      id: item.id || `URB-${Date.now()}`,
      title: item.title || 'Civic Issue Dossier',
      category: categoryMap[item.category] || (item.category as Category) || 'Other',
      description: item.description || '',
      severity: (item.severity || 'MEDIUM') as Severity,
      status: (item.status || 'SUBMITTED') as ComplaintStatus,
      latitude: item.latitude ? parseFloat(item.latitude) : 28.6139,
      longitude: item.longitude ? parseFloat(item.longitude) : 77.2090,
      address: item.address || 'Location Coordinates',
      createdAt: item.created_at || new Date().toISOString(),
      updatedAt: item.updated_at || new Date().toISOString(),
      reporter: {
        id: item.reporter_user_id || 'user-001',
        name: 'Citizen Reporter',
      },
      media: mediaList,
      timeline,
      upvotesCount: item.upvotes_count || 0,
    };
  }
}

export const complaintRepository = new ApiComplaintRepositoryImpl();
