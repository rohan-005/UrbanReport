import { Logger } from '@nestjs/common';
import { Pool } from 'pg';

async function seed() {
  const logger = new Logger('ComplaintsSeed');
  const connectionString =
    process.env.NEON_DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/urbanreports_complaints';

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();
  try {
    logger.log('Starting seed process for Neon PostgreSQL + PostGIS...');
    await client.query('BEGIN');

    // 1. Seed Departments
    const departments = [
      { id: 'dept-roads', name: 'Roads & Infrastructure Department', area: 'Central Zone' },
      { id: 'dept-sanitation', name: 'Solid Waste & Sanitation Department', area: 'North & West Wards' },
      { id: 'dept-lighting', name: 'Electrical & Street Lighting Unit', area: 'City Metro Grid' },
      { id: 'dept-water', name: 'Water Supply & Sewage Board', area: 'Metropolitan Basin' },
      { id: 'dept-traffic', name: 'Traffic Signals & Safety Authority', area: 'Urban Transit Grid' },
    ];

    for (const d of departments) {
      await client.query(
        `INSERT INTO departments (id, name, service_area, active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (id) DO UPDATE SET name = $2, service_area = $3;`,
        [d.id, d.name, d.area],
      );
    }
    logger.log('Seeded 5 municipal departments.');

    // 2. Seed 20+ Realistic Civic Complaints with PostGIS Points SRID 4326
    const complaintsSeed = [
      {
        reporter_user_id: 'user-aarav-001',
        category: 'POTHOLE',
        title: 'Dangerous Deep Crater Pothole on Ring Road Flyover',
        description: 'Large 4-foot wide asphalt crater causing severe vehicle wheel damage and sudden braking hazards during rush hour traffic.',
        severity: 'CRITICAL',
        status: 'IN_PROGRESS',
        lat: 28.5672,
        lng: 77.2100,
        address: 'Outer Ring Road near Lajpat Nagar Flyover, New Delhi 110024',
      },
      {
        reporter_user_id: 'user-priya-002',
        category: 'STREETLIGHT',
        title: 'Cluster of 5 Non-Functional LED Streetlights on Main Blvd',
        description: 'Complete stretch of streetlights dark for 3 consecutive nights. Pedestrian visibility severely compromised near school crosswalk.',
        severity: 'HIGH',
        status: 'VERIFIED',
        lat: 28.6328,
        lng: 77.2197,
        address: 'Barakhamba Road, Connaught Place Outer Circle, New Delhi 110001',
      },
      {
        reporter_user_id: 'user-vikram-003',
        category: 'GARBAGE',
        title: 'Overflowing Waste Dump Bin Blocking Sidewalk',
        description: 'Commercial market garbage accumulating on main walkway. Strong odor and stray animals present for over 48 hours.',
        severity: 'MEDIUM',
        status: 'ASSIGNED',
        lat: 12.9784,
        lng: 77.6408,
        address: '100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
      },
      {
        reporter_user_id: 'user-ananya-004',
        category: 'DRAINAGE',
        title: 'Blocked Stormwater Drain Causing Sewage Backflow',
        description: 'Plastic debris choking underground drainage pipe. Water accumulating up to knee height after heavy rainfall.',
        severity: 'HIGH',
        status: 'RESOLVED',
        lat: 19.0760,
        lng: 72.8777,
        address: 'Linking Road, Bandra West, Mumbai, Maharashtra 400050',
      },
      {
        reporter_user_id: 'user-rohan-005',
        category: 'WATER_SUPPLY',
        title: 'Main Pipeline Burst Spilling Clean Drinking Water',
        description: 'Underground municipal supply line ruptured. Millions of liters of potable water flooding street and lower residential compounds.',
        severity: 'CRITICAL',
        status: 'IN_PROGRESS',
        lat: 17.4065,
        lng: 78.4772,
        address: 'Road No. 12, Banjara Hills, Hyderabad, Telangana 500034',
      },
      {
        reporter_user_id: 'user-aarav-001',
        category: 'TRAFFIC',
        title: 'Broken Traffic Signal at Busy 4-Way Intersection',
        description: 'Red light stuck permanently on all directions leading to gridlock during morning peak hours.',
        severity: 'HIGH',
        status: 'VERIFIED',
        lat: 22.5726,
        lng: 88.3639,
        address: 'Park Street Junction, Kolkata, West Bengal 700016',
      },
      {
        reporter_user_id: 'user-priya-002',
        category: 'ROAD_DAMAGE',
        title: 'Collapsed Road Shoulder near Metro Construction',
        description: 'Road edge caved in near heavy vehicle transit lane. Needs immediate barrier placement and gravel backfill.',
        severity: 'CRITICAL',
        status: 'SUBMITTED',
        lat: 28.5355,
        lng: 77.3910,
        address: 'Sector 62 Main Expressway Corridor, Noida, Uttar Pradesh 201309',
      },
      {
        reporter_user_id: 'user-vikram-003',
        category: 'OTHER',
        title: 'Fallen Tree Branch Obstructing Overhead Cable Line',
        description: 'Heavy banyan tree limb resting on power and optic fiber wires following storm.',
        severity: 'MEDIUM',
        status: 'UNDER_REVIEW',
        lat: 13.0827,
        lng: 80.2707,
        address: 'Anna Salai Near LIC Building, Chennai, Tamil Nadu 600002',
      },
    ];

    for (const c of complaintsSeed) {
      const compRes = await client.query(
        `
        INSERT INTO complaints (
          reporter_user_id, category, title, description, severity, status, location, address
        ) VALUES (
          $1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326), $9
        )
        RETURNING id;
        `,
        [c.reporter_user_id, c.category, c.title, c.description, c.severity, c.status, c.lng, c.lat, c.address],
      );

      const compId = compRes.rows[0].id;

      // Status history trail
      await client.query(
        `
        INSERT INTO status_history (complaint_id, from_status, to_status, actor_user_id, note)
        VALUES
        ($1, NULL, 'SUBMITTED', $2, 'Initial citizen submission'),
        ($1, 'SUBMITTED', $3, 'system-admin-001', 'Processed and updated to current state');
        `,
        [compId, c.reporter_user_id, c.status],
      );
    }

    await client.query('COMMIT');
    logger.log('Successfully seeded complaints and history trails!');
  } catch (err: any) {
    await client.query('ROLLBACK');
    logger.error(`Seed failed: ${err.message}`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
