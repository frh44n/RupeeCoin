"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TelegramUser } from "@/lib/user-service"

interface TelegramAuthProps {
  onAuth: (user: any) => void
}

export function TelegramAuth({ onAuth }: TelegramAuthProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isTelegram, setIsTelegram] = useState(false)
  const [telegramId, setTelegramId] = useState("")
  const [firstName, setFirstName] = useState("")
  const [username, setUsername] = useState("")
  const [referralCode, setReferralCode] = useState("")

  useEffect(() => {
    const processTelegramAuth = async (retries = 3) => {
      console.log("Attempting Telegram auth, retries left:", retries)
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
        window.Telegram.WebApp.ready()
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user
        const startParam = window.Telegram.WebApp.initDataUnsafe.start_param

        console.log("Telegram user data:", tgUser)
        console.log("Start param:", startParam)

        if (startParam) {
          setReferralCode(startParam)
        }

        if (tgUser && tgUser.id) {
          setIsTelegram(true)
          await handleAuth(tgUser)
        } else if (retries > 0) {
          setTimeout(() => processTelegramAuth(retries - 1), 500) // Retry after 500ms
        } else {
          console.log("Telegram auth failed after multiple retries.")
          setIsLoading(false)
        }
      } else if (retries > 0) {
        setTimeout(() => processTelegramAuth(retries - 1), 500) // Retry after 500ms
      } else {
        console.log("Telegram Web App script not found.")
        setIsLoading(false)
      }
    }

    processTelegramAuth()
  }, [])

  const handleAuth = async (tgUser: any = null) => {
    setIsLoading(true)

    try {
      let telegramUser: TelegramUser
      if (tgUser) {
        telegramUser = {
          id: tgUser.id,
          first_name: tgUser.first_name,
          username: tgUser.username,
        }
      } else {
        if (!telegramId || !firstName) {
          setIsLoading(false)
          return
        }
        telegramUser = {
          id: Number.parseInt(telegramId),
          first_name: firstName,
          username: username || undefined,
        }
      }

      const response = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telegramUser),
      })

      const data = await response.json()

      if (response.ok) {
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
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Auth error:", error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-yellow-400 text-2xl">Connecting to Telegram...</div>
        <div className="animate-ping-3d w-16 h-16 mt-4 border-4 border-yellow-400/60 rounded-full" />
      </div>
    )
  }

  if (isTelegram) {
    // Already handled in useEffect, this is a fallback message
    return <div className="text-yellow-400 text-2xl">Authenticated via Telegram. Loading...</div>
  }

  return (
    <Card className="max-w-md mx-auto bg-black/20 backdrop-blur-sm border border-yellow-500/20">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold text-yellow-400">Welcome to RupeeCoin</CardTitle>
        <CardDescription className="text-gray-300">
          Enter your details to play. For the best experience, open via our Telegram bot.
        </CardDescription>
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
          onClick={() => handleAuth()}
          disabled={!telegramId || !firstName || isLoading}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
        >
          {isLoading ? "Connecting..." : "Start Playing"}
        </Button>
      </CardContent>
    </Card>
  )
}
