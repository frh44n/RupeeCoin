import { NextResponse } from "next/server"
import { getTopTappers } from "@/lib/leaderboard-service"

export async function GET() {
  try {
    const leaderboard = await getTopTappers(50)
    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("Error fetching top tappers:", error)
    return NextResponse.json({ error: "Failed to fetch top tappers" }, { status: 500 })
  }
}
