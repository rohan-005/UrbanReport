import { Logger } from '@nestjs/common';
import { Pool } from 'pg';

async function clearComplaints() {
  const logger = new Logger('ComplaintsClear');
  const connectionString =
    process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_m8PcLztZqVX3@ep-dawn-mouse-ae9qxkv7-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  });

  try {
    logger.log('Starting complaint purge process for PostgreSQL DB...');
    await pool.query(
      'TRUNCATE TABLE complaints, complaint_media, status_history, assignments, audit_events, complaint_confirmations CASCADE;',
    );
    logger.log('Successfully truncated all complaints and related relational records.');
  } catch (err: any) {
    logger.error(`Complaints purge failed: ${err.message}`);
  } finally {
    await pool.end();
  }
}

clearComplaints();
