export type Category =
  | 'POTHOLE'
  | 'GARBAGE'
  | 'STREETLIGHT'
  | 'DRAINAGE'
  | 'ROAD_DAMAGE'
  | 'WATER_SUPPLY'
  | 'TRAFFIC'
  | 'OTHER';

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

export interface LocationPoint {
  latitude: number;
  longitude: number;
}

export interface ComplaintEntity {
  id: string;
  reporter_user_id: string;
  category: Category;
  title: string;
  description: string;
  severity: Severity;
  status: ComplaintStatus;
  latitude: number;
  longitude: number;
  address: string;
  upvotes_count: number;
  created_at: Date;
  updated_at: Date;
}
