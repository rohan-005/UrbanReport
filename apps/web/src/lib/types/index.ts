export type Category =
  | 'Pothole'
  | 'Garbage'
  | 'Streetlight'
  | 'Drainage'
  | 'Road Damage'
  | 'Water Supply'
  | 'Traffic'
  | 'Other';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REOPENED'
  | 'REJECTED';

export type UserRole = 'CITIZEN' | 'ADMIN' | 'OFFICER' | 'AUTHORITY';

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus;
  title: string;
  description: string;
  timestamp: string;
  actor: {
    name: string;
    role: 'CITIZEN' | 'ADMIN' | 'OFFICER' | 'SYSTEM' | 'AUTHORITY';
  };
  notes?: string;
}

export interface Assignment {
  department: string;
  assignedOfficer?: string;
  assignedAt?: string;
  estimatedResolutionDate?: string;
  notes?: string;
}

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
}

export interface NotificationPreferences {
  complaintUpdates: boolean;
  resolutionNotifications: boolean;
  assignmentUpdates: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  aadhaarNumber?: string;
  isVerified?: boolean;
  avatarUrl?: string;
  avatar?: string;
  notificationPreferences?: NotificationPreferences;
}

export interface Complaint {
  id: string;
  title: string;
  category: Category;
  description: string;
  severity: Severity;
  status: ComplaintStatus;
  latitude: number;
  longitude: number;
  address: string;
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    name: string;
    email?: string;
    isAnonymous?: boolean;
  };
  media: MediaItem[];
  timeline: TimelineEvent[];
  assignment?: Assignment;
  upvotesCount: number;
  upvotedByUserIds?: string[];
  resolutionNotes?: string;
  resolutionMedia?: MediaItem[];
  auditEvents?: any[];
  confirmationsCount?: number;
  hasUserConfirmed?: boolean;
}

export type DuplicateConfidence = 'HIGH' | 'POSSIBLE' | 'LOW';

export interface DuplicateCandidate {
  complaintId: string;
  title: string;
  category: Category;
  status: ComplaintStatus;
  latitude: number;
  longitude: number;
  address: string;
  distanceMeters: number;
  similarityScore: number;
  similarityPercentage: number;
  confidence: DuplicateConfidence;
  createdAt: string;
  media?: MediaItem[];
}

export interface DuplicateCheckInput {
  latitude: number;
  longitude: number;
  category: Category | string;
  title?: string;
  description?: string;
  radius?: number;
}

export interface ComplaintFilters {
  category?: Category | 'ALL';
  severity?: Severity | 'ALL';
  status?: ComplaintStatus | 'ALL';
  searchQuery?: string;
  sortBy?: 'newest' | 'oldest' | 'upvotes' | 'severity';
}

export interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
}

export interface SeverityStat {
  severity: string;
  count: number;
  percentage: number;
}

export interface StatusStat {
  status: string;
  count: number;
  percentage: number;
}

export interface HotspotPoint {
  lat: number;
  lng: number;
  count: number;
  category: string;
  address: string;
}

export interface AnalyticsOverview {
  totalComplaints: number;
  resolvedComplaints: number;
  reopenedComplaints: number;
  criticalAlertsCount: number;
  avgResolutionTimeDays: number;
  categories: CategoryStat[];
  statuses: StatusStat[];
  severities: SeverityStat[];
  hotspots: HotspotPoint[];
  mapActivity?: {
    totalMapViews: number;
    nearbySearches: number;
    duplicateChecksCount: number;
  };
}
