import { type NextRequest, NextResponse } from "next/server"
import { processReferral } from "@/lib/referral-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, referralCode } = await request.json()

    if (!userId || !referralCode) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const result = await processReferral(userId, referralCode)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing referral:", error)
    return NextResponse.json({ success: false, error: "Failed to process referral" }, { status: 500 })
  }
}
