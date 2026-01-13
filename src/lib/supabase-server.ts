import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================
// Server-side Supabase Client (Singleton)
// ============================================
// 用於 API Routes，重用連線避免每次請求都建立新連線
// 這可以節省 200-500ms 的連線建立時間
//
// 2025-12-26: 合併後只使用單一資料庫（ERP）

let supabaseClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      throw new Error('Missing Supabase configuration')
    }

    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
  return supabaseClient
}

// 向後相容的別名
export const getOnlineSupabase = getSupabase
export const getServerSupabase = getSupabase
export const getErpSupabase = getSupabase  // 合併後都指向同一個資料庫
