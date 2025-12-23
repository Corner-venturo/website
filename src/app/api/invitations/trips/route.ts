import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

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

// GET: 取得行程邀請列表
export async function GET(request: Request) {
  try {
    const supabase = await getAuthSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'received' // received | sent | all
    const tripId = searchParams.get('tripId')

    const serviceSupabase = getServiceSupabase()

    let query = serviceSupabase
      .from('trip_invitations')
      .select(`
        id,
        trip_id,
        inviter_id,
        invitee_id,
        invite_code,
        status,
        message,
        role,
        expires_at,
        responded_at,
        created_at,
        trip:trips(id, title, cover_image, start_date, end_date),
        inviter:profiles!trip_invitations_inviter_id_fkey(id, display_name, avatar_url, username),
        invitee:profiles!trip_invitations_invitee_id_fkey(id, display_name, avatar_url, username)
      `)

    if (tripId) {
      query = query.eq('trip_id', tripId)
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
    console.error('Get trip invitations error:', error)
    return NextResponse.json({ error: '讀取失敗' }, { status: 500 })
  }
}

// POST: 發送行程邀請 / 產生邀請碼
export async function POST(request: Request) {
  try {
    const supabase = await getAuthSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const {
      tripId,
      inviteeId,
      username,
      message,
      role = 'member',
      generateCode = false,
      expiresInDays = 7
    } = await request.json()

    if (!tripId) {
      return NextResponse.json({ error: '請提供行程 ID' }, { status: 400 })
    }

    const serviceSupabase = getServiceSupabase()

    // 驗證是行程成員
    const { data: membership } = await serviceSupabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: '你不是這個行程的成員' }, { status: 403 })
    }

    // 計算過期時間
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // 模式1: 產生邀請碼（無特定被邀請人）
    if (generateCode) {
      const inviteCode = generateInviteCode()

      const { data, error } = await serviceSupabase
        .from('trip_invitations')
        .insert({
          trip_id: tripId,
          inviter_id: user.id,
          invite_code: inviteCode,
          message,
          role,
          expires_at: expiresAt.toISOString(),
        })
        .select(`
          id,
          invite_code,
          expires_at,
          trip:trips(id, title)
        `)
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        data,
        inviteLink: `${process.env.NEXT_PUBLIC_SITE_URL}/invite/trip/${inviteCode}`,
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

    // 檢查是否已是成員
    const { data: existingMember } = await serviceSupabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', targetUserId)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: '該用戶已是行程成員' }, { status: 400 })
    }

    // 檢查是否已有邀請
    const { data: existingInvite } = await serviceSupabase
      .from('trip_invitations')
      .select('id, status')
      .eq('trip_id', tripId)
      .eq('invitee_id', targetUserId)
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      return NextResponse.json({ error: '已有待處理的邀請' }, { status: 400 })
    }

    // 建立邀請
    const { data, error } = await serviceSupabase
      .from('trip_invitations')
      .insert({
        trip_id: tripId,
        inviter_id: user.id,
        invitee_id: targetUserId,
        message,
        role,
        expires_at: expiresAt.toISOString(),
      })
      .select(`
        id,
        status,
        created_at,
        trip:trips(id, title),
        invitee:profiles!trip_invitations_invitee_id_fkey(id, display_name, avatar_url)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Send trip invitation error:', error)
    return NextResponse.json({ error: '發送邀請失敗' }, { status: 500 })
  }
}
