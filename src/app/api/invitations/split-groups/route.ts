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

// 生成邀請碼
function generateInviteCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// GET: 取得分帳群組邀請列表
export async function GET(request: Request) {
  try {
    const supabase = await getAuthSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'received' // received | sent | all
    const groupId = searchParams.get('groupId')

    const serviceSupabase = getOnlineSupabase()

    let query = serviceSupabase
      .from('split_group_invitations')
      .select(`
        id,
        group_id,
        inviter_id,
        invitee_id,
        invite_code,
        status,
        message,
        expires_at,
        responded_at,
        created_at,
        group:split_groups(id, name, cover_image),
        inviter:profiles!split_group_invitations_inviter_id_fkey(id, display_name, avatar_url, username),
        invitee:profiles!split_group_invitations_invitee_id_fkey(id, display_name, avatar_url, username)
      `)

    if (groupId) {
      query = query.eq('group_id', groupId)
    }

    if (type === 'received') {
      query = query.eq('invitee_id', user.id).eq('status', 'pending')
    } else if (type === 'sent') {
      query = query.eq('inviter_id', user.id)
    } else {
      query = query.or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('Get split group invitations error:', error)
    return NextResponse.json({ error: '讀取失敗' }, { status: 500 })
  }
}

// POST: 發送分帳群組邀請
export async function POST(request: Request) {
  try {
    const supabase = await getAuthSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const {
      groupId,
      inviteeId,
      username,
      message,
      generateCode = false,
      expiresInDays = 7
    } = await request.json()

    if (!groupId) {
      return NextResponse.json({ error: '請提供群組 ID' }, { status: 400 })
    }

    const serviceSupabase = getOnlineSupabase()

    // 驗證是群組成員
    const { data: membership } = await serviceSupabase
      .from('split_group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: '你不是這個群組的成員' }, { status: 403 })
    }

    // 計算過期時間
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // 模式1: 產生邀請碼
    if (generateCode) {
      const inviteCode = generateInviteCode()

      const { data, error } = await serviceSupabase
        .from('split_group_invitations')
        .insert({
          group_id: groupId,
          inviter_id: user.id,
          invite_code: inviteCode,
          message,
          expires_at: expiresAt.toISOString(),
        })
        .select(`
          id,
          invite_code,
          expires_at,
          group:split_groups(id, name)
        `)
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        data,
        inviteLink: `${process.env.NEXT_PUBLIC_SITE_URL}/invite/split/${inviteCode}`,
      })
    }

    // 模式2: 邀請特定用戶
    let targetUserId = inviteeId

    if (!targetUserId && username) {
      const { data: profile } = await serviceSupabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()

      if (!profile) {
        return NextResponse.json({ error: '找不到該用戶' }, { status: 404 })
      }
      targetUserId = profile.id
    }

    if (!targetUserId) {
      return NextResponse.json({ error: '請提供被邀請人 ID 或用戶名' }, { status: 400 })
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: '不能邀請自己' }, { status: 400 })
    }

    // 平行檢查是否已是成員 + 是否已有邀請
    const [memberResult, inviteResult] = await Promise.all([
      serviceSupabase
        .from('split_group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', targetUserId)
        .single(),
      serviceSupabase
        .from('split_group_invitations')
        .select('id, status')
        .eq('group_id', groupId)
        .eq('invitee_id', targetUserId)
        .eq('status', 'pending')
        .single(),
    ])

    if (memberResult.data) {
      return NextResponse.json({ error: '該用戶已是群組成員' }, { status: 400 })
    }

    if (inviteResult.data) {
      return NextResponse.json({ error: '已有待處理的邀請' }, { status: 400 })
    }

    // 建立邀請
    const { data, error } = await serviceSupabase
      .from('split_group_invitations')
      .insert({
        group_id: groupId,
        inviter_id: user.id,
        invitee_id: targetUserId,
        message,
        expires_at: expiresAt.toISOString(),
      })
      .select(`
        id,
        status,
        created_at,
        group:split_groups(id, name),
        invitee:profiles!split_group_invitations_invitee_id_fkey(id, display_name, avatar_url)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Send split group invitation error:', error)
    return NextResponse.json({ error: '發送邀請失敗' }, { status: 500 })
  }
}
