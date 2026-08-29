import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('DatabaseService');
  private pool: Pool;
  public isConnected: boolean = false;

  constructor(private configService: ConfigService) {
    const connectionString =
      this.configService.get<string>('NEON_DATABASE_URL') ||
      process.env.NEON_DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/urbanreports_complaints';

    this.pool = new Pool({
      connectionString,
      ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }

  async onModuleInit() {
    try {
      this.logger.log('Initializing Neon PostgreSQL database connection & PostGIS schemas...');
      await this.runMigrations();
      this.isConnected = true;
      this.logger.log('Neon PostgreSQL & PostGIS schemas successfully verified.');
    } catch (err: any) {
      this.isConnected = false;
      const msg =
        err.message ||
        (Array.isArray(err.errors) ? err.errors.map((e: any) => e.message || String(e)).join(', ') : String(err));
      this.logger.warn(
        `PostgreSQL connection warning: ${msg} (${err.code || err.name || 'OFFLINE'}). (Running in fallback mode if offline)`,
      );
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query(text: string, params?: any[]): Promise<any> {
    if (!this.isConnected) {
      throw new Error('Database connection is offline');
    }
    return this.pool.query(text, params);
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  private async runMigrations() {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Enable PostGIS extension
      await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');

      // Departments table
      await client.query(`
        CREATE TABLE IF NOT EXISTS departments (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          service_area VARCHAR(255) NOT NULL,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Core Complaints table with PostGIS Point SRID 4326
      await client.query(`
        CREATE TABLE IF NOT EXISTS complaints (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          reporter_user_id VARCHAR(128) NOT NULL,
          category VARCHAR(64) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          severity VARCHAR(32) NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
          location GEOMETRY(Point, 4326) NOT NULL,
          address VARCHAR(255) NOT NULL,
          upvotes_count INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // GiST Spatial Index on PostGIS Point location
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_complaints_location ON complaints USING GIST(location);
        CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
        CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
        CREATE INDEX IF NOT EXISTS idx_complaints_severity ON complaints(severity);
        CREATE INDEX IF NOT EXISTS idx_complaints_reporter ON complaints(reporter_user_id);
      `);

      // Status History table
      await client.query(`
        CREATE TABLE IF NOT EXISTS status_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
          from_status VARCHAR(32),
          to_status VARCHAR(32) NOT NULL,
          actor_user_id VARCHAR(128) NOT NULL,
          note TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Assignments table
      await client.query(`
        CREATE TABLE IF NOT EXISTS assignments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
          department_id VARCHAR(64) NOT NULL REFERENCES departments(id),
          officer_id VARCHAR(128),
          notes TEXT,
          assigned_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Complaint Media references table (Phase 4 media service hook)
      await client.query(`
        CREATE TABLE IF NOT EXISTS complaint_media (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
          media_id VARCHAR(128) NOT NULL,
          type VARCHAR(32) NOT NULL DEFAULT 'image',
          caption VARCHAR(255),
          url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Complaint Confirmations table (Phase 8 community validation hook)
      await client.query(`
        CREATE TABLE IF NOT EXISTS complaint_confirmations (
          complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
          user_id VARCHAR(128) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          PRIMARY KEY (complaint_id, user_id)
        );
      `);

      // Audit Events table
      await client.query(`
        CREATE TABLE IF NOT EXISTS audit_events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          actor_id VARCHAR(128) NOT NULL,
          action VARCHAR(128) NOT NULL,
          resource VARCHAR(128) NOT NULL,
          resource_id VARCHAR(128) NOT NULL,
          metadata JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
