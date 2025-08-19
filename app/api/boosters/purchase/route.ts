import { type NextRequest, NextResponse } from "next/server"
import { purchaseBooster } from "@/lib/booster-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, boosterId } = await request.json()

    if (!userId || !boosterId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await purchaseBooster(userId, boosterId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error purchasing booster:", error)
    return NextResponse.json({ error: "Purchase failed" }, { status: 500 })
  }
}
