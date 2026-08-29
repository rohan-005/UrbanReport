import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ComplaintQueryDto } from './dto/query-complaint.dto';
import { NearbyQueryDto, ViewportQueryDto } from './dto/geo-query.dto';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Get('stats')
  async getStats() {
    return this.complaintsService.getStats();
  }

  @Get('departments')
  async getDepartments() {
    return this.complaintsService.getDepartments();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createComplaint(@Request() req: any, @Body() dto: CreateComplaintDto) {
    const reporterUserId = req.user?.userId || 'citizen-anon-001';
    return this.complaintsService.createComplaint(dto, reporterUserId);
  }

  @Get()
  async listComplaints(@Query() query: ComplaintQueryDto) {
    return this.complaintsService.listComplaints(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyComplaints(@Request() req: any) {
    const reporterUserId = req.user?.userId || 'citizen-anon-001';
    return this.complaintsService.getMyComplaints(reporterUserId);
  }

  @Get('nearby')
  async getNearbyComplaints(@Query() query: NearbyQueryDto) {
    return this.complaintsService.getNearbyComplaints(query);
  }

  @Get('viewport')
  async getViewportComplaints(@Query() query: ViewportQueryDto) {
    return this.complaintsService.getViewportComplaints(query);
  }

  @Post('duplicates')
  async findDuplicateCandidates(@Body() body: any) {
    return this.complaintsService.findDuplicateCandidates(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/confirm')
  async confirmComplaint(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.userId || req.user?._id || 'citizen-anon-001';
    return this.complaintsService.confirmComplaint(id, userId);
  }

  @Get(':id/confirmations')
  async getConfirmationCount(@Param('id') id: string) {
    const count = await this.complaintsService.getConfirmationCount(id);
    return { complaintId: id, confirmationsCount: count };
  }

  @Get(':id')
  async getComplaintById(@Param('id') id: string) {
    return this.complaintsService.getComplaintById(id);
  }

  @Get(':id/audit')
  async getAuditEvents(@Param('id') id: string) {
    return this.complaintsService.getAuditEvents(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/assign')
  async assignDepartment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { departmentId: string; officerId?: string; notes?: string },
  ) {
    const actorUserId = req.user?.userId || 'admin-desk-001';
    return this.complaintsService.assignDepartment(
      id,
      body.departmentId,
      body.officerId,
      body.notes,
      actorUserId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/resolution-evidence')
  async addResolutionEvidence(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { mediaId: string },
  ) {
    const actorUserId = req.user?.userId || 'admin-desk-001';
    return this.complaintsService.addResolutionEvidence(id, body.mediaId, actorUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatusPatch(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    const actorUserId = req.user?.userId || 'admin-desk-001';
    return this.complaintsService.updateStatus(id, dto, actorUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/status')
  async updateStatusPost(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    const actorUserId = req.user?.userId || 'admin-desk-001';
    return this.complaintsService.updateStatus(id, dto, actorUserId);
  }
}

