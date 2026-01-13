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

// GET: 取得用戶的對話列表
export async function GET() {
  try {
    const supabase = await getAuthSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const serviceSupabase = getOnlineSupabase()

    // 取得用戶的所有對話（包含最後訊息預覽和未讀數）
    const { data: conversations, error } = await serviceSupabase
      .from('traveler_conversations')
      .select(`
        id,
        type,
        name,
        avatar_url,
        trip_id,
        split_group_id,
        tour_id,
        is_open,
        last_message_preview,
        last_message_at,
        created_at,
        updated_at,
        tours(
          tour_code,
          name,
          departure_date
        ),
        members:traveler_conversation_members!inner(
          user_id,
          role,
          last_read_message_id,
          is_muted,
          user:traveler_profiles(id, display_name, avatar_url)
        )
      `)
      .eq('members.user_id', user.id)
      .is('members.left_at', null)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (error) throw error

    // 過濾掉未開啟的團對話
    const filteredConversations = (conversations || []).filter(conv => {
      // 團公告/客服對話：只顯示已開啟的
      if (conv.type === 'tour_announcement' || conv.type === 'tour_support') {
        return conv.is_open === true
      }
      return true
    })

    // 批量取得未讀數（避免 N+1 查詢）
    const conversationIds = filteredConversations.map(c => c.id)
    const { data: unreadData } = await serviceSupabase
      .rpc('get_unread_counts_batch', { p_conversation_ids: conversationIds })

    // 建立未讀數對照表
    const unreadMap = new Map<string, number>()
    if (unreadData) {
      for (const item of unreadData) {
        unreadMap.set(item.conversation_id, item.unread_count)
      }
    }

    // 處理對話顯示資訊
    const conversationsWithUnread = filteredConversations.map(conv => {
      // 處理顯示名稱和頭像
      let displayName = conv.name
      let displayAvatar = conv.avatar_url

      if (conv.type === 'direct') {
        // 私訊：顯示對方名稱
        interface ConvMember {
          user_id: string
          role: string
          user: Array<{ id: string; display_name: string | null; avatar_url: string | null }>
        }
        const otherMember = (conv.members as unknown as ConvMember[]).find((m) => m.user_id !== user.id)
        if (otherMember?.user?.[0]) {
          displayName = otherMember.user[0].display_name
          displayAvatar = otherMember.user[0].avatar_url
        }
      } else if (conv.type === 'tour_announcement' || conv.type === 'tour_support') {
        // 團對話：顯示團號和類型
        interface TourInfo {
          tour_code: string
          name: string
          departure_date: string
        }
        const tour = conv.tours as unknown as TourInfo | null
        if (tour) {
          const typeLabel = conv.type === 'tour_announcement' ? '公告' : '客服'
          displayName = `${tour.tour_code} ${typeLabel}`
        }
      }

      return {
        ...conv,
        tour: conv.tours || null,
        display_name: displayName,
        display_avatar: displayAvatar,
        unread_count: unreadMap.get(conv.id) || 0,
      }
    })

    return NextResponse.json({
      success: true,
      data: conversationsWithUnread,
    })
  } catch (error) {
    logger.error('Get conversations error:', error)
    return NextResponse.json({ error: '讀取失敗' }, { status: 500 })
  }
}

// POST: 建立新對話
export async function POST(request: Request) {
  try {
    const supabase = await getAuthSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const { type, otherUserId, tripId, splitGroupId, name } = await request.json()

    const serviceSupabase = getOnlineSupabase()

    // 私訊：使用 RPC 建立或取得對話
    if (type === 'direct') {
      if (!otherUserId) {
        return NextResponse.json({ error: '請提供對方用戶 ID' }, { status: 400 })
      }

      if (otherUserId === user.id) {
        return NextResponse.json({ error: '無法與自己對話' }, { status: 400 })
      }

      const { data: conversationId, error } = await serviceSupabase
        .rpc('get_or_create_direct_conversation', { other_user_id: otherUserId })

      if (error) throw error

      return NextResponse.json({
        success: true,
        conversationId,
      })
    }

    // 群組聊天：建立新對話
    if (type === 'trip' || type === 'split') {
      const { data: conversation, error: createError } = await serviceSupabase
        .from('traveler_conversations')
        .insert({
          type,
          name,
          trip_id: type === 'trip' ? tripId : null,
          split_group_id: type === 'split' ? splitGroupId : null,
          created_by: user.id,
        })
        .select()
        .single()

      if (createError) throw createError

      // 將建立者加入成員
      await serviceSupabase
        .from('traveler_conversation_members')
        .insert({
          conversation_id: conversation.id,
          user_id: user.id,
          role: 'owner',
        })

      return NextResponse.json({
        success: true,
        conversationId: conversation.id,
      })
    }

    return NextResponse.json({ error: '無效的對話類型' }, { status: 400 })
  } catch (error) {
    logger.error('Create conversation error:', error)
    return NextResponse.json({ error: '建立對話失敗' }, { status: 500 })
  }
}
