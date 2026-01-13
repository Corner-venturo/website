'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { dedup } from '@/lib/request-dedup'
import { logger } from '@/lib/logger'
import type {
  LearningProfile,
  LearningRole,
  LearningGoal,
  LearningScenario,
  VocabularyWithProgress,
  UserVocabularyProgress,
  TodayStats,
  UserLearningStats,
  LearningSession,
  UserDailyTask,
  Badge,
  UserBadge,
  FSRSRating,
  TargetLanguage,
  CreateProfileRequest,
  CreateGoalRequest,
  SessionType,
} from '@/features/learn/types'

// 快取設定
const CACHE_DURATION = 2 * 60 * 1000 // 2 分鐘內直接用快取
const STALE_DURATION = 5 * 60 * 1000 // 5 分鐘後背景刷新

interface LearnState {
  // 用戶檔案
  profile: LearningProfile | null
  profileLoading: boolean
  profileError: string | null
  profileLastFetched: number | null

  // 角色列表
  roles: LearningRole[]
  rolesLoading: boolean

  // 學習目標
  goals: LearningGoal[]
  goalsLoading: boolean
  activeGoal: LearningGoal | null

  // 情境列表
  scenarios: LearningScenario[]
  scenariosLoading: boolean

  // 今日統計
  todayStats: TodayStats | null
  statsLoading: boolean

  // 用戶學習統計
  userStats: UserLearningStats | null

  // 待複習詞彙
  dueVocabulary: VocabularyWithProgress[]
  dueVocabularyLoading: boolean
  dueCount: number

  // 當前學習 Session
  currentSession: LearningSession | null

  // 每日任務
  dailyTasks: UserDailyTask[]
  dailyTasksLoading: boolean

  // 徽章
  badges: Badge[]
  userBadges: UserBadge[]
  newBadges: UserBadge[] // 新獲得的徽章 (用於顯示通知)

  // 是否已設定完成
  isSetupComplete: boolean
}

interface LearnActions {
  // Profile Actions
  fetchProfile: () => Promise<void>
  createProfile: (data: CreateProfileRequest) => Promise<LearningProfile | null>
  updateProfile: (data: Partial<CreateProfileRequest>) => Promise<void>

  // Roles Actions
  fetchRoles: () => Promise<void>

  // Goals Actions
  fetchGoals: () => Promise<void>
  createGoal: (data: CreateGoalRequest) => Promise<LearningGoal | null>
  updateGoal: (goalId: string, data: Partial<LearningGoal>) => Promise<void>
  deleteGoal: (goalId: string) => Promise<void>
  setActiveGoal: (goal: LearningGoal | null) => void

  // Scenarios Actions
  fetchScenarios: () => Promise<void>

  // Stats Actions
  fetchTodayStats: () => Promise<void>
  fetchUserStats: () => Promise<void>

  // Vocabulary Actions
  fetchDueVocabulary: (limit?: number) => Promise<void>
  recordReview: (vocabularyId: string, rating: FSRSRating) => Promise<void>
  learnNewWord: (vocabularyId: string, scenarioId?: string) => Promise<void>

  // Session Actions
  startSession: (type: SessionType, goalId?: string, scenarioId?: string) => Promise<LearningSession | null>
  endSession: (xpEarned?: number) => Promise<void>

  // Daily Tasks Actions
  fetchDailyTasks: () => Promise<void>
  claimTaskReward: (taskId: string) => Promise<void>

  // Badges Actions
  fetchBadges: () => Promise<void>
  fetchUserBadges: () => Promise<void>
  clearNewBadges: () => void

  // Utility
  checkSetupComplete: () => boolean
  reset: () => void
}

type LearnStore = LearnState & LearnActions

const initialState: LearnState = {
  profile: null,
  profileLoading: false,
  profileError: null,
  profileLastFetched: null,
  roles: [],
  rolesLoading: false,
  goals: [],
  goalsLoading: false,
  activeGoal: null,
  scenarios: [],
  scenariosLoading: false,
  todayStats: null,
  statsLoading: false,
  userStats: null,
  dueVocabulary: [],
  dueVocabularyLoading: false,
  dueCount: 0,
  currentSession: null,
  dailyTasks: [],
  dailyTasksLoading: false,
  badges: [],
  userBadges: [],
  newBadges: [],
  isSetupComplete: false,
}

export const useLearnStore = create<LearnStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // Profile Actions
      // ============================================
      fetchProfile: async () => {
        const { profileLastFetched, profile } = get()
        const now = Date.now()

        // 如果有快取且未過期，直接返回
        if (profile && profileLastFetched && now - profileLastFetched < CACHE_DURATION) {
          return
        }

        // 如果快取過期但還在 stale 範圍內，背景刷新
        const shouldShowLoading = !profile || !profileLastFetched || now - profileLastFetched > STALE_DURATION

        if (shouldShowLoading) {
          set({ profileLoading: true, profileError: null })
        }

        try {
          const data = await dedup('learn:profile', async () => {
            const res = await fetch('/api/learn/profile')
            if (!res.ok) {
              if (res.status === 404) return null
              throw new Error('Failed to fetch profile')
            }
            return res.json()
          })

          set({
            profile: data,
            profileLoading: false,
            profileLastFetched: Date.now(),
            isSetupComplete: !!data?.role_id,
          })
        } catch (error) {
          logger.error('Failed to fetch learning profile:', error)
          set({
            profileLoading: false,
            profileError: error instanceof Error ? error.message : '載入失敗',
          })
        }
      },

      createProfile: async (data) => {
        set({ profileLoading: true, profileError: null })
        try {
          const res = await fetch('/api/learn/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })

          if (!res.ok) throw new Error('Failed to create profile')

          const profile = await res.json()
          set({
            profile,
            profileLoading: false,
            profileLastFetched: Date.now(),
            isSetupComplete: !!profile.role_id,
          })
          return profile
        } catch (error) {
          logger.error('Failed to create learning profile:', error)
          set({
            profileLoading: false,
            profileError: error instanceof Error ? error.message : '建立失敗',
          })
          return null
        }
      },

      updateProfile: async (data) => {
        const { profile } = get()
        if (!profile) return

        try {
          const res = await fetch('/api/learn/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })

          if (!res.ok) throw new Error('Failed to update profile')

          const updated = await res.json()
          set({
            profile: updated,
            profileLastFetched: Date.now(),
            isSetupComplete: !!updated.role_id,
          })
        } catch (error) {
          logger.error('Failed to update learning profile:', error)
        }
      },

      // ============================================
      // Roles Actions
      // ============================================
      fetchRoles: async () => {
        const { roles } = get()
        if (roles.length > 0) return // 角色是靜態資料，只需載入一次

        set({ rolesLoading: true })
        try {
          const data = await dedup('learn:roles', async () => {
            const res = await fetch('/api/learn/roles')
            if (!res.ok) throw new Error('Failed to fetch roles')
            return res.json()
          })

          set({ roles: data, rolesLoading: false })
        } catch (error) {
          logger.error('Failed to fetch roles:', error)
          set({ rolesLoading: false })
        }
      },

      // ============================================
      // Goals Actions
      // ============================================
      fetchGoals: async () => {
        set({ goalsLoading: true })
        try {
          const data = await dedup('learn:goals', async () => {
            const res = await fetch('/api/learn/goals')
            if (!res.ok) throw new Error('Failed to fetch goals')
            return res.json()
          })

          const activeGoal = data.find((g: LearningGoal) => g.status === 'active') || null
          set({ goals: data, goalsLoading: false, activeGoal })
        } catch (error) {
          logger.error('Failed to fetch goals:', error)
          set({ goalsLoading: false })
        }
      },

      createGoal: async (data) => {
        try {
          const res = await fetch('/api/learn/goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })

          if (!res.ok) throw new Error('Failed to create goal')

          const goal = await res.json()
          set((state) => ({
            goals: [...state.goals, goal],
            activeGoal: goal,
          }))
          return goal
        } catch (error) {
          logger.error('Failed to create goal:', error)
          return null
        }
      },

      updateGoal: async (goalId, data) => {
        try {
          const res = await fetch(`/api/learn/goals/${goalId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })

          if (!res.ok) throw new Error('Failed to update goal')

          const updated = await res.json()
          set((state) => ({
            goals: state.goals.map((g) => (g.id === goalId ? updated : g)),
            activeGoal: state.activeGoal?.id === goalId ? updated : state.activeGoal,
          }))
        } catch (error) {
          logger.error('Failed to update goal:', error)
        }
      },

      deleteGoal: async (goalId) => {
        try {
          const res = await fetch(`/api/learn/goals/${goalId}`, {
            method: 'DELETE',
          })

          if (!res.ok) throw new Error('Failed to delete goal')

          set((state) => ({
            goals: state.goals.filter((g) => g.id !== goalId),
            activeGoal: state.activeGoal?.id === goalId ? null : state.activeGoal,
          }))
        } catch (error) {
          logger.error('Failed to delete goal:', error)
        }
      },

      setActiveGoal: (goal) => set({ activeGoal: goal }),

      // ============================================
      // Scenarios Actions
      // ============================================
      fetchScenarios: async () => {
        const { scenarios } = get()
        if (scenarios.length > 0) return // 情境是靜態資料

        set({ scenariosLoading: true })
        try {
          const data = await dedup('learn:scenarios', async () => {
            const res = await fetch('/api/learn/scenarios')
            if (!res.ok) throw new Error('Failed to fetch scenarios')
            return res.json()
          })

          set({ scenarios: data, scenariosLoading: false })
        } catch (error) {
          logger.error('Failed to fetch scenarios:', error)
          set({ scenariosLoading: false })
        }
      },

      // ============================================
      // Stats Actions
      // ============================================
      fetchTodayStats: async () => {
        set({ statsLoading: true })
        try {
          const data = await dedup('learn:today-stats', async () => {
            const res = await fetch('/api/learn/stats/today')
            if (!res.ok) throw new Error('Failed to fetch today stats')
            return res.json()
          })

          set({ todayStats: data, statsLoading: false })
        } catch (error) {
          logger.error('Failed to fetch today stats:', error)
          set({ statsLoading: false })
        }
      },

      fetchUserStats: async () => {
        try {
          const data = await dedup('learn:user-stats', async () => {
            const res = await fetch('/api/learn/stats')
            if (!res.ok) throw new Error('Failed to fetch user stats')
            return res.json()
          })

          set({ userStats: data })
        } catch (error) {
          logger.error('Failed to fetch user stats:', error)
        }
      },

      // ============================================
      // Vocabulary Actions
      // ============================================
      fetchDueVocabulary: async (limit = 20) => {
        set({ dueVocabularyLoading: true })
        try {
          const data = await dedup(`learn:due-vocab:${limit}`, async () => {
            const res = await fetch(`/api/learn/vocabulary/due?limit=${limit}`)
            if (!res.ok) throw new Error('Failed to fetch due vocabulary')
            return res.json()
          })

          set({
            dueVocabulary: data.vocabulary,
            dueCount: data.total,
            dueVocabularyLoading: false,
          })
        } catch (error) {
          logger.error('Failed to fetch due vocabulary:', error)
          set({ dueVocabularyLoading: false })
        }
      },

      recordReview: async (vocabularyId, rating) => {
        try {
          const res = await fetch('/api/learn/vocabulary/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vocabulary_id: vocabularyId, rating }),
          })

          if (!res.ok) throw new Error('Failed to record review')

          const result = await res.json()

          // 更新本地狀態
          set((state) => ({
            dueVocabulary: state.dueVocabulary.filter((v) => v.id !== vocabularyId),
            dueCount: Math.max(0, state.dueCount - 1),
            todayStats: state.todayStats
              ? {
                  ...state.todayStats,
                  words_reviewed: state.todayStats.words_reviewed + 1,
                  xp_earned: state.todayStats.xp_earned + (result.xp_earned || 0),
                }
              : null,
          }))

          // 檢查是否獲得新徽章
          if (result.new_badges && result.new_badges.length > 0) {
            set((state) => ({
              newBadges: [...state.newBadges, ...result.new_badges],
            }))
          }
        } catch (error) {
          logger.error('Failed to record review:', error)
        }
      },

      learnNewWord: async (vocabularyId, scenarioId) => {
        try {
          const res = await fetch('/api/learn/vocabulary/learn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vocabulary_id: vocabularyId, scenario_id: scenarioId }),
          })

          if (!res.ok) throw new Error('Failed to learn new word')

          const result = await res.json()

          // 更新統計
          set((state) => ({
            todayStats: state.todayStats
              ? {
                  ...state.todayStats,
                  words_learned: state.todayStats.words_learned + 1,
                  xp_earned: state.todayStats.xp_earned + (result.xp_earned || 0),
                }
              : null,
            profile: state.profile
              ? {
                  ...state.profile,
                  words_learned: state.profile.words_learned + 1,
                }
              : null,
          }))
        } catch (error) {
          logger.error('Failed to learn new word:', error)
        }
      },

      // ============================================
      // Session Actions
      // ============================================
      startSession: async (type, goalId, scenarioId) => {
        try {
          const res = await fetch('/api/learn/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_type: type,
              goal_id: goalId,
              scenario_id: scenarioId,
            }),
          })

          if (!res.ok) throw new Error('Failed to start session')

          const session = await res.json()
          set({ currentSession: session })
          return session
        } catch (error) {
          logger.error('Failed to start session:', error)
          return null
        }
      },

      endSession: async (xpEarned = 0) => {
        const { currentSession } = get()
        if (!currentSession) return

        try {
          await fetch(`/api/learn/sessions/${currentSession.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ended_at: new Date().toISOString(),
              xp_earned: xpEarned,
            }),
          })

          set({ currentSession: null })

          // 刷新統計
          get().fetchTodayStats()
          get().fetchUserStats()
        } catch (error) {
          logger.error('Failed to end session:', error)
        }
      },

      // ============================================
      // Daily Tasks Actions
      // ============================================
      fetchDailyTasks: async () => {
        set({ dailyTasksLoading: true })
        try {
          const data = await dedup('learn:daily-tasks', async () => {
            const res = await fetch('/api/learn/tasks/daily')
            if (!res.ok) throw new Error('Failed to fetch daily tasks')
            return res.json()
          })

          set({ dailyTasks: data, dailyTasksLoading: false })
        } catch (error) {
          logger.error('Failed to fetch daily tasks:', error)
          set({ dailyTasksLoading: false })
        }
      },

      claimTaskReward: async (taskId) => {
        try {
          const res = await fetch(`/api/learn/tasks/${taskId}/claim`, {
            method: 'POST',
          })

          if (!res.ok) throw new Error('Failed to claim reward')

          const result = await res.json()

          set((state) => ({
            dailyTasks: state.dailyTasks.map((t) =>
              t.id === taskId ? { ...t, reward_claimed: true } : t
            ),
            todayStats: state.todayStats
              ? {
                  ...state.todayStats,
                  xp_earned: state.todayStats.xp_earned + (result.xp_earned || 0),
                }
              : null,
          }))
        } catch (error) {
          logger.error('Failed to claim task reward:', error)
        }
      },

      // ============================================
      // Badges Actions
      // ============================================
      fetchBadges: async () => {
        try {
          const data = await dedup('learn:badges', async () => {
            const res = await fetch('/api/learn/badges')
            if (!res.ok) throw new Error('Failed to fetch badges')
            return res.json()
          })

          set({ badges: data })
        } catch (error) {
          logger.error('Failed to fetch badges:', error)
        }
      },

      fetchUserBadges: async () => {
        try {
          const data = await dedup('learn:user-badges', async () => {
            const res = await fetch('/api/learn/badges/user')
            if (!res.ok) throw new Error('Failed to fetch user badges')
            return res.json()
          })

          set({ userBadges: data })
        } catch (error) {
          logger.error('Failed to fetch user badges:', error)
        }
      },

      clearNewBadges: () => set({ newBadges: [] }),

      // ============================================
      // Utility
      // ============================================
      checkSetupComplete: () => {
        const { profile } = get()
        return !!profile?.role_id
      },

      reset: () => set(initialState),
    }),
    {
      name: 'learn-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        profileLastFetched: state.profileLastFetched,
        isSetupComplete: state.isSetupComplete,
      }),
    }
  )
)
