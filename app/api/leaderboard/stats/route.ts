import { NextResponse } from "next/server"
import { getLeaderboardStats } from "@/lib/leaderboard-service"

export async function GET() {
  try {
    const stats = await getLeaderboardStats()
    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching leaderboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
