import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

// GET /api/learn/stats/today - 取得今日學習統計
export async function GET() {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    // 平行查詢
    const [streakResult, profileResult] = await Promise.all([
      // 今日 streak 記錄
      supabase
        .from('learning_streaks')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single(),

      // 用戶每日目標
      supabase
        .from('learning_profiles')
        .select('daily_goal_xp, daily_goal_minutes')
        .eq('user_id', user.id)
        .single(),
    ])

    const streak = streakResult.data
    const profile = profileResult.data

    const stats = {
      xp_earned: streak?.xp_earned || 0,
      minutes_studied: streak?.minutes_studied || 0,
      words_learned: 0, // 需要從 sessions 計算
      words_reviewed: streak?.lessons_completed || 0,
      streak_maintained: streak?.streak_maintained || false,
      goal_achieved: (streak?.xp_earned || 0) >= (profile?.daily_goal_xp || 50),
    }

    return jsonResponse(stats, { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get today stats:', error)
    return NextResponse.json({ error: 'Failed to get today stats' }, { status: 500 })
  }
}
