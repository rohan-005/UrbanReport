import { Resolver, Query, Mutation, Args, Float, Int, Context } from '@nestjs/graphql';
import {
  ComplaintType,
  CreateComplaintInput,
  DuplicateCandidateType,
  DuplicateCheckInput,
  ConfirmComplaintPayloadType,
  AnalyticsOverviewType,
  HotspotPointType,
} from './types/complaint.type';
import { AuthPayloadType, RegisterInput, UserType } from './types/user.type';
import { PlaceResultType, ReverseGeocodeType } from './types/maps.type';
import { ProxyService } from '../proxy/proxy.service';

@Resolver()
export class GatewayResolver {
  constructor(private readonly proxyService: ProxyService) {}

  @Query(() => [ComplaintType])
  async complaints(
    @Args('category', { nullable: true }) category?: string,
    @Args('severity', { nullable: true }) severity?: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('search', { nullable: true }) search?: string,
  ) {
    return this.proxyService.listComplaints({ category, severity, status, search });
  }

  @Query(() => ComplaintType, { nullable: true })
  async complaint(@Args('id') id: string) {
    return this.proxyService.getComplaintById(id);
  }

  @Query(() => AnalyticsOverviewType)
  async adminAnalyticsOverview(@Context() context: any) {
    const authHeader = context?.req?.headers?.authorization;
    return this.proxyService.getAdminAnalyticsOverview(
      authHeader ? { authorization: authHeader } : undefined,
    );
  }

  @Query(() => [HotspotPointType])
  async geographicHotspots(@Context() context: any) {
    const authHeader = context?.req?.headers?.authorization;
    return this.proxyService.getGeographicHotspots(
      authHeader ? { authorization: authHeader } : undefined,
    );
  }

  @Query(() => [DuplicateCandidateType])
  async findDuplicateComplaints(@Args('input') input: DuplicateCheckInput) {
    return this.proxyService.findDuplicateCandidates(input);
  }

  @Mutation(() => ConfirmComplaintPayloadType)
  async confirmComplaint(@Args('complaintId') complaintId: string, @Context() context: any) {
    const authHeader = context?.req?.headers?.authorization;
    return this.proxyService.confirmComplaint(complaintId, authHeader ? { authorization: authHeader } : undefined);
  }

  @Query(() => [ComplaintType])
  async viewportComplaints(
    @Args('minLat', { type: () => Float }) minLat: number,
    @Args('minLng', { type: () => Float }) minLng: number,
    @Args('maxLat', { type: () => Float }) maxLat: number,
    @Args('maxLng', { type: () => Float }) maxLng: number,
    @Args('category', { nullable: true }) category?: string,
    @Args('severity', { nullable: true }) severity?: string,
    @Args('status', { nullable: true }) status?: string,
  ) {
    return this.proxyService.getViewportComplaints({
      minLat,
      minLng,
      maxLat,
      maxLng,
      category,
      severity,
      status,
    });
  }

  @Query(() => [ComplaintType])
  async nearbyComplaints(
    @Args('lat', { type: () => Float }) lat: number,
    @Args('lng', { type: () => Float }) lng: number,
    @Args('radius', { type: () => Int, nullable: true }) radius?: number,
  ) {
    return this.proxyService.getNearbyComplaints(lat, lng, radius);
  }

  @Query(() => [PlaceResultType])
  async searchPlaces(@Args('q') q: string) {
    return this.proxyService.searchPlaces(q);
  }

  @Query(() => ReverseGeocodeType)
  async reverseGeocode(
    @Args('lat', { type: () => Float }) lat: number,
    @Args('lng', { type: () => Float }) lng: number,
  ) {
    return this.proxyService.reverseGeocode(lat, lng);
  }

  @Mutation(() => AuthPayloadType)
  async login(
    @Args('email') email: string,
    @Args('password', { nullable: true }) password?: string,
  ) {
    return this.proxyService.login(email, password);
  }

  @Mutation(() => AuthPayloadType)
  async register(@Args('input') input: RegisterInput) {
    return this.proxyService.register(input);
  }

  @Mutation(() => ComplaintType)
  async createComplaint(@Args('input') input: CreateComplaintInput) {
    return this.proxyService.createComplaint(input);
  }
}
