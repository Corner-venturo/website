import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

export interface ExpenseStreak {
  current_streak: number
  longest_streak: number
  last_record_date: string | null
  total_records: number
  total_expense_amount: number
  total_income_amount: number
  achievements: ExpenseAchievement[]
}

export interface ExpenseAchievement {
  id: string
  name: string
  description: string
  icon: string
  color: string
  unlockedAt?: string
}

const EXPENSE_ACHIEVEMENTS: ExpenseAchievement[] = [
  {
    id: 'first_record',
    name: '初次記帳',
    description: '完成第一筆記帳',
    icon: 'edit_note',
    color: '#10B981',
  },
  {
    id: 'streak_7',
    name: '一週達人',
    description: '連續記帳 7 天',
    icon: 'local_fire_department',
    color: '#F59E0B',
  },
  {
    id: 'streak_30',
    name: '月度達人',
    description: '連續記帳 30 天',
    icon: 'whatshot',
    color: '#EF4444',
  },
  {
    id: 'streak_100',
    name: '百日傳奇',
    description: '連續記帳 100 天',
    icon: 'emoji_events',
    color: '#8B5CF6',
  },
  {
    id: 'records_50',
    name: '記帳新手',
    description: '累計記帳 50 筆',
    icon: 'auto_stories',
    color: '#3B82F6',
  },
  {
    id: 'records_200',
    name: '記帳達人',
    description: '累計記帳 200 筆',
    icon: 'military_tech',
    color: '#EC4899',
  },
  {
    id: 'records_500',
    name: '記帳大師',
    description: '累計記帳 500 筆',
    icon: 'workspace_premium',
    color: '#F59E0B',
  },
]

// GET /api/expenses/streak - 取得連續記帳數據
export async function GET() {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 取得 streak 記錄
    const { data: streak, error } = await supabase
      .from('expense_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // 如果沒有記錄，返回初始狀態
    if (!streak) {
      return jsonResponse({
        current_streak: 0,
        longest_streak: 0,
        last_record_date: null,
        total_records: 0,
        total_expense_amount: 0,
        total_income_amount: 0,
        achievements: [],
      }, { cache: CACHE_CONFIGS.privateShort })
    }

    // 計算已解鎖的成就
    const unlockedAchievements = calculateAchievements(streak)

    const result: ExpenseStreak = {
      current_streak: streak.current_streak || 0,
      longest_streak: streak.longest_streak || 0,
      last_record_date: streak.last_record_date,
      total_records: streak.total_records || 0,
      total_expense_amount: streak.total_expense_amount || 0,
      total_income_amount: streak.total_income_amount || 0,
      achievements: unlockedAchievements,
    }

    return jsonResponse(result, { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get expense streak:', error)
    return NextResponse.json({ error: 'Failed to get streak' }, { status: 500 })
  }
}

function calculateAchievements(streak: {
  current_streak: number
  longest_streak: number
  total_records: number
}): ExpenseAchievement[] {
  const unlocked: ExpenseAchievement[] = []

  // 第一筆記錄
  if (streak.total_records >= 1) {
    unlocked.push({ ...EXPENSE_ACHIEVEMENTS[0], unlockedAt: 'unlocked' })
  }

  // 連續天數成就
  const maxStreak = Math.max(streak.current_streak, streak.longest_streak)
  if (maxStreak >= 7) {
    unlocked.push({ ...EXPENSE_ACHIEVEMENTS[1], unlockedAt: 'unlocked' })
  }
  if (maxStreak >= 30) {
    unlocked.push({ ...EXPENSE_ACHIEVEMENTS[2], unlockedAt: 'unlocked' })
  }
  if (maxStreak >= 100) {
    unlocked.push({ ...EXPENSE_ACHIEVEMENTS[3], unlockedAt: 'unlocked' })
  }

  // 累計記錄數成就
  if (streak.total_records >= 50) {
    unlocked.push({ ...EXPENSE_ACHIEVEMENTS[4], unlockedAt: 'unlocked' })
  }
  if (streak.total_records >= 200) {
    unlocked.push({ ...EXPENSE_ACHIEVEMENTS[5], unlockedAt: 'unlocked' })
  }
  if (streak.total_records >= 500) {
    unlocked.push({ ...EXPENSE_ACHIEVEMENTS[6], unlockedAt: 'unlocked' })
  }

  return unlocked
}
