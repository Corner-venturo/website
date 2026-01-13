import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

// POST: 新增虛擬成員（不需要真實帳號的成員）
export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const body = await request.json()
    const { name } = body

    if (!groupId || !name?.trim()) {
      return NextResponse.json(
        { success: false, error: '請提供群組 ID 和成員名稱' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    // 生成虛擬用戶 ID（使用 virtual_ 前綴標識）
    const virtualUserId = `virtual_${randomUUID()}`

    // 新增成員到分帳群組
    const { error: memberError } = await supabase
      .from('traveler_split_group_members')
      .insert({
        group_id: groupId,
        user_id: virtualUserId,
        role: 'member',
        display_name: name.trim(), // 儲存顯示名稱
        is_virtual: true, // 標記為虛擬成員
      })

    if (memberError) {
      logger.error('Insert virtual member error:', memberError)
      return NextResponse.json(
        { success: false, error: '新增虛擬成員失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: virtualUserId,
        displayName: name.trim(),
        isVirtual: true,
      },
      message: '虛擬成員已新增',
    })
  } catch (error) {
    logger.error('Create virtual member error:', error)
    return NextResponse.json(
      { success: false, error: '系統錯誤' },
      { status: 500 }
    )
  }
}
