import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Hardcode the Supabase connection string directly
const connectionString = "postgresql://postgres:m2aJGRPUwp63URwO@db.yflxemvirfhjuvlqmqfr.supabase.co:6543/postgres";

// Configure PostgreSQL connection with SSL enabled
export const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Log connection status
pool.on('connect', () => {
  console.log('Connected to Supabase PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const db = drizzle(pool, { schema });