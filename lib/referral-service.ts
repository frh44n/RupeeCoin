import { createClient } from "@/lib/supabase/server"

export interface ReferralData {
  id: string
  referrer_id: string
  referred_id: string
  referral_code: string
  bonus_coins: number
  created_at: string
  referrer: {
    first_name: string
    username?: string
  }
  referred: {
    first_name: string
    username?: string
  }
}

export interface ReferralStats {
  totalReferrals: number
  totalBonusEarned: number
  referralCode: string
  referredUsers: Array<{
    id: string
    first_name: string
    username?: string
    bonus_coins: number
    created_at: string
  }>
}

const REFERRAL_BONUS = 1000 // Coins given to both referrer and referred user

export function generateReferralCode(telegramId: number): string {
  // Generate a unique referral code based on telegram ID
  const base = telegramId.toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `RC${base}${random}`
}

export async function getUserReferralStats(userId: string): Promise<ReferralStats> {
  const supabase = createClient()

  try {
    // Get user's telegram ID for referral code
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("telegram_id")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return {
        totalReferrals: 0,
        totalBonusEarned: 0,
        referralCode: "",
        referredUsers: [],
      }
    }

    const referralCode = generateReferralCode(user.telegram_id)

    // Get referral statistics
    const { data: referrals, error: referralsError } = await supabase
      .from("referrals")
      .select(`
        *,
        referred:users!referrals_referred_id_fkey(first_name, username)
      `)
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false })

    if (referralsError) {
      console.error("Error fetching referrals:", referralsError)
      return {
        totalReferrals: 0,
        totalBonusEarned: 0,
        referralCode,
        referredUsers: [],
      }
    }

    const totalReferrals = referrals?.length || 0
    const totalBonusEarned = (referrals?.length || 0) * REFERRAL_BONUS
    const referredUsers =
      referrals?.map((ref) => ({
        id: ref.referred_id,
        first_name: ref.referred.first_name,
        username: ref.referred.username,
        bonus_coins: ref.bonus_coins,
        created_at: ref.created_at,
      })) || []

    return {
      totalReferrals,
      totalBonusEarned,
      referralCode,
      referredUsers,
    }
  } catch (error) {
    console.error("Error in getUserReferralStats:", error)
    return {
      totalReferrals: 0,
      totalBonusEarned: 0,
      referralCode: "",
      referredUsers: [],
    }
  }
}

export async function processReferral(
  referredUserId: string,
  referralCode: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    // Find referrer by referral code pattern
    const codeWithoutPrefix = referralCode.replace("RC", "")
    const telegramIdBase36 = codeWithoutPrefix.substring(0, codeWithoutPrefix.length - 4)

    // Convert back to decimal
    let telegramId: number
    try {
      telegramId = Number.parseInt(telegramIdBase36, 36)
    } catch {
      return { success: false, error: "Invalid referral code" }
    }

    // Find referrer user
    const { data: referrer, error: referrerError } = await supabase
      .from("users")
      .select("id")
      .eq("telegram_id", telegramId)
      .single()

    if (referrerError || !referrer) {
      return { success: false, error: "Referrer not found" }
    }

    // Check if user is trying to refer themselves
    if (referrer.id === referredUserId) {
      return { success: false, error: "Cannot refer yourself" }
    }

    // Check if user was already referred
    const { data: existingReferral } = await supabase
      .from("referrals")
      .select("id")
      .eq("referred_id", referredUserId)
      .single()

    if (existingReferral) {
      return { success: false, error: "User already referred" }
    }

    // Create referral record
    const { error: referralError } = await supabase.from("referrals").insert({
      referrer_id: referrer.id,
      referred_id: referredUserId,
      referral_code: referralCode,
      bonus_coins: REFERRAL_BONUS,
    })

    if (referralError) {
      console.error("Error creating referral:", referralError)
      return { success: false, error: "Failed to create referral" }
    }

    const { data: referrerUser } = await supabase.from("users").select("coins").eq("id", referrer.id).single()

    const { data: referredUser } = await supabase.from("users").select("coins").eq("id", referredUserId).single()

    if (!referrerUser || !referredUser) {
      return { success: false, error: "Users not found" }
    }

    // Give bonus coins to both users
    const { error: referrerUpdateError } = await supabase
      .from("users")
      .update({ coins: referrerUser.coins + REFERRAL_BONUS })
      .eq("id", referrer.id)

    const { error: referredUpdateError } = await supabase
      .from("users")
      .update({ coins: referredUser.coins + REFERRAL_BONUS })
      .eq("id", referredUserId)

    if (referrerUpdateError || referredUpdateError) {
      console.error("Error updating user coins:", { referrerUpdateError, referredUpdateError })
      return { success: false, error: "Failed to award bonus coins" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error processing referral:", error)
    return { success: false, error: "Failed to process referral" }
  }
}

export async function validateReferralCode(referralCode: string): Promise<{ valid: boolean; referrerName?: string }> {
  const supabase = createClient()

  try {
    const codeWithoutPrefix = referralCode.replace("RC", "")
    const telegramIdBase36 = codeWithoutPrefix.substring(0, codeWithoutPrefix.length - 4)

    let telegramId: number
    try {
      telegramId = Number.parseInt(telegramIdBase36, 36)
    } catch {
      return { valid: false }
    }

    const { data: referrer, error } = await supabase
      .from("users")
      .select("first_name, username")
      .eq("telegram_id", telegramId)
      .single()

    if (error || !referrer) {
      return { valid: false }
    }

    const referrerName = referrer.username ? `@${referrer.username}` : referrer.first_name

    return { valid: true, referrerName }
  } catch (error) {
    console.error("Error validating referral code:", error)
    return { valid: false }
  }
}
