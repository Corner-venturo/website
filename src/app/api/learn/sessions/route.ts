import { NextRequest, NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

// POST /api/learn/sessions - 開始新的學習 Session
export async function POST(request: NextRequest) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { session_type, goal_id, scenario_id } = body

    const { data: session, error } = await supabase
      .from('learning_sessions')
      .insert({
        user_id: user.id,
        session_type,
        goal_id,
        scenario_id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    logger.error('Failed to create session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

// GET /api/learn/sessions - 取得學習 Session 歷史
export async function GET(request: NextRequest) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const { data: sessions, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json(sessions || [])
  } catch (error) {
    logger.error('Failed to get sessions:', error)
    return NextResponse.json({ error: 'Failed to get sessions' }, { status: 500 })
  }
}
