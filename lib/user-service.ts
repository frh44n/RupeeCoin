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

export async function updateUserTap(userId: string, coinsEarned: number): Promise<UserData | null> {
  console.log("[v0] updateUserTap called with:", { userId, coinsEarned })

  try {
    const supabase = createClient()
    console.log("[v0] Supabase client created")

    // Get current user data
    console.log("[v0] Fetching user data...")
    const { data: currentUser, error: fetchError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (fetchError) {
      console.error("[v0] Error fetching user:", fetchError)
      return null
    }

    if (!currentUser) {
      console.error("[v0] No user found with id:", userId)
      return null
    }

    console.log("[v0] Current user data:", currentUser)

    // Check if user has enough energy
    if (currentUser.energy < 1) {
      console.log("[v0] User has insufficient energy:", currentUser.energy)
      return currentUser
    }

    // Update user with new values
    console.log("[v0] Updating user...")
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        coins: currentUser.coins + coinsEarned,
        total_taps: currentUser.total_taps + 1,
        energy: Math.max(0, currentUser.energy - 1),
        last_energy_update: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Error updating user:", updateError)
      return null
    }

    console.log("[v0] User updated successfully:", updatedUser)

    // Record tap session (non-blocking)
    supabase
      .from("tap_sessions")
      .insert({
        user_id: userId,
        taps_count: 1,
        coins_earned: coinsEarned,
        energy_used: 1,
        session_start: new Date().toISOString(),
        session_end: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) {
          console.error("[v0] Error recording tap session:", error)
        } else {
          console.log("[v0] Tap session recorded successfully")
        }
      })

    return updatedUser
  } catch (error) {
    console.error("[v0] Error in updateUserTap:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return null
  }
}
