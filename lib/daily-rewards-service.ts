import { createClient } from "@/lib/supabase/server"

export interface DailyReward {
  id: string
  user_id: string
  last_claim_date: string | null
  current_streak: number
  total_days_claimed: number
}

export interface DailyRewardInfo {
  canClaim: boolean
  currentStreak: number
  nextReward: number
  streakBroken: boolean
  daysUntilNextClaim: number
}

const DAILY_REWARDS = [
  { day: 1, coins: 100, bonus: "Welcome bonus!" },
  { day: 2, coins: 150, bonus: "Keep it up!" },
  { day: 3, coins: 200, bonus: "Great streak!" },
  { day: 4, coins: 300, bonus: "Amazing!" },
  { day: 5, coins: 500, bonus: "Fantastic!" },
  { day: 6, coins: 750, bonus: "Incredible!" },
  { day: 7, coins: 1000, bonus: "Weekly champion!" },
]

export function getDailyRewardAmount(streak: number): { coins: number; bonus: string } {
  const rewardIndex = Math.min(streak - 1, DAILY_REWARDS.length - 1)
  const baseReward = DAILY_REWARDS[rewardIndex]

  // For streaks beyond 7 days, give the 7-day reward plus bonus
  if (streak > 7) {
    const weekMultiplier = Math.floor((streak - 1) / 7)
    return {
      coins: baseReward.coins + weekMultiplier * 200,
      bonus: `${weekMultiplier + 1} week streak!`,
    }
  }

  return baseReward
}

export async function getDailyRewardStatus(userId: string): Promise<DailyRewardInfo> {
  const supabase = createClient()

  try {
    const { data: reward, error } = await supabase.from("daily_rewards").select("*").eq("user_id", userId).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching daily reward:", error)
      return {
        canClaim: true,
        currentStreak: 0,
        nextReward: getDailyRewardAmount(1).coins,
        streakBroken: false,
        daysUntilNextClaim: 0,
      }
    }

    if (!reward) {
      // New user, can claim first reward
      return {
        canClaim: true,
        currentStreak: 0,
        nextReward: getDailyRewardAmount(1).coins,
        streakBroken: false,
        daysUntilNextClaim: 0,
      }
    }

    const now = new Date()
    const today = now.toISOString().split("T")[0]
    const lastClaimDate = reward.last_claim_date

    if (!lastClaimDate) {
      // Never claimed before
      return {
        canClaim: true,
        currentStreak: reward.current_streak,
        nextReward: getDailyRewardAmount(reward.current_streak + 1).coins,
        streakBroken: false,
        daysUntilNextClaim: 0,
      }
    }

    const lastClaim = new Date(lastClaimDate)
    const daysDifference = Math.floor((now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDifference === 0) {
      // Already claimed today
      return {
        canClaim: false,
        currentStreak: reward.current_streak,
        nextReward: getDailyRewardAmount(reward.current_streak + 1).coins,
        streakBroken: false,
        daysUntilNextClaim: 1,
      }
    } else if (daysDifference === 1) {
      // Can claim today, streak continues
      return {
        canClaim: true,
        currentStreak: reward.current_streak,
        nextReward: getDailyRewardAmount(reward.current_streak + 1).coins,
        streakBroken: false,
        daysUntilNextClaim: 0,
      }
    } else {
      // Streak broken, reset to day 1
      return {
        canClaim: true,
        currentStreak: 0,
        nextReward: getDailyRewardAmount(1).coins,
        streakBroken: true,
        daysUntilNextClaim: 0,
      }
    }
  } catch (error) {
    console.error("Error in getDailyRewardStatus:", error)
    return {
      canClaim: false,
      currentStreak: 0,
      nextReward: 0,
      streakBroken: false,
      daysUntilNextClaim: 1,
    }
  }
}

export async function claimDailyReward(
  userId: string,
): Promise<{ success: boolean; reward?: { coins: number; bonus: string; newStreak: number }; error?: string }> {
  const supabase = createClient()

  try {
    const rewardStatus = await getDailyRewardStatus(userId)

    if (!rewardStatus.canClaim) {
      return { success: false, error: "Daily reward already claimed or not available" }
    }

    const newStreak = rewardStatus.streakBroken ? 1 : rewardStatus.currentStreak + 1
    const rewardAmount = getDailyRewardAmount(newStreak)
    const today = new Date().toISOString().split("T")[0]

    const { data: currentReward } = await supabase
      .from("daily_rewards")
      .select("total_days_claimed")
      .eq("user_id", userId)
      .single()

    const { error: rewardError } = await supabase.from("daily_rewards").upsert(
      {
        user_id: userId,
        last_claim_date: today,
        current_streak: newStreak,
        total_days_claimed: (currentReward?.total_days_claimed || 0) + 1,
      },
      {
        onConflict: "user_id",
      },
    )

    if (rewardError) {
      console.error("Error updating daily reward:", rewardError)
      return { success: false, error: "Failed to update reward record" }
    }

    const { data: currentUser } = await supabase.from("users").select("coins").eq("id", userId).single()

    if (!currentUser) {
      return { success: false, error: "User not found" }
    }

    // Add coins to user
    const { error: userError } = await supabase
      .from("users")
      .update({
        coins: currentUser.coins + rewardAmount.coins,
      })
      .eq("id", userId)

    if (userError) {
      console.error("Error updating user coins:", userError)
      return { success: false, error: "Failed to add coins" }
    }

    return {
      success: true,
      reward: {
        coins: rewardAmount.coins,
        bonus: rewardAmount.bonus,
        newStreak: newStreak,
      },
    }
  } catch (error) {
    console.error("Error claiming daily reward:", error)
    return { success: false, error: "Failed to claim reward" }
  }
}

export function getUpcomingRewards(currentStreak: number): Array<{ day: number; coins: number; bonus: string }> {
  const upcoming = []
  for (let i = 1; i <= 7; i++) {
    const reward = getDailyRewardAmount(currentStreak + i)
    upcoming.push({
      day: currentStreak + i,
      coins: reward.coins,
      bonus: reward.bonus,
    })
  }
  return upcoming
}
