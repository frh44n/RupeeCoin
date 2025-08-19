import { type NextRequest, NextResponse } from "next/server"
import { updateUserTap } from "@/lib/user-service"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Tap API route called")

    const body = await request.json()
    console.log("[v0] Request body:", body)

    const { userId, coinsEarned } = body

    if (!userId || typeof coinsEarned !== "number") {
      console.log("[v0] Invalid request data:", { userId, coinsEarned })
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    console.log("[v0] Calling updateUserTap with:", { userId, coinsEarned })
    const updatedUser = await updateUserTap(userId, coinsEarned)
    console.log("[v0] UpdateUserTap result:", updatedUser)

    if (!updatedUser) {
      console.log("[v0] Failed to update user - returning 500")
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    console.log("[v0] Returning success response")
    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("[v0] Error in tap update:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
