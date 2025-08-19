"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Trophy } from "lucide-react"
import { RupeeCoin } from "./rupee-coin"
import { CoinCounter } from "./coin-counter"
import { EnergyBar } from "./energy-bar"
import { TelegramAuth } from "./telegram-auth"
import { UpgradeShop } from "./upgrade-shop"
import { Leaderboard } from "./leaderboard"
import { DailyRewardsButton } from "./daily-rewards-button"
import { ReferralButton } from "./referral-button"
import type { UserData } from "@/lib/user-service"

export function TapInterface() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [lastTapIncrement, setLastTapIncrement] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState<"game" | "shop" | "leaderboard">("game")

  const handleAuth = (user: UserData) => {
    setUserData(user)
    setIsAuthenticated(true)
  }

  const handleRewardClaimed = (coins: number) => {
    if (userData) {
      setUserData({ ...userData, coins: userData.coins + coins })
    }
  }

  const handleTap = useCallback(async () => {
    if (!userData || userData.energy <= 0) return

    const coinsEarned = userData.coins_per_tap
    setLastTapIncrement(coinsEarned)

    // Optimistic update
    setUserData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        coins: prev.coins + coinsEarned,
        energy: Math.max(prev.energy - 1, 0),
        total_taps: prev.total_taps + 1,
      }
    })

    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    // Update database
    try {
      const response = await fetch("/api/user/tap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData.id, coinsEarned }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API call failed with status ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (data.user) {
        setUserData(data.user)
      }
    } catch (error) {
      console.error("Error updating tap:", error)
      setUserData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          coins: prev.coins - coinsEarned,
          energy: Math.min(prev.energy + 1, prev.max_energy),
          total_taps: prev.total_taps - 1,
        }
      })
    }
  }, [userData])

  // Energy regeneration effect
  useEffect(() => {
    if (!userData) return

    const interval = setInterval(() => {
      setUserData((prev) => {
        if (!prev || prev.energy >= prev.max_energy) return prev
        return { ...prev, energy: Math.min(prev.energy + prev.energy_regen_rate, prev.max_energy) }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [userData])

  if (!isAuthenticated || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <TelegramAuth onAuth={handleAuth} />
      </div>
    )
  }

  if (currentView === "shop") {
    return <UpgradeShop userData={userData} onBack={() => setCurrentView("game")} onUserUpdate={setUserData} />
  }

  if (currentView === "leaderboard") {
    return <Leaderboard userData={userData} onBack={() => setCurrentView("game")} />
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-md">
        <div className="flex space-x-2">
          <Button
            onClick={() => setCurrentView("leaderboard")}
            className="bg-yellow-600 hover:bg-yellow-700 text-black"
          >
            <Trophy className="w-4 h-4" />
          </Button>
          <DailyRewardsButton userId={userData.id} onRewardClaimed={handleRewardClaimed} />
          <ReferralButton userId={userData.id} />
        </div>
        <div className="text-center flex-1">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
            RupeeCoin
          </h1>
          <p className="text-lg text-gray-300/80">Welcome, {userData.first_name}!</p>
        </div>
        <Button onClick={() => setCurrentView("shop")} className="bg-purple-600 hover:bg-purple-700 text-white">
          <ShoppingCart className="w-4 h-4" />
        </Button>
      </div>

      {/* Coin Counter */}
      <CoinCounter coins={userData.coins} increment={lastTapIncrement} />

      {/* Main Tap Area */}
      <div className="flex-1 flex items-center justify-center">
        <RupeeCoin onTap={handleTap} isAnimating={isAnimating} />
      </div>

      {/* Energy Bar */}
      <EnergyBar currentEnergy={userData.energy} maxEnergy={userData.max_energy} />

      {/* Stats */}
      <div className="flex justify-center space-x-8 text-center">
        <div>
          <div className="text-2xl font-bold text-yellow-400">{userData.total_taps}</div>
          <div className="text-sm text-gray-400">Total Taps</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-400">{userData.coins_per_tap}</div>
          <div className="text-sm text-gray-400">Per Tap</div>
        </div>
      </div>
    </div>
  )
}
