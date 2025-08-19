-- Create user upgrades table to track user's upgrade levels
CREATE TABLE IF NOT EXISTS user_upgrades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  upgrade_id UUID REFERENCES upgrades(id) ON DELETE CASCADE,
  current_level INTEGER DEFAULT 0,
  total_spent BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, upgrade_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_upgrades_user_id ON user_upgrades(user_id);
CREATE INDEX IF NOT EXISTS idx_user_upgrades_upgrade_id ON user_upgrades(upgrade_id);
