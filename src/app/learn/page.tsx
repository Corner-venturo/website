'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MobileNav from '@/components/MobileNav'
import { useAuthStore } from '@/stores/auth-store'
import { useLearnStore } from '@/stores/learn-store'
import {
  LearnHeader,
  StreakCard,
  TodayProgress,
  QuickActions,
  ActiveGoals,
  DailyTasks,
  FriendsLeaderboard,
} from './components'

export default function LearnPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const {
    profile,
    profileLoading,
    fetchProfile,
    fetchGoals,
    fetchTodayStats,
    fetchDailyTasks,
    fetchUserStats,
    isSetupComplete,
    goals,
    todayStats,
    userStats,
    dailyTasks,
  } = useLearnStore()

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    }
  }, [user?.id, fetchProfile])

  useEffect(() => {
    if (profile) {
      // 平行載入資料
      Promise.all([
        fetchGoals(),
        fetchTodayStats(),
        fetchDailyTasks(),
        fetchUserStats(),
      ])
    }
  }, [profile, fetchGoals, fetchTodayStats, fetchDailyTasks, fetchUserStats])

  // 如果未登入，導向登入頁
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/learn')
    }
  }, [isInitialized, user, router])

  // 如果未設定完成，導向設定頁
  useEffect(() => {
    if (profile && !isSetupComplete) {
      router.push('/learn/setup')
    }
  }, [profile, isSetupComplete, router])

  if (!isInitialized || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <LearnHeader profile={profile} userStats={userStats} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 連續天數卡片 */}
        <StreakCard
          currentStreak={profile.current_streak}
          longestStreak={profile.longest_streak}
          todayComplete={todayStats?.goal_achieved || false}
        />

        {/* 今日進度 */}
        <TodayProgress
          stats={todayStats}
          dailyGoalXP={profile.daily_goal_xp}
          dailyGoalMinutes={profile.daily_goal_minutes}
        />

        {/* 快速操作 */}
        <QuickActions dueCount={userStats?.due_today || 0} />

        {/* 好友排行榜 */}
        <FriendsLeaderboard />

        {/* 進行中的目標 */}
        {goals.filter((g) => g.status === 'active').length > 0 && (
          <ActiveGoals goals={goals.filter((g) => g.status === 'active')} />
        )}

        {/* 每日任務 */}
        {dailyTasks.length > 0 && <DailyTasks tasks={dailyTasks} />}
      </main>

      <MobileNav />
    </div>
  )
}
