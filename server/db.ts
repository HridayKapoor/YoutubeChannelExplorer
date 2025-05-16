import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set. Using in-memory storage instead.');
}

let pool: Pool | undefined;
let db: any;

if (process.env.DATABASE_URL) {
  try {
    // Configure PostgreSQL connection with proper SSL settings
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Log connection status
    pool.on('connect', () => {
      console.log('Connected to PostgreSQL database');
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
}

export { pool, db };