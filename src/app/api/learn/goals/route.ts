import { NextRequest, NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

// GET /api/learn/goals - 取得用戶學習目標
export async function GET() {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: goals, error } = await supabase
      .from('learning_goals')
      .select(`
        *,
        scenario:learning_scenarios(*)
      `)
      .eq('user_id', user.id)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error

    return jsonResponse(goals || [], { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get learning goals:', error)
    return NextResponse.json({ error: 'Failed to get goals' }, { status: 500 })
  }
}

// POST /api/learn/goals - 建立學習目標
export async function POST(request: NextRequest) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { scenario_id, target_date, priority = 1, trip_id } = body

    if (!scenario_id || !target_date) {
      return NextResponse.json(
        { error: 'scenario_id and target_date are required' },
        { status: 400 }
      )
    }

    // 取得情境的詞彙和句型數量
    const { data: scenario } = await supabase
      .from('learning_scenarios')
      .select('total_vocabulary, total_patterns, total_dialogues')
      .eq('id', scenario_id)
      .single()

    const { data: goal, error } = await supabase
      .from('learning_goals')
      .insert({
        user_id: user.id,
        scenario_id,
        target_date,
        priority,
        trip_id,
        vocabulary_total: scenario?.total_vocabulary || 0,
        patterns_total: scenario?.total_patterns || 0,
        dialogues_total: scenario?.total_dialogues || 0,
      })
      .select(`
        *,
        scenario:learning_scenarios(*)
      `)
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Goal for this scenario already exists' },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    logger.error('Failed to create learning goal:', error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}
