import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

// GET /api/learn/tasks/daily - 取得今日每日任務
export async function GET() {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    // 取得用戶今日任務
    let { data: userTasks } = await supabase
      .from('user_daily_tasks')
      .select(`
        *,
        task:daily_tasks(*)
      `)
      .eq('user_id', user.id)
      .eq('task_date', today)

    // 如果沒有今日任務，自動分配
    if (!userTasks || userTasks.length === 0) {
      // 取得所有可用任務
      const { data: availableTasks } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('is_active', true)

      if (availableTasks && availableTasks.length > 0) {
        // 隨機選擇 3-5 個任務
        const shuffled = availableTasks.sort(() => 0.5 - Math.random())
        const selectedTasks = shuffled.slice(0, Math.min(4, shuffled.length))

        // 建立用戶任務
        const tasksToInsert = selectedTasks.map((task) => ({
          user_id: user.id,
          task_id: task.id,
          task_date: today,
          target_value: task.target_value,
          current_value: 0,
          status: 'active',
        }))

        await supabase.from('user_daily_tasks').insert(tasksToInsert)

        // 重新取得
        const { data: newTasks } = await supabase
          .from('user_daily_tasks')
          .select(`
            *,
            task:daily_tasks(*)
          `)
          .eq('user_id', user.id)
          .eq('task_date', today)

        userTasks = newTasks
      }
    }

    return jsonResponse(userTasks || [], { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get daily tasks:', error)
    return NextResponse.json({ error: 'Failed to get daily tasks' }, { status: 500 })
  }
}
