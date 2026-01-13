import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

// GET /api/fitness/stats - 取得用戶健身統計
export async function GET() {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 取得統計資料
    const { data: stats } = await supabase
      .from('fitness_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // 取得本週訓練記錄
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data: weekSessions } = await supabase
      .from('workout_sessions')
      .select('workout_date, total_volume, total_sets')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('workout_date', weekAgo.toISOString().split('T')[0])

    const weeklyWorkouts = weekSessions?.length || 0
    const weeklyVolume = weekSessions?.reduce((sum, s) => sum + (s.total_volume || 0), 0) || 0

    return jsonResponse({
      total_workouts: stats?.total_workouts || 0,
      total_volume: stats?.total_volume || 0,
      total_sets: stats?.total_sets || 0,
      current_streak: stats?.current_streak || 0,
      longest_streak: stats?.longest_streak || 0,
      last_workout_date: stats?.last_workout_date || null,
      weekly_workouts: weeklyWorkouts,
      weekly_volume: weeklyVolume,
    }, { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get fitness stats:', error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
}
