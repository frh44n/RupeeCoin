"use client"

import { useState, useEffect } from "react"

interface CoinCounterProps {
  coins: number
  increment: number
}

export function CoinCounter({ coins, increment }: CoinCounterProps) {
  const [displayCoins, setDisplayCoins] = useState(coins || 0)
  const [showIncrement, setShowIncrement] = useState(false)

  useEffect(() => {
    if (coins !== displayCoins) {
      setShowIncrement(true)
      setDisplayCoins(coins || 0)
      setTimeout(() => setShowIncrement(false), 1000)
    }
  }, [coins, displayCoins])

  const formatNumber = (num: number) => {
    if (num == null || isNaN(num)) {
      return "0"
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toLocaleString()
  }

  return (
    <div className="relative text-center">
      <div className="text-4xl font-bold text-yellow-400 drop-shadow-lg">{formatNumber(displayCoins)}</div>
      <div className="text-lg text-yellow-300/80 font-medium">RupeeCoins</div>

      {/* Floating increment animation */}
      {showIncrement && increment > 0 && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl font-bold text-green-400 animate-bounce pointer-events-none">
          +{increment}
        </div>
      )}
    </div>
  )
}
