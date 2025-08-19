"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Upgrade, UserUpgrade } from "@/lib/upgrade-service"
import { calculateUpgradeCost, calculateUpgradeEffect } from "@/lib/upgrade-service"

interface UpgradeCardProps {
  upgrade: Upgrade
  userUpgrade?: UserUpgrade
  userCoins: number
  onPurchase: (upgradeId: string) => void
  isPurchasing: boolean
}

export function UpgradeCard({ upgrade, userUpgrade, userCoins, onPurchase, isPurchasing }: UpgradeCardProps) {
  const currentLevel = userUpgrade?.current_level || 0
  const cost = calculateUpgradeCost(upgrade, currentLevel)
  const currentEffect = calculateUpgradeEffect(upgrade, currentLevel)
  const nextEffect = calculateUpgradeEffect(upgrade, currentLevel + 1)
  const isMaxLevel = currentLevel >= upgrade.max_level
  const canAfford = userCoins >= cost

  const getUpgradeIcon = (type: string) => {
    switch (type) {
      case "coins_per_tap":
        return "💰"
      case "max_energy":
        return "⚡"
      case "energy_regen":
        return "🔋"
      case "auto_tap":
        return "🤖"
      default:
        return "⭐"
    }
  }

  const getEffectText = (type: string, effect: number) => {
    switch (type) {
      case "coins_per_tap":
        return `+${effect} coins per tap`
      case "max_energy":
        return `+${effect} max energy`
      case "energy_regen":
        return `+${effect} energy/sec`
      case "auto_tap":
        return `${effect} auto taps/sec`
      default:
        return `+${effect}`
    }
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getUpgradeIcon(upgrade.upgrade_type)}</span>
            <CardTitle className="text-lg text-white">{upgrade.name}</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-gray-700 text-gray-300">
            Level {currentLevel}
          </Badge>
        </div>
        <CardDescription className="text-gray-400">{upgrade.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Current:</span>
            <span className="text-green-400">
              {currentLevel > 0 ? getEffectText(upgrade.upgrade_type, currentEffect) : "None"}
            </span>
          </div>
          {!isMaxLevel && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Next level:</span>
              <span className="text-blue-400">{getEffectText(upgrade.upgrade_type, nextEffect)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-right">
            {isMaxLevel ? (
              <Badge className="bg-yellow-600 text-yellow-100">MAX LEVEL</Badge>
            ) : (
              <div className="text-lg font-bold text-yellow-400">{cost.toLocaleString()} coins</div>
            )}
          </div>
          <Button
            onClick={() => onPurchase(upgrade.id)}
            disabled={isMaxLevel || !canAfford || isPurchasing}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold disabled:opacity-50"
          >
            {isPurchasing ? "Buying..." : isMaxLevel ? "Maxed" : canAfford ? "Buy" : "Can't Afford"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
