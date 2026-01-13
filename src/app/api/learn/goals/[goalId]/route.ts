import { NextRequest, NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

interface RouteParams {
  params: Promise<{ goalId: string }>
}

// GET /api/learn/goals/[goalId] - 取得單一目標
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { goalId } = await params
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: goal, error } = await supabase
      .from('learning_goals')
      .select(`
        *,
        scenario:learning_scenarios(*)
      `)
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(goal)
  } catch (error) {
    logger.error('Failed to get learning goal:', error)
    return NextResponse.json({ error: 'Failed to get goal' }, { status: 500 })
  }
}

// PATCH /api/learn/goals/[goalId] - 更新目標
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { goalId } = await params
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const allowedFields = [
      'target_date',
      'priority',
      'status',
      'progress_percentage',
      'vocabulary_learned',
      'patterns_learned',
      'dialogues_completed',
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // 如果狀態改為 completed，設定完成時間
    if (updateData.status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    updateData.updated_at = new Date().toISOString()

    const { data: goal, error } = await supabase
      .from('learning_goals')
      .update(updateData)
      .eq('id', goalId)
      .eq('user_id', user.id)
      .select(`
        *,
        scenario:learning_scenarios(*)
      `)
      .single()

    if (error) throw error

    return NextResponse.json(goal)
  } catch (error) {
    logger.error('Failed to update learning goal:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}

// DELETE /api/learn/goals/[goalId] - 刪除目標
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { goalId } = await params
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('learning_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to delete learning goal:', error)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}
