'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  Flame,
  BookOpen,
  Dumbbell,
  TrendingUp,
  Calendar,
  Trophy,
  Target,
  Zap
} from 'lucide-react'
import MobileNav from '@/components/MobileNav'
import { useAuthStore } from '@/stores/auth-store'
import { IntegratedLeaderboard } from '@/app/my/components'
import type { GrowthStats } from '@/app/api/my/growth/route'

export default function GrowthPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const [stats, setStats] = useState<GrowthStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/my/growth')
    }
  }, [isInitialized, user, router])

  useEffect(() => {
    if (user) {
      fetch('/api/my/growth')
        .then(res => res.json())
        .then(data => {
          if (!data.error) setStats(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [user])

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr)
    const days = ['日', '一', '二', '三', '四', '五', '六']
    return days[date.getDay()]
  }

  const getActivityColor = (hasLearning: boolean, hasFitness: boolean) => {
    if (hasLearning && hasFitness) return 'bg-gradient-to-br from-blue-500 to-orange-500'
    if (hasLearning) return 'bg-blue-500'
    if (hasFitness) return 'bg-orange-500'
    return 'bg-gray-200'
  }

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">成長總覽</h1>
            <p className="text-xs text-gray-500">追蹤你的學習與健身進度</p>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : stats ? (
          <>
            {/* 綜合連續天數 */}
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-1">綜合連續天數</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">{stats.combined.total_streak}</span>
                    <span className="text-xl">天</span>
                  </div>
                </div>
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Flame className="w-10 h-10" />
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>學習 {stats.learning.current_streak} 天</span>
                </div>
                <div className="flex items-center gap-1">
                  <Dumbbell className="w-4 h-4" />
                  <span>健身 {stats.fitness.current_streak} 天</span>
                </div>
              </div>
            </div>

            {/* 本週活動 */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h2 className="font-bold text-lg">本週活動</h2>
                <span className="ml-auto text-sm text-gray-500">
                  {stats.combined.weekly_active_days}/7 天
                </span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {stats.weekly_activity.map((day) => (
                  <div key={day.date} className="text-center">
                    <p className="text-xs text-gray-400 mb-2">{getDayName(day.date)}</p>
                    <div
                      className={`w-10 h-10 mx-auto rounded-xl ${getActivityColor(day.has_learning, day.has_fitness)} flex items-center justify-center`}
                    >
                      {(day.has_learning || day.has_fitness) && (
                        <span className="text-white text-xs font-bold">
                          {day.has_learning && day.has_fitness ? '2' : '1'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span>學習</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-orange-500" />
                  <span>健身</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-500 to-orange-500" />
                  <span>兩者皆有</span>
                </div>
              </div>
            </div>

            {/* 學習統計 */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <h2 className="font-bold text-lg">語言學習</h2>
                <button
                  onClick={() => router.push('/learn')}
                  className="ml-auto text-sm text-blue-600"
                >
                  查看詳情
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-gray-500">本週 XP</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.learning.weekly_xp.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-gray-500">本週課程</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.learning.weekly_sessions}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500">累計 XP</span>
                  </div>
                  <p className="text-xl font-bold text-gray-700">
                    {stats.learning.total_xp.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-gray-500">最長連續</span>
                  </div>
                  <p className="text-xl font-bold text-gray-700">
                    {stats.learning.longest_streak} 天
                  </p>
                </div>
              </div>
            </div>

            {/* 健身統計 */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="w-5 h-5 text-orange-500" />
                <h2 className="font-bold text-lg">健身記錄</h2>
                <button
                  onClick={() => router.push('/fitness')}
                  className="ml-auto text-sm text-orange-600"
                >
                  查看詳情
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Dumbbell className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-gray-500">本週訓練</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.fitness.weekly_workouts}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-gray-500">本週容量</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.fitness.weekly_volume >= 1000
                      ? `${(stats.fitness.weekly_volume / 1000).toFixed(1)}k`
                      : stats.fitness.weekly_volume} kg
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500">累計訓練</span>
                  </div>
                  <p className="text-xl font-bold text-gray-700">
                    {stats.fitness.total_workouts} 次
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-gray-500">最長連續</span>
                  </div>
                  <p className="text-xl font-bold text-gray-700">
                    {stats.fitness.longest_streak} 天
                  </p>
                </div>
              </div>
            </div>

            {/* 好友排行榜 */}
            <IntegratedLeaderboard isLoggedIn={!!user} />

            {/* 快速行動 */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/learn')}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl p-4 shadow-lg transition flex flex-col items-center gap-2"
              >
                <BookOpen className="w-8 h-8" />
                <span className="font-bold">開始學習</span>
              </button>
              <button
                onClick={() => router.push('/fitness')}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl p-4 shadow-lg transition flex flex-col items-center gap-2"
              >
                <Dumbbell className="w-8 h-8" />
                <span className="font-bold">開始訓練</span>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">載入資料失敗</p>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
