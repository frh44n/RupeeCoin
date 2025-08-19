-- Create boosters table for temporary power-ups
CREATE TABLE IF NOT EXISTS boosters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  booster_type VARCHAR(50) NOT NULL, -- 'tap_multiplier', 'energy_refill', 'auto_tap_duration'
  effect_value INTEGER NOT NULL, -- multiplier or duration in seconds
  duration_seconds INTEGER DEFAULT 0, -- 0 for instant effects
  cost BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default boosters
INSERT INTO boosters (name, description, booster_type, effect_value, duration_seconds, cost) VALUES
('2x Tap Power', 'Double your tap earnings for 10 minutes', 'tap_multiplier', 2, 600, 1000),
('5x Tap Power', 'Multiply your tap earnings by 5 for 5 minutes', 'tap_multiplier', 5, 300, 5000),
('Energy Refill', 'Instantly refill your energy to maximum', 'energy_refill', 100, 0, 500),
('Auto Tap 1min', 'Automatically tap for 1 minute', 'auto_tap_duration', 1, 60, 2000);
