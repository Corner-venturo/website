import { NextRequest, NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

interface RouteParams {
  params: Promise<{ sessionId: string }>
}

// PATCH /api/learn/sessions/[sessionId] - 更新 Session
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // 取得現有 session
    const { data: existing } = await supabase
      .from('learning_sessions')
      .select('started_at')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // 計算持續時間
    let duration_seconds = body.duration_seconds
    if (body.ended_at && !duration_seconds) {
      const startTime = new Date(existing.started_at).getTime()
      const endTime = new Date(body.ended_at).getTime()
      duration_seconds = Math.round((endTime - startTime) / 1000)
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'ended_at',
      'xp_earned',
      'vocabulary_reviewed',
      'vocabulary_learned',
      'exercises_completed',
      'correct_count',
      'incorrect_count',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (duration_seconds) {
      updateData.duration_seconds = duration_seconds
    }

    const { data: session, error } = await supabase
      .from('learning_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    // 如果 session 結束，更新用戶的學習時間
    if (body.ended_at && duration_seconds) {
      const minutes = Math.round(duration_seconds / 60)

      // 更新今日 streak
      const today = new Date().toISOString().split('T')[0]
      const { data: streak } = await supabase
        .from('learning_streaks')
        .select('minutes_studied')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      await supabase
        .from('learning_streaks')
        .upsert({
          user_id: user.id,
          date: today,
          minutes_studied: (streak?.minutes_studied || 0) + minutes,
          streak_maintained: true,
        }, {
          onConflict: 'user_id,date',
        })

      // 更新用戶連續天數
      await supabase.rpc('update_user_learning_streak', { p_user_id: user.id })
    }

    return NextResponse.json(session)
  } catch (error) {
    logger.error('Failed to update session:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}
