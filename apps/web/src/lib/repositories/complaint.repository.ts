import {
  Complaint,
  ComplaintFilters,
  ComplaintStatus,
  Category,
  Severity,
  TimelineEvent,
  Assignment,
  DuplicateCandidate,
  DuplicateCheckInput,
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
  findDuplicateCandidates(input: DuplicateCheckInput): Promise<DuplicateCandidate[]>;
  confirmComplaint(complaintId: string): Promise<{ complaintId: string; confirmationsCount: number; hasUserConfirmed: boolean }>;
  getConfirmationCount(complaintId: string): Promise<number>;
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

  public async findDuplicateCandidates(input: DuplicateCheckInput): Promise<DuplicateCandidate[]> {
    const radius = input.radius || 250;
    const active = this.complaints.filter((c) =>
      ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)
    );
    const candidates: DuplicateCandidate[] = [];
    for (const c of active) {
      const dist = Math.round(Math.hypot(c.latitude - input.latitude, c.longitude - input.longitude) * 111000);
      if (dist <= radius) {
        const catScore = c.category.toLowerCase() === (input.category || '').toLowerCase() ? 1.0 : 0.3;
        const distScore = Math.max(0, 1 - dist / radius);
        const score = Number((0.6 * distScore + 0.4 * catScore).toFixed(2));
        const conf = score >= 0.65 ? 'HIGH' : score >= 0.45 ? 'POSSIBLE' : 'LOW';
        if (conf !== 'LOW') {
          candidates.push({
            complaintId: c.id,
            title: c.title,
            category: c.category,
            status: c.status,
            latitude: c.latitude,
            longitude: c.longitude,
            address: c.address,
            distanceMeters: dist,
            similarityScore: score,
            similarityPercentage: Math.round(score * 100),
            confidence: conf as any,
            createdAt: c.createdAt,
            media: c.media,
          });
        }
      }
    }
    return candidates.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  public async confirmComplaint(complaintId: string): Promise<{ complaintId: string; confirmationsCount: number; hasUserConfirmed: boolean }> {
    const complaint = this.complaints.find((c) => c.id.toLowerCase() === complaintId.toLowerCase());
    if (complaint) {
      complaint.upvotesCount = (complaint.upvotesCount || 0) + 1;
      complaint.confirmationsCount = (complaint.confirmationsCount || 0) + 1;
      complaint.hasUserConfirmed = true;
      this.persist();
      return {
        complaintId,
        confirmationsCount: complaint.confirmationsCount,
        hasUserConfirmed: true,
      };
    }
    return { complaintId, confirmationsCount: 1, hasUserConfirmed: true };
  }

  public async getConfirmationCount(complaintId: string): Promise<number> {
    const complaint = this.complaints.find((c) => c.id.toLowerCase() === complaintId.toLowerCase());
    return complaint?.confirmationsCount || complaint?.upvotesCount || 0;
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
    notes?: string,
    resolutionMediaIds?: string[],
  ): Promise<Complaint | null> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('urbanreports_access_token') : null;
      const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ nextStatus: status, note: notes, resolutionMediaIds }),
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
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('urbanreports_access_token') : null;
      const res = await fetch(`${API_BASE}/complaints/${id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          departmentId: assignment.department,
          officerId: assignment.assignedOfficer,
          notes: assignment.notes,
        }),
      });

      if (!res.ok) return this.fallbackMock.assignDepartment(id, assignment, actorName);
      const item = await res.json();
      return this.mapToFrontendComplaint(item);
    } catch {
      return this.fallbackMock.assignDepartment(id, assignment, actorName);
    }
  }

  public async upvoteComplaint(id: string, userId: string): Promise<Complaint | null> {
    return this.fallbackMock.upvoteComplaint(id, userId);
  }

  public async getStats() {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      if (res.ok) {
        const stats = await res.json();
        if (stats && typeof stats.total === 'number') return stats;
      }
    } catch {}

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

  public async getDepartments(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/departments`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [
      { id: 'dept-roads', name: 'Roads & Infrastructure Department', service_area: 'Central Zone', active: true },
      { id: 'dept-sanitation', name: 'Solid Waste & Sanitation Department', service_area: 'North & West Wards', active: true },
      { id: 'dept-lighting', name: 'Electrical & Street Lighting Unit', service_area: 'City Metro Grid', active: true },
      { id: 'dept-water', name: 'Water Supply & Sewage Board', service_area: 'Metropolitan Basin', active: true },
      { id: 'dept-traffic', name: 'Traffic Signals & Safety Authority', service_area: 'Urban Transit Grid', active: true },
    ];
  }

  public async getAuditEvents(id: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}/audit`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [];
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

  public async findDuplicateCandidates(input: DuplicateCheckInput): Promise<DuplicateCandidate[]> {
    try {
      const res = await fetch(`${API_BASE}/complaints/duplicates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) return this.fallbackMock.findDuplicateCandidates(input);
      const data = await res.json();
      if (Array.isArray(data)) return data;
      return this.fallbackMock.findDuplicateCandidates(input);
    } catch {
      return this.fallbackMock.findDuplicateCandidates(input);
    }
  }

  public async confirmComplaint(complaintId: string): Promise<{ complaintId: string; confirmationsCount: number; hasUserConfirmed: boolean }> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('urbanreports_access_token') : null;
      const res = await fetch(`${API_BASE}/complaints/${complaintId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) return this.fallbackMock.confirmComplaint(complaintId);
      return await res.json();
    } catch {
      return this.fallbackMock.confirmComplaint(complaintId);
    }
  }

  public async getConfirmationCount(complaintId: string): Promise<number> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${complaintId}/confirmations`);
      if (res.ok) {
        const data = await res.json();
        return data.confirmationsCount || 0;
      }
    } catch {}
    return this.fallbackMock.getConfirmationCount(complaintId);
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

    const rawMedia = item.media || [];
    const mediaList = rawMedia
      .filter((m: any) => m.type !== 'resolution' && m.type !== 'after')
      .map((m: any) => ({
        id: m.id || m.mediaId || `med-${Math.random()}`,
        url: MediaService.getMediaUrl(m.url || m.mediaId || m.id),
        type: (m.type || 'image') as 'image' | 'video',
        caption: m.caption || 'Submission evidence photo',
      }));

    const resolutionMediaList = rawMedia
      .filter((m: any) => m.type === 'resolution' || m.type === 'after')
      .map((m: any) => ({
        id: m.id || m.mediaId || `med-${Math.random()}`,
        url: MediaService.getMediaUrl(m.url || m.mediaId || m.id),
        type: (m.type || 'image') as 'image' | 'video',
        caption: m.caption || 'Resolution evidence photo',
      }));

    const assignment = item.assignment ? {
      department: item.assignment.department || item.assignment.departmentId || 'Municipal Department',
      assignedOfficer: item.assignment.assignedOfficer || item.assignment.officer_id,
      notes: item.assignment.notes,
      assignedAt: item.assignment.assignedAt || item.assignment.assigned_at,
    } : undefined;

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
      createdAt: item.created_at || item.createdAt || new Date().toISOString(),
      updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
      reporter: {
        id: item.reporter_user_id || 'user-001',
        name: 'Citizen Reporter',
      },
      media: mediaList.length > 0 ? mediaList : (rawMedia.length > 0 ? rawMedia.map((m: any) => ({
        id: m.id || m.mediaId || `med-${Math.random()}`,
        url: MediaService.getMediaUrl(m.url || m.mediaId || m.id),
        type: (m.type || 'image') as 'image' | 'video',
        caption: m.caption || 'Evidence photo',
      })) : []),
      resolutionMedia: resolutionMediaList,
      timeline,
      assignment,
      auditEvents: item.auditEvents || [],
      upvotesCount: item.upvotes_count || item.upvotesCount || 0,
      confirmationsCount: item.confirmationsCount || item.upvotes_count || item.upvotesCount || 0,
      hasUserConfirmed: Boolean(item.hasUserConfirmed),
    };
  }
}

export const complaintRepository = new ApiComplaintRepositoryImpl();
