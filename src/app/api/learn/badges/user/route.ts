import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

// GET /api/learn/badges/user - 取得用戶已獲得的徽章
export async function GET() {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userBadges, error } = await supabase
      .from('user_learning_badges')
      .select(`
        *,
        badge:learning_badges(*)
      `)
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })

    if (error) throw error

    return jsonResponse(userBadges || [], { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get user badges:', error)
    return NextResponse.json({ error: 'Failed to get user badges' }, { status: 500 })
  }
}
