"use client"

import { CardDescription } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Copy, Gift, Share, UserPlus } from "lucide-react"
import type { ReferralStats } from "@/lib/referral-service"

interface ReferralModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function ReferralModal({ isOpen, onClose, userId }: ReferralModalProps) {
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null)
  const [referralCode, setReferralCode] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{ valid: boolean; referrerName?: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchReferralStats()
    }
  }, [isOpen, userId])

  const fetchReferralStats = async () => {
    try {
      const response = await fetch(`/api/referrals/stats/${userId}`)
      const data = await response.json()
      setReferralStats(data.stats)
    } catch (error) {
      console.error("Error fetching referral stats:", error)
    }
  }

  const referralLink = `https://t.me/RupeeCoinBot?start=${referralStats?.referralCode}`

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      // You could add a toast notification here to confirm copy
      alert("Referral link copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const shareReferralLink = async () => {
    const shareText = `Join me on RupeeCoin and start earning! ${referralLink}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join RupeeCoin",
          text: shareText,
          url: referralLink,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback to copying
      copyReferralLink()
    }
  }

  const validateReferralCode = async (code: string) => {
    if (!code.trim()) {
      setValidationResult(null)
      return
    }

    setIsValidating(true)
    try {
      const response = await fetch("/api/referrals/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: code }),
      })
      const data = await response.json()
      setValidationResult(data)
    } catch (error) {
      console.error("Error validating referral code:", error)
      setValidationResult({ valid: false })
    } finally {
      setIsValidating(false)
    }
  }

  const useReferralCode = async () => {
    if (!referralCode.trim() || !validationResult?.valid) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/referrals/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, referralCode }),
      })

      const data = await response.json()
      if (data.success) {
        alert(`Success! You and your referrer both earned 1000 RupeeCoins!`)
        setReferralCode("")
        setValidationResult(null)
        onClose()
      } else {
        alert(data.error || "Failed to use referral code")
      }
    } catch (error) {
      console.error("Error using referral code:", error)
      alert("Failed to use referral code")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!referralStats) {
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
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <Users className="w-6 h-6 text-blue-400" />
            <span>Referral System</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Invite friends and earn 1000 coins for each successful referral!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Referral Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-4 text-center">
                <UserPlus className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-400">{referralStats.totalReferrals}</div>
                <div className="text-sm text-gray-400">Friends Invited</div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="p-4 text-center">
                <Gift className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-400">{referralStats.totalBonusEarned}</div>
                <div className="text-sm text-gray-400">Bonus Earned</div>
              </CardContent>
            </Card>
          </div>

          {/* Referral Link */}
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-400">Your Referral Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="bg-gray-800 border-gray-600 text-white text-sm"
                />
                <Button onClick={copyReferralLink} size="sm" className="bg-gray-700 hover:bg-gray-600">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Button onClick={shareReferralLink} className="w-full bg-green-600 hover:bg-green-700">
                <Share className="w-4 h-4 mr-2" />
                Share Link
              </Button>
            </CardContent>
          </Card>

          {/* Referred Users */}
          {referralStats.referredUsers.length > 0 && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Your Referrals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-48 overflow-y-auto">
                {referralStats.referredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                    <div>
                      <div className="text-white font-medium">
                        {user.username ? `@${user.username}` : user.first_name}
                      </div>
                      <div className="text-xs text-gray-400">{new Date(user.created_at).toLocaleDateString()}</div>
                    </div>
                    <Badge className="bg-yellow-600 text-yellow-100">+{user.bonus_coins}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
