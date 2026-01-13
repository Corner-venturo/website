import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

export interface WeeklyReport {
  period: {
    start: string
    end: string
  }
  summary: {
    total_active_days: number
    total_xp: number
    total_workouts: number
    total_volume: number
    best_day: string | null
  }
  learning: {
    sessions: number
    xp_earned: number
    streak_maintained: boolean
    current_streak: number
    improvement: number // 比上週增減百分比
  }
  fitness: {
    workouts: number
    volume: number
    sets: number
    streak_maintained: boolean
    current_streak: number
    improvement: number // 比上週增減百分比
  }
  daily_breakdown: {
    date: string
    day_name: string
    learning_xp: number
    fitness_volume: number
    has_activity: boolean
  }[]
  achievements: string[] // 本週達成的成就
  friends_comparison: {
    rank: number
    total: number
    percentile: number
  } | null
}

// GET /api/my/weekly-report - 取得本週報告
export async function GET() {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 計算本週和上週範圍
    const today = new Date()
    const dayOfWeek = today.getDay()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - dayOfWeek)
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const lastWeekStart = new Date(weekStart)
    lastWeekStart.setDate(weekStart.getDate() - 7)

    const lastWeekEnd = new Date(weekStart)
    lastWeekEnd.setDate(weekStart.getDate() - 1)

    const weekStartStr = weekStart.toISOString().split('T')[0]
    const weekEndStr = weekEnd.toISOString().split('T')[0]
    const lastWeekStartStr = lastWeekStart.toISOString().split('T')[0]
    const lastWeekEndStr = lastWeekEnd.toISOString().split('T')[0]

    // 平行取得所有資料
    const [
      learningStatsResult,
      fitnessStatsResult,
      thisWeekLearningResult,
      lastWeekLearningResult,
      thisWeekFitnessResult,
      lastWeekFitnessResult,
    ] = await Promise.all([
      supabase.from('learning_stats').select('current_streak').eq('user_id', user.id).single(),
      supabase.from('fitness_stats').select('current_streak').eq('user_id', user.id).single(),
      supabase.from('learning_sessions').select('session_date, xp_earned').eq('user_id', user.id).gte('session_date', weekStartStr).lte('session_date', weekEndStr),
      supabase.from('learning_sessions').select('session_date, xp_earned').eq('user_id', user.id).gte('session_date', lastWeekStartStr).lte('session_date', lastWeekEndStr),
      supabase.from('workout_sessions').select('workout_date, total_volume, total_sets').eq('user_id', user.id).eq('completed', true).gte('workout_date', weekStartStr).lte('workout_date', weekEndStr),
      supabase.from('workout_sessions').select('workout_date, total_volume, total_sets').eq('user_id', user.id).eq('completed', true).gte('workout_date', lastWeekStartStr).lte('workout_date', lastWeekEndStr),
    ])

    const thisWeekLearning = thisWeekLearningResult.data || []
    const lastWeekLearning = lastWeekLearningResult.data || []
    const thisWeekFitness = thisWeekFitnessResult.data || []
    const lastWeekFitness = lastWeekFitnessResult.data || []

    // 本週學習統計
    const thisWeekXp = thisWeekLearning.reduce((sum, s) => sum + (s.xp_earned || 0), 0)
    const lastWeekXp = lastWeekLearning.reduce((sum, s) => sum + (s.xp_earned || 0), 0)
    const learningImprovement = lastWeekXp > 0 ? Math.round(((thisWeekXp - lastWeekXp) / lastWeekXp) * 100) : 0

    // 本週健身統計
    const thisWeekVolume = thisWeekFitness.reduce((sum, s) => sum + (s.total_volume || 0), 0)
    const lastWeekVolume = lastWeekFitness.reduce((sum, s) => sum + (s.total_volume || 0), 0)
    const thisWeekSets = thisWeekFitness.reduce((sum, s) => sum + (s.total_sets || 0), 0)
    const fitnessImprovement = lastWeekVolume > 0 ? Math.round(((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100) : 0

    // 每日明細
    const dayNames = ['日', '一', '二', '三', '四', '五', '六']
    const dailyBreakdown: WeeklyReport['daily_breakdown'] = []

    for (let i = 0; i <= 6; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]

      const dayLearning = thisWeekLearning.filter(s => s.session_date === dateStr)
      const dayFitness = thisWeekFitness.filter(s => s.workout_date === dateStr)

      dailyBreakdown.push({
        date: dateStr,
        day_name: dayNames[date.getDay()],
        learning_xp: dayLearning.reduce((sum, s) => sum + (s.xp_earned || 0), 0),
        fitness_volume: dayFitness.reduce((sum, s) => sum + (s.total_volume || 0), 0),
        has_activity: dayLearning.length > 0 || dayFitness.length > 0,
      })
    }

    // 活躍天數
    const activeDays = dailyBreakdown.filter(d => d.has_activity).length

    // 找出最佳日
    const bestDay = dailyBreakdown.reduce((best, day) => {
      const score = day.learning_xp + day.fitness_volume * 0.1
      const bestScore = best ? best.learning_xp + best.fitness_volume * 0.1 : 0
      return score > bestScore ? day : best
    }, null as WeeklyReport['daily_breakdown'][0] | null)

    // 成就檢查
    const achievements: string[] = []
    if (activeDays >= 7) achievements.push('完美週：每天都有活動！')
    if (activeDays >= 5) achievements.push('活力滿滿：本週活躍 5 天以上')
    if (thisWeekXp >= 1000) achievements.push('學霸：本週獲得 1000+ XP')
    if (thisWeekFitness.length >= 4) achievements.push('健身達人：本週訓練 4 次以上')
    if (learningImprovement >= 20) achievements.push('進步神速：學習比上週提升 20%+')
    if (fitnessImprovement >= 20) achievements.push('突破自我：訓練量比上週提升 20%+')

    const report: WeeklyReport = {
      period: {
        start: weekStartStr,
        end: weekEndStr,
      },
      summary: {
        total_active_days: activeDays,
        total_xp: thisWeekXp,
        total_workouts: thisWeekFitness.length,
        total_volume: Math.round(thisWeekVolume),
        best_day: bestDay?.date || null,
      },
      learning: {
        sessions: thisWeekLearning.length,
        xp_earned: thisWeekXp,
        streak_maintained: (learningStatsResult.data?.current_streak || 0) > 0,
        current_streak: learningStatsResult.data?.current_streak || 0,
        improvement: learningImprovement,
      },
      fitness: {
        workouts: thisWeekFitness.length,
        volume: Math.round(thisWeekVolume),
        sets: thisWeekSets,
        streak_maintained: (fitnessStatsResult.data?.current_streak || 0) > 0,
        current_streak: fitnessStatsResult.data?.current_streak || 0,
        improvement: fitnessImprovement,
      },
      daily_breakdown: dailyBreakdown,
      achievements,
      friends_comparison: null, // TODO: 加入好友比較
    }

    return jsonResponse(report, { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get weekly report:', error)
    return NextResponse.json({ error: 'Failed to get report' }, { status: 500 })
  }
}
