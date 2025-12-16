import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 瀏覽器端 Supabase Client
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// 單例模式（給不需要每次重新建立的情況用）
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return browserClient
}

// 舊版相容
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
