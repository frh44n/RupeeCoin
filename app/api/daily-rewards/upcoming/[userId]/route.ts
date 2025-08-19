import { type NextRequest, NextResponse } from "next/server"
import { getDailyRewardStatus, getUpcomingRewards } from "@/lib/daily-rewards-service"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const status = await getDailyRewardStatus(params.userId)
    const rewards = getUpcomingRewards(status.currentStreak)
    return NextResponse.json({ rewards })
  } catch (error) {
    console.error("Error fetching upcoming rewards:", error)
    return NextResponse.json({ error: "Failed to fetch upcoming rewards" }, { status: 500 })
  }
}
