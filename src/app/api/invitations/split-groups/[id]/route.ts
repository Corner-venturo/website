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

// PUT: 接受/拒絕/撤回分帳群組邀請
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
    const { action } = await request.json() // accept | reject | cancel

    if (!['accept', 'reject', 'cancel'].includes(action)) {
      return NextResponse.json({ error: '無效的操作' }, { status: 400 })
    }

    const serviceSupabase = getOnlineSupabase()

    // 取得邀請
    const { data: invitation, error: fetchError } = await serviceSupabase
      .from('traveler_split_group_invitations')
      .select('*, group:split_groups(id, name)')
      .eq('id', id)
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json({ error: '找不到邀請' }, { status: 404 })
    }

    // 撤回邀請
    if (action === 'cancel') {
      if (invitation.inviter_id !== user.id) {
        return NextResponse.json({ error: '只有邀請人可以撤回' }, { status: 403 })
      }
      if (invitation.status !== 'pending') {
        return NextResponse.json({ error: '只能撤回待處理的邀請' }, { status: 400 })
      }

      const { error } = await serviceSupabase
        .from('traveler_split_group_invitations')
        .update({ status: 'cancelled' })
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: '已撤回邀請',
      })
    }

    // 接受/拒絕邀請
    if (invitation.invitee_id !== user.id) {
      return NextResponse.json({ error: '無權限處理此邀請' }, { status: 403 })
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: '此邀請已處理' }, { status: 400 })
    }

    // 檢查是否過期
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      await serviceSupabase
        .from('traveler_split_group_invitations')
        .update({ status: 'expired' })
        .eq('id', id)
      return NextResponse.json({ error: '邀請已過期' }, { status: 400 })
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected'

    // 更新邀請狀態
    const { error: updateError } = await serviceSupabase
      .from('traveler_split_group_invitations')
      .update({
        status: newStatus,
        responded_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) throw updateError

    // 如果接受，加入群組成員
    if (action === 'accept') {
      const { error: memberError } = await serviceSupabase
        .from('traveler_split_group_members')
        .insert({
          group_id: invitation.group_id,
          user_id: user.id,
          role: 'member',
        })

      if (memberError) {
        // 如果已是成員，忽略錯誤
        if (!memberError.message.includes('duplicate')) {
          throw memberError
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: action === 'accept' ? '已加入分帳群組' : '已拒絕邀請',
      groupId: invitation.group_id,
    })
  } catch (error) {
    logger.error('Update split group invitation error:', error)
    return NextResponse.json({ error: '處理失敗' }, { status: 500 })
  }
}

// DELETE: 刪除邀請
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

    // 取得邀請
    const { data: invitation } = await serviceSupabase
      .from('traveler_split_group_invitations')
      .select('inviter_id')
      .eq('id', id)
      .single()

    if (!invitation) {
      return NextResponse.json({ error: '找不到邀請' }, { status: 404 })
    }

    if (invitation.inviter_id !== user.id) {
      return NextResponse.json({ error: '只有邀請人可以刪除' }, { status: 403 })
    }

    const { error } = await serviceSupabase
      .from('traveler_split_group_invitations')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: '已刪除邀請',
    })
  } catch (error) {
    logger.error('Delete split group invitation error:', error)
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 })
  }
}
