import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

async function main() {
  console.log("Running tenant migration...");

  try {
    // Create tenants table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        domain VARCHAR(255) UNIQUE,
        description TEXT,
        logo_url TEXT,
        contact_email TEXT,
        contact_phone VARCHAR(20),
        address JSONB,
        settings JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        subscription_plan VARCHAR(50) DEFAULT 'basic',
        subscription_status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Add tenant_id column to users table if it doesn't exist
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
    `);

    // Insert sample tenants if table is empty
    const existingTenants = await pool.query('SELECT COUNT(*) FROM tenants');
    if (existingTenants.rows[0].count === '0') {
      await pool.query(`
        INSERT INTO tenants (name, slug, description, contact_email, is_active) VALUES
        ('Loja Principal', 'loja-principal', 'Loja principal do sistema', 'admin@loja.com', true),
        ('Loja Parceira 1', 'loja-parceira-1', 'Primeira loja parceira', 'parceiro1@loja.com', true),
        ('Loja Parceira 2', 'loja-parceira-2', 'Segunda loja parceira', 'parceiro2@loja.com', false);
      `);
    }

    console.log('✅ Tenants table created successfully!');
    console.log('✅ tenant_id column added to users table!');
    console.log('✅ Sample tenants inserted!');

  } catch (error) {
    console.error("❌ Tenant migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();