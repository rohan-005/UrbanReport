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

const API_BASE = process.env.NEXT_PUBLIC_COMPLAINTS_SERVICE_URL || 'http://localhost:3002';

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

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'oldest':
          result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'upvotes':
          result.sort((a, b) => b.upvotesCount - a.upvotesCount);
          break;
        case 'severity': {
          const weight: Record<Severity, number> = {
            CRITICAL: 4,
            HIGH: 3,
            MEDIUM: 2,
            LOW: 1,
          };
          result.sort((a, b) => weight[b.severity] - weight[a.severity]);
          break;
        }
      }
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

    const initialTimeline: TimelineEvent = {
      id: `tl-${Date.now()}`,
      status: 'SUBMITTED',
      title: 'Complaint Submitted',
      description: 'Complaint registered by citizen with media evidence and location.',
      timestamp: now,
      actor: {
        name: payload.reporter.name || 'Anonymous Citizen',
        role: 'CITIZEN',
      },
    };

    const newComplaint: Complaint = {
      ...payload,
      id: newId,
      status: payload.status || 'SUBMITTED',
      createdAt: now,
      updatedAt: now,
      timeline: [initialTimeline],
      upvotesCount: 1,
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
    const now = new Date().toISOString();

    const titleMap: Record<ComplaintStatus, string> = {
      SUBMITTED: 'Status Reset to Submitted',
      UNDER_REVIEW: 'Under Review by Admin Desk',
      VERIFIED: 'Verified by Field Inspector',
      ASSIGNED: 'Assigned to Municipal Department',
      IN_PROGRESS: 'Work Started by Repair Crew',
      RESOLVED: 'Marked as Resolved',
      REOPENED: 'Reopened by Citizen',
      REJECTED: 'Complaint Rejected / Closed',
    };

    const descriptionMap: Record<ComplaintStatus, string> = {
      SUBMITTED: 'Status was reset to submitted state.',
      UNDER_REVIEW: 'Complaint details and location are being reviewed for priority triage.',
      VERIFIED: 'Issue authenticity verified. Queued for departmental assignment.',
      ASSIGNED: 'Work order dispatched to handling department.',
      IN_PROGRESS: 'On-site maintenance team deployed to location.',
      RESOLVED: 'Resolution verified and work completed successfully.',
      REOPENED: 'Citizen reported issue persists after resolution attempt.',
      REJECTED: 'Closed by administration due to duplicate entry or invalid claim.',
    };

    const newTimelineEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      status,
      title: titleMap[status] || `Status changed to ${status}`,
      description: descriptionMap[status] || `Status updated to ${status}.`,
      timestamp: now,
      actor: {
        name: actorName,
        role: actorRole,
      },
      notes,
    };

    const updated: Complaint = {
      ...complaint,
      status,
      updatedAt: now,
      resolutionNotes: status === 'RESOLVED' || status === 'REJECTED' ? notes || complaint.resolutionNotes : complaint.resolutionNotes,
      timeline: [newTimelineEvent, ...complaint.timeline],
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
    const now = new Date().toISOString();

    const timelineEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      status: 'ASSIGNED',
      title: `Assigned to ${assignment.department}`,
      description: assignment.assignedOfficer
        ? `Dispatched to officer ${assignment.assignedOfficer}.`
        : `Work order dispatched to ${assignment.department}.`,
      timestamp: now,
      actor: {
        name: actorName,
        role: 'ADMIN',
      },
      notes: assignment.notes,
    };

    const updated: Complaint = {
      ...complaint,
      status: 'ASSIGNED',
      assignment: {
        ...assignment,
        assignedAt: now,
      },
      updatedAt: now,
      timeline: [timelineEvent, ...complaint.timeline],
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
    const newUpvotedIds = hasUpvoted
      ? userIds.filter((uid) => uid !== userId)
      : [...userIds, userId];

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
    const total = this.complaints.length;
    const submitted = this.complaints.filter((c) => c.status === 'SUBMITTED').length;
    const underReview = this.complaints.filter((c) => c.status === 'UNDER_REVIEW').length;
    const verified = this.complaints.filter((c) => c.status === 'VERIFIED').length;
    const assigned = this.complaints.filter((c) => c.status === 'ASSIGNED').length;
    const inProgress = this.complaints.filter((c) => c.status === 'IN_PROGRESS').length;
    const resolved = this.complaints.filter((c) => c.status === 'RESOLVED').length;
    const reopened = this.complaints.filter((c) => c.status === 'REOPENED').length;
    const rejected = this.complaints.filter((c) => c.status === 'REJECTED').length;
    const critical = this.complaints.filter((c) => c.severity === 'CRITICAL').length;

    return {
      total,
      submitted,
      underReview,
      verified,
      assigned,
      inProgress,
      resolved,
      reopened,
      rejected,
      critical,
    };
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
      if (!res.ok) throw new Error('API Error');
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
      if (!res.ok) throw new Error('API Error');
      const item = await res.json();
      return this.mapToFrontendComplaint(item);
    } catch {
      return this.fallbackMock.getComplaintById(id);
    }
  }

  public async createComplaint(
    payload: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'upvotesCount'>
  ): Promise<Complaint> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('urbanreports_access_token') : null;
      const res = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          category: payload.category.toUpperCase(),
          title: payload.title,
          description: payload.description,
          severity: payload.severity,
          latitude: payload.latitude,
          longitude: payload.longitude,
          address: payload.address,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create complaint through API.');
      }

      const item = await res.json();
      return this.mapToFrontendComplaint(item);
    } catch (err: any) {
      if (err.message?.includes('API')) {
        return this.fallbackMock.createComplaint(payload);
      }
      return this.fallbackMock.createComplaint(payload);
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

      if (!res.ok) throw new Error('API Error');
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
    return this.fallbackMock.assignDepartment(id, assignment, actorName);
  }

  public async upvoteComplaint(id: string, userId: string): Promise<Complaint | null> {
    return this.fallbackMock.upvoteComplaint(id, userId);
  }

  public async getStats() {
    return this.fallbackMock.getStats();
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

    if (timeline.length === 0) {
      timeline.push({
        id: `tl-${Date.now()}`,
        status: (item.status || 'SUBMITTED') as ComplaintStatus,
        title: 'Complaint Submitted',
        description: 'Initial complaint registration',
        timestamp: item.created_at || new Date().toISOString(),
        actor: { name: 'Citizen Reporter', role: 'CITIZEN' },
      });
    }

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
        name: 'Aarav Sharma',
      },
      media: [
        {
          id: 'm1',
          url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
          type: 'image',
          caption: 'Primary issue location photo',
        },
      ],
      timeline,
      upvotesCount: item.upvotes_count || 1,
    };
  }
}

export const complaintRepository = new ApiComplaintRepositoryImpl();
