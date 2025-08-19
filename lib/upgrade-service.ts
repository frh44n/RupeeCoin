import { createClient } from "@/lib/supabase/client"

export interface Upgrade {
  id: string
  name: string
  description: string
  upgrade_type: string
  base_cost: number
  cost_multiplier: number
  base_effect: number
  max_level: number
}

export interface UserUpgrade {
  id: string
  user_id: string
  upgrade_id: string
  current_level: number
  total_spent: number
  upgrade: Upgrade
}

export async function getUserUpgrades(userId: string): Promise<UserUpgrade[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("user_upgrades")
    .select(`
      *,
      upgrade:upgrades(*)
    `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching user upgrades:", error)
    return []
  }

  return data || []
}

export async function getAvailableUpgrades(): Promise<Upgrade[]> {
  const supabase = createClient()

  const { data, error } = await supabase.from("upgrades").select("*").order("base_cost")

  if (error) {
    console.error("Error fetching upgrades:", error)
    return []
  }

  return data || []
}

export function calculateUpgradeCost(upgrade: Upgrade, currentLevel: number): number {
  return Math.floor(upgrade.base_cost * Math.pow(upgrade.cost_multiplier, currentLevel))
}

export function calculateUpgradeEffect(upgrade: Upgrade, level: number): number {
  return upgrade.base_effect * level
}

export async function purchaseUpgrade(
  userId: string,
  upgradeId: string,
): Promise<{ success: boolean; error?: string; user?: any }> {
  const supabase = createClient()

  try {
    // Get current user data
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError || !user) {
      return { success: false, error: "User not found" }
    }

    // Get upgrade details
    const { data: upgrade, error: upgradeError } = await supabase
      .from("upgrades")
      .select("*")
      .eq("id", upgradeId)
      .single()

    if (upgradeError || !upgrade) {
      return { success: false, error: "Upgrade not found" }
    }

    // Get current user upgrade level
    const { data: userUpgrade } = await supabase
      .from("user_upgrades")
      .select("*")
      .eq("user_id", userId)
      .eq("upgrade_id", upgradeId)
      .single()

    const currentLevel = userUpgrade?.current_level || 0

    if (currentLevel >= upgrade.max_level) {
      return { success: false, error: "Upgrade already at max level" }
    }

    const cost = calculateUpgradeCost(upgrade, currentLevel)

    if (user.coins < cost) {
      return { success: false, error: "Insufficient coins" }
    }

    // Start transaction
    const { error: transactionError } = await supabase.rpc("purchase_upgrade", {
      p_user_id: userId,
      p_upgrade_id: upgradeId,
      p_cost: cost,
      p_current_level: currentLevel,
    })

    if (transactionError) {
      console.error("Transaction error:", transactionError)
      return { success: false, error: "Purchase failed" }
    }

    // Get updated user data
    const { data: updatedUser } = await supabase.from("users").select("*").eq("id", userId).single()

    return { success: true, user: updatedUser }
  } catch (error) {
    console.error("Error purchasing upgrade:", error)
    return { success: false, error: "Purchase failed" }
  }
}
