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

  @Get(':id')
  async getComplaintById(@Param('id') id: string) {
    return this.complaintsService.getComplaintById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    const actorUserId = req.user?.userId || 'admin-desk-001';
    return this.complaintsService.updateStatus(id, dto, actorUserId);
  }
}
