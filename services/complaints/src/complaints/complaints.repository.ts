import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { ComplaintQueryDto } from './dto/query-complaint.dto';
import { NearbyQueryDto, ViewportQueryDto } from './dto/geo-query.dto';
import { ComplaintEntity, ComplaintStatus } from './types/complaint.types';

@Injectable()
export class ComplaintsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateComplaintDto, reporterUserId: string): Promise<any> {
    return this.db.withTransaction(async (client) => {
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

      const [withMedia] = await this.attachMediaToComplaints([complaint]);
      return withMedia;
    });
  }

  async findById(id: string): Promise<any> {
    const res = await this.db.query(
      `
      SELECT id, reporter_user_id, category, title, description, severity, status, address, upvotes_count, created_at, updated_at,
             ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude
      FROM complaints
      WHERE id = $1;
      `,
      [id],
    );

    if (res.rows.length === 0) return null;

    const complaint = res.rows[0];

    // Fetch status history
    const historyRes = await this.db.query(
      `
      SELECT id, from_status, to_status, actor_user_id, note, created_at
      FROM status_history
      WHERE complaint_id = $1
      ORDER BY created_at ASC;
      `,
      [id],
    );

    const [withMedia] = await this.attachMediaToComplaints([complaint]);

    return {
      ...withMedia,
      statusHistory: historyRes.rows,
    };
  }

  async findMany(query: ComplaintQueryDto): Promise<{ items: any[]; total: number; page: number; limit: number }> {
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
  }

  async findByReporter(reporterUserId: string): Promise<any[]> {
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
  }

  async findNearby(dto: NearbyQueryDto): Promise<any[]> {
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
  }

  async findViewport(dto: ViewportQueryDto): Promise<any[]> {
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
  }

  async updateStatus(
    id: string,
    fromStatus: ComplaintStatus,
    toStatus: ComplaintStatus,
    actorUserId: string,
    note?: string,
  ): Promise<any> {
    return this.db.withTransaction(async (client) => {
      // 1. Update complaint status and timestamp
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

      // 2. Insert status history record
      await client.query(
        `
        INSERT INTO status_history (complaint_id, from_status, to_status, actor_user_id, note)
        VALUES ($1, $2, $3, $4, $5);
        `,
        [id, fromStatus, toStatus, actorUserId, note || `Status updated to ${toStatus}`],
      );

      // 3. Audit event
      await client.query(
        `
        INSERT INTO audit_events (actor_id, action, resource, resource_id, metadata)
        VALUES ($1, 'UPDATE_STATUS', 'complaint', $2, $3);
        `,
        [actorUserId, id, JSON.stringify({ fromStatus, toStatus, note })],
      );

      const [withMedia] = await this.attachMediaToComplaints([updated]);
      return withMedia;
    });
  }

  private async attachMediaToComplaints(items: any[]): Promise<any[]> {
    if (!items || items.length === 0) return items;
    const complaintIds = items.map((i) => i.id);

    const mediaRes = await this.db.query(
      `
      SELECT complaint_id, media_id, type, caption, url, created_at
      FROM complaint_media
      WHERE complaint_id = ANY($1::uuid[])
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
      media: mediaMap.get(item.id) || [],
    }));
  }
}
