"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import { UpgradeCard } from "./upgrade-card"
import { BoosterCard } from "./booster-card"
import type { UserData } from "@/lib/user-service"
import type { Upgrade, UserUpgrade } from "@/lib/upgrade-service"
import type { Booster } from "@/lib/booster-service"

interface UpgradeShopProps {
  userData: UserData
  onBack: () => void
  onUserUpdate: (user: UserData) => void
}

export function UpgradeShop({ userData, onBack, onUserUpdate }: UpgradeShopProps) {
  const [upgrades, setUpgrades] = useState<Upgrade[]>([])
  const [userUpgrades, setUserUpgrades] = useState<UserUpgrade[]>([])
  const [boosters, setBoosters] = useState<Booster[]>([])
  const [isPurchasing, setIsPurchasing] = useState(false)

  useEffect(() => {
    fetchUpgrades()
    fetchBoosters()
    fetchUserUpgrades()
  }, [])

  const fetchUpgrades = async () => {
    try {
      const response = await fetch("/api/upgrades")
      const data = await response.json()
      setUpgrades(data.upgrades || [])
    } catch (error) {
      console.error("Error fetching upgrades:", error)
    }
  }

  const fetchBoosters = async () => {
    try {
      const response = await fetch("/api/boosters")
      const data = await response.json()
      setBoosters(data.boosters || [])
    } catch (error) {
      console.error("Error fetching boosters:", error)
    }
  }

  const fetchUserUpgrades = async () => {
    try {
      const response = await fetch(`/api/user/profile/${userData.id}/upgrades`)
      const data = await response.json()
      setUserUpgrades(data.upgrades || [])
    } catch (error) {
      console.error("Error fetching user upgrades:", error)
    }
  }

  const handleUpgradePurchase = async (upgradeId: string) => {
    setIsPurchasing(true)
    try {
      const response = await fetch("/api/upgrades/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData.id, upgradeId }),
      })

      const data = await response.json()
      if (data.success) {
        onUserUpdate(data.user)
        fetchUserUpgrades()
      } else {
        alert(data.error || "Purchase failed")
      }
    } catch (error) {
      console.error("Error purchasing upgrade:", error)
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleBoosterPurchase = async (boosterId: string) => {
    setIsPurchasing(true)
    try {
      const response = await fetch("/api/boosters/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData.id, boosterId }),
      })

      const data = await response.json()
      if (data.success) {
        onUserUpdate(data.user)
      } else {
        alert(data.error || "Purchase failed")
      }
    } catch (error) {
      console.error("Error purchasing booster:", error)
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="ghost" className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Game
        </Button>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{userData.coins.toLocaleString()}</div>
          <div className="text-sm text-gray-400">RupeeCoins</div>
        </div>
      </div>

      {/* Shop Tabs */}
      <Tabs defaultValue="upgrades" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="upgrades" className="text-white data-[state=active]:bg-yellow-600">
            Upgrades
          </TabsTrigger>
          <TabsTrigger value="boosters" className="text-white data-[state=active]:bg-purple-600">
            Boosters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upgrades" className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Permanent Upgrades</h2>
            <p className="text-gray-400">Improve your earning potential forever</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {upgrades.map((upgrade) => {
              const userUpgrade = userUpgrades.find((uu) => uu.upgrade_id === upgrade.id)
              return (
                <UpgradeCard
                  key={upgrade.id}
                  upgrade={upgrade}
                  userUpgrade={userUpgrade}
                  userCoins={userData.coins}
                  onPurchase={handleUpgradePurchase}
                  isPurchasing={isPurchasing}
                />
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="boosters" className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Temporary Boosters</h2>
            <p className="text-gray-400">Get temporary power-ups to boost your earnings</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {boosters.map((booster) => (
              <BoosterCard
                key={booster.id}
                booster={booster}
                userCoins={userData.coins}
                onPurchase={handleBoosterPurchase}
                isPurchasing={isPurchasing}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
