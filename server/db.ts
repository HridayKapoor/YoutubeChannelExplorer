import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Build Supabase connection string
const password = "m2aJGRPUwp63URwO";
const connectionString = `postgresql://postgres.yflxemvirfhjuvlqmqfr:${password}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

let pool: Pool | undefined;
let db: any;

try {
  // Configure PostgreSQL connection with proper SSL settings
  pool = new Pool({ 
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
    console.error('Unexpected database error:', err);
  });

  // Test the connection
  pool.connect((err, client, done) => {
    if (err) {
      console.error('Database connection error:', err.message);
    } else {
      console.log('Database connection successful');
      done();
    }
  });

  db = drizzle(pool, { schema });
} catch (error) {
  console.error('Failed to initialize database connection:', error);
}

export { pool, db };