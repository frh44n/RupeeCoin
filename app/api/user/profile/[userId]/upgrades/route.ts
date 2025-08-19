import { type NextRequest, NextResponse } from "next/server"
import { getUserUpgrades } from "@/lib/upgrade-service"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const upgrades = await getUserUpgrades(params.userId)
    return NextResponse.json({ upgrades })
  } catch (error) {
    console.error("Error fetching user upgrades:", error)
    return NextResponse.json({ error: "Failed to fetch user upgrades" }, { status: 500 })
  }
}
