import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================
// Server-side Supabase Client (Singleton)
// ============================================
// 用於 API Routes，重用連線避免每次請求都建立新連線
// 這可以節省 200-500ms 的連線建立時間

// Online 資料庫 (主要資料庫)
let onlineClient: SupabaseClient | null = null

export function getOnlineSupabase(): SupabaseClient {
  if (!onlineClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      throw new Error('Missing Supabase configuration for Online database')
    }

    onlineClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
  return onlineClient
}

// ERP 資料庫 (用於領隊功能、同步資料)
let erpClient: SupabaseClient | null = null

export function getErpSupabase(): SupabaseClient {
  if (!erpClient) {
    const url = process.env.NEXT_PUBLIC_ERP_SUPABASE_URL
    const key = process.env.ERP_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_ERP_SUPABASE_ANON_KEY

    if (!url || !key) {
      throw new Error('Missing Supabase configuration for ERP database')
    }

    erpClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
  return erpClient
}

// 向後相容的別名
export const getServerSupabase = getOnlineSupabase
