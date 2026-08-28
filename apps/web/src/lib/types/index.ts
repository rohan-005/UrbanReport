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

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus;
  title: string;
  description: string;
  timestamp: string;
  actor: {
    name: string;
    role: 'CITIZEN' | 'ADMIN' | 'OFFICER' | 'SYSTEM';
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

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CITIZEN' | 'ADMIN' | 'OFFICER';
  aadhaarNumber?: string;
  isVerified?: boolean;
  avatarUrl?: string;
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
    isAnonymous?: boolean;
  };
  media: MediaItem[];
  timeline: TimelineEvent[];
  assignment?: Assignment;
  upvotesCount: number;
  upvotedByUserIds?: string[];
  resolutionNotes?: string;
}

export interface ComplaintFilters {
  category?: Category | 'ALL';
  severity?: Severity | 'ALL';
  status?: ComplaintStatus | 'ALL';
  searchQuery?: string;
  sortBy?: 'newest' | 'oldest' | 'upvotes' | 'severity';
}
