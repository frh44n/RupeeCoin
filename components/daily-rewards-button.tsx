"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift } from "lucide-react"
import { DailyRewardsModal } from "./daily-rewards-modal"

interface DailyRewardsButtonProps {
  userId: string
  onRewardClaimed: (coins: number) => void
}

export function DailyRewardsButton({ userId, onRewardClaimed }: DailyRewardsButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [canClaim, setCanClaim] = useState(false)

  useEffect(() => {
    checkRewardStatus()
  }, [userId])

  const checkRewardStatus = async () => {
    try {
      const response = await fetch(`/api/daily-rewards/status/${userId}`)
      const data = await response.json()
      setCanClaim(data.status?.canClaim || false)
    } catch (error) {
      console.error("Error checking reward status:", error)
    }
  }

  const handleRewardClaimed = (coins: number) => {
    setCanClaim(false)
    onRewardClaimed(coins)
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className={`relative ${
          canClaim
            ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black animate-pulse"
            : "bg-gray-700 hover:bg-gray-600 text-white"
        }`}
      >
        <Gift className="w-4 h-4 mr-2" />
        Daily
        {canClaim && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0.5 animate-bounce">!</Badge>
        )}
      </Button>

      <DailyRewardsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userId={userId}
        onRewardClaimed={handleRewardClaimed}
      />
    </>
  )
}
