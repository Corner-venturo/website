import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getOnlineSupabase } from '@/lib/supabase-server'

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

// PUT: 接受/拒絕好友邀請
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
    const { action } = await request.json() // accept | reject

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: '無效的操作' }, { status: 400 })
    }

    const serviceSupabase = getOnlineSupabase()

    // 取得邀請
    const { data: invitation, error: fetchError } = await serviceSupabase
      .from('friends')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json({ error: '找不到邀請' }, { status: 404 })
    }

    // 驗證是被邀請人
    if (invitation.friend_id !== user.id) {
      return NextResponse.json({ error: '無權限處理此邀請' }, { status: 403 })
    }

    // 驗證狀態
    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: '此邀請已處理' }, { status: 400 })
    }

    // 檢查是否過期
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      await serviceSupabase
        .from('friends')
        .update({ status: 'rejected' })
        .eq('id', id)
      return NextResponse.json({ error: '邀請已過期' }, { status: 400 })
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected'

    // 更新狀態
    const { data, error } = await serviceSupabase
      .from('friends')
      .update({ status: newStatus })
      .eq('id', id)
      .select(`
        id,
        status,
        updated_at,
        inviter:profiles!friends_user_id_fkey(id, display_name, avatar_url)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: action === 'accept' ? '已接受好友邀請' : '已拒絕好友邀請',
      data,
    })
  } catch (error) {
    console.error('Update friend invitation error:', error)
    return NextResponse.json({ error: '處理失敗' }, { status: 500 })
  }
}

// DELETE: 撤回好友邀請
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
    const { data: invitation, error: fetchError } = await serviceSupabase
      .from('friends')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json({ error: '找不到邀請' }, { status: 404 })
    }

    // 驗證是發送人且狀態為 pending
    if (invitation.user_id !== user.id) {
      return NextResponse.json({ error: '只有發送者可以撤回邀請' }, { status: 403 })
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: '只能撤回待處理的邀請' }, { status: 400 })
    }

    // 刪除邀請
    const { error } = await serviceSupabase
      .from('friends')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: '已撤回邀請',
    })
  } catch (error) {
    console.error('Delete friend invitation error:', error)
    return NextResponse.json({ error: '撤回失敗' }, { status: 500 })
  }
}
