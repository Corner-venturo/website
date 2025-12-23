import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'

// GET: 取得所有儲存的 UI 代碼
export async function GET() {
  try {
    const { data, error } = await getOnlineSupabase()
      .from('generated_ui')
      .select('id, name, prompt, page_type, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({
      success: true,
      items: data,
    })
  } catch (error) {
    console.error('Get generated UI error:', error)
    return NextResponse.json(
      { error: '讀取失敗' },
      { status: 500 }
    )
  }
}

// POST: 儲存新的 UI 代碼
export async function POST(request: Request) {
  try {
    const { name, code, prompt, pageType } = await request.json()

    if (!name || !code) {
      return NextResponse.json(
        { error: '請提供名稱和代碼' },
        { status: 400 }
      )
    }

    const { data, error } = await getOnlineSupabase()
      .from('generated_ui')
      .insert({
        name,
        code,
        prompt,
        page_type: pageType || 'page',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      item: data,
    })
  } catch (error) {
    console.error('Save generated UI error:', error)
    return NextResponse.json(
      { error: '儲存失敗' },
      { status: 500 }
    )
  }
}
