import { type NextRequest, NextResponse } from "next/server"
import { getUserRank } from "@/lib/leaderboard-service"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const rank = await getUserRank(params.userId)
    return NextResponse.json({ rank })
  } catch (error) {
    console.error("Error fetching user rank:", error)
    return NextResponse.json({ error: "Failed to fetch user rank" }, { status: 500 })
  }
}
