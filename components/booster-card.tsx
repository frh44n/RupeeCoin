"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Booster } from "@/lib/booster-service"

interface BoosterCardProps {
  booster: Booster
  userCoins: number
  onPurchase: (boosterId: string) => void
  isPurchasing: boolean
}

export function BoosterCard({ booster, userCoins, onPurchase, isPurchasing }: BoosterCardProps) {
  const canAfford = userCoins >= booster.cost

  const getBoosterIcon = (type: string) => {
    switch (type) {
      case "tap_multiplier":
        return "🚀"
      case "energy_refill":
        return "⚡"
      case "auto_tap_duration":
        return "🤖"
      default:
        return "✨"
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "Instant"
    if (seconds < 60) return `${seconds}s`
    return `${Math.floor(seconds / 60)}m`
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getBoosterIcon(booster.booster_type)}</span>
          <CardTitle className="text-lg text-white">{booster.name}</CardTitle>
        </div>
        <CardDescription className="text-gray-400">{booster.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Effect:</span>
            <span className="text-blue-400">
              {booster.booster_type === "tap_multiplier" && `${booster.effect_value}x multiplier`}
              {booster.booster_type === "energy_refill" && "Full energy restore"}
              {booster.booster_type === "auto_tap_duration" &&
                `Auto tap for ${formatDuration(booster.duration_seconds)}`}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Duration:</span>
            <span className="text-green-400">{formatDuration(booster.duration_seconds)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-yellow-400">{booster.cost.toLocaleString()} coins</div>
          <Button
            onClick={() => onPurchase(booster.id)}
            disabled={!canAfford || isPurchasing}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold disabled:opacity-50"
          >
            {isPurchasing ? "Buying..." : canAfford ? "Buy" : "Can't Afford"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
