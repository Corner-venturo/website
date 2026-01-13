import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

export interface GrowthStats {
  // 學習統計
  learning: {
    total_xp: number
    weekly_xp: number
    current_streak: number
    longest_streak: number
    total_sessions: number
    weekly_sessions: number
  }
  // 健身統計
  fitness: {
    total_workouts: number
    weekly_workouts: number
    total_volume: number
    weekly_volume: number
    current_streak: number
    longest_streak: number
  }
  // 綜合統計
  combined: {
    total_streak: number // 兩者中較高的連續天數
    weekly_active_days: number // 本週活躍天數（有學習或健身）
    total_achievements: number
  }
  // 本週每日活動
  weekly_activity: {
    date: string
    has_learning: boolean
    has_fitness: boolean
    learning_xp: number
    fitness_volume: number
  }[]
}

// GET /api/my/growth - 取得用戶成長統計
export async function GET() {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]

    // 平行取得所有資料
    const [
      learningStatsResult,
      fitnessStatsResult,
      weeklyLearningResult,
      weeklyFitnessResult,
    ] = await Promise.all([
      // 學習統計
      supabase
        .from('learning_stats')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      // 健身統計
      supabase
        .from('fitness_stats')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      // 本週學習記錄
      supabase
        .from('learning_sessions')
        .select('session_date, xp_earned')
        .eq('user_id', user.id)
        .gte('session_date', weekAgoStr),
      // 本週健身記錄
      supabase
        .from('workout_sessions')
        .select('workout_date, total_volume')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('workout_date', weekAgoStr),
    ])

    const learningStats = learningStatsResult.data
    const fitnessStats = fitnessStatsResult.data
    const weeklyLearning = weeklyLearningResult.data || []
    const weeklyFitness = weeklyFitnessResult.data || []

    // 計算本週學習統計
    const weeklyLearningXp = weeklyLearning.reduce((sum, s) => sum + (s.xp_earned || 0), 0)
    const weeklyLearningSessions = weeklyLearning.length

    // 計算本週健身統計
    const weeklyFitnessWorkouts = weeklyFitness.length
    const weeklyFitnessVolume = weeklyFitness.reduce((sum, s) => sum + (s.total_volume || 0), 0)

    // 建立本週每日活動
    const weeklyActivity: GrowthStats['weekly_activity'] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayLearning = weeklyLearning.filter(s => s.session_date === dateStr)
      const dayFitness = weeklyFitness.filter(s => s.workout_date === dateStr)

      weeklyActivity.push({
        date: dateStr,
        has_learning: dayLearning.length > 0,
        has_fitness: dayFitness.length > 0,
        learning_xp: dayLearning.reduce((sum, s) => sum + (s.xp_earned || 0), 0),
        fitness_volume: dayFitness.reduce((sum, s) => sum + (s.total_volume || 0), 0),
      })
    }

    // 計算本週活躍天數
    const weeklyActiveDays = weeklyActivity.filter(
      d => d.has_learning || d.has_fitness
    ).length

    // 計算綜合連續天數 (取較高者)
    const learningStreak = learningStats?.current_streak || 0
    const fitnessStreak = fitnessStats?.current_streak || 0
    const totalStreak = Math.max(learningStreak, fitnessStreak)

    const response: GrowthStats = {
      learning: {
        total_xp: learningStats?.total_xp || 0,
        weekly_xp: weeklyLearningXp,
        current_streak: learningStreak,
        longest_streak: learningStats?.longest_streak || 0,
        total_sessions: learningStats?.total_sessions || 0,
        weekly_sessions: weeklyLearningSessions,
      },
      fitness: {
        total_workouts: fitnessStats?.total_workouts || 0,
        weekly_workouts: weeklyFitnessWorkouts,
        total_volume: fitnessStats?.total_volume || 0,
        weekly_volume: weeklyFitnessVolume,
        current_streak: fitnessStreak,
        longest_streak: fitnessStats?.longest_streak || 0,
      },
      combined: {
        total_streak: totalStreak,
        weekly_active_days: weeklyActiveDays,
        total_achievements: 0, // TODO: 整合成就系統
      },
      weekly_activity: weeklyActivity,
    }

    return jsonResponse(response, { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get growth stats:', error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
}
