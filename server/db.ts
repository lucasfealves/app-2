// Import both drivers
import { Pool as PgPool } from 'pg';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Initialize database connection based on environment
function initializeDatabase() {
  if (!process.env.REPL_ID && process.env.NODE_ENV === 'development') {
    // Local development - use native pg driver
    console.log('Using native PostgreSQL driver for local development');
    const pool = new PgPool({ 
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    return { pool, db: drizzlePg(pool, { schema }) };
  } else {
    // Replit/Production - use Neon serverless
    console.log('Using Neon serverless driver for production');
    neonConfig.webSocketConstructor = ws;
    neonConfig.useSecureWebSocket = true;
    neonConfig.pipelineConnect = false;

    const pool = new NeonPool({ 
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    return { pool, db: drizzleNeon({ client: pool, schema }) };
  }
}

const { pool, db } = initializeDatabase();
export { pool, db };