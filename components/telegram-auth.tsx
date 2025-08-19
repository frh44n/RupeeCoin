"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TelegramUser } from "@/lib/user-service"

interface TelegramAuthProps {
  onAuth: (user: any) => void
}

export function TelegramAuth({ onAuth }: TelegramAuthProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [telegramId, setTelegramId] = useState("")
  const [firstName, setFirstName] = useState("")
  const [username, setUsername] = useState("")
  const [referralCode, setReferralCode] = useState("")

  const handleAuth = async () => {
    if (!telegramId || !firstName) return

    setIsLoading(true)

    try {
      const telegramUser: TelegramUser = {
        id: Number.parseInt(telegramId),
        first_name: firstName,
        username: username || undefined,
      }

      const response = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telegramUser),
      })

      const data = await response.json()

      if (response.ok) {
        // Process referral code if provided
        if (referralCode.trim()) {
          try {
            await fetch("/api/referrals/use", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: data.user.id, referralCode: referralCode.trim().toUpperCase() }),
            })
          } catch (error) {
            console.error("Error processing referral:", error)
          }
        }

        onAuth(data.user)
      } else {
        console.error("Auth error:", data.error)
      }
    } catch (error) {
      console.error("Auth error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto bg-black/20 backdrop-blur-sm border border-yellow-500/20">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold text-yellow-400">Welcome to RupeeCoin</CardTitle>
        <CardDescription className="text-gray-300">Enter your Telegram details to start earning</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Telegram ID</label>
          <Input
            type="number"
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            placeholder="Your Telegram ID"
            className="bg-gray-800/50 border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Your first name"
            className="bg-gray-800/50 border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Username (optional)</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@username"
            className="bg-gray-800/50 border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Referral Code (optional)</label>
          <Input
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            placeholder="RC123ABC"
            className="bg-gray-800/50 border-gray-600 text-white font-mono"
          />
          <p className="text-xs text-gray-400 mt-1">Enter a friend's referral code to earn bonus coins!</p>
        </div>

        <Button
          onClick={handleAuth}
          disabled={!telegramId || !firstName || isLoading}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
        >
          {isLoading ? "Connecting..." : "Start Playing"}
        </Button>

        <div className="text-xs text-gray-400 text-center">
          In a real Telegram bot, this data would be automatically provided by Telegram
        </div>
      </CardContent>
    </Card>
  )
}
