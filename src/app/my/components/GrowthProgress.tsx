'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flame, BookOpen, Dumbbell, ChevronRight, TrendingUp } from 'lucide-react'
import type { GrowthStats } from '@/app/api/my/growth/route'

interface GrowthProgressProps {
  isLoggedIn: boolean
}

export default function GrowthProgress({ isLoggedIn }: GrowthProgressProps) {
  const router = useRouter()
  const [stats, setStats] = useState<GrowthStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false)
      return
    }

    fetch('/api/my/growth')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [isLoggedIn])

  // 未登入顯示 demo
  if (!isLoggedIn) {
    return (
      <div
        onClick={() => router.push('/login')}
        className="bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4] rounded-2xl p-4 cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#8B7355]" />
            <span className="font-medium text-[#5C4D3C]">成長進度</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8B7355]" />
        </div>
        <p className="text-sm text-[#8B7355]">登入後追蹤你的學習與健身進度</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 animate-pulse">
        <div className="h-5 w-24 bg-gray-200 rounded mb-3" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  // 沒有任何活動記錄
  if (!stats || (stats.learning.total_xp === 0 && stats.fitness.total_workouts === 0)) {
    return (
      <div
        onClick={() => router.push('/my/growth')}
        className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-4 cursor-pointer hover:shadow-md transition"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">開始你的成長之旅</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>學習語言</span>
          </div>
          <div className="flex items-center gap-1">
            <Dumbbell className="w-4 h-4 text-orange-500" />
            <span>健身記錄</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => router.push('/my/growth')}
      className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 cursor-pointer hover:shadow-md transition"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-800">{stats.combined.total_streak} 天連續</span>
            <p className="text-xs text-gray-500">本週 {stats.combined.weekly_active_days}/7 天活躍</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* 學習進度 */}
        <div className="bg-blue-50 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-1">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">學習</span>
          </div>
          <p className="font-bold text-blue-600">
            {stats.learning.weekly_xp.toLocaleString()} XP
          </p>
          <p className="text-xs text-gray-400">本週獲得</p>
        </div>

        {/* 健身進度 */}
        <div className="bg-orange-50 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-1">
            <Dumbbell className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-500">健身</span>
          </div>
          <p className="font-bold text-orange-600">
            {stats.fitness.weekly_workouts} 次
          </p>
          <p className="text-xs text-gray-400">本週訓練</p>
        </div>
      </div>

      {/* 本週活動指示器 */}
      <div className="mt-3 flex justify-center gap-1">
        {stats.weekly_activity.map((day) => (
          <div
            key={day.date}
            className={`w-6 h-2 rounded-full ${
              day.has_learning && day.has_fitness
                ? 'bg-gradient-to-r from-blue-500 to-orange-500'
                : day.has_learning
                ? 'bg-blue-500'
                : day.has_fitness
                ? 'bg-orange-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
