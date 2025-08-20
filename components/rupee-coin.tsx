"use client"

import { useState } from "react"

interface RupeeCoinProps {
  onTap: () => void
  isAnimating: boolean
}

interface FallingCoin {
  id: number
  x: number
  y: number
}

interface FloatingText {
  id: number
  x: number
  y: number
  value: number
}

export function RupeeCoin({ onTap, isAnimating }: RupeeCoinProps) {
  const [tapEffect, setTapEffect] = useState(false)
  const [fallingCoins, setFallingCoins] = useState<FallingCoin[]>([])
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])

  const handleTap = () => {
    onTap()
    setTapEffect(true)
    setTimeout(() => setTapEffect(false), 300)

    const newCoins: FallingCoin[] = []
    const angleIncrement = (2 * Math.PI) / 8
    for (let i = 0; i < 8; i++) {
      const angle = i * angleIncrement
      newCoins.push({
        id: Date.now() + i,
        x: Math.cos(angle) * 150,
        y: Math.sin(angle) * 150,
      })
    }
    setFallingCoins((prev) => [...prev, ...newCoins])

    const newText: FloatingText = {
      id: Date.now(),
      x: Math.random() * 100 - 50,
      y: 0,
      value: 1,
    }
    setFloatingTexts((prev) => [...prev, newText])

    setTimeout(() => {
      setFallingCoins((prev) => prev.filter((coin) => !newCoins.some((nc) => nc.id === coin.id)))
    }, 2000)

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((text) => text.id !== newText.id))
    }, 1500)
  }

  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
      {/* Falling Coins */}
      {fallingCoins.map((coin) => (
        <div
          key={coin.id}
          className="absolute pointer-events-none animate-fall-and-fade"
          style={{
            left: `50%`,
            top: `50%`,
            transform: `translate(${coin.x}px, ${coin.y}px) scale(0.8)`,
          }}
        >
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 border-2 border-yellow-300 shadow-lg flex items-center justify-center">
            <span className="text-xs font-bold text-yellow-900">₹</span>
          </div>
        </div>
      ))}

      {/* Floating Text */}
      {floatingTexts.map((text) => (
        <div
          key={text.id}
          className="absolute pointer-events-none animate-float-up text-3xl md:text-4xl font-bold text-green-400 drop-shadow-lg"
          style={{
            left: `50%`,
            top: `50%`,
            transform: `translate(${text.x}px, ${text.y}px)`,
          }}
        >
          +{text.value}
        </div>
      ))}

      {/* Tap Ping Effect */}
      {tapEffect && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-yellow-400/60 rounded-full animate-ping-3d" />
          <div className="absolute w-40 h-40 md:w-48 md:h-48 border-2 border-yellow-300/40 rounded-full animate-ping-3d animation-delay-100" />
          <div className="absolute w-48 h-48 md:w-56 md:h-56 border border-yellow-200/20 rounded-full animate-ping-3d animation-delay-200" />
        </div>
      )}

      {/* Main Coin Button */}
      <button
        onClick={handleTap}
        data-testid="rupee-coin-button"
        className={`
          relative w-52 h-52 md:w-64 md:h-64 rounded-full
          bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700
          shadow-2xl shadow-yellow-500/60
          border-4 border-yellow-200
          transform transition-all duration-200 ease-out
          hover:scale-105 active:scale-95
          perspective-1000 transform-style-3d
          ${isAnimating ? "animate-bounce-3d" : ""}
          ${tapEffect ? "animate-wobble" : ""}
        `}
        style={{
          background: `
            radial-gradient(ellipse at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #fbbf24 0%, #f59e0b 25%, #d97706 50%, #92400e 75%, #451a03 100%)
          `,
          boxShadow: `
            0 0 0 4px rgba(254, 240, 138, 0.4),
            0 8px 32px rgba(245, 158, 11, 0.6),
            inset 0 4px 8px rgba(255, 255, 255, 0.2),
            inset 0 -4px 8px rgba(0, 0, 0, 0.2)
          `,
        }}
      >
        {/* Coin overlays and shines */}
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-yellow-200/60 via-transparent to-yellow-800/20 animate-shimmer" />
        <div className="absolute top-6 left-8 w-12 h-12 md:w-16 md:h-16 bg-white/50 rounded-full blur-md" />
        <div className="absolute top-12 left-12 w-6 h-6 md:w-8 md:h-8 bg-white/70 rounded-full blur-sm" />
        <div className="absolute bottom-8 right-10 w-8 h-8 md:w-10 md:h-10 bg-yellow-800/30 rounded-full blur-sm" />

        {/* Rupee Symbol */}
        <div className="absolute inset-0 flex items-center justify-center transform-style-3d animate-glowing-star">
          <div
            className="text-7xl md:text-8xl font-black text-yellow-900 drop-shadow-2xl transform transition-transform duration-200"
            style={{
              textShadow: `
                2px 2px 0px rgba(146, 64, 14, 0.8),
                4px 4px 8px rgba(0, 0, 0, 0.3),
                0 0 20px rgba(245, 158, 11, 0.4)
              `,
              transform: tapEffect ? "translateZ(10px) rotateY(5deg)" : "translateZ(0px)",
            }}
          >
            ₹
          </div>
        </div>

        {/* Inner border */}
        <div className="absolute inset-0 rounded-full border-2 border-yellow-100/30" />
      </button>
    </div>
  )
}
