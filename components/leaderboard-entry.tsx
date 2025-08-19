"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { LeaderboardEntry } from "@/lib/leaderboard-service"

interface LeaderboardEntryProps {
  entry: LeaderboardEntry
  isCurrentUser?: boolean
}

export function LeaderboardEntryComponent({ entry, isCurrentUser }: LeaderboardEntryProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return null
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-400"
      case 2:
        return "text-gray-300"
      case 3:
        return "text-amber-600"
      default:
        return "text-gray-400"
    }
  }

  const displayName = entry.username ? `@${entry.username}` : entry.first_name
  const fullName = [entry.first_name, entry.last_name].filter(Boolean).join(" ")

  return (
    <div
      className={`flex items-center space-x-4 p-4 rounded-lg transition-colors ${
        isCurrentUser ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-gray-800/30 hover:bg-gray-800/50"
      }`}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-12">
        {getRankIcon(entry.rank) ? (
          <span className="text-2xl">{getRankIcon(entry.rank)}</span>
        ) : (
          <span className={`text-lg font-bold ${getRankColor(entry.rank)}`}>#{entry.rank}</span>
        )}
      </div>

      {/* Avatar */}
      <Avatar className="w-12 h-12">
        <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-bold">
          {entry.first_name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-white font-medium truncate">{displayName}</p>
          {isCurrentUser && <Badge className="bg-yellow-600 text-yellow-100 text-xs">You</Badge>}
        </div>
        {entry.username && <p className="text-gray-400 text-sm truncate">{fullName}</p>}
      </div>

      {/* Stats */}
      <div className="text-right space-y-1">
        <div className="text-yellow-400 font-bold">{entry.coins.toLocaleString()}</div>
        <div className="text-gray-400 text-sm">{entry.total_taps.toLocaleString()} taps</div>
      </div>
    </div>
  )
}
