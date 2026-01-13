import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

export interface WorkoutSet {
  id?: string
  set_number: number
  weight: number
  reps: number
  completed: boolean
}

export interface WorkoutExercise {
  id?: string
  exercise_id: number
  exercise_name: string
  exercise_category: string
  order_index: number
  sets: WorkoutSet[]
}

export interface WorkoutSession {
  id?: string
  user_id?: string
  workout_date: string
  duration_minutes?: number
  total_volume: number
  total_sets: number
  notes?: string
  completed: boolean
  exercises: WorkoutExercise[]
  created_at?: string
}

// GET /api/fitness/sessions - 取得用戶的訓練記錄
export async function GET(request: Request) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 取得訓練記錄
    const { data: sessions, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        exercises:workout_exercises(
          *,
          sets:workout_sets(*)
        )
      `)
      .eq('user_id', user.id)
      .order('workout_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return jsonResponse(sessions || [], { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get workout sessions:', error)
    return NextResponse.json({ error: 'Failed to get sessions' }, { status: 500 })
  }
}

// POST /api/fitness/sessions - 建立或更新訓練記錄
export async function POST(request: Request) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: WorkoutSession = await request.json()

    // 計算總容量和總組數
    let totalVolume = 0
    let totalSets = 0
    body.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed) {
          totalVolume += set.weight * set.reps
          totalSets += 1
        }
      })
    })

    // 建立或更新 session
    const sessionData = {
      user_id: user.id,
      workout_date: body.workout_date || new Date().toISOString().split('T')[0],
      duration_minutes: body.duration_minutes,
      total_volume: totalVolume,
      total_sets: totalSets,
      notes: body.notes,
      completed: body.completed,
      updated_at: new Date().toISOString(),
    }

    let sessionId = body.id

    if (sessionId) {
      // 更新現有 session
      const { error: updateError } = await supabase
        .from('workout_sessions')
        .update(sessionData)
        .eq('id', sessionId)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // 刪除舊的 exercises 和 sets
      await supabase
        .from('workout_exercises')
        .delete()
        .eq('session_id', sessionId)
    } else {
      // 建立新 session
      const { data: newSession, error: insertError } = await supabase
        .from('workout_sessions')
        .insert(sessionData)
        .select()
        .single()

      if (insertError) throw insertError
      sessionId = newSession.id
    }

    // 建立 exercises 和 sets
    for (let i = 0; i < body.exercises.length; i++) {
      const ex = body.exercises[i]

      const { data: newExercise, error: exError } = await supabase
        .from('workout_exercises')
        .insert({
          session_id: sessionId,
          exercise_id: ex.exercise_id,
          exercise_name: ex.exercise_name,
          exercise_category: ex.exercise_category,
          order_index: i,
        })
        .select()
        .single()

      if (exError) throw exError

      // 建立 sets
      const setsData = ex.sets.map((set, idx) => ({
        workout_exercise_id: newExercise.id,
        set_number: idx + 1,
        weight: set.weight,
        reps: set.reps,
        completed: set.completed,
      }))

      if (setsData.length > 0) {
        const { error: setsError } = await supabase
          .from('workout_sets')
          .insert(setsData)

        if (setsError) throw setsError
      }
    }

    // 更新統計
    await updateFitnessStats(supabase, user.id)

    return NextResponse.json({ id: sessionId, success: true })
  } catch (error) {
    logger.error('Failed to save workout session:', error)
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 })
  }
}

// 更新健身統計
async function updateFitnessStats(supabase: ReturnType<typeof getOnlineSupabase>, userId: string) {
  try {
    // 計算統計數據
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('workout_date, total_volume, total_sets, completed')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('workout_date', { ascending: false })

    if (!sessions || sessions.length === 0) return

    const totalWorkouts = sessions.length
    const totalVolume = sessions.reduce((sum, s) => sum + (s.total_volume || 0), 0)
    const totalSets = sessions.reduce((sum, s) => sum + (s.total_sets || 0), 0)
    const lastWorkoutDate = sessions[0].workout_date

    // 計算連續天數
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < sessions.length; i++) {
      const sessionDate = new Date(sessions[i].workout_date)
      sessionDate.setHours(0, 0, 0, 0)

      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)

      if (sessionDate.getTime() === expectedDate.getTime()) {
        currentStreak++
      } else if (i === 0 && (today.getTime() - sessionDate.getTime()) <= 86400000) {
        // 昨天有訓練也算
        currentStreak++
      } else {
        break
      }
    }

    // 更新或建立統計
    const { data: existing } = await supabase
      .from('fitness_stats')
      .select('id, longest_streak')
      .eq('user_id', userId)
      .single()

    const longestStreak = Math.max(currentStreak, existing?.longest_streak || 0)

    const statsData = {
      user_id: userId,
      total_workouts: totalWorkouts,
      total_volume: totalVolume,
      total_sets: totalSets,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_workout_date: lastWorkoutDate,
      updated_at: new Date().toISOString(),
    }

    if (existing) {
      await supabase
        .from('fitness_stats')
        .update(statsData)
        .eq('id', existing.id)
    } else {
      await supabase
        .from('fitness_stats')
        .insert(statsData)
    }
  } catch (error) {
    logger.error('Failed to update fitness stats:', error)
  }
}
