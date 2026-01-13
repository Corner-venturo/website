import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

async function getAuthSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )
}

// GET: 取得對話詳情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getAuthSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const { id } = await params
    const serviceSupabase = getOnlineSupabase()

    // 驗證用戶是對話成員
    const { data: membership, error: memberError } = await serviceSupabase
      .from('traveler_conversation_members')
      .select('role, is_muted')
      .eq('conversation_id', id)
      .eq('user_id', user.id)
      .is('left_at', null)
      .single()

    if (memberError || !membership) {
      return NextResponse.json({ error: '無權限查看此對話' }, { status: 403 })
    }

    // 取得對話詳情
    const { data: conversation, error } = await serviceSupabase
      .from('traveler_conversations')
      .select(`
        id,
        type,
        name,
        avatar_url,
        trip_id,
        split_group_id,
        created_at,
        updated_at,
        members:traveler_conversation_members(
          user_id,
          role,
          joined_at,
          user:traveler_profiles(id, display_name, avatar_url)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    // 處理私訊的對方資訊
    let displayName = conversation.name
    let displayAvatar = conversation.avatar_url

    if (conversation.type === 'direct') {
      interface ConvMember {
        user_id: string
        role: string
        joined_at: string
        user: Array<{ id: string; display_name: string | null; avatar_url: string | null }>
      }
      const otherMember = (conversation.members as unknown as ConvMember[]).find((m) => m.user_id !== user.id)
      if (otherMember?.user?.[0]) {
        displayName = otherMember.user[0].display_name
        displayAvatar = otherMember.user[0].avatar_url
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...conversation,
        display_name: displayName,
        display_avatar: displayAvatar,
        my_role: membership.role,
        is_muted: membership.is_muted,
      },
    })
  } catch (error) {
    logger.error('Get conversation error:', error)
    return NextResponse.json({ error: '讀取失敗' }, { status: 500 })
  }
}

// PUT: 更新對話設定 / 標記已讀
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getAuthSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const { id } = await params
    const { action, name, is_muted } = await request.json()
    const serviceSupabase = getOnlineSupabase()

    // 驗證用戶是對話成員
    const { data: membership, error: memberError } = await serviceSupabase
      .from('traveler_conversation_members')
      .select('role')
      .eq('conversation_id', id)
      .eq('user_id', user.id)
      .is('left_at', null)
      .single()

    if (memberError || !membership) {
      return NextResponse.json({ error: '無權限操作此對話' }, { status: 403 })
    }

    // 標記已讀
    if (action === 'mark_read') {
      const { error } = await serviceSupabase.rpc('mark_conversation_read', {
        p_conversation_id: id,
      })

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: '已標記為已讀',
      })
    }

    // 更新靜音設定
    if (typeof is_muted === 'boolean') {
      const { error } = await serviceSupabase
        .from('traveler_conversation_members')
        .update({ is_muted })
        .eq('conversation_id', id)
        .eq('user_id', user.id)

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: is_muted ? '已開啟靜音' : '已關閉靜音',
      })
    }

    // 更新群組名稱（僅群主/管理員可操作）
    if (name !== undefined && ['owner', 'admin'].includes(membership.role)) {
      const { error } = await serviceSupabase
        .from('traveler_conversations')
        .update({ name })
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: '已更新群組名稱',
      })
    }

    return NextResponse.json({ error: '無效的操作' }, { status: 400 })
  } catch (error) {
    logger.error('Update conversation error:', error)
    return NextResponse.json({ error: '更新失敗' }, { status: 500 })
  }
}

// DELETE: 離開對話
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getAuthSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const { id } = await params
    const serviceSupabase = getOnlineSupabase()

    // 標記離開（軟刪除）
    const { error } = await serviceSupabase
      .from('traveler_conversation_members')
      .update({ left_at: new Date().toISOString() })
      .eq('conversation_id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: '已離開對話',
    })
  } catch (error) {
    logger.error('Leave conversation error:', error)
    return NextResponse.json({ error: '離開失敗' }, { status: 500 })
  }
}
