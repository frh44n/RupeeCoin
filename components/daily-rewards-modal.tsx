"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Gift, Flame, Clock } from "lucide-react"
import type { DailyRewardInfo } from "@/lib/daily-rewards-service"

interface DailyRewardsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onRewardClaimed: (coins: number) => void
}

export function DailyRewardsModal({ isOpen, onClose, userId, onRewardClaimed }: DailyRewardsModalProps) {
  const [rewardStatus, setRewardStatus] = useState<DailyRewardInfo | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimedReward, setClaimedReward] = useState<{ coins: number; bonus: string; newStreak: number } | null>(null)
  const [upcomingRewards, setUpcomingRewards] = useState<Array<{ day: number; coins: number; bonus: string }>>([])

  useEffect(() => {
    if (isOpen) {
      fetchRewardStatus()
    }
  }, [isOpen, userId])

  const fetchRewardStatus = async () => {
    try {
      const response = await fetch(`/api/daily-rewards/status/${userId}`)
      const data = await response.json()
      setRewardStatus(data.status)

      // Fetch upcoming rewards
      const upcomingResponse = await fetch(`/api/daily-rewards/upcoming/${userId}`)
      const upcomingData = await upcomingResponse.json()
      setUpcomingRewards(upcomingData.rewards || [])
    } catch (error) {
      console.error("Error fetching reward status:", error)
    }
  }

  const handleClaimReward = async () => {
    if (!rewardStatus?.canClaim) return

    setIsClaiming(true)
    try {
      const response = await fetch("/api/daily-rewards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()
      if (data.success) {
        setClaimedReward(data.reward)
        onRewardClaimed(data.reward.coins)
        fetchRewardStatus()
      } else {
        alert(data.error || "Failed to claim reward")
      }
    } catch (error) {
      console.error("Error claiming reward:", error)
    } finally {
      setIsClaiming(false)
    }
  }

  if (!rewardStatus) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <Gift className="w-6 h-6 text-yellow-400" />
            <span>Daily Rewards</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Login daily to earn increasing rewards and maintain your streak!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Streak */}
          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="font-medium">Current Streak</span>
                </div>
                <div className="text-2xl font-bold text-orange-400">{rewardStatus.currentStreak} days</div>
              </div>
            </CardContent>
          </Card>

          {/* Streak Broken Warning */}
          {rewardStatus.streakBroken && (
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4 text-center">
                <div className="text-red-400 font-medium">Streak broken! Starting fresh today.</div>
              </CardContent>
            </Card>
          )}

          {/* Claim Section */}
          {rewardStatus.canClaim ? (
            <Card className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-yellow-400 flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Today's Reward</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">{rewardStatus.nextReward}</div>
                  <div className="text-gray-400">RupeeCoins</div>
                </div>
                <Button
                  onClick={handleClaimReward}
                  disabled={isClaiming}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                >
                  {isClaiming ? "Claiming..." : "Claim Reward"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center space-y-2">
                <Clock className="w-8 h-8 text-gray-400 mx-auto" />
                <div className="text-gray-400">Already claimed today!</div>
                <div className="text-sm text-gray-500">Come back tomorrow for your next reward</div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Rewards Preview */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-300">Upcoming Rewards</h3>
            <div className="grid grid-cols-7 gap-1">
              {upcomingRewards.slice(0, 7).map((reward, index) => (
                <div key={reward.day} className="text-center">
                  <div className="text-xs text-gray-400 mb-1">Day {reward.day}</div>
                  <Badge
                    variant="secondary"
                    className={`text-xs px-1 py-1 ${
                      index === 0 ? "bg-yellow-600 text-yellow-100" : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {reward.coins}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Claimed Reward Celebration */}
          {claimedReward && (
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardContent className="p-4 text-center space-y-2">
                <div className="text-4xl">🎉</div>
                <div className="text-green-400 font-bold">Reward Claimed!</div>
                <div className="text-2xl font-bold text-yellow-400">+{claimedReward.coins} coins</div>
                <div className="text-sm text-gray-400">{claimedReward.bonus}</div>
                <Badge className="bg-orange-600 text-orange-100">{claimedReward.newStreak} day streak!</Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
