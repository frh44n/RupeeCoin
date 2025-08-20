import { createClient } from "@/lib/supabase/server"

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface UserData {
  id: string
  telegram_id: number
  username?: string
  first_name: string
  last_name?: string
  coins: number
  total_taps: number
  energy: number
  max_energy: number
  energy_regen_rate: number
  coins_per_tap: number
  last_energy_update: string
  created_at: string
  updated_at: string
}

export async function getOrCreateUser(telegramUser: TelegramUser): Promise<UserData | null> {
  const supabase = createClient()

  try {
    // First, try to get existing user
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", telegramUser.id)
      .single()

    if (existingUser && !fetchError) {
      // Update energy based on time passed
      const updatedUser = await updateUserEnergy(existingUser)
      return updatedUser
    }

    // Create new user if doesn't exist
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        telegram_id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        coins: 0,
        total_taps: 0,
        energy: 1000,
        max_energy: 1000,
        energy_regen_rate: 1,
        coins_per_tap: 1,
        last_energy_update: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating user:", createError)
      return null
    }

    // Initialize daily rewards for new user
    await supabase.from("daily_rewards").insert({
      user_id: newUser.id,
      current_streak: 0,
      total_days_claimed: 0,
    })

    return newUser
  } catch (error) {
    console.error("Error in getOrCreateUser:", error)
    return null
  }
}

export async function updateUserEnergy(user: UserData): Promise<UserData> {
  const supabase = createClient()

  const now = new Date()
  const lastUpdate = new Date(user.last_energy_update)
  const secondsPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000)

  // Calculate energy regenerated
  const energyToAdd = secondsPassed * user.energy_regen_rate
  const newEnergy = Math.min(user.energy + energyToAdd, user.max_energy)

  if (newEnergy !== user.energy) {
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        energy: newEnergy,
        last_energy_update: now.toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating user energy:", error)
      return user
    }

    return updatedUser
  }

  return user
}

export async function updateUserTap(
  userId: string,
  coinsEarned: number,
  taps: number,
): Promise<UserData | null> {
  try {
    const supabase = createClient()

    const { data: currentUser, error: fetchError } = await supabase
      .from("users")
      .select("coins, total_taps, energy")
      .eq("id", userId)
      .single()

    if (fetchError) {
      console.error("Error fetching user for tap update:", fetchError)
      return null
    }

    if (currentUser.energy < taps) {
      // Not enough energy for all taps, but we process what we can
      // This case should ideally be prevented by client-side checks
      console.warn("User has insufficient energy for all taps in batch.")
      taps = currentUser.energy
      // Recalculate coins earned based on actual taps
      coinsEarned = taps * (coinsEarned / taps) // Assumes coinsEarned is a multiple of taps
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        coins: currentUser.coins + coinsEarned,
        total_taps: currentUser.total_taps + taps,
        energy: currentUser.energy - taps,
        last_energy_update: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating user after tap:", updateError)
      return null
    }

    // Record tap session (non-blocking)
    supabase
      .from("tap_sessions")
      .insert({
        user_id: userId,
        taps_count: taps,
        coins_earned: coinsEarned,
        energy_used: taps,
      })
      .then(({ error }) => {
        if (error) console.error("Error recording tap session:", error)
      })

    return updatedUser
  } catch (error) {
    console.error("Error in updateUserTap:", error)
    return null
  }
}
