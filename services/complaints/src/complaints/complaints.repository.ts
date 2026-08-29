import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { DuplicateDetectionService, DuplicateCheckInput } from './duplicate-detection.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { ComplaintQueryDto } from './dto/query-complaint.dto';
import { NearbyQueryDto, ViewportQueryDto } from './dto/geo-query.dto';
import { ComplaintEntity, ComplaintStatus } from './types/complaint.types';

@Injectable()
export class ComplaintsRepository {
  private fallbackStore: Map<string, any> = new Map();

  constructor(
    private readonly db: DatabaseService,
    private readonly duplicateDetection: DuplicateDetectionService,
  ) {}

  async create(dto: CreateComplaintDto, reporterUserId: string): Promise<any> {
    try {
      return await this.db.withTransaction(async (client) => {
        // 1. Insert complaint with PostGIS Point SRID 4326
        const res = await client.query(
          `
          INSERT INTO complaints (
            reporter_user_id, category, title, description, severity, status, location, address
          ) VALUES (
            $1, $2, $3, $4, $5, 'SUBMITTED', ST_SetSRID(ST_MakePoint($6, $7), 4326), $8
          )
          RETURNING id, reporter_user_id, category, title, description, severity, status, address, upvotes_count, created_at, updated_at,
                    ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude;
          `,
          [
            reporterUserId,
            dto.category,
            dto.title,
            dto.description,
            dto.severity,
            dto.longitude,
            dto.latitude,
            dto.address,
          ],
        );

        const complaint = res.rows[0];

        // 2. Insert complaint_media links if mediaIds are provided
        if (dto.mediaIds && dto.mediaIds.length > 0) {
          for (const mediaId of dto.mediaIds) {
            await client.query(
              `
              INSERT INTO complaint_media (complaint_id, media_id, type, caption, url)
              VALUES ($1, $2, 'image', 'Evidence photo', $3);
              `,
              [complaint.id, mediaId, `/media/${mediaId}`],
            );
          }
        }

        // 3. Initial status history record
        await client.query(
          `
          INSERT INTO status_history (complaint_id, from_status, to_status, actor_user_id, note)
          VALUES ($1, NULL, 'SUBMITTED', $2, 'Initial complaint submission by citizen');
          `,
          [complaint.id, reporterUserId],
        );

        // 4. Audit event
        await client.query(
          `
          INSERT INTO audit_events (actor_id, action, resource, resource_id, metadata)
          VALUES ($1, 'CREATE_COMPLAINT', 'complaint', $2, $3);
          `,
          [reporterUserId, complaint.id, JSON.stringify({ category: dto.category, severity: dto.severity, mediaCount: dto.mediaIds?.length || 0 })],
        );

        complaint.media = (dto.mediaIds || []).map((mId) => ({
          id: mId,
          mediaId: mId,
          type: 'image',
          caption: 'Evidence photo',
          url: `/media/${mId}`,
          createdAt: complaint.created_at || new Date().toISOString(),
        }));
        this.fallbackStore.set(complaint.id, complaint);
        return complaint;
      });
    } catch (dbErr: any) {
      // Fallback in-memory persistence when PostgreSQL DB connection is offline
      const id = `URB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date().toISOString();

      const mediaItems = (dto.mediaIds || []).map((mId) => ({
        id: mId,
        mediaId: mId,
        type: 'image',
        caption: 'Evidence photo',
        url: `/media/${mId}`,
        createdAt: now,
      }));

      const record = {
        id,
        reporter_user_id: reporterUserId,
        category: dto.category,
        title: dto.title,
        description: dto.description,
        severity: dto.severity,
        status: 'SUBMITTED',
        latitude: Number(dto.latitude),
        longitude: Number(dto.longitude),
        address: dto.address,
        upvotes_count: 0,
        created_at: now,
        updated_at: now,
        media: mediaItems,
        statusHistory: [
          {
            id: `sh-${Date.now()}`,
            from_status: null,
            to_status: 'SUBMITTED',
            actor_user_id: reporterUserId,
            note: 'Initial complaint submission by citizen',
            created_at: now,
          },
        ],
      };

      this.fallbackStore.set(id, record);
      return record;
    }
  }

  async findById(id: string): Promise<any> {
    try {
      const res = await this.db.query(
        `
        SELECT id, reporter_user_id, category, title, description, severity, status, address, upvotes_count, created_at, updated_at,
               ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude
        FROM complaints
        WHERE id = $1;
        `,
        [id],
      );

      if (res.rows.length === 0) return this.fallbackStore.get(id) || null;

      const complaint = res.rows[0];

      const historyRes = await this.db.query(
        `
        SELECT id, from_status, to_status, actor_user_id, note, created_at
        FROM status_history
        WHERE complaint_id = $1
        ORDER BY created_at ASC;
        `,
        [id],
      );

      const assignRes = await this.db.query(
        `
        SELECT a.id, a.department_id, d.name as department_name, a.officer_id, a.notes, a.assigned_at
        FROM assignments a
        LEFT JOIN departments d ON d.id = a.department_id
        WHERE a.complaint_id = $1
        ORDER BY a.assigned_at DESC
        LIMIT 1;
        `,
        [id],
      );

      const auditRes = await this.db.query(
        `
        SELECT id, actor_id, action, resource, resource_id, metadata, created_at
        FROM audit_events
        WHERE resource_id = $1
        ORDER BY created_at DESC;
        `,
        [id],
      );

      const [withMedia] = await this.attachMediaToComplaints([complaint]);

      const assignment = assignRes.rows.length > 0 ? {
        departmentId: assignRes.rows[0].department_id,
        department: assignRes.rows[0].department_name || assignRes.rows[0].department_id,
        assignedOfficer: assignRes.rows[0].officer_id,
        notes: assignRes.rows[0].notes,
        assignedAt: assignRes.rows[0].assigned_at,
      } : (this.fallbackStore.get(id)?.assignment || null);

      return {
        ...withMedia,
        statusHistory: historyRes.rows,
        assignment,
        auditEvents: auditRes.rows,
      };
    } catch {
      return this.fallbackStore.get(id) || null;
    }
  }

  async findMany(query: ComplaintQueryDto): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    try {
      const { category, severity, status, search, page = 1, limit = 20, sortBy = 'newest' } = query;

      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (category && category !== 'ALL') {
        conditions.push(`category = $${paramIndex++}`);
        params.push(category);
      }

      if (severity && severity !== 'ALL') {
        conditions.push(`severity = $${paramIndex++}`);
        params.push(severity);
      }

      if (status && status !== 'ALL') {
        conditions.push(`status = $${paramIndex++}`);
        params.push(status);
      }

      if (search) {
        conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR address ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      let orderClause = 'ORDER BY created_at DESC';
      if (sortBy === 'oldest') orderClause = 'ORDER BY created_at ASC';
      if (sortBy === 'upvotes') orderClause = 'ORDER BY upvotes_count DESC';

      const offset = (page - 1) * limit;

      const countRes = await this.db.query(`SELECT COUNT(*) as total FROM complaints ${whereClause};`, params);
      const total = parseInt(countRes.rows[0].total, 10);

      const itemsRes = await this.db.query(
        `
        SELECT id, reporter_user_id, category, title, description, severity, status, address, upvotes_count, created_at, updated_at,
               ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude
        FROM complaints
        ${whereClause}
        ${orderClause}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++};
        `,
        [...params, limit, offset],
      );

      const itemsWithMedia = await this.attachMediaToComplaints(itemsRes.rows);

      return {
        items: itemsWithMedia,
        total,
        page,
        limit,
      };
    } catch {
      const all = Array.from(this.fallbackStore.values());
      return {
        items: all,
        total: all.length,
        page: 1,
        limit: 20,
      };
    }
  }

  async findByReporter(reporterUserId: string): Promise<any[]> {
    try {
      const res = await this.db.query(
        `
        SELECT id, reporter_user_id, category, title, description, severity, status, address, upvotes_count, created_at, updated_at,
               ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude
        FROM complaints
        WHERE reporter_user_id = $1
        ORDER BY created_at DESC;
        `,
        [reporterUserId],
      );
      return this.attachMediaToComplaints(res.rows);
    } catch {
      return Array.from(this.fallbackStore.values()).filter((c) => c.reporter_user_id === reporterUserId);
    }
  }

  async findNearby(dto: NearbyQueryDto): Promise<any[]> {
    try {
      const radiusMeters = dto.radius || 5000;
      const res = await this.db.query(
        `
        SELECT id, reporter_user_id, category, title, description, severity, status, address, upvotes_count, created_at, updated_at,
               ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude,
               ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as distance_meters
        FROM complaints
        WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
        ORDER BY distance_meters ASC
        LIMIT 100;
        `,
        [dto.lng, dto.lat, radiusMeters],
      );
      return this.attachMediaToComplaints(res.rows);
    } catch {
      return Array.from(this.fallbackStore.values());
    }
  }

  async findViewport(dto: ViewportQueryDto): Promise<any[]> {
    try {
      const conditions = [`location && ST_MakeEnvelope($1, $2, $3, $4, 4326)`];
      const params: any[] = [dto.minLng, dto.minLat, dto.maxLng, dto.maxLat];
      let pIdx = 5;

      if (dto.category && dto.category !== 'ALL') {
        conditions.push(`category = $${pIdx++}`);
        params.push(dto.category);
      }
      if (dto.status && dto.status !== 'ALL') {
        conditions.push(`status = $${pIdx++}`);
        params.push(dto.status);
      }
      if (dto.severity && dto.severity !== 'ALL') {
        conditions.push(`severity = $${pIdx++}`);
        params.push(dto.severity);
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`;

      const res = await this.db.query(
        `
        SELECT id, reporter_user_id, category, title, description, severity, status, address, upvotes_count, created_at, updated_at,
               ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude
        FROM complaints
        ${whereClause}
        LIMIT 200;
        `,
        params,
      );
      return this.attachMediaToComplaints(res.rows);
    } catch {
      return Array.from(this.fallbackStore.values());
    }
  }

  async getStats(): Promise<any> {
    try {
      const res = await this.db.query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'SUBMITTED')::int as submitted,
          COUNT(*) FILTER (WHERE status = 'UNDER_REVIEW')::int as "underReview",
          COUNT(*) FILTER (WHERE status = 'VERIFIED')::int as verified,
          COUNT(*) FILTER (WHERE status = 'ASSIGNED')::int as assigned,
          COUNT(*) FILTER (WHERE status = 'IN_PROGRESS')::int as "inProgress",
          COUNT(*) FILTER (WHERE status = 'RESOLVED')::int as resolved,
          COUNT(*) FILTER (WHERE status = 'REOPENED')::int as reopened,
          COUNT(*) FILTER (WHERE status = 'REJECTED')::int as rejected,
          COUNT(*) FILTER (WHERE severity = 'CRITICAL')::int as critical
        FROM complaints;
      `);
      return res.rows[0];
    } catch {
      const all = Array.from(this.fallbackStore.values());
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
  }

  async getDepartments(): Promise<any[]> {
    try {
      const res = await this.db.query(`
        SELECT id, name, service_area, active, created_at
        FROM departments
        ORDER BY name ASC;
      `);
      if (res.rows.length > 0) return res.rows;
    } catch {}

    return [
      { id: 'dept-roads', name: 'Roads & Infrastructure Department', service_area: 'Central Zone', active: true },
      { id: 'dept-sanitation', name: 'Solid Waste & Sanitation Department', service_area: 'North & West Wards', active: true },
      { id: 'dept-lighting', name: 'Electrical & Street Lighting Unit', service_area: 'City Metro Grid', active: true },
      { id: 'dept-water', name: 'Water Supply & Sewage Board', service_area: 'Metropolitan Basin', active: true },
      { id: 'dept-traffic', name: 'Traffic Signals & Safety Authority', service_area: 'Urban Transit Grid', active: true },
    ];
  }

  async assignDepartment(
    complaintId: string,
    departmentId: string,
    officerId?: string,
    notes?: string,
    actorUserId: string = 'admin-001',
  ): Promise<any> {
    try {
      return await this.db.withTransaction(async (client) => {
        const compRes = await client.query(`SELECT status FROM complaints WHERE id = $1;`, [complaintId]);
        if (compRes.rows.length === 0) throw new NotFoundException(`Complaint ${complaintId} not found.`);

        const currentStatus = compRes.rows[0].status;
        const nextStatus = (currentStatus === 'SUBMITTED' || currentStatus === 'UNDER_REVIEW' || currentStatus === 'VERIFIED') ? 'ASSIGNED' : currentStatus;

        await client.query(
          `
          INSERT INTO assignments (complaint_id, department_id, officer_id, notes)
          VALUES ($1, $2, $3, $4);
          `,
          [complaintId, departmentId, officerId || null, notes || null],
        );

        await client.query(
          `
          UPDATE complaints
          SET status = $1, updated_at = NOW()
          WHERE id = $2;
          `,
          [nextStatus, complaintId],
        );

        await client.query(
          `
          INSERT INTO status_history (complaint_id, from_status, to_status, actor_user_id, note)
          VALUES ($1, $2, $3, $4, $5);
          `,
          [complaintId, currentStatus, nextStatus, actorUserId, notes || `Assigned to department ${departmentId}`],
        );

        await client.query(
          `
          INSERT INTO audit_events (actor_id, action, resource, resource_id, metadata)
          VALUES ($1, 'ASSIGN_DEPARTMENT', 'complaint', $2, $3);
          `,
          [actorUserId, complaintId, JSON.stringify({ departmentId, officerId, notes })],
        );

        return this.findById(complaintId);
      });
    } catch {
      const existing = this.fallbackStore.get(complaintId);
      if (existing) {
        existing.status = 'ASSIGNED';
        existing.assignment = {
          departmentId,
          department: departmentId,
          assignedOfficer: officerId,
          notes,
          assignedAt: new Date().toISOString(),
        };
        this.fallbackStore.set(complaintId, existing);
        return existing;
      }
      throw new NotFoundException(`Complaint ${complaintId} not found.`);
    }
  }

  async addResolutionEvidence(
    complaintId: string,
    mediaId: string,
    actorUserId: string = 'admin-001',
  ): Promise<any> {
    try {
      await this.db.query(
        `
        INSERT INTO complaint_media (complaint_id, media_id, type, caption, url)
        VALUES ($1, $2, 'resolution', 'Resolution evidence photo', $3);
        `,
        [complaintId, mediaId, `/media/${mediaId}`],
      );

      await this.db.query(
        `
        INSERT INTO audit_events (actor_id, action, resource, resource_id, metadata)
        VALUES ($1, 'UPLOAD_RESOLUTION_EVIDENCE', 'complaint', $2, $3);
        `,
        [actorUserId, complaintId, JSON.stringify({ mediaId })],
      );

      return this.findById(complaintId);
    } catch {
      const existing = this.fallbackStore.get(complaintId);
      if (existing) {
        if (!existing.media) existing.media = [];
        existing.media.push({
          id: mediaId,
          mediaId: mediaId,
          type: 'resolution',
          caption: 'Resolution evidence photo',
          url: `/media/${mediaId}`,
          createdAt: new Date().toISOString(),
        });
        return existing;
      }
      throw new NotFoundException(`Complaint ${complaintId} not found.`);
    }
  }

  async getAuditEvents(complaintId: string): Promise<any[]> {
    try {
      const res = await this.db.query(
        `
        SELECT id, actor_id, action, resource, resource_id, metadata, created_at
        FROM audit_events
        WHERE resource_id = $1
        ORDER BY created_at DESC;
        `,
        [complaintId],
      );
      return res.rows;
    } catch {
      return [
        {
          id: `audit-${Date.now()}`,
          actor_id: 'admin-001',
          action: 'VIEW_COMPLAINT',
          resource: 'complaint',
          resource_id: complaintId,
          metadata: {},
          created_at: new Date().toISOString(),
        },
      ];
    }
  }

  async findDuplicateCandidates(input: DuplicateCheckInput): Promise<any[]> {
    const radiusMeters = input.radius || Number(process.env.DUPLICATE_SEARCH_RADIUS_METERS) || 250;
    const maxCandidates = Number(process.env.DUPLICATE_MAX_CANDIDATES) || 10;
    const category = (input.category || '').replace(/\s+/g, '_').toUpperCase();

    try {
      const res = await this.db.query(
        `
        SELECT id, reporter_user_id, category, title, description, severity, status, address, upvotes_count, created_at, updated_at,
               ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude,
               ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as distance_meters
        FROM complaints
        WHERE status IN ('SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS')
          AND category = $5
          AND ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
        ORDER BY distance_meters ASC
        LIMIT $4;
        `,
        [input.longitude, input.latitude, radiusMeters, maxCandidates, category],
      );

      const itemsWithMedia = await this.attachMediaToComplaints(res.rows);
      return this.duplicateDetection.rankCandidates(itemsWithMedia, input, radiusMeters);
    } catch {
      const allActive = Array.from(this.fallbackStore.values()).filter((c) =>
        ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status) &&
        c.category === category,
      );
      return this.duplicateDetection.rankCandidates(allActive, input, radiusMeters);
    }
  }

  async confirmComplaint(complaintId: string, userId: string): Promise<any> {
    try {
      return await this.db.withTransaction(async (client) => {
        // Insert confirmation (ON CONFLICT DO NOTHING due to PRIMARY KEY (complaint_id, user_id))
        const confirmRes = await client.query(
          `
          INSERT INTO complaint_confirmations (complaint_id, user_id)
          VALUES ($1, $2)
          ON CONFLICT (complaint_id, user_id) DO NOTHING
          RETURNING complaint_id;
          `,
          [complaintId, userId],
        );

        const isNewConfirmation = confirmRes.rows.length > 0;

        if (isNewConfirmation) {
          await client.query(
            `
            UPDATE complaints
            SET upvotes_count = upvotes_count + 1, updated_at = NOW()
            WHERE id = $1;
            `,
            [complaintId],
          );

          await client.query(
            `
            INSERT INTO audit_events (actor_id, action, resource, resource_id, metadata)
            VALUES ($1, 'CONFIRM_COMPLAINT', 'complaint', $2, $3);
            `,
            [userId, complaintId, JSON.stringify({ action: 'COMMUNITY_CONFIRM' })],
          );
        }

        const countRes = await client.query(
          `SELECT COUNT(*)::int as total FROM complaint_confirmations WHERE complaint_id = $1;`,
          [complaintId],
        );

        const totalConfirmations = parseInt(countRes.rows[0]?.total || '0', 10);
        const complaint = await this.findById(complaintId);

        return {
          complaint,
          complaintId,
          confirmationsCount: totalConfirmations,
          hasUserConfirmed: true,
          isNewConfirmation,
        };
      });
    } catch {
      const existing = this.fallbackStore.get(complaintId);
      if (existing) {
        if (!existing.confirmations) existing.confirmations = new Set();
        const isNew = !existing.confirmations.has(userId);
        existing.confirmations.add(userId);
        existing.upvotes_count = existing.confirmations.size;
        this.fallbackStore.set(complaintId, existing);
        return {
          complaint: existing,
          complaintId,
          confirmationsCount: existing.confirmations.size,
          hasUserConfirmed: true,
          isNewConfirmation: isNew,
        };
      }
      throw new NotFoundException(`Complaint ${complaintId} not found.`);
    }
  }

  async getConfirmationCount(complaintId: string): Promise<number> {
    try {
      const res = await this.db.query(
        `SELECT COUNT(*)::int as total FROM complaint_confirmations WHERE complaint_id = $1;`,
        [complaintId],
      );
      return parseInt(res.rows[0]?.total || '0', 10);
    } catch {
      const existing = this.fallbackStore.get(complaintId);
      return existing?.confirmations?.size || existing?.upvotes_count || 0;
    }
  }

  async hasUserConfirmed(complaintId: string, userId: string): Promise<boolean> {
    try {
      const res = await this.db.query(
        `SELECT COUNT(*)::int as count FROM complaint_confirmations WHERE complaint_id = $1 AND user_id = $2;`,
        [complaintId, userId],
      );
      return parseInt(res.rows[0]?.count || '0', 10) > 0;
    } catch {
      const existing = this.fallbackStore.get(complaintId);
      return Boolean(existing?.confirmations?.has(userId));
    }
  }

  async updateStatus(
    id: string,
    fromStatus: ComplaintStatus,
    toStatus: ComplaintStatus,
    actorUserId: string,
    note?: string,
    resolutionMediaIds?: string[],
  ): Promise<any> {
    try {
      return await this.db.withTransaction(async (client) => {
        const updateRes = await client.query(
          `
          UPDATE complaints
          SET status = $1, updated_at = NOW()
          WHERE id = $2
          RETURNING id, reporter_user_id, category, title, description, severity, status, address, upvotes_count, created_at, updated_at,
                    ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude;
          `,
          [toStatus, id],
        );

        if (updateRes.rows.length === 0) {
          throw new NotFoundException(`Complaint ${id} not found.`);
        }

        const updated = updateRes.rows[0];

        if (resolutionMediaIds && resolutionMediaIds.length > 0) {
          for (const mId of resolutionMediaIds) {
            await client.query(
              `
              INSERT INTO complaint_media (complaint_id, media_id, type, caption, url)
              VALUES ($1, $2, 'resolution', 'Resolution photo evidence', $3);
              `,
              [id, mId, `/media/${mId}`],
            );
          }
        }

        await client.query(
          `
          INSERT INTO status_history (complaint_id, from_status, to_status, actor_user_id, note)
          VALUES ($1, $2, $3, $4, $5);
          `,
          [id, fromStatus, toStatus, actorUserId, note || `Status updated to ${toStatus}`],
        );

        await client.query(
          `
          INSERT INTO audit_events (actor_id, action, resource, resource_id, metadata)
          VALUES ($1, 'UPDATE_STATUS', 'complaint', $2, $3);
          `,
          [actorUserId, id, JSON.stringify({ fromStatus, toStatus, note, resolutionMediaIds })],
        );

        const [withMedia] = await this.attachMediaToComplaints([updated]);
        this.fallbackStore.set(id, withMedia);
        return withMedia;
      });
    } catch {
      const existing = this.fallbackStore.get(id);
      if (!existing) throw new NotFoundException(`Complaint ${id} not found.`);
      existing.status = toStatus;
      existing.updated_at = new Date().toISOString();
      if (resolutionMediaIds && resolutionMediaIds.length > 0) {
        if (!existing.media) existing.media = [];
        for (const mId of resolutionMediaIds) {
          existing.media.push({
            id: mId,
            mediaId: mId,
            type: 'resolution',
            caption: 'Resolution photo evidence',
            url: `/media/${mId}`,
            createdAt: new Date().toISOString(),
          });
        }
      }
      this.fallbackStore.set(id, existing);
      return existing;
    }
  }

  async delete(id: string, actorUserId: string = 'admin-001'): Promise<boolean> {
    try {
      return await this.db.withTransaction(async (client) => {
        await client.query(`DELETE FROM status_history WHERE complaint_id = $1;`, [id]);
        await client.query(`DELETE FROM assignments WHERE complaint_id = $1;`, [id]);
        await client.query(`DELETE FROM complaint_media WHERE complaint_id = $1;`, [id]);
        await client.query(`DELETE FROM complaint_confirmations WHERE complaint_id = $1;`, [id]);
        await client.query(`DELETE FROM audit_events WHERE resource_id = $1;`, [id]);
        const res = await client.query(`DELETE FROM complaints WHERE id = $1 RETURNING id;`, [id]);
        this.fallbackStore.delete(id);
        return res.rows.length > 0;
      });
    } catch {
      const existed = this.fallbackStore.has(id);
      this.fallbackStore.delete(id);
      return existed;
    }
  }


  private async attachMediaToComplaints(items: any[]): Promise<any[]> {
    if (!items || items.length === 0) return items;
    const complaintIds = items.map((i) => i.id);

    try {
      const mediaRes = await this.db.query(
        `
        SELECT complaint_id, media_id, type, caption, url, created_at
        FROM complaint_media
        WHERE complaint_id::text = ANY($1::text[])
        ORDER BY created_at ASC;
        `,
        [complaintIds],
      );

      const mediaMap = new Map<string, any[]>();
      for (const row of mediaRes.rows) {
        if (!mediaMap.has(row.complaint_id)) {
          mediaMap.set(row.complaint_id, []);
        }
        mediaMap.get(row.complaint_id)!.push({
          id: row.media_id,
          mediaId: row.media_id,
          type: row.type,
          caption: row.caption,
          url: row.url,
          createdAt: row.created_at,
        });
      }

      return items.map((item) => ({
        ...item,
        media: mediaMap.get(item.id) || item.media || [],
      }));
    } catch {
      return items.map((item) => ({
        ...item,
        media: item.media || [],
      }));
    }
  }
}
