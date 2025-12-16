import { create } from 'zustand'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null

  // Actions
  initialize: () => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signInWithGithub: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    const supabase = getSupabaseClient()

    try {
      // 取得目前的 session
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) throw error

      set({
        user: session?.user ?? null,
        session,
        isInitialized: true,
      })

      // 監聽 auth 狀態變化
      supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        set({
          user: session?.user ?? null,
          session,
        })
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ isInitialized: true, error: '初始化失敗' })
    }
  },

  signUp: async (email, password, name) => {
    const supabase = getSupabaseClient()
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          },
        },
      })

      if (error) throw error

      set({
        user: data.user,
        session: data.session,
        isLoading: false,
      })

      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '註冊失敗'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  signIn: async (email, password) => {
    const supabase = getSupabaseClient()
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      set({
        user: data.user,
        session: data.session,
        isLoading: false,
      })

      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '登入失敗'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  signInWithGoogle: async () => {
    const supabase = getSupabaseClient()
    set({ isLoading: true, error: null })

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Google 登入失敗'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  signInWithGithub: async () => {
    const supabase = getSupabaseClient()
    set({ isLoading: true, error: null })

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'GitHub 登入失敗'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  signOut: async () => {
    const supabase = getSupabaseClient()
    set({ isLoading: true })

    try {
      await supabase.auth.signOut()
      set({
        user: null,
        session: null,
        isLoading: false,
      })
    } catch (error) {
      console.error('Sign out error:', error)
      set({ isLoading: false })
    }
  },

  resetPassword: async (email) => {
    const supabase = getSupabaseClient()
    set({ isLoading: true, error: null })

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      set({ isLoading: false })
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '重設密碼失敗'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  clearError: () => set({ error: null }),
}))
