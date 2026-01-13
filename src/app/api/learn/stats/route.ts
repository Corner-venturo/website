import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

// GET /api/learn/stats - 取得用戶學習統計
export async function GET() {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 平行查詢
    const [profileResult, reviewingResult, masteredResult, dueResult] = await Promise.all([
      // 用戶檔案統計
      supabase
        .from('learning_profiles')
        .select('total_xp, current_streak, longest_streak, words_learned')
        .eq('user_id', user.id)
        .single(),

      // 學習中的詞彙數量
      supabase
        .from('user_vocabulary_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'reviewing'),

      // 已掌握的詞彙數量
      supabase
        .from('user_vocabulary_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'mastered'),

      // 今日待複習數量
      supabase
        .from('user_vocabulary_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['learning', 'reviewing'])
        .lte('due_date', new Date().toISOString()),
    ])

    const profile = profileResult.data

    const stats = {
      total_xp: profile?.total_xp || 0,
      current_streak: profile?.current_streak || 0,
      longest_streak: profile?.longest_streak || 0,
      words_learned: profile?.words_learned || 0,
      words_reviewing: reviewingResult.count || 0,
      words_mastered: masteredResult.count || 0,
      due_today: dueResult.count || 0,
    }

    return jsonResponse(stats, { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get user stats:', error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
}
