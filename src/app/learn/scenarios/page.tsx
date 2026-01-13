'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MobileNav from '@/components/MobileNav'
import { useAuthStore } from '@/stores/auth-store'
import { useLearnStore } from '@/stores/learn-store'
import type { LearningScenario, ScenarioCategory } from '@/features/learn/types'

const categoryLabels: Record<ScenarioCategory, { name: string; icon: string }> = {
  dining: { name: '餐飲', icon: '🍽️' },
  accommodation: { name: '住宿', icon: '🏨' },
  transport: { name: '交通', icon: '🚃' },
  shopping: { name: '購物', icon: '🛍️' },
  emergency: { name: '緊急', icon: '🚨' },
}

export default function ScenariosPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const { scenarios, scenariosLoading, fetchScenarios, goals, fetchGoals, profile, fetchProfile } = useLearnStore()

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
      router.push('/login?redirect=/learn/scenarios')
    }
  }, [isInitialized, user, router])

  // 按分類分組情境
  const groupedScenarios = scenarios.reduce((acc, scenario) => {
    const category = scenario.category as ScenarioCategory
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(scenario)
    return acc
  }, {} as Record<ScenarioCategory, LearningScenario[]>)

  // 檢查是否已有此情境的目標
  const hasGoal = (scenarioId: string) => {
    return goals.some((g) => g.scenario_id === scenarioId)
  }

  const getGoalProgress = (scenarioId: string) => {
    const goal = goals.find((g) => g.scenario_id === scenarioId)
    return goal?.progress_percentage || 0
  }

  if (!isInitialized || scenariosLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/learn" className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold">學習情境</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {Object.entries(groupedScenarios).map(([category, categoryScenarios]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{categoryLabels[category as ScenarioCategory]?.icon}</span>
              <h2 className="font-bold text-gray-800">
                {categoryLabels[category as ScenarioCategory]?.name}
              </h2>
            </div>

            <div className="space-y-3">
              {categoryScenarios.map((scenario) => {
                const hasExistingGoal = hasGoal(scenario.id)
                const progress = getGoalProgress(scenario.id)

                return (
                  <Link
                    key={scenario.id}
                    href={`/learn/scenarios/${scenario.id}`}
                    className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{scenario.icon || '📖'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800">{scenario.name_zh}</h3>
                          {scenario.is_premium && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                              進階
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {scenario.description_zh}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>難度 {'⭐'.repeat(scenario.difficulty)}</span>
                          <span>{scenario.total_vocabulary} 詞彙</span>
                          <span>約 {scenario.estimated_hours} 小時</span>
                        </div>

                        {hasExistingGoal && (
                          <div className="mt-2">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-green-600 mt-1">
                              學習中 - {Math.round(progress)}%
                            </p>
                          </div>
                        )}
                      </div>

                      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {scenarios.length === 0 && !scenariosLoading && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">📚</p>
            <p>暫無學習情境</p>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
