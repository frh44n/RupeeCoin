-- Create tap sessions table to track tapping activity
CREATE TABLE IF NOT EXISTS tap_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  taps_count INTEGER NOT NULL,
  coins_earned BIGINT NOT NULL,
  energy_used INTEGER NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_tap_sessions_user_id ON tap_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tap_sessions_created_at ON tap_sessions(created_at);
