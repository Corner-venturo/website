import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET: 取得單一 UI 代碼
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await getSupabase()
      .from('generated_ui')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      item: data,
    })
  } catch (error) {
    console.error('Get generated UI error:', error)
    return NextResponse.json(
      { error: '讀取失敗' },
      { status: 500 }
    )
  }
}

// PUT: 更新 UI 代碼
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, code, prompt, pageType } = await request.json()

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (code) updateData.code = code
    if (prompt !== undefined) updateData.prompt = prompt
    if (pageType) updateData.page_type = pageType

    const { data, error } = await getSupabase()
      .from('generated_ui')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      item: data,
    })
  } catch (error) {
    console.error('Update generated UI error:', error)
    return NextResponse.json(
      { error: '更新失敗' },
      { status: 500 }
    )
  }
}

// DELETE: 刪除 UI 代碼
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await getSupabase()
      .from('generated_ui')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete generated UI error:', error)
    return NextResponse.json(
      { error: '刪除失敗' },
      { status: 500 }
    )
  }
}
