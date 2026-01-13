'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useLearnStore } from '@/stores/learn-store'

export default function NewGoalPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const {
    scenarios,
    fetchScenarios,
    createGoal,
    goals,
    fetchGoals,
    profile,
    fetchProfile,
  } = useLearnStore()

  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [targetDate, setTargetDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    }
  }, [user?.id, fetchProfile])

  useEffect(() => {
    if (profile) {
      fetchScenarios()
      fetchGoals()
    }
  }, [profile, fetchScenarios, fetchGoals])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/learn/goals/new')
    }
  }, [isInitialized, user, router])

  // 設定預設目標日期（2週後）
  useEffect(() => {
    const twoWeeksLater = new Date()
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)
    setTargetDate(twoWeeksLater.toISOString().split('T')[0])
  }, [])

  // 過濾已有目標的情境
  const existingGoalScenarioIds = goals.map((g) => g.scenario_id)
  const availableScenarios = scenarios.filter(
    (s) => !existingGoalScenarioIds.includes(s.id)
  )

  const handleSubmit = async () => {
    if (!selectedScenario || !targetDate) return

    setIsSubmitting(true)
    try {
      const goal = await createGoal({
        scenario_id: selectedScenario,
        target_date: targetDate,
      })

      if (goal) {
        router.push('/learn/goals')
      }
    } catch (error) {
      console.error('Failed to create goal:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 計算天數
  const daysUntilTarget = targetDate
    ? Math.ceil(
        (new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : 0

  // 根據選擇的情境計算每日建議時間
  const selectedScenarioData = scenarios.find((s) => s.id === selectedScenario)
  const dailyMinutes = selectedScenarioData && daysUntilTarget > 0
    ? Math.ceil((selectedScenarioData.estimated_hours * 60) / daysUntilTarget)
    : 0

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/learn/goals" className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold">設定學習目標</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 選擇情境 */}
        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4">選擇學習情境</h2>

          {availableScenarios.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              所有情境都已設定目標
            </p>
          ) : (
            <div className="space-y-2">
              {availableScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition ${
                    selectedScenario === scenario.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl">{scenario.icon || '📖'}</span>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-800">{scenario.name_zh}</p>
                    <p className="text-sm text-gray-500">
                      {scenario.total_vocabulary} 詞彙 • 約 {scenario.estimated_hours} 小時
                    </p>
                  </div>
                  {selectedScenario === scenario.id && (
                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 設定目標日期 */}
        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4">目標完成日期</h2>

          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {targetDate && daysUntilTarget > 0 && (
            <p className="mt-3 text-sm text-gray-600">
              距離目標還有 <span className="font-bold text-blue-600">{daysUntilTarget}</span> 天
            </p>
          )}

          {/* 快速選擇 */}
          <div className="mt-4 flex gap-2">
            {[
              { label: '1週', days: 7 },
              { label: '2週', days: 14 },
              { label: '1個月', days: 30 },
              { label: '2個月', days: 60 },
            ].map((option) => {
              const date = new Date()
              date.setDate(date.getDate() + option.days)
              const dateStr = date.toISOString().split('T')[0]

              return (
                <button
                  key={option.days}
                  onClick={() => setTargetDate(dateStr)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                    targetDate === dateStr
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </section>

        {/* 學習計畫預覽 */}
        {selectedScenario && targetDate && dailyMinutes > 0 && (
          <section className="bg-blue-50 rounded-xl p-5">
            <h3 className="font-bold text-blue-800 mb-3">學習計畫預覽</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p>
                📚 需學習 <strong>{selectedScenarioData?.total_vocabulary}</strong> 個詞彙
              </p>
              <p>
                ⏰ 建議每天學習 <strong>{dailyMinutes}</strong> 分鐘
              </p>
              <p>
                📅 預計在 <strong>{new Date(targetDate).toLocaleDateString('zh-TW')}</strong> 前完成
              </p>
            </div>
          </section>
        )}

        {/* 提交按鈕 */}
        <button
          onClick={handleSubmit}
          disabled={!selectedScenario || !targetDate || isSubmitting}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '建立中...' : '建立學習目標'}
        </button>
      </main>
    </div>
  )
}
