import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateUserEnergy } from "@/lib/user-service"

export async function GET(request: NextRequest, { params }: { params: { telegramId: string } }) {
  try {
    const telegramId = Number.parseInt(params.telegramId)

    if (isNaN(telegramId)) {
      return NextResponse.json({ error: "Invalid Telegram ID" }, { status: 400 })
    }

    const supabase = createClient()
    const { data: user, error } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update energy before returning
    const updatedUser = await updateUserEnergy(user)

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
