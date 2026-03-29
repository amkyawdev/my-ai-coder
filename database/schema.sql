-- Database Schema for AI Coder
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved codes table
CREATE TABLE IF NOT EXISTS saved_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  code TEXT NOT NULL,
  language VARCHAR(50) DEFAULT 'javascript',
  framework VARCHAR(50) DEFAULT '',
  prompt TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_codes_user_id ON saved_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);