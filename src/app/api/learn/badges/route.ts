import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

// GET /api/learn/badges - 取得所有徽章
export async function GET() {
  try {
    const supabase = getOnlineSupabase()

    const { data: badges, error } = await supabase
      .from('learning_badges')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

    return jsonResponse(badges || [], { cache: CACHE_CONFIGS.publicMedium })
  } catch (error) {
    logger.error('Failed to get badges:', error)
    return NextResponse.json({ error: 'Failed to get badges' }, { status: 500 })
  }
}
