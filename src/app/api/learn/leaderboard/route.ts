import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

export interface LeaderboardEntry {
  user_id: string
  display_name: string
  avatar_url: string | null
  weekly_xp: number
  total_xp: number
  current_streak: number
  rank: number
  is_me: boolean
}

// GET /api/learn/leaderboard - 取得好友排行榜
export async function GET() {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. 取得好友列表 (已接受的)
    const { data: friendships } = await supabase
      .from('traveler_friends')
      .select('user_id, friend_id')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq('status', 'accepted')

    // 收集所有好友 ID (包含自己)
    const userIds = new Set<string>([user.id])
    friendships?.forEach(f => {
      userIds.add(f.user_id === user.id ? f.friend_id : f.user_id)
    })

    const userIdArray = Array.from(userIds)

    // 2. 取得這些用戶的學習檔案
    const { data: profiles } = await supabase
      .from('learning_profiles')
      .select('user_id, total_xp, current_streak')
      .in('user_id', userIdArray)

    // 3. 取得這些用戶的個人資料 (頭像、名稱)
    const { data: travelerProfiles } = await supabase
      .from('traveler_profiles')
      .select('id, display_name, avatar_url')
      .in('id', userIdArray)

    // 4. 計算本週 XP (從 learning_sessions)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data: sessions } = await supabase
      .from('learning_sessions')
      .select('user_id, xp_earned')
      .in('user_id', userIdArray)
      .gte('created_at', weekAgo.toISOString())

    // 計算每個用戶的週 XP
    const weeklyXpMap = new Map<string, number>()
    sessions?.forEach(s => {
      const current = weeklyXpMap.get(s.user_id) || 0
      weeklyXpMap.set(s.user_id, current + (s.xp_earned || 0))
    })

    // 5. 組合資料
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])
    const travelerMap = new Map(travelerProfiles?.map(p => [p.id, p]) || [])

    const leaderboard: Omit<LeaderboardEntry, 'rank'>[] = userIdArray
      .filter(uid => profileMap.has(uid)) // 只包含有學習檔案的用戶
      .map(uid => {
        const profile = profileMap.get(uid)
        const traveler = travelerMap.get(uid)

        return {
          user_id: uid,
          display_name: traveler?.display_name || '匿名用戶',
          avatar_url: traveler?.avatar_url || null,
          weekly_xp: weeklyXpMap.get(uid) || 0,
          total_xp: profile?.total_xp || 0,
          current_streak: profile?.current_streak || 0,
          is_me: uid === user.id,
        }
      })

    // 6. 排序 (週 XP 優先，相同則比較總 XP)
    leaderboard.sort((a, b) => {
      if (b.weekly_xp !== a.weekly_xp) return b.weekly_xp - a.weekly_xp
      return b.total_xp - a.total_xp
    })

    // 7. 加入排名
    const rankedLeaderboard: LeaderboardEntry[] = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))

    return jsonResponse({
      leaderboard: rankedLeaderboard,
      my_rank: rankedLeaderboard.find(e => e.is_me)?.rank || null,
      total_friends: rankedLeaderboard.length - 1, // 不含自己
    }, { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get leaderboard:', error)
    return NextResponse.json({ error: 'Failed to get leaderboard' }, { status: 500 })
  }
}
