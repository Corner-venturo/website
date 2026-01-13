'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Check, Save, Dumbbell, History, Flame, Trophy } from 'lucide-react'
import MobileNav from '@/components/MobileNav'
import { useAuthStore } from '@/stores/auth-store'
import { EXERCISES, MUSCLE_GROUPS } from '@/data/fitness/exercises'

interface WorkoutSet {
  setNumber: number
  weight: number
  reps: number
  completed: boolean
}

interface WorkoutExercise {
  exerciseId: number
  exerciseName: string
  exerciseCategory: string
  sets: WorkoutSet[]
}

interface FitnessStats {
  current_streak: number
  weekly_workouts: number
  weekly_volume: number
  total_workouts: number
}

export default function FitnessPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [stats, setStats] = useState<FitnessStats | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/fitness')
    }
  }, [isInitialized, user, router])

  useEffect(() => {
    if (user) {
      fetch('/api/fitness/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(() => {})
    }
  }, [user])

  const addExercise = (exerciseId: number, exerciseName: string, category: string) => {
    setWorkoutExercises([
      ...workoutExercises,
      {
        exerciseId,
        exerciseName,
        exerciseCategory: category,
        sets: [
          { setNumber: 1, weight: 0, reps: 0, completed: false },
          { setNumber: 2, weight: 0, reps: 0, completed: false },
          { setNumber: 3, weight: 0, reps: 0, completed: false },
        ],
      },
    ])
    setShowExercisePicker(false)
    setSelectedCategory(null)
  }

  const removeExercise = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index))
  }

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps' | 'completed',
    value: number | boolean
  ) => {
    const updated = [...workoutExercises]
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: value,
    }
    setWorkoutExercises(updated)
  }

  const addSet = (exerciseIndex: number) => {
    const updated = [...workoutExercises]
    const currentSets = updated[exerciseIndex].sets
    updated[exerciseIndex].sets = [
      ...currentSets,
      {
        setNumber: currentSets.length + 1,
        weight: currentSets[currentSets.length - 1]?.weight || 0,
        reps: currentSets[currentSets.length - 1]?.reps || 0,
        completed: false,
      },
    ]
    setWorkoutExercises(updated)
  }

  const calculateTotalVolume = () => {
    return workoutExercises.reduce((total, exercise) => {
      const exerciseVolume = exercise.sets.reduce((sum, set) => {
        return set.completed ? sum + set.weight * set.reps : sum
      }, 0)
      return total + exerciseVolume
    }, 0)
  }

  const saveWorkout = async () => {
    if (workoutExercises.length === 0) return

    setSaving(true)
    try {
      const response = await fetch('/api/fitness/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workout_date: new Date().toISOString().split('T')[0],
          completed: true,
          exercises: workoutExercises.map((ex, i) => ({
            exercise_id: ex.exerciseId,
            exercise_name: ex.exerciseName,
            exercise_category: ex.exerciseCategory,
            order_index: i,
            sets: ex.sets,
          })),
        }),
      })

      if (response.ok) {
        setWorkoutExercises([])
        // 重新載入統計
        const statsRes = await fetch('/api/fitness/stats')
        setStats(await statsRes.json())
        alert('訓練已儲存！')
      }
    } catch {
      alert('儲存失敗，請重試')
    } finally {
      setSaving(false)
    }
  }

  const filteredExercises = selectedCategory
    ? EXERCISES.filter(ex => ex.category === selectedCategory)
    : EXERCISES

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-orange-500" />
            <h1 className="text-xl font-bold">健身記錄</h1>
          </div>
          <button
            onClick={() => router.push('/fitness/history')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <History className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 統計卡片 */}
        {stats && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-500">{stats.current_streak}</span>
                </div>
                <p className="text-xs text-gray-500">連續天數</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.weekly_workouts}</div>
                <p className="text-xs text-gray-500">本週訓練</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {stats.weekly_volume >= 1000
                    ? `${(stats.weekly_volume / 1000).toFixed(1)}k`
                    : stats.weekly_volume}
                </div>
                <p className="text-xs text-gray-500">本週容量 kg</p>
              </div>
            </div>
          </div>
        )}

        {/* 訓練部位選擇 */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            選擇訓練部位
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {MUSCLE_GROUPS.map(group => (
              <button
                key={group.id}
                onClick={() => {
                  setSelectedCategory(group.id)
                  setShowExercisePicker(true)
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-gray-100 hover:border-orange-300 hover:bg-orange-50 transition"
                style={{ backgroundColor: group.color + '30' }}
              >
                <span className="text-2xl mb-1">
                  {group.id === 'chest' && '💪'}
                  {group.id === 'back' && '🔙'}
                  {group.id === 'legs' && '🦵'}
                  {group.id === 'shoulders' && '🤷'}
                  {group.id === 'arms' && '💪'}
                  {group.id === 'core' && '🔥'}
                  {group.id === 'cardio' && '🏃'}
                </span>
                <span className="text-xs font-medium text-gray-700">{group.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 今日訓練 */}
        {workoutExercises.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500">今日訓練</h2>

            {workoutExercises.map((exercise, exerciseIndex) => (
              <div key={exerciseIndex} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{exercise.exerciseName}</h3>
                  <button
                    onClick={() => removeExercise(exerciseIndex)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* 組數 */}
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 font-medium">
                    <div className="text-center">組</div>
                    <div className="text-center">重量</div>
                    <div className="text-center">次數</div>
                    <div className="text-center">完成</div>
                  </div>

                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="grid grid-cols-4 gap-2 items-center">
                      <div className="text-center font-medium text-gray-600">{set.setNumber}</div>
                      <input
                        type="number"
                        value={set.weight || ''}
                        onChange={e => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm text-center focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                        placeholder="kg"
                      />
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={e => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm text-center focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                        placeholder="次"
                      />
                      <button
                        onClick={() => updateSet(exerciseIndex, setIndex, 'completed', !set.completed)}
                        className="flex justify-center"
                      >
                        {set.completed ? (
                          <Check className="w-6 h-6 text-green-500" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addSet(exerciseIndex)}
                  className="w-full mt-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition"
                >
                  + 新增組數
                </button>
              </div>
            ))}

            {/* 統計 */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">總容量</span>
                <span className="font-bold text-orange-600">{calculateTotalVolume().toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">完成組數</span>
                <span className="font-medium">
                  {workoutExercises.reduce((t, e) => t + e.sets.filter(s => s.completed).length, 0)} 組
                </span>
              </div>
            </div>

            {/* 儲存按鈕 */}
            <button
              onClick={saveWorkout}
              disabled={saving}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  完成訓練
                </>
              )}
            </button>
          </div>
        )}

        {/* 新增動作按鈕 */}
        {workoutExercises.length === 0 && (
          <button
            onClick={() => setShowExercisePicker(true)}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-orange-400 hover:text-orange-500 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            開始今日訓練
          </button>
        )}
      </main>

      {/* 動作選擇彈窗 */}
      {showExercisePicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[80vh] rounded-t-3xl overflow-hidden">
            <div className="sticky top-0 bg-white border-b px-4 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">選擇訓練動作</h2>
                <button
                  onClick={() => {
                    setShowExercisePicker(false)
                    setSelectedCategory(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 分類篩選 */}
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    !selectedCategory ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  全部
                </button>
                {MUSCLE_GROUPS.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedCategory(group.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                      selectedCategory === group.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
              {filteredExercises.map(exercise => (
                <button
                  key={exercise.id}
                  onClick={() => addExercise(exercise.id, exercise.name, exercise.category)}
                  className="w-full p-4 text-left bg-gray-50 hover:bg-orange-50 rounded-xl transition"
                >
                  <span className="font-medium">{exercise.name}</span>
                  {exercise.equipment && (
                    <span className="text-xs text-gray-400 ml-2">{exercise.equipment}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  )
}
