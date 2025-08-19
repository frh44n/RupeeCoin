import { type NextRequest, NextResponse } from "next/server"
import { getOrCreateUser, type TelegramUser } from "@/lib/user-service"

export async function POST(request: NextRequest) {
  try {
    const telegramUser: TelegramUser = await request.json()

    // Validate required fields
    if (!telegramUser.id || !telegramUser.first_name) {
      return NextResponse.json({ error: "Invalid Telegram user data" }, { status: 400 })
    }

    const userData = await getOrCreateUser(telegramUser)

    if (!userData) {
      return NextResponse.json({ error: "Failed to create or retrieve user" }, { status: 500 })
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Error in Telegram auth:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
