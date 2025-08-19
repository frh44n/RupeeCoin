-- Create RPC function for atomic user tap updates
CREATE OR REPLACE FUNCTION update_user_tap(
  user_id UUID,
  coins_to_add BIGINT,
  taps_to_add BIGINT,
  energy_to_subtract INTEGER
)
RETURNS TABLE(
  id UUID,
  telegram_id BIGINT,
  username VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  coins BIGINT,
  total_taps BIGINT,
  energy INTEGER,
  max_energy INTEGER,
  energy_regen_rate INTEGER,
  coins_per_tap INTEGER,
  last_energy_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users 
  SET 
    coins = coins + coins_to_add,
    total_taps = total_taps + taps_to_add,
    energy = GREATEST(0, energy - energy_to_subtract),
    last_energy_update = NOW(),
    updated_at = NOW()
  WHERE users.id = user_id;
  
  RETURN QUERY
  SELECT * FROM users WHERE users.id = user_id;
END;
$$;
