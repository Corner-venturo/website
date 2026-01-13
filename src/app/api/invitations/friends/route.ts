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

// GET: 取得好友邀請列表（收到的、發出的）
export async function GET(request: Request) {
  try {
    const supabase = await getAuthSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'received' // received | sent | all

    const serviceSupabase = getOnlineSupabase()

    let query = serviceSupabase
      .from('traveler_friends')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        expires_at,
        invite_message,
        created_at,
        updated_at,
        inviter:profiles!friends_user_id_fkey(id, display_name, avatar_url, username),
        invitee:profiles!friends_friend_id_fkey(id, display_name, avatar_url, username)
      `)

    if (type === 'received') {
      query = query.eq('friend_id', user.id).eq('status', 'pending')
    } else if (type === 'sent') {
      query = query.eq('user_id', user.id).eq('status', 'pending')
    } else {
      query = query.or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    logger.error('Get friend invitations error:', error)
    return NextResponse.json({ error: '讀取失敗' }, { status: 500 })
  }
}

// POST: 發送好友邀請
export async function POST(request: Request) {
  try {
    const supabase = await getAuthSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const { friendId, username, message, expiresInDays = 7 } = await request.json()

    const serviceSupabase = getOnlineSupabase()
    let targetUserId = friendId

    // 如果提供 username，查找對應用戶
    if (!targetUserId && username) {
      const { data: profile } = await serviceSupabase
        .from('traveler_profiles')
        .select('id')
        .eq('username', username)
        .single()

      if (!profile) {
        return NextResponse.json({ error: '找不到該用戶' }, { status: 404 })
      }
      targetUserId = profile.id
    }

    if (!targetUserId) {
      return NextResponse.json({ error: '請提供好友 ID 或用戶名' }, { status: 400 })
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: '不能加自己為好友' }, { status: 400 })
    }

    // 檢查是否已有邀請或好友關係
    const { data: existing } = await serviceSupabase
      .from('traveler_friends')
      .select('id, status')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${user.id})`)
      .single()

    if (existing) {
      if (existing.status === 'accepted') {
        return NextResponse.json({ error: '你們已經是好友了' }, { status: 400 })
      }
      if (existing.status === 'pending') {
        return NextResponse.json({ error: '已有待處理的邀請' }, { status: 400 })
      }
    }

    // 計算過期時間
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // 建立邀請
    const { data, error } = await serviceSupabase
      .from('traveler_friends')
      .insert({
        user_id: user.id,
        friend_id: targetUserId,
        status: 'pending',
        invite_message: message,
        expires_at: expiresAt.toISOString(),
      })
      .select(`
        id,
        status,
        created_at,
        invitee:profiles!friends_friend_id_fkey(id, display_name, avatar_url, username)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    logger.error('Send friend invitation error:', error)
    return NextResponse.json({ error: '發送邀請失敗' }, { status: 500 })
  }
}
