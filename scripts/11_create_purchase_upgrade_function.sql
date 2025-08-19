-- Create a function to handle upgrade purchases atomically
CREATE OR REPLACE FUNCTION purchase_upgrade(
  p_user_id UUID,
  p_upgrade_id UUID,
  p_cost BIGINT,
  p_current_level INTEGER
) RETURNS VOID AS $$
DECLARE
  upgrade_record RECORD;
  new_level INTEGER;
  effect_increase INTEGER;
BEGIN
  -- Get upgrade details
  SELECT * INTO upgrade_record FROM upgrades WHERE id = p_upgrade_id;
  
  new_level := p_current_level + 1;
  effect_increase := upgrade_record.base_effect;
  
  -- Deduct coins from user
  UPDATE users SET coins = coins - p_cost WHERE id = p_user_id;
  
  -- Update or insert user upgrade
  INSERT INTO user_upgrades (user_id, upgrade_id, current_level, total_spent)
  VALUES (p_user_id, p_upgrade_id, new_level, p_cost)
  ON CONFLICT (user_id, upgrade_id)
  DO UPDATE SET 
    current_level = new_level,
    total_spent = user_upgrades.total_spent + p_cost,
    updated_at = NOW();
  
  -- Apply upgrade effects to user
  IF upgrade_record.upgrade_type = 'coins_per_tap' THEN
    UPDATE users SET coins_per_tap = coins_per_tap + effect_increase WHERE id = p_user_id;
  ELSIF upgrade_record.upgrade_type = 'max_energy' THEN
    UPDATE users SET max_energy = max_energy + effect_increase WHERE id = p_user_id;
  ELSIF upgrade_record.upgrade_type = 'energy_regen' THEN
    UPDATE users SET energy_regen_rate = energy_regen_rate + effect_increase WHERE id = p_user_id;
  END IF;
  
END;
$$ LANGUAGE plpgsql;
