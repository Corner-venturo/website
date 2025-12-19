import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getSupabaseClient } from '@/lib/supabase'

// 快取設定
const CACHE_DURATION = 5 * 60 * 1000 // 5 分鐘後背景更新
const FORCE_REFRESH_DURATION = 30 * 60 * 1000 // 30 分鐘後強制更新

export interface Profile {
  id: string
  username: string | null          // 唯一用戶名 (@username)
  full_name: string | null
  display_name: string | null
  avatar_url: string | null        // 用戶自訂頭像（優先顯示）
  phone: string | null
  location: string | null
  bio: string | null
  is_profile_complete: boolean
  is_founding_member: boolean      // 創始會員 (前100名用戶)
  member_number: number | null     // 創始會員編號 (1-100)
  created_at: string
  updated_at: string
}

// 取得顯示用頭像：優先自訂 > Google 頭像
export function getDisplayAvatar(profile: Profile | null, userMetadata?: Record<string, string>): string | null {
  // 優先使用用戶自訂頭像
  if (profile?.avatar_url) {
    return profile.avatar_url
  }
  // 其次使用 Google/OAuth 頭像
  if (userMetadata?.avatar_url || userMetadata?.picture) {
    return userMetadata.avatar_url || userMetadata.picture
  }
  return null
}

interface ProfileState {
  profile: Profile | null
  isLoading: boolean
  error: string | null
  lastFetchedAt: number | null // 上次讀取時間
  cachedUserId: string | null  // 快取的用戶 ID

  // Actions
  fetchProfile: (userId: string, forceRefresh?: boolean) => Promise<void>
  updateProfile: (userId: string, data: Partial<Profile>) => Promise<{ success: boolean; error?: string }>
  uploadAvatar: (userId: string, file: File) => Promise<{ success: boolean; url?: string; error?: string }>
  completeProfile: (userId: string, data: {
    full_name: string
    display_name: string
    phone: string
    location?: string
    bio?: string
    avatar_url?: string
    username?: string
  }) => Promise<{ success: boolean; error?: string }>
  checkUsernameAvailable: (username: string) => Promise<boolean>
  updateUsername: (userId: string, username: string) => Promise<{ success: boolean; error?: string }>
  clearProfile: () => void
  invalidateCache: () => void // 強制清除快取
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
  profile: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,
  cachedUserId: null,

  fetchProfile: async (userId: string, forceRefresh = false) => {
    const state = get()
    const now = Date.now()

    // 檢查是否需要更新
    const isSameUser = state.cachedUserId === userId
    const hasCache = state.profile !== null && isSameUser
    const timeSinceLastFetch = state.lastFetchedAt ? now - state.lastFetchedAt : Infinity

    // 快取邏輯：
    // 1. 不同用戶 → 強制更新
    // 2. 強制刷新 → 更新
    // 3. 超過 30 分鐘 → 強制更新
    // 4. 超過 5 分鐘 → 背景更新（不顯示 loading）
    // 5. 5 分鐘內且有快取 → 直接用快取

    const needsForceRefresh = !isSameUser || forceRefresh || timeSinceLastFetch > FORCE_REFRESH_DURATION
    const needsBackgroundRefresh = timeSinceLastFetch > CACHE_DURATION

    // 5 分鐘內有快取，直接返回
    if (hasCache && !needsForceRefresh && !needsBackgroundRefresh) {
      return
    }

    // 背景更新：有快取時不顯示 loading
    const showLoading = !hasCache || needsForceRefresh

    const supabase = getSupabaseClient()
    if (showLoading) {
      set({ isLoading: true, error: null })
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error

      set({
        profile: data,
        isLoading: false,
        lastFetchedAt: now,
        cachedUserId: userId,
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '載入個人資料失敗'
      set({ isLoading: false, error: message })
    }
  },

  updateProfile: async (userId: string, data: Partial<Profile>) => {
    const supabase = getSupabaseClient()
    set({ isLoading: true, error: null })

    try {
      const { data: updated, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      set({ profile: updated, isLoading: false, lastFetchedAt: Date.now() })
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '更新個人資料失敗'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  uploadAvatar: async (userId: string, file: File) => {
    const supabase = getSupabaseClient()

    try {
      // 產生唯一檔名
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`

      // 上傳到 Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true, // 覆蓋舊檔案
        })

      if (uploadError) throw uploadError

      // 取得公開 URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      return { success: true, url: publicUrl }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '上傳頭像失敗'
      return { success: false, error: message }
    }
  },

  completeProfile: async (userId: string, data) => {
    const supabase = getSupabaseClient()
    set({ isLoading: true, error: null })

    try {
      // 使用 upsert：如果 profile 不存在就建立，存在就更新
      const { data: updated, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...data,
          is_profile_complete: true,
        })
        .select()
        .single()

      if (error) throw error

      set({ profile: updated, isLoading: false, lastFetchedAt: Date.now() })
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '完成個人資料失敗'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  checkUsernameAvailable: async (username: string) => {
    const supabase = getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .maybeSingle()

      if (error) throw error
      return !data // 如果沒有找到，表示可用
    } catch {
      return false
    }
  },

  updateUsername: async (userId: string, username: string) => {
    const supabase = getSupabaseClient()
    const normalizedUsername = username.toLowerCase().trim()

    // 驗證格式
    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      return { success: false, error: '用戶名需要 3-20 字元，只能使用小寫字母、數字和底線' }
    }

    try {
      // 檢查是否可用
      const isAvailable = await get().checkUsernameAvailable(normalizedUsername)
      if (!isAvailable) {
        return { success: false, error: '此用戶名已被使用' }
      }

      const { data: updated, error } = await supabase
        .from('profiles')
        .update({ username: normalizedUsername })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      set({ profile: updated, lastFetchedAt: Date.now() })
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '更新用戶名失敗'
      return { success: false, error: message }
    }
  },

  clearProfile: () => set({ profile: null, error: null, lastFetchedAt: null, cachedUserId: null }),

  invalidateCache: () => set({ lastFetchedAt: null }),
}),
    {
      name: 'venturo-profile', // localStorage 的 key
      partialize: (state) => ({
        // 只持久化這些欄位（不存 isLoading, error）
        profile: state.profile,
        lastFetchedAt: state.lastFetchedAt,
        cachedUserId: state.cachedUserId,
      }),
    }
  )
)
