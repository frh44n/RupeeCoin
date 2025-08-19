import { createClient } from "@/lib/supabase/server"

export interface LeaderboardEntry {
  id: string
  telegram_id: number
  username?: string
  first_name: string
  last_name?: string
  coins: number
  total_taps: number
  rank: number
}

export interface UserRank {
  rank: number
  total_players: number
}

export async function getGlobalLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, telegram_id, username, first_name, last_name, coins, total_taps")
      .order("coins", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching leaderboard:", error)
      return []
    }

    // Add rank to each entry
    return (data || []).map((user, index) => ({
      ...user,
      rank: index + 1,
    }))
  } catch (error) {
    console.error("Error in getGlobalLeaderboard:", error)
    return []
  }
}

export async function getUserRank(userId: string): Promise<UserRank | null> {
  const supabase = createClient()

  try {
    // Get user's current coins
    const { data: user, error: userError } = await supabase.from("users").select("coins").eq("id", userId).single()

    if (userError || !user) {
      return null
    }

    // Count users with more coins
    const { count: higherRanked, error: countError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gt("coins", user.coins)

    if (countError) {
      console.error("Error getting user rank:", countError)
      return null
    }

    // Get total player count
    const { count: totalPlayers, error: totalError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    if (totalError) {
      console.error("Error getting total players:", totalError)
      return null
    }

    return {
      rank: (higherRanked || 0) + 1,
      total_players: totalPlayers || 0,
    }
  } catch (error) {
    console.error("Error in getUserRank:", error)
    return null
  }
}

export async function getTopTappers(limit = 20): Promise<LeaderboardEntry[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, telegram_id, username, first_name, last_name, coins, total_taps")
      .order("total_taps", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching top tappers:", error)
      return []
    }

    return (data || []).map((user, index) => ({
      ...user,
      rank: index + 1,
    }))
  } catch (error) {
    console.error("Error in getTopTappers:", error)
    return []
  }
}

export async function getLeaderboardStats(): Promise<{
  totalPlayers: number
  totalCoins: number
  totalTaps: number
}> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("users").select("coins, total_taps")

    if (error) {
      console.error("Error fetching leaderboard stats:", error)
      return { totalPlayers: 0, totalCoins: 0, totalTaps: 0 }
    }

    const totalPlayers = data?.length || 0
    const totalCoins = data?.reduce((sum, user) => sum + user.coins, 0) || 0
    const totalTaps = data?.reduce((sum, user) => sum + user.total_taps, 0) || 0

    return { totalPlayers, totalCoins, totalTaps }
  } catch (error) {
    console.error("Error in getLeaderboardStats:", error)
    return { totalPlayers: 0, totalCoins: 0, totalTaps: 0 }
  }
}
