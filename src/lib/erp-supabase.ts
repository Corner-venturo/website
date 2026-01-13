import { getSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'

// ============================================
// ERP Supabase 客戶端（向後相容）
// ============================================
// 2025-12-26: 合併後 ERP 和 Online 使用同一個資料庫
// 這個檔案保留是為了向後相容，實際上都指向同一個資料庫

export function getErpSupabaseClient() {
  return getSupabaseClient()
}

// 設定 ERP session（從 leader login 取得）
export async function setErpSession(accessToken: string, refreshToken: string) {
  const client = getSupabaseClient()

  const { data, error } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (error) {
    logger.error('Failed to set session:', error)
    return null
  }

  return data.session
}

// 取得當前 session
export async function getErpSession() {
  const client = getSupabaseClient()
  const { data: { session } } = await client.auth.getSession()
  return session
}

// 清除 session
export async function clearErpSession() {
  const client = getSupabaseClient()
  await client.auth.signOut()
}
