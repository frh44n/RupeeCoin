-- Create upgrades table to store available upgrades
CREATE TABLE IF NOT EXISTS upgrades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  upgrade_type VARCHAR(50) NOT NULL, -- 'coins_per_tap', 'max_energy', 'energy_regen', 'auto_tap'
  base_cost BIGINT NOT NULL,
  cost_multiplier DECIMAL(3,2) DEFAULT 1.5, -- cost increases by this factor each level
  base_effect INTEGER NOT NULL, -- base improvement amount
  max_level INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default upgrades
INSERT INTO upgrades (name, description, upgrade_type, base_cost, base_effect, max_level) VALUES
('Tap Power', 'Increase coins earned per tap', 'coins_per_tap', 100, 1, 50),
('Energy Boost', 'Increase maximum energy capacity', 'max_energy', 500, 100, 25),
('Energy Regen', 'Increase energy regeneration rate', 'energy_regen', 1000, 1, 20),
('Auto Tapper', 'Automatically tap for you', 'auto_tap', 10000, 1, 10);
