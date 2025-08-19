-- Create users table to store player information
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  coins BIGINT DEFAULT 0,
  total_taps BIGINT DEFAULT 0,
  energy INTEGER DEFAULT 1000,
  max_energy INTEGER DEFAULT 1000,
  energy_regen_rate INTEGER DEFAULT 1, -- energy per second
  coins_per_tap INTEGER DEFAULT 1,
  last_energy_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster telegram_id lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- Create index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_users_coins ON users(coins DESC);
