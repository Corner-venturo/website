'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MobileNav from '@/components/MobileNav'
import { useAuthStore } from '@/stores/auth-store'
import { useLearnStore } from '@/stores/learn-store'
import type { LearningGoal } from '@/features/learn/types'

export default function GoalsPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const {
    goals,
    goalsLoading,
    fetchGoals,
    deleteGoal,
    updateGoal,
    profile,
    fetchProfile,
  } = useLearnStore()

  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

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
      fetchGoals()
    }
  }, [profile, fetchGoals])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/learn/goals')
    }
  }, [isInitialized, user, router])

  const handleDelete = async (goalId: string) => {
    await deleteGoal(goalId)
    setShowDeleteModal(null)
  }

  const handlePause = async (goal: LearningGoal) => {
    await updateGoal(goal.id, {
      status: goal.status === 'paused' ? 'active' : 'paused',
    })
  }

  const activeGoals = goals.filter((g) => g.status === 'active')
  const pausedGoals = goals.filter((g) => g.status === 'paused')
  const completedGoals = goals.filter((g) => g.status === 'completed')

  if (!isInitialized || goalsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const GoalCard = ({ goal }: { goal: LearningGoal }) => {
    const daysLeft = Math.ceil(
      (new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    const isUrgent = daysLeft <= 7 && goal.status === 'active'
    const isPaused = goal.status === 'paused'
    const isCompleted = goal.status === 'completed'

    return (
      <div
        className={`bg-white rounded-xl shadow-sm p-4 ${
          isPaused ? 'opacity-60' : ''
        } ${isUrgent ? 'border-2 border-red-200' : ''}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{goal.scenario?.icon || '📖'}</span>
            <div>
              <h3 className="font-semibold text-gray-800">
                {goal.scenario?.name_zh || '學習目標'}
              </h3>
              <p className="text-xs text-gray-500">
                目標日期：{new Date(goal.target_date).toLocaleDateString('zh-TW')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isCompleted && (
              <>
                <button
                  onClick={() => handlePause(goal)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title={isPaused ? '繼續' : '暫停'}
                >
                  {isPaused ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteModal(goal.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 進度 */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">學習進度</span>
            <span className="font-medium">{Math.round(goal.progress_percentage)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isCompleted ? 'bg-green-500' : isUrgent ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${goal.progress_percentage}%` }}
            />
          </div>
        </div>

        {/* 統計 */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            詞彙：{goal.vocabulary_learned}/{goal.vocabulary_total}
          </span>
          <span>
            句型：{goal.patterns_learned}/{goal.patterns_total}
          </span>
          <span className={isUrgent ? 'text-red-500 font-medium' : ''}>
            {isCompleted ? '已完成' : isPaused ? '已暫停' : `剩餘 ${daysLeft} 天`}
          </span>
        </div>

        {!isCompleted && !isPaused && (
          <Link
            href={`/learn/scenarios/${goal.scenario_id}`}
            className="mt-3 block w-full py-2 text-center bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition"
          >
            繼續學習
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/learn" className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">學習目標</h1>
          </div>

          <Link
            href="/learn/goals/new"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            + 新增目標
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 進行中的目標 */}
        {activeGoals.length > 0 && (
          <section>
            <h2 className="font-bold text-gray-800 mb-3">進行中 ({activeGoals.length})</h2>
            <div className="space-y-3">
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </section>
        )}

        {/* 暫停的目標 */}
        {pausedGoals.length > 0 && (
          <section>
            <h2 className="font-bold text-gray-500 mb-3">已暫停 ({pausedGoals.length})</h2>
            <div className="space-y-3">
              {pausedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </section>
        )}

        {/* 已完成的目標 */}
        {completedGoals.length > 0 && (
          <section>
            <h2 className="font-bold text-green-600 mb-3">已完成 ({completedGoals.length})</h2>
            <div className="space-y-3">
              {completedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </section>
        )}

        {goals.length === 0 && !goalsLoading && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🎯</p>
            <p className="text-gray-500 mb-4">還沒有設定學習目標</p>
            <Link
              href="/learn/goals/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              設定第一個目標
            </Link>
          </div>
        )}
      </main>

      {/* 刪除確認 Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">確定要刪除這個目標？</h3>
            <p className="text-gray-500 text-sm mb-6">刪除後將無法恢復學習進度</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  )
}
