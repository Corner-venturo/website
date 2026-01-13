'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Trophy, Users, ChevronRight, BookOpen, Dumbbell, Flame } from 'lucide-react'
import type { IntegratedLeaderboardEntry } from '@/app/api/friends/leaderboard/route'

interface LeaderboardData {
  leaderboard: IntegratedLeaderboardEntry[]
  my_rank: number | null
  total_friends: number
}

interface IntegratedLeaderboardProps {
  isLoggedIn: boolean
}

export default function IntegratedLeaderboard({ isLoggedIn }: IntegratedLeaderboardProps) {
  const router = useRouter()
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false)
      return
    }

    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/friends/leaderboard')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch {
        // 靜默失敗
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [isLoggedIn])

  if (!isLoggedIn) return null

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="ml-auto h-4 w-12 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 沒有好友或沒有資料
  if (!data || data.leaderboard.length <= 1) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="font-bold text-lg text-gray-800">好友排行榜</h2>
        </div>
        <div className="text-center py-6">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">邀請好友一起成長</p>
          <button
            onClick={() => router.push('/my/friends')}
            className="text-blue-600 font-medium text-sm flex items-center gap-1 mx-auto"
          >
            找朋友 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // 只顯示前 5 名
  const topEntries = data.leaderboard.slice(0, 5)

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `${rank}`
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 font-bold'
    if (rank === 2) return 'text-gray-500 font-bold'
    if (rank === 3) return 'text-orange-600 font-bold'
    return 'text-gray-400'
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="font-bold text-lg text-gray-800">好友排行榜</h2>
        </div>
        <span className="text-xs text-gray-400">本週綜合</span>
      </div>

      <div className="space-y-3">
        {topEntries.map((entry) => (
          <div
            key={entry.user_id}
            className={`flex items-center gap-3 p-2 rounded-xl transition ${
              entry.is_me ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
            }`}
          >
            {/* 排名 */}
            <div className={`w-8 text-center ${getRankColor(entry.rank)}`}>
              {getRankIcon(entry.rank)}
            </div>

            {/* 頭像 */}
            <div className="relative">
              {entry.avatar_url ? (
                <Image
                  src={entry.avatar_url}
                  alt={entry.display_name}
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {entry.display_name.charAt(0)}
                </div>
              )}
              {(entry.learning_streak >= 7 || entry.fitness_streak >= 7) && (
                <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-0.5">
                  <Flame className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* 名稱與統計 */}
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${entry.is_me ? 'text-blue-700' : 'text-gray-800'}`}>
                {entry.display_name}
                {entry.is_me && <span className="text-xs text-blue-500 ml-1">(你)</span>}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {entry.weekly_xp > 0 && (
                  <span className="flex items-center gap-0.5">
                    <BookOpen className="w-3 h-3 text-blue-500" />
                    {entry.weekly_xp}
                  </span>
                )}
                {entry.weekly_workouts > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Dumbbell className="w-3 h-3 text-orange-500" />
                    {entry.weekly_workouts}
                  </span>
                )}
              </div>
            </div>

            {/* 分數 */}
            <div className="text-right">
              <p className={`font-bold ${entry.is_me ? 'text-blue-600' : 'text-gray-700'}`}>
                {entry.score.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">分</p>
            </div>
          </div>
        ))}
      </div>

      {/* 計分說明 */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          分數 = XP + 訓練次數×100 + 訓練容量×0.1
        </p>
      </div>
    </div>
  )
}
