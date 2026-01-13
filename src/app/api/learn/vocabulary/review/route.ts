import { NextRequest, NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

// FSRS-4.5 簡化實作
function calculateFSRS(
  stability: number,
  difficulty: number,
  rating: 1 | 2 | 3 | 4
): { newStability: number; newDifficulty: number; intervalDays: number } {
  let newStability: number
  let newDifficulty: number
  let intervalDays: number

  if (rating === 1) {
    // Again - 完全忘記
    newStability = Math.max(stability * 0.2, 0.1)
    newDifficulty = Math.min(difficulty + 0.2, 1)
    intervalDays = 1
  } else if (rating === 2) {
    // Hard - 困難回想
    newStability = stability * 1.2
    newDifficulty = Math.min(difficulty + 0.1, 1)
    intervalDays = Math.max(Math.round(newStability * 0.8), 1)
  } else if (rating === 3) {
    // Good - 正常回想
    newStability = stability * 2.5
    newDifficulty = difficulty
    intervalDays = Math.max(Math.round(newStability), 1)
  } else {
    // Easy - 輕鬆回想
    newStability = stability * 3.5
    newDifficulty = Math.max(difficulty - 0.1, 0)
    intervalDays = Math.max(Math.round(newStability * 1.3), 1)
  }

  return { newStability, newDifficulty, intervalDays }
}

// POST /api/learn/vocabulary/review - 記錄詞彙複習結果
export async function POST(request: NextRequest) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vocabulary_id, rating } = body

    if (!vocabulary_id || !rating || rating < 1 || rating > 4) {
      return NextResponse.json(
        { error: 'vocabulary_id and rating (1-4) are required' },
        { status: 400 }
      )
    }

    // 取得當前進度
    const { data: currentProgress } = await supabase
      .from('user_vocabulary_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('vocabulary_id', vocabulary_id)
      .single()

    // 計算新的 FSRS 參數
    const currentStability = currentProgress?.stability || 1
    const currentDifficulty = currentProgress?.difficulty || 0.3
    const { newStability, newDifficulty, intervalDays } = calculateFSRS(
      currentStability,
      currentDifficulty,
      rating as 1 | 2 | 3 | 4
    )

    const now = new Date()
    const dueDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000)

    // 更新或建立進度
    const isCorrect = rating >= 3
    const xpEarned = isCorrect ? 10 : 5

    if (currentProgress) {
      // 更新現有進度
      const newReps = currentProgress.reps + 1
      const newStatus = newReps > 5 && isCorrect ? 'mastered' : 'reviewing'

      await supabase
        .from('user_vocabulary_progress')
        .update({
          status: newStatus,
          stability: newStability,
          difficulty: newDifficulty,
          due_date: dueDate.toISOString(),
          last_review: now.toISOString(),
          reps: newReps,
          lapses: currentProgress.lapses + (rating === 1 ? 1 : 0),
          correct_count: currentProgress.correct_count + (isCorrect ? 1 : 0),
          incorrect_count: currentProgress.incorrect_count + (isCorrect ? 0 : 1),
          mastered_at: newStatus === 'mastered' ? now.toISOString() : currentProgress.mastered_at,
          updated_at: now.toISOString(),
        })
        .eq('id', currentProgress.id)
    } else {
      // 建立新進度
      await supabase.from('user_vocabulary_progress').insert({
        user_id: user.id,
        vocabulary_id,
        status: 'learning',
        stability: newStability,
        difficulty: newDifficulty,
        due_date: dueDate.toISOString(),
        last_review: now.toISOString(),
        reps: 1,
        lapses: rating === 1 ? 1 : 0,
        correct_count: isCorrect ? 1 : 0,
        incorrect_count: isCorrect ? 0 : 1,
      })
    }

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

    // 更新 profile XP
    await supabase.rpc('add_user_xp', {
      p_user_id: user.id,
      p_xp_amount: xpEarned,
    })

    // 檢查並頒發徽章
    const { data: newBadges } = await supabase.rpc('check_and_award_badges', {
      p_user_id: user.id,
    })

    return NextResponse.json({
      success: true,
      xp_earned: xpEarned,
      next_review: dueDate.toISOString(),
      interval_days: intervalDays,
      new_badges: newBadges || [],
    })
  } catch (error) {
    logger.error('Failed to record vocabulary review:', error)
    return NextResponse.json({ error: 'Failed to record review' }, { status: 500 })
  }
}
