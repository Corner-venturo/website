'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  Dumbbell,
  Trophy,
  Flame,
  Star,
  Share2
} from 'lucide-react'
import MobileNav from '@/components/MobileNav'
import { useAuthStore } from '@/stores/auth-store'
import type { WeeklyReport } from '@/app/api/my/weekly-report/route'

export default function WeeklyReportPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const [report, setReport] = useState<WeeklyReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/my/weekly-report')
    }
  }, [isInitialized, user, router])

  useEffect(() => {
    if (user) {
      fetch('/api/my/weekly-report')
        .then(res => res.json())
        .then(data => {
          if (!data.error) setReport(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [user])

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start)
    const e = new Date(end)
    return `${s.getMonth() + 1}/${s.getDate()} - ${e.getMonth() + 1}/${e.getDate()}`
  }

  const ImprovementBadge = ({ value }: { value: number }) => {
    if (value > 0) {
      return (
        <span className="flex items-center gap-0.5 text-green-600 text-xs font-medium">
          <TrendingUp className="w-3 h-3" />
          +{value}%
        </span>
      )
    } else if (value < 0) {
      return (
        <span className="flex items-center gap-0.5 text-red-500 text-xs font-medium">
          <TrendingDown className="w-3 h-3" />
          {value}%
        </span>
      )
    }
    return (
      <span className="flex items-center gap-0.5 text-gray-400 text-xs font-medium">
        <Minus className="w-3 h-3" />
        持平
      </span>
    )
  }

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">週報</h1>
              {report && (
                <p className="text-xs text-gray-500">
                  {formatDateRange(report.period.start, report.period.end)}
                </p>
              )}
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : report ? (
          <>
            {/* 總覽卡片 */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">本週總覽</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold">{report.summary.total_active_days}</p>
                  <p className="text-white/70 text-sm">活躍天數</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold">{report.summary.total_xp.toLocaleString()}</p>
                  <p className="text-white/70 text-sm">總 XP</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold">{report.summary.total_workouts}</p>
                  <p className="text-white/70 text-sm">訓練次數</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold">
                    {report.summary.total_volume >= 1000
                      ? `${(report.summary.total_volume / 1000).toFixed(1)}k`
                      : report.summary.total_volume}
                  </p>
                  <p className="text-white/70 text-sm">訓練容量 kg</p>
                </div>
              </div>
            </div>

            {/* 每日活動 */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                每日活動
              </h2>

              <div className="space-y-2">
                {report.daily_breakdown.map((day) => (
                  <div
                    key={day.date}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      day.has_activity ? 'bg-gradient-to-r from-blue-50 to-orange-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="w-10 text-center">
                      <p className="text-xs text-gray-400">週{day.day_name}</p>
                      <p className="font-bold text-gray-700">{new Date(day.date).getDate()}</p>
                    </div>

                    <div className="flex-1 flex items-center gap-3">
                      {day.learning_xp > 0 && (
                        <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                          <BookOpen className="w-3 h-3" />
                          {day.learning_xp} XP
                        </div>
                      )}
                      {day.fitness_volume > 0 && (
                        <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                          <Dumbbell className="w-3 h-3" />
                          {Math.round(day.fitness_volume)} kg
                        </div>
                      )}
                      {!day.has_activity && (
                        <span className="text-gray-400 text-xs">休息日</span>
                      )}
                    </div>

                    {day.date === report.summary.best_day && (
                      <div className="bg-yellow-100 p-1.5 rounded-full">
                        <Star className="w-4 h-4 text-yellow-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 學習統計 */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  語言學習
                </h2>
                <ImprovementBadge value={report.learning.improvement} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{report.learning.xp_earned}</p>
                  <p className="text-xs text-gray-500">獲得 XP</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{report.learning.sessions}</p>
                  <p className="text-xs text-gray-500">完成課程</p>
                </div>
              </div>

              {report.learning.streak_maintained && (
                <div className="mt-3 flex items-center gap-2 text-orange-600">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    連續 {report.learning.current_streak} 天學習中！
                  </span>
                </div>
              )}
            </div>

            {/* 健身統計 */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-orange-500" />
                  健身記錄
                </h2>
                <ImprovementBadge value={report.fitness.improvement} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">{report.fitness.workouts}</p>
                  <p className="text-xs text-gray-500">訓練次數</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {report.fitness.volume >= 1000
                      ? `${(report.fitness.volume / 1000).toFixed(1)}k`
                      : report.fitness.volume}
                  </p>
                  <p className="text-xs text-gray-500">容量 kg</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">{report.fitness.sets}</p>
                  <p className="text-xs text-gray-500">完成組數</p>
                </div>
              </div>

              {report.fitness.streak_maintained && (
                <div className="mt-3 flex items-center gap-2 text-orange-600">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    連續 {report.fitness.current_streak} 天訓練中！
                  </span>
                </div>
              )}
            </div>

            {/* 本週成就 */}
            {report.achievements.length > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-5 border border-yellow-100">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  本週成就
                </h2>

                <div className="space-y-2">
                  {report.achievements.map((achievement, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-white/60 rounded-xl p-3"
                    >
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-500" />
                      </div>
                      <span className="text-gray-700 font-medium">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 繼續努力 */}
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-4">繼續保持，下週會更好！</p>
              <button
                onClick={() => router.push('/my/growth')}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-full shadow-lg transition"
              >
                查看成長總覽
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">載入報告失敗</p>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
