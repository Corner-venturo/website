'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Trophy, Users, ChevronRight, Flame } from 'lucide-react'
import type { LeaderboardEntry } from '@/app/api/learn/leaderboard/route'

interface LeaderboardData {
  leaderboard: LeaderboardEntry[]
  my_rank: number | null
  total_friends: number
}

export function FriendsLeaderboard() {
  const router = useRouter()
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/learn/leaderboard')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (error) {
        // 靜默失敗
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5">
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
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="font-bold text-lg">好友排行榜</h2>
        </div>
        <div className="text-center py-6">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">邀請好友一起學習</p>
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
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="font-bold text-lg">好友排行榜</h2>
        </div>
        <span className="text-xs text-gray-400">本週 XP</span>
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
              {entry.current_streak >= 7 && (
                <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-0.5">
                  <Flame className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* 名稱 */}
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${entry.is_me ? 'text-blue-700' : 'text-gray-800'}`}>
                {entry.display_name}
                {entry.is_me && <span className="text-xs text-blue-500 ml-1">(你)</span>}
              </p>
              {entry.current_streak > 0 && (
                <p className="text-xs text-gray-400">
                  🔥 連續 {entry.current_streak} 天
                </p>
              )}
            </div>

            {/* XP */}
            <div className="text-right">
              <p className={`font-bold ${entry.is_me ? 'text-blue-600' : 'text-gray-700'}`}>
                {entry.weekly_xp.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">XP</p>
            </div>
          </div>
        ))}
      </div>

      {/* 查看更多 */}
      {data.leaderboard.length > 5 && (
        <button
          onClick={() => router.push('/learn/leaderboard')}
          className="w-full mt-4 py-2 text-blue-600 text-sm font-medium hover:bg-blue-50 rounded-lg transition flex items-center justify-center gap-1"
        >
          查看完整排行榜 <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
