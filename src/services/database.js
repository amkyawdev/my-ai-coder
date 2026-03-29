// Database Service - Neon PostgreSQL
// Uses @neondatabase/serverless for Cloudflare Workers

let sql = null;

export function getDatabase(env) {
  if (sql) return sql;

  // Create database connection from environment
  const connectionString = env.DATABASE_URL || env.NEON_DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL not configured');
  }

  // Using @neondatabase/serverless for Cloudflare Workers
  const { neon } = require('@neondatabase/serverless');
  sql = neon(connectionString);

  return sql;
}

// Initialize database schema
export async function initializeDatabase(env) {
  const db = getDatabase(env);
  
  // Create users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create saved_codes table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS saved_codes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(500) NOT NULL,
      code TEXT NOT NULL,
      language VARCHAR(50) DEFAULT 'javascript',
      framework VARCHAR(50) DEFAULT '',
      prompt TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database initialized successfully');
}