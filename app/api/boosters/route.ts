import { NextResponse } from "next/server"
import { getAvailableBoosters } from "@/lib/booster-service"

export async function GET() {
  try {
    const boosters = await getAvailableBoosters()
    return NextResponse.json({ boosters })
  } catch (error) {
    console.error("Error fetching boosters:", error)
    return NextResponse.json({ error: "Failed to fetch boosters" }, { status: 500 })
  }
}
