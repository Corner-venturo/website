import { create } from 'zustand'
import { getSupabaseClient } from '@/lib/supabase'

export interface Profile {
  id: string
  full_name: string | null
  display_name: string | null
  avatar_url: string | null        // 用戶自訂頭像（優先顯示）
  phone: string | null
  location: string | null
  bio: string | null
  is_profile_complete: boolean
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

  // Actions
  fetchProfile: (userId: string) => Promise<void>
  updateProfile: (userId: string, data: Partial<Profile>) => Promise<{ success: boolean; error?: string }>
  uploadAvatar: (userId: string, file: File) => Promise<{ success: boolean; url?: string; error?: string }>
  completeProfile: (userId: string, data: {
    full_name: string
    display_name: string
    phone: string
    location?: string
    bio?: string
    avatar_url?: string
  }) => Promise<{ success: boolean; error?: string }>
  clearProfile: () => void
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async (userId: string) => {
    const supabase = getSupabaseClient()
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // 使用 maybeSingle，不存在時返回 null 而不是報錯

      if (error) throw error

      set({ profile: data, isLoading: false })
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

      set({ profile: updated, isLoading: false })
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

      set({ profile: updated, isLoading: false })
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '完成個人資料失敗'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  clearProfile: () => set({ profile: null, error: null }),
}))
