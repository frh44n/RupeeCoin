import { type NextRequest, NextResponse } from "next/server"
import { validateReferralCode } from "@/lib/referral-service"

export async function POST(request: NextRequest) {
  try {
    const { referralCode } = await request.json()

    if (!referralCode) {
      return NextResponse.json({ valid: false })
    }

    const result = await validateReferralCode(referralCode)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error validating referral code:", error)
    return NextResponse.json({ valid: false })
  }
}
