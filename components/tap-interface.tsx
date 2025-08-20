"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  const tapQueue = useRef<number[]>([])

  const handleAuth = (user: UserData) => {
    setUserData(user)
    setIsAuthenticated(true)
  }

  const handleRewardClaimed = (coins: number) => {
    if (userData) {
      setUserData({ ...userData, coins: userData.coins + coins })
    }
  }

  const isProcessingQueue = useRef(false)
  const userDataRef = useRef(userData)

  useEffect(() => {
    userDataRef.current = userData
  }, [userData])

  const processTapQueue = useCallback(async () => {
    if (isProcessingQueue.current || tapQueue.current.length === 0) return

    isProcessingQueue.current = true
    const tapsToProcess = [...tapQueue.current]
    tapQueue.current = []

    const totalCoinsEarned = tapsToProcess.reduce((sum, coins) => sum + coins, 0)
    const totalTaps = tapsToProcess.length

    try {
      const response = await fetch("/api/user/tap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userDataRef.current!.id,
          coinsEarned: totalCoinsEarned,
          taps: totalTaps,
        }),
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
      console.error("Error processing tap queue:", error)
      // Revert optimistic updates on failure
      setUserData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          coins: prev.coins - totalCoinsEarned,
          energy: Math.min(prev.energy + totalTaps, prev.max_energy),
          total_taps: prev.total_taps - totalTaps,
        }
      })
    } finally {
      isProcessingQueue.current = false
    }
  }, [])

  const handleTap = useCallback(() => {
    if (!userData || userData.energy <= 0) return

    const coinsEarned = userData.coins_per_tap
    setLastTapIncrement(coinsEarned)
    tapQueue.current.push(coinsEarned)

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
  }, [userData])

  // Process tap queue periodically
  useEffect(() => {
    const interval = setInterval(processTapQueue, 2000) // Process every 2 seconds
    return () => {
      clearInterval(interval)
      processTapQueue() // Process any remaining taps on unmount
    }
  }, [processTapQueue])

  // Energy regeneration
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
    <div className="flex flex-col items-center justify-between min-h-screen p-4 md:p-6 space-y-4">
      {/* Top section: Title and user info */}
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
          RupeeCoin
        </h1>
        <p className="text-md md:text-lg text-gray-300/80">Welcome, {userData.first_name}!</p>
      </div>

      {/* Middle section: Coin Counter and Tap Area */}
      <div className="flex flex-col items-center justify-center flex-grow w-full space-y-4">
        <CoinCounter coins={userData.coins} increment={lastTapIncrement} />
        <div className="w-full flex-grow flex items-center justify-center">
          <RupeeCoin onTap={handleTap} isAnimating={isAnimating} />
        </div>
        <EnergyBar currentEnergy={userData.energy} maxEnergy={userData.max_energy} />
      </div>

      {/* Bottom section: Stats and navigation */}
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-around text-center bg-black/20 p-2 rounded-lg">
          <div>
            <div className="text-xl md:text-2xl font-bold text-yellow-400">{userData.total_taps}</div>
            <div className="text-xs md:text-sm text-gray-400">Total Taps</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-green-400">+{userData.coins_per_tap}</div>
            <div className="text-xs md:text-sm text-gray-400">Per Tap</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => setCurrentView("leaderboard")}
            className="bg-yellow-600 hover:bg-yellow-700 text-black w-full"
          >
            <Trophy className="w-5 h-5 mr-2" /> Rank
          </Button>
          <DailyRewardsButton userId={userData.id} onRewardClaimed={handleRewardClaimed} />
          <ReferralButton userId={userData.id} />
          <Button
            onClick={() => setCurrentView("shop")}
            className="bg-purple-600 hover:bg-purple-700 text-white col-span-3"
          >
            <ShoppingCart className="w-5 h-5 mr-2" /> Upgrades & Boosters
          </Button>
        </div>
      </div>
    </div>
  )
}
