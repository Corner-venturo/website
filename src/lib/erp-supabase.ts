import { createBrowserClient } from '@supabase/ssr'

// ERP Supabase 客戶端（用於領隊功能）
// 注意：這個客戶端連接到 ERP 資料庫，用於查詢團資料、行程等

const erpSupabaseUrl = process.env.NEXT_PUBLIC_ERP_SUPABASE_URL
const erpSupabaseAnonKey = process.env.NEXT_PUBLIC_ERP_SUPABASE_ANON_KEY

// 單例模式
let erpBrowserClient: ReturnType<typeof createBrowserClient> | null = null

export function getErpSupabaseClient() {
  if (!erpSupabaseUrl || !erpSupabaseAnonKey) {
    console.warn('ERP Supabase config not found')
    return null
  }

  if (!erpBrowserClient) {
    erpBrowserClient = createBrowserClient(erpSupabaseUrl, erpSupabaseAnonKey)
  }
  return erpBrowserClient
}

// 設定 ERP session（從 leader login 取得）
export async function setErpSession(accessToken: string, refreshToken: string) {
  const client = getErpSupabaseClient()
  if (!client) return null

  const { data, error } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (error) {
    console.error('Failed to set ERP session:', error)
    return null
  }

  return data.session
}

// 取得當前 ERP session
export async function getErpSession() {
  const client = getErpSupabaseClient()
  if (!client) return null

  const { data: { session } } = await client.auth.getSession()
  return session
}

// 清除 ERP session
export async function clearErpSession() {
  const client = getErpSupabaseClient()
  if (!client) return

  await client.auth.signOut()
}
