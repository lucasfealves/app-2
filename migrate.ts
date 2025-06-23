
// Import both drivers
import { Pool as PgPool } from 'pg';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import crypto from "crypto";
import bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// Use appropriate driver based on environment
let pool, db;

if (!process.env.REPL_ID && process.env.NODE_ENV === 'development') {
  console.log('Using native PostgreSQL driver for migration');
  pool = new PgPool({ connectionString: process.env.DATABASE_URL });
  db = drizzlePg(pool);
} else {
  console.log('Using Neon serverless driver for migration');
  neonConfig.webSocketConstructor = ws;
  neonConfig.useSecureWebSocket = true;
  neonConfig.pipelineConnect = false;
  
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon({ client: pool });
}

async function main() {
  console.log("Running migrations...");

  try {
    // Drop all tables to start fresh
    await pool.query(`
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS order_items CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS cart_items CASCADE;
      DROP TABLE IF EXISTS carts CASCADE;
      DROP TABLE IF EXISTS product_variants CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS brands CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS sessions CASCADE;
    `);

    // Create sessions table (required for Replit Auth)
    await pool.query(`
      CREATE TABLE sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX "IDX_session_expire" ON sessions (expire);
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        profile_image_url TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        is_blocked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create categories table
    await pool.query(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create brands table
    await pool.query(`
      CREATE TABLE brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create products table
    await pool.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        short_description TEXT,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        stock INTEGER DEFAULT 0,
        category_id INTEGER REFERENCES categories(id),
        brand_id INTEGER REFERENCES brands(id),
        image_url TEXT,
        images TEXT[],
        specifications JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create product_variants table
    await pool.query(`
      CREATE TABLE product_variants (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) NOT NULL,
        name VARCHAR(255) NOT NULL,
        value VARCHAR(255) NOT NULL,
        price_modifier DECIMAL(10,2) DEFAULT 0,
        stock_modifier INTEGER DEFAULT 0
      );
    `);

    // Create carts table
    await pool.query(`
      CREATE TABLE carts (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create cart_items table
    await pool.query(`
      CREATE TABLE cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER REFERENCES carts(id) NOT NULL,
        product_id INTEGER REFERENCES products(id) NOT NULL,
        quantity INTEGER NOT NULL,
        variant_id INTEGER REFERENCES product_variants(id),
        added_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create orders table
    await pool.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        order_number VARCHAR(100) NOT NULL UNIQUE,
        status VARCHAR(50) DEFAULT 'pending',
        total_amount DECIMAL(10,2) NOT NULL,
        shipping_address JSONB,
        payment_method VARCHAR(50),
        payment_status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create order_items table
    await pool.query(`
      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) NOT NULL,
        product_id INTEGER REFERENCES products(id) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        variant_id INTEGER REFERENCES product_variants(id)
      );
    `);

    // Create payments table
    await pool.query(`
      CREATE TABLE payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        method VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create default admin user
    const adminEmail = 'admin@example.com';
    const adminId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await pool.query(`
      INSERT INTO users (id, email, password, first_name, last_name, is_admin) 
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [adminId, adminEmail, hashedPassword, 'Admin', 'User', true]);

    // Insert sample categories
    await pool.query(`
      INSERT INTO categories (name, slug) VALUES
      ('Eletrônicos', 'eletronicos'),
      ('Roupas', 'roupas'),
      ('Casa e Jardim', 'casa-jardim'),
      ('Esportes', 'esportes'),
      ('Livros', 'livros');
    `);

    // Insert sample brands
    await pool.query(`
      INSERT INTO brands (name, slug) VALUES
      ('Samsung', 'samsung'),
      ('Apple', 'apple'),
      ('Nike', 'nike'),
      ('Adidas', 'adidas'),
      ('IKEA', 'ikea');
    `);

    // Insert sample products
    await pool.query(`
      INSERT INTO products (name, slug, description, short_description, price, original_price, stock, category_id, brand_id, image_url, is_active) VALUES
      ('Smartphone Galaxy S24', 'smartphone-galaxy-s24', 'Smartphone Samsung Galaxy S24 com 256GB', 'Último lançamento da Samsung', 2999.99, 3299.99, 50, 1, 1, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', true),
      ('iPhone 15 Pro', 'iphone-15-pro', 'iPhone 15 Pro com 128GB', 'Novo iPhone da Apple', 4999.99, 5499.99, 30, 1, 2, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', true),
      ('Tênis Air Max', 'tenis-air-max', 'Tênis Nike Air Max para corrida', 'Conforto e performance', 299.99, 399.99, 100, 4, 3, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', true),
      ('Camiseta Adidas', 'camiseta-adidas', 'Camiseta esportiva Adidas', 'Tecido respirável', 89.99, 119.99, 200, 2, 4, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', true),
      ('Mesa de Escritório', 'mesa-escritorio', 'Mesa de escritório IKEA', 'Design moderno e funcional', 399.99, 499.99, 25, 3, 5, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', true);
    `);

    console.log('✅ Default admin user created (admin@example.com / admin123)');
    console.log('✅ Sample data inserted');
    console.log('✅ All tables created successfully!');

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
