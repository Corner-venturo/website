import { createBrowserClient } from '@supabase/ssr'

// 瀏覽器端 Supabase Client
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// 單例模式（給不需要每次重新建立的情況用）
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return browserClient
}

// 舊版相容 - 使用 getter 延遲初始化
export function getSupabase() {
  return getSupabaseClient()
}

// 為了向後相容，用 Proxy 實現延遲初始化
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_, prop) {
    return getSupabaseClient()[prop as keyof ReturnType<typeof createBrowserClient>]
  }
})
