import { NextRequest, NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

// POST /api/learn/vocabulary/learn - 學習新詞彙
export async function POST(request: NextRequest) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vocabulary_id, scenario_id } = body

    if (!vocabulary_id) {
      return NextResponse.json({ error: 'vocabulary_id is required' }, { status: 400 })
    }

    // 檢查是否已經學過
    const { data: existing } = await supabase
      .from('user_vocabulary_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('vocabulary_id', vocabulary_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already learned this word' }, { status: 400 })
    }

    const now = new Date()
    // 新詞彙第一次複習設定在 10 分鐘後
    const dueDate = new Date(now.getTime() + 10 * 60 * 1000)

    // 建立新的進度記錄
    const { data: progress, error } = await supabase
      .from('user_vocabulary_progress')
      .insert({
        user_id: user.id,
        vocabulary_id,
        status: 'learning',
        stability: 1,
        difficulty: 0.3,
        due_date: dueDate.toISOString(),
        learned_in_scenario_id: scenario_id,
        first_seen_at: now.toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // 更新 profile 的 words_learned
    await supabase
      .from('learning_profiles')
      .update({
        words_learned: supabase.rpc('increment_words_learned'),
        updated_at: now.toISOString(),
      })
      .eq('user_id', user.id)

    // 簡單更新 words_learned (因為 RPC 可能不存在)
    const { data: profile } = await supabase
      .from('learning_profiles')
      .select('words_learned')
      .eq('user_id', user.id)
      .single()

    await supabase
      .from('learning_profiles')
      .update({
        words_learned: (profile?.words_learned || 0) + 1,
        updated_at: now.toISOString(),
      })
      .eq('user_id', user.id)

    // 如果有關聯的目標，更新進度
    if (scenario_id) {
      const { data: goal } = await supabase
        .from('learning_goals')
        .select('id, vocabulary_learned, vocabulary_total')
        .eq('user_id', user.id)
        .eq('scenario_id', scenario_id)
        .eq('status', 'active')
        .single()

      if (goal) {
        const newLearned = (goal.vocabulary_learned || 0) + 1
        const progress = goal.vocabulary_total
          ? Math.round((newLearned / goal.vocabulary_total) * 100)
          : 0

        await supabase
          .from('learning_goals')
          .update({
            vocabulary_learned: newLearned,
            progress_percentage: progress,
            last_studied_at: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('id', goal.id)
      }
    }

    const xpEarned = 15 // 學習新詞彙的 XP

    // 更新今日 streak 記錄
    const today = now.toISOString().split('T')[0]
    await supabase
      .from('learning_streaks')
      .upsert(
        {
          user_id: user.id,
          date: today,
          xp_earned: xpEarned,
          lessons_completed: 1,
        },
        {
          onConflict: 'user_id,date',
        }
      )

    return NextResponse.json({
      success: true,
      progress,
      xp_earned: xpEarned,
      first_review: dueDate.toISOString(),
    })
  } catch (error) {
    logger.error('Failed to learn vocabulary:', error)
    return NextResponse.json({ error: 'Failed to learn vocabulary' }, { status: 500 })
  }
}
