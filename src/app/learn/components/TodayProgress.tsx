'use client'

import type { TodayStats } from '@/features/learn/types'

interface TodayProgressProps {
  stats: TodayStats | null
  dailyGoalXP: number
  dailyGoalMinutes: number
}

export function TodayProgress({ stats, dailyGoalXP, dailyGoalMinutes }: TodayProgressProps) {
  const xpEarned = stats?.xp_earned || 0
  const minutesStudied = stats?.minutes_studied || 0

  const xpProgress = Math.min((xpEarned / dailyGoalXP) * 100, 100)
  const minutesProgress = Math.min((minutesStudied / dailyGoalMinutes) * 100, 100)

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="font-bold text-lg mb-4">今日進度</h3>

      <div className="space-y-4">
        {/* XP 進度 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">經驗值</span>
            <span className="text-sm font-medium">
              {xpEarned} / {dailyGoalXP} XP
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {/* 學習時間進度 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">學習時間</span>
            <span className="text-sm font-medium">
              {minutesStudied} / {dailyGoalMinutes} 分鐘
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${minutesProgress}%` }}
            />
          </div>
        </div>

        {/* 統計數字 */}
        <div className="flex justify-around pt-2 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats?.words_learned || 0}</p>
            <p className="text-xs text-gray-500">新學單字</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats?.words_reviewed || 0}</p>
            <p className="text-xs text-gray-500">複習單字</p>
          </div>
        </div>
      </div>
    </div>
  )
}
