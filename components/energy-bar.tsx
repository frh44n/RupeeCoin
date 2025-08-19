"use client"

interface EnergyBarProps {
  currentEnergy: number
  maxEnergy: number
}

export function EnergyBar({ currentEnergy, maxEnergy }: EnergyBarProps) {
  const energyPercentage = (currentEnergy / maxEnergy) * 100

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-blue-300">Energy</span>
        <span className="text-sm font-medium text-blue-300">
          {currentEnergy}/{maxEnergy}
        </span>
      </div>

      <div className="w-full bg-gray-700/50 rounded-full h-4 backdrop-blur-sm border border-gray-600">
        <div
          className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full rounded-full transition-all duration-300 ease-out shadow-lg shadow-blue-400/30"
          style={{ width: `${energyPercentage}%` }}
        />
      </div>

      {currentEnergy < maxEnergy && <div className="text-xs text-blue-300/70 mt-1 text-center">Regenerating...</div>}
    </div>
  )
}
