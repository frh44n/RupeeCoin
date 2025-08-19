import { NextResponse } from "next/server"
import { getGlobalLeaderboard } from "@/lib/leaderboard-service"

export async function GET() {
  try {
    const leaderboard = await getGlobalLeaderboard(50)
    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("Error fetching global leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
