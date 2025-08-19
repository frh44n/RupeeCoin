"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trophy, Target, Users } from "lucide-react"
import { LeaderboardEntryComponent } from "./leaderboard-entry"
import type { UserData } from "@/lib/user-service"
import type { LeaderboardEntry } from "@/lib/leaderboard-service"

interface LeaderboardProps {
  userData: UserData
  onBack: () => void
}

export function Leaderboard({ userData, onBack }: LeaderboardProps) {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([])
  const [topTappers, setTopTappers] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<{ rank: number; total_players: number } | null>(null)
  const [stats, setStats] = useState({ totalPlayers: 0, totalCoins: 0, totalTaps: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboardData()
  }, [])

  const fetchLeaderboardData = async () => {
    setIsLoading(true)
    try {
      const [globalResponse, tappersResponse, rankResponse, statsResponse] = await Promise.all([
        fetch("/api/leaderboard/global"),
        fetch("/api/leaderboard/tappers"),
        fetch(`/api/leaderboard/rank/${userData.id}`),
        fetch("/api/leaderboard/stats"),
      ])

      const [globalData, tappersData, rankData, statsData] = await Promise.all([
        globalResponse.json(),
        tappersResponse.json(),
        rankResponse.json(),
        statsResponse.json(),
      ])

      setGlobalLeaderboard(globalData.leaderboard || [])
      setTopTappers(tappersData.leaderboard || [])
      setUserRank(rankData.rank)
      setStats(statsData.stats || { totalPlayers: 0, totalCoins: 0, totalTaps: 0 })
    } catch (error) {
      console.error("Error fetching leaderboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-4xl">🏆</div>
          <div className="text-xl text-white">Loading Leaderboard...</div>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Leaderboard
          </h1>
        </div>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* User Rank Card */}
      {userRank && (
        <Card className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Your Ranking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-yellow-400">#{userRank.rank}</div>
                <div className="text-gray-400">out of {userRank.total_players.toLocaleString()} players</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white">{userData.coins.toLocaleString()}</div>
                <div className="text-gray-400">RupeeCoins</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{stats.totalPlayers.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Players</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{stats.totalCoins.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total Coins</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{stats.totalTaps.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total Taps</div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="coins" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="coins" className="text-white data-[state=active]:bg-yellow-600">
            Top Earners
          </TabsTrigger>
          <TabsTrigger value="taps" className="text-white data-[state=active]:bg-green-600">
            Top Tappers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coins" className="space-y-4">
          <Card className="bg-gray-800/30 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>Richest Players</span>
              </CardTitle>
              <CardDescription className="text-gray-400">Players ranked by total RupeeCoins earned</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {globalLeaderboard.map((entry) => (
                <LeaderboardEntryComponent key={entry.id} entry={entry} isCurrentUser={entry.id === userData.id} />
              ))}
              {globalLeaderboard.length === 0 && <div className="text-center py-8 text-gray-400">No players found</div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taps" className="space-y-4">
          <Card className="bg-gray-800/30 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-400" />
                <span>Most Active Tappers</span>
              </CardTitle>
              <CardDescription className="text-gray-400">Players ranked by total taps made</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {topTappers.map((entry) => (
                <LeaderboardEntryComponent key={entry.id} entry={entry} isCurrentUser={entry.id === userData.id} />
              ))}
              {topTappers.length === 0 && <div className="text-center py-8 text-gray-400">No players found</div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
