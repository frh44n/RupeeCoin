import { NextResponse } from "next/server"
import { getAvailableUpgrades } from "@/lib/upgrade-service"

export async function GET() {
  try {
    const upgrades = await getAvailableUpgrades()
    return NextResponse.json({ upgrades })
  } catch (error) {
    console.error("Error fetching upgrades:", error)
    return NextResponse.json({ error: "Failed to fetch upgrades" }, { status: 500 })
  }
}
