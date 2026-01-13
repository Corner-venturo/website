import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

// GET /api/learn/roles - 取得所有學習角色
export async function GET() {
  try {
    const supabase = getOnlineSupabase()

    const { data: roles, error } = await supabase
      .from('learning_roles')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

    // 角色是靜態資料，可以較長時間快取
    return jsonResponse(roles, { cache: CACHE_CONFIGS.publicMedium })
  } catch (error) {
    logger.error('Failed to get learning roles:', error)
    return NextResponse.json({ error: 'Failed to get roles' }, { status: 500 })
  }
}
