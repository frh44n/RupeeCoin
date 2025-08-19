-- Create active boosters table to track user's active boosters
CREATE TABLE IF NOT EXISTS active_boosters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booster_id UUID REFERENCES boosters(id) ON DELETE CASCADE,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_active_boosters_user_id ON active_boosters(user_id);
CREATE INDEX IF NOT EXISTS idx_active_boosters_expires_at ON active_boosters(expires_at);
CREATE INDEX IF NOT EXISTS idx_active_boosters_active ON active_boosters(is_active);
