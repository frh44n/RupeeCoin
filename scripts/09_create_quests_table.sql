-- Create quests table for mini games and challenges
CREATE TABLE IF NOT EXISTS quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quest_type VARCHAR(50) NOT NULL, -- 'daily_taps', 'total_taps', 'referrals', 'login_streak'
  target_value INTEGER NOT NULL, -- target to complete quest
  reward_coins BIGINT NOT NULL,
  is_daily BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default quests
INSERT INTO quests (name, description, quest_type, target_value, reward_coins, is_daily) VALUES
('Daily Tapper', 'Tap 1000 times today', 'daily_taps', 1000, 500, true),
('Tap Master', 'Reach 10000 total taps', 'total_taps', 10000, 2000, false),
('Friend Inviter', 'Invite 3 friends', 'referrals', 3, 1500, false),
('Streak Master', 'Login for 7 consecutive days', 'login_streak', 7, 3000, false);
