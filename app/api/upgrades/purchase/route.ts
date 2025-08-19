import { type NextRequest, NextResponse } from "next/server"
import { purchaseUpgrade } from "@/lib/upgrade-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, upgradeId } = await request.json()

    if (!userId || !upgradeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await purchaseUpgrade(userId, upgradeId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error purchasing upgrade:", error)
    return NextResponse.json({ error: "Purchase failed" }, { status: 500 })
  }
}
