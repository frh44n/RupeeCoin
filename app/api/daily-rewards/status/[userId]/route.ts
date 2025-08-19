import { type NextRequest, NextResponse } from "next/server"
import { getDailyRewardStatus } from "@/lib/daily-rewards-service"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const status = await getDailyRewardStatus(params.userId)
    return NextResponse.json({ status })
  } catch (error) {
    console.error("Error fetching daily reward status:", error)
    return NextResponse.json({ error: "Failed to fetch reward status" }, { status: 500 })
  }
}
