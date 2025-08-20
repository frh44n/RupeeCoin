import { type NextRequest, NextResponse } from "next/server"
import { updateUserTap } from "@/lib/user-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, coinsEarned, taps } = body

    if (!userId || typeof coinsEarned !== "number" || typeof taps !== "number") {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    const updatedUser = await updateUserTap(userId, coinsEarned, taps)

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error in tap update:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
