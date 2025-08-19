-- Create daily rewards table to track login streaks
CREATE TABLE IF NOT EXISTS daily_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  last_claim_date DATE,
  current_streak INTEGER DEFAULT 0,
  total_days_claimed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_daily_rewards_user_id ON daily_rewards(user_id);
