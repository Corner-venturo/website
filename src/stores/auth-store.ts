import { create } from 'zustand'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase'
import { setErpSession, clearErpSession, getErpSession, getErpSupabaseClient } from '@/lib/erp-supabase'
import { logger } from '@/lib/logger'

// 領隊/員工資訊
interface LeaderInfo {
  employee_id: string
  employee_number: string
  name: string
  roles: string[]
}

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  leaderInfo: LeaderInfo | null // 領隊專屬資訊

  // Actions
  initialize: () => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signInAsLeader: (nationalId: string, password: string) => Promise<{ success: boolean; error?: string }>
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
  leaderInfo: null,

  initialize: async () => {
    const supabase = getSupabaseClient()

    try {
      // 取得目前的 session
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) throw error

      // 檢查是否有 ERP session（領隊登入）
      const erpSession = await getErpSession()

      // 如果有主 session 且與 ERP session 用戶不同，清除 ERP session
      // 這表示用戶用不同帳號登入了
      if (session?.user && erpSession?.user && session.user.id !== erpSession.user.id) {
        logger.log('Session mismatch detected, clearing ERP session')
        await clearErpSession()
        set({
          user: session.user,
          session,
          leaderInfo: null,
          isInitialized: true,
        })
        return
      }

      if (erpSession?.user) {
        // 驗證領隊身份是否仍然有效
        const erpClient = getErpSupabaseClient()
        if (erpClient) {
          try {
            const { data: employee, error: employeeError } = await erpClient
              .from('employees')
              .select('id, employee_number, name, roles')
              .eq('user_id', erpSession.user.id)
              .single()

            if (employeeError) {
              // 查詢錯誤時，保持現有 session（不要因為網路錯誤就登出）
              logger.warn('Employee verification failed:', employeeError)
              set({
                user: erpSession.user,
                session: erpSession,
                isInitialized: true,
              })
            } else if (employee) {
              // 領隊身份仍然有效
              set({
                user: erpSession.user,
                session: erpSession,
                leaderInfo: {
                  employee_id: employee.id,
                  employee_number: employee.employee_number,
                  name: employee.name,
                  roles: employee.roles || [],
                },
                isInitialized: true,
              })
            } else {
              // 領隊身份已被移除，清除 session
              logger.log('Leader identity removed, clearing session')
              await clearErpSession()
              set({
                user: session?.user ?? null,
                session,
                leaderInfo: null,
                isInitialized: true,
              })
            }
          } catch (verifyError) {
            // 驗證過程出錯，保持現有 session
            logger.error('Leader verification error:', verifyError)
            set({
              user: erpSession.user,
              session: erpSession,
              isInitialized: true,
            })
          }
        } else {
          // 沒有 ERP client，保持 ERP session
          set({
            user: erpSession.user,
            session: erpSession,
            isInitialized: true,
          })
        }
      } else {
        set({
          user: session?.user ?? null,
          session,
          isInitialized: true,
        })
      }

      // 監聽 auth 狀態變化
      supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        set({
          user: session?.user ?? null,
          session,
        })
      })
    } catch (error) {
      logger.error('Auth initialization error:', error)
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

      // 清除 ERP session（如果有的話），因為這是一般用戶登入
      await clearErpSession()

      set({
        user: data.user,
        session: data.session,
        leaderInfo: null, // 清除領隊資訊
        isLoading: false,
      })

      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '登入失敗'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  signInAsLeader: async (nationalId, password) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch('/api/auth/leader-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ national_id: nationalId, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '登入失敗')
      }

      // 設定 ERP Supabase 客戶端的 session（用於查詢 ERP 資料）
      await setErpSession(
        data.session.access_token,
        data.session.refresh_token
      )

      // 將 ERP 用戶資訊存儲在本地（不設定主 Supabase session）
      set({
        user: data.session.user, // ERP 用戶
        session: data.session, // ERP session
        leaderInfo: {
          employee_id: data.user.employee_id,
          employee_number: data.user.employee_number,
          name: data.user.name,
          roles: data.user.roles,
        },
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
      // 清除主 Supabase session
      await supabase.auth.signOut()
      // 清除 ERP Supabase session（如果有的話）
      await clearErpSession()

      set({
        user: null,
        session: null,
        leaderInfo: null,
        isLoading: false,
      })
    } catch (error) {
      logger.error('Sign out error:', error)
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
