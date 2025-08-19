import { type NextRequest, NextResponse } from "next/server"
import { claimDailyReward } from "@/lib/daily-rewards-service"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const result = await claimDailyReward(userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error claiming daily reward:", error)
    return NextResponse.json({ error: "Failed to claim reward" }, { status: 500 })
  }
}
