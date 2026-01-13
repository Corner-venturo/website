import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

// GET /api/learn/scenarios - 取得所有學習情境
export async function GET() {
  try {
    const supabase = getOnlineSupabase()

    const { data: scenarios, error } = await supabase
      .from('learning_scenarios')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

    return jsonResponse(scenarios, { cache: CACHE_CONFIGS.publicMedium })
  } catch (error) {
    logger.error('Failed to get learning scenarios:', error)
    return NextResponse.json({ error: 'Failed to get scenarios' }, { status: 500 })
  }
}
