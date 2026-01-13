'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Dumbbell, Calendar } from 'lucide-react'
import MobileNav from '@/components/MobileNav'
import { useAuthStore } from '@/stores/auth-store'

interface WorkoutSession {
  id: string
  workout_date: string
  total_volume: number
  total_sets: number
  completed: boolean
  exercises: {
    exercise_name: string
    exercise_category: string
    sets: { weight: number; reps: number; completed: boolean }[]
  }[]
}

export default function FitnessHistoryPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/fitness/history')
    }
  }, [isInitialized, user, router])

  useEffect(() => {
    if (user) {
      fetch('/api/fitness/sessions?limit=20')
        .then(res => res.json())
        .then(data => {
          setSessions(data || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [user])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateStr === today.toISOString().split('T')[0]) return '今天'
    if (dateStr === yesterday.toISOString().split('T')[0]) return '昨天'

    return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', weekday: 'short' })
  }

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">訓練記錄</h1>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">還沒有訓練記錄</p>
            <button
              onClick={() => router.push('/fitness')}
              className="text-orange-600 font-medium"
            >
              開始第一次訓練
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map(session => (
              <div key={session.id} className="bg-white rounded-2xl shadow-sm p-4">
                {/* 日期 */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4" />
                  {formatDate(session.workout_date)}
                </div>

                {/* 訓練動作 */}
                <div className="space-y-2">
                  {session.exercises.map((ex, i) => {
                    const completedSets = ex.sets.filter(s => s.completed).length
                    const maxWeight = Math.max(...ex.sets.map(s => s.weight))

                    return (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="font-medium text-gray-800">{ex.exercise_name}</span>
                        <div className="text-sm text-gray-500">
                          {completedSets} 組 · {maxWeight} kg
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 統計 */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                  <span className="text-gray-500">總容量</span>
                  <span className="font-bold text-orange-600">{session.total_volume.toLocaleString()} kg</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
