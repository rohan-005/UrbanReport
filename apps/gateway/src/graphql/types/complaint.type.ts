import { ObjectType, Field, ID, Float, Int, InputType } from '@nestjs/graphql';

@ObjectType()
export class ComplaintMediaItemType {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field({ defaultValue: 'image' })
  type: string;

  @Field({ nullable: true })
  caption?: string;
}

@ObjectType()
export class ComplaintType {
  @Field(() => ID)
  id: string;

  @Field()
  category: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  severity: string;

  @Field()
  status: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field()
  address: string;

  @Field(() => Int, { defaultValue: 0 })
  upvotesCount: number;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field(() => [ComplaintMediaItemType], { defaultValue: [] })
  media: ComplaintMediaItemType[];
}

@InputType()
export class CreateComplaintInput {
  @Field()
  category: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  severity: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field()
  address: string;

  @Field(() => [String], { nullable: 'itemsAndList' })
  mediaIds?: string[];
}

@InputType()
export class DuplicateCheckInput {
  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field()
  category: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  radius?: number;
}

@ObjectType()
export class DuplicateCandidateType {
  @Field(() => ID)
  complaintId: string;

  @Field()
  title: string;

  @Field()
  category: string;

  @Field()
  status: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field()
  address: string;

  @Field(() => Float)
  distanceMeters: number;

  @Field(() => Float)
  similarityScore: number;

  @Field(() => Int)
  similarityPercentage: number;

  @Field()
  confidence: string;

  @Field()
  createdAt: string;

  @Field(() => [ComplaintMediaItemType], { defaultValue: [] })
  media: ComplaintMediaItemType[];
}

@ObjectType()
export class ConfirmComplaintPayloadType {
  @Field(() => ID)
  complaintId: string;

  @Field(() => Int)
  confirmationsCount: number;

  @Field()
  hasUserConfirmed: boolean;
}

@ObjectType()
export class CategoryStatType {
  @Field()
  category: string;

  @Field(() => Int)
  count: number;

  @Field(() => Int)
  percentage: number;
}

@ObjectType()
export class StatusStatType {
  @Field()
  status: string;

  @Field(() => Int)
  count: number;

  @Field(() => Int)
  percentage: number;
}

@ObjectType()
export class SeverityStatType {
  @Field()
  severity: string;

  @Field(() => Int)
  count: number;

  @Field(() => Int)
  percentage: number;
}

@ObjectType()
export class HotspotPointType {
  @Field(() => Float)
  lat: number;

  @Field(() => Float)
  lng: number;

  @Field(() => Int)
  count: number;

  @Field()
  category: string;

  @Field()
  address: string;
}

@ObjectType()
export class AnalyticsOverviewType {
  @Field(() => Int)
  totalComplaints: number;

  @Field(() => Int)
  resolvedComplaints: number;

  @Field(() => Int)
  reopenedComplaints: number;

  @Field(() => Int)
  criticalAlertsCount: number;

  @Field(() => Float)
  avgResolutionTimeDays: number;

  @Field(() => [CategoryStatType])
  categories: CategoryStatType[];

  @Field(() => [StatusStatType])
  statuses: StatusStatType[];

  @Field(() => [SeverityStatType])
  severities: SeverityStatType[];

  @Field(() => [HotspotPointType])
  hotspots: HotspotPointType[];
}
