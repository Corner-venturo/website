import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // 檢查是否已完成個人資料
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_profile_complete')
        .eq('id', data.user.id)
        .maybeSingle() // 使用 maybeSingle，profile 不存在時返回 null

      // 如果尚未完成資料填寫，導向 onboarding
      // onboarding 完成後會檢查 localStorage 並跳轉到正確頁面
      if (!profile?.is_profile_complete) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // 已完成 profile 的用戶，檢查是否有待跳轉頁面
      // 因為 Server Component 無法讀取 localStorage，所以跳轉到一個中間頁處理
      // 或者直接跳轉到 next 參數指定的頁面
      // 這裡我們使用 next 參數，但前端登入時會將 localStorage 的值傳給 next
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 如果出錯，導回登入頁面
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
