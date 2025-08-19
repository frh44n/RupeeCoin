import { type NextRequest, NextResponse } from "next/server"
import { getUserReferralStats } from "@/lib/referral-service"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const stats = await getUserReferralStats(params.userId)
    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching referral stats:", error)
    return NextResponse.json({ error: "Failed to fetch referral stats" }, { status: 500 })
  }
}
