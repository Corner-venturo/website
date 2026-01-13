import { NextRequest, NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

interface RouteParams {
  params: Promise<{ taskId: string }>
}

// POST /api/learn/tasks/[taskId]/claim - 領取任務獎勵
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { taskId } = await params
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 取得任務
    const { data: userTask, error: fetchError } = await supabase
      .from('user_daily_tasks')
      .select(`
        *,
        task:daily_tasks(*)
      `)
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !userTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // 檢查是否已完成
    if (userTask.status !== 'completed') {
      return NextResponse.json({ error: 'Task not completed' }, { status: 400 })
    }

    // 檢查是否已領取
    if (userTask.reward_claimed) {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 })
    }

    const xpReward = userTask.task?.xp_reward || 10
    const now = new Date().toISOString()

    // 更新任務為已領取
    await supabase
      .from('user_daily_tasks')
      .update({
        reward_claimed: true,
        reward_claimed_at: now,
      })
      .eq('id', taskId)

    // 增加用戶 XP - 先取得當前 XP，再更新
    const { data: currentProfile } = await supabase
      .from('learning_profiles')
      .select('total_xp')
      .eq('user_id', user.id)
      .single()

    await supabase
      .from('learning_profiles')
      .update({
        total_xp: (currentProfile?.total_xp || 0) + xpReward,
        updated_at: now,
      })
      .eq('user_id', user.id)

    // 更新今日 streak XP
    const today = now.split('T')[0]
    const { data: streak } = await supabase
      .from('learning_streaks')
      .select('xp_earned')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    await supabase
      .from('learning_streaks')
      .upsert({
        user_id: user.id,
        date: today,
        xp_earned: (streak?.xp_earned || 0) + xpReward,
      }, {
        onConflict: 'user_id,date',
      })

    return NextResponse.json({
      success: true,
      xp_earned: xpReward,
    })
  } catch (error) {
    logger.error('Failed to claim task reward:', error)
    return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 })
  }
}
