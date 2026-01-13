import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

export interface IntegratedLeaderboardEntry {
  user_id: string
  display_name: string
  avatar_url: string | null
  rank: number
  score: number // 綜合分數
  weekly_xp: number
  weekly_workouts: number
  weekly_volume: number
  learning_streak: number
  fitness_streak: number
  is_me: boolean
}

// GET /api/friends/leaderboard - 取得好友綜合排行榜
export async function GET() {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 取得好友列表
    const { data: friendships } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', user.id)
      .eq('status', 'accepted')

    const friendIds = friendships?.map(f => f.friend_id) || []
    const allUserIds = [user.id, ...friendIds]

    if (allUserIds.length === 0) {
      return jsonResponse({
        leaderboard: [],
        my_rank: null,
        total_friends: 0,
      }, { cache: CACHE_CONFIGS.privateShort })
    }

    // 計算本週範圍
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]

    // 平行取得所有資料
    const [profilesResult, learningStatsResult, fitnessStatsResult, weeklyLearningResult, weeklyFitnessResult] = await Promise.all([
      // 用戶資料
      supabase
        .from('profiles')
        .select('id, display_name, full_name, avatar_url')
        .in('id', allUserIds),
      // 學習統計
      supabase
        .from('learning_stats')
        .select('user_id, current_streak')
        .in('user_id', allUserIds),
      // 健身統計
      supabase
        .from('fitness_stats')
        .select('user_id, current_streak')
        .in('user_id', allUserIds),
      // 本週學習
      supabase
        .from('learning_sessions')
        .select('user_id, xp_earned')
        .in('user_id', allUserIds)
        .gte('session_date', weekAgoStr),
      // 本週健身
      supabase
        .from('workout_sessions')
        .select('user_id, total_volume')
        .in('user_id', allUserIds)
        .eq('completed', true)
        .gte('workout_date', weekAgoStr),
    ])

    const profiles = profilesResult.data || []
    const learningStats = learningStatsResult.data || []
    const fitnessStats = fitnessStatsResult.data || []
    const weeklyLearning = weeklyLearningResult.data || []
    const weeklyFitness = weeklyFitnessResult.data || []

    // 計算每個用戶的綜合分數
    const userScores: IntegratedLeaderboardEntry[] = allUserIds.map(userId => {
      const profile = profiles.find(p => p.id === userId)
      const learningS = learningStats.find(s => s.user_id === userId)
      const fitnessS = fitnessStats.find(s => s.user_id === userId)

      // 本週 XP
      const weeklyXp = weeklyLearning
        .filter(s => s.user_id === userId)
        .reduce((sum, s) => sum + (s.xp_earned || 0), 0)

      // 本週訓練次數與容量
      const userWorkouts = weeklyFitness.filter(s => s.user_id === userId)
      const weeklyWorkouts = userWorkouts.length
      const weeklyVolume = userWorkouts.reduce((sum, s) => sum + (s.total_volume || 0), 0)

      // 綜合分數計算：
      // XP * 1 + 訓練次數 * 100 + 訓練容量 * 0.1
      const score = Math.round(
        weeklyXp * 1 +
        weeklyWorkouts * 100 +
        weeklyVolume * 0.1
      )

      return {
        user_id: userId,
        display_name: profile?.display_name || profile?.full_name || '匿名用戶',
        avatar_url: profile?.avatar_url || null,
        rank: 0,
        score,
        weekly_xp: weeklyXp,
        weekly_workouts: weeklyWorkouts,
        weekly_volume: Math.round(weeklyVolume),
        learning_streak: learningS?.current_streak || 0,
        fitness_streak: fitnessS?.current_streak || 0,
        is_me: userId === user.id,
      }
    })

    // 按分數排序並設定排名
    userScores.sort((a, b) => b.score - a.score)
    userScores.forEach((entry, index) => {
      entry.rank = index + 1
    })

    const myRank = userScores.find(e => e.is_me)?.rank || null

    return jsonResponse({
      leaderboard: userScores,
      my_rank: myRank,
      total_friends: friendIds.length,
    }, { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get integrated leaderboard:', error)
    return NextResponse.json({ error: 'Failed to get leaderboard' }, { status: 500 })
  }
}
