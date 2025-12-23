import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'

// GET: 取得群組成員
export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const supabase = getOnlineSupabase()

    const { data: members, error } = await supabase
      .from('split_group_members')
      .select(`
        id,
        user_id,
        nickname,
        role,
        joined_at,
        user:profiles(id, display_name, avatar_url, phone)
      `)
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Query members error:', error)
      return NextResponse.json(
        { error: '取得成員失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: members,
    })
  } catch (error) {
    console.error('Get group members error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// POST: 邀請成員加入群組
export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const body = await request.json()
    const { userId, userIds, nickname, role = 'member' } = body

    // 支援單個或多個成員
    const memberIds = userIds || (userId ? [userId] : [])

    if (memberIds.length === 0) {
      return NextResponse.json(
        { error: '請提供成員 ID' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    // 使用 UPSERT 避免重複
    const membersToInsert = memberIds.map((id: string) => ({
      group_id: groupId,
      user_id: id,
      nickname: nickname || null,
      role,
    }))

    const { data: members, error } = await supabase
      .from('split_group_members')
      .upsert(membersToInsert, {
        onConflict: 'group_id,user_id',
        ignoreDuplicates: true,
      })
      .select(`
        id,
        user_id,
        nickname,
        role,
        joined_at,
        user:profiles(id, display_name, avatar_url)
      `)

    if (error) {
      console.error('Insert member error:', error)
      return NextResponse.json(
        { error: '邀請成員失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: members,
    })
  } catch (error) {
    console.error('Invite member error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// DELETE: 移除成員
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: '請提供成員 ID' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    // 檢查是否為 owner，owner 不能被移除
    const { data: member } = await supabase
      .from('split_group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single()

    if (member?.role === 'owner') {
      return NextResponse.json(
        { error: '無法移除群組建立者' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('split_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)

    if (error) {
      console.error('Delete member error:', error)
      return NextResponse.json(
        { error: '移除成員失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}
