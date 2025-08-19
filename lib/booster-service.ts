import { createClient } from "@/lib/supabase/server"

export interface Booster {
  id: string
  name: string
  description: string
  booster_type: string
  effect_value: number
  duration_seconds: number
  cost: number
}

export interface ActiveBooster {
  id: string
  user_id: string
  booster_id: string
  activated_at: string
  expires_at: string
  is_active: boolean
  booster: Booster
}

export async function getAvailableBoosters(): Promise<Booster[]> {
  const supabase = createClient()

  const { data, error } = await supabase.from("boosters").select("*").order("cost")

  if (error) {
    console.error("Error fetching boosters:", error)
    return []
  }

  return data || []
}

export async function getUserActiveBoosters(userId: string): Promise<ActiveBooster[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("active_boosters")
    .select(`
      *,
      booster:boosters(*)
    `)
    .eq("user_id", userId)
    .eq("is_active", true)
    .gt("expires_at", new Date().toISOString())

  if (error) {
    console.error("Error fetching active boosters:", error)
    return []
  }

  return data || []
}

export async function purchaseBooster(
  userId: string,
  boosterId: string,
): Promise<{ success: boolean; error?: string; user?: any }> {
  const supabase = createClient()

  try {
    // Get current user data
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError || !user) {
      return { success: false, error: "User not found" }
    }

    // Get booster details
    const { data: booster, error: boosterError } = await supabase
      .from("boosters")
      .select("*")
      .eq("id", boosterId)
      .single()

    if (boosterError || !booster) {
      return { success: false, error: "Booster not found" }
    }

    if (user.coins < booster.cost) {
      return { success: false, error: "Insufficient coins" }
    }

    // Calculate expiry time
    const now = new Date()
    const expiresAt = new Date(now.getTime() + booster.duration_seconds * 1000)

    // Start transaction
    const { error: updateError } = await supabase
      .from("users")
      .update({ coins: user.coins - booster.cost })
      .eq("id", userId)

    if (updateError) {
      return { success: false, error: "Failed to deduct coins" }
    }

    // Add active booster
    const { error: boosterError2 } = await supabase.from("active_boosters").insert({
      user_id: userId,
      booster_id: boosterId,
      expires_at: expiresAt.toISOString(),
    })

    if (boosterError2) {
      console.error("Error adding active booster:", boosterError2)
      return { success: false, error: "Failed to activate booster" }
    }

    // Handle instant effects (like energy refill)
    if (booster.booster_type === "energy_refill") {
      await supabase.from("users").update({ energy: user.max_energy }).eq("id", userId)
    }

    // Get updated user data
    const { data: updatedUser } = await supabase.from("users").select("*").eq("id", userId).single()

    return { success: true, user: updatedUser }
  } catch (error) {
    console.error("Error purchasing booster:", error)
    return { success: false, error: "Purchase failed" }
  }
}
