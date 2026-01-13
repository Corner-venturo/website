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

// GET: 取得對話訊息
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
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const before = searchParams.get('before') // 分頁用：取得此訊息之前的

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
      return NextResponse.json({ error: '無權限查看此對話' }, { status: 403 })
    }

    // 建立查詢
    let query = serviceSupabase
      .from('traveler_messages')
      .select(`
        id,
        content,
        type,
        attachments,
        reactions,
        metadata,
        edited_at,
        created_at,
        reply_to_id,
        sender:traveler_profiles!sender_id(id, display_name, avatar_url),
        reply_to:traveler_messages!reply_to_id(
          id,
          content,
          type,
          sender:traveler_profiles!sender_id(id, display_name)
        )
      `)
      .eq('conversation_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    // 分頁查詢
    if (before) {
      const { data: beforeMessage } = await serviceSupabase
        .from('traveler_messages')
        .select('created_at')
        .eq('id', before)
        .single()

      if (beforeMessage) {
        query = query.lt('created_at', beforeMessage.created_at)
      }
    }

    const { data: messages, error } = await query

    if (error) throw error

    // 反轉順序（讓舊訊息在前）
    const sortedMessages = (messages || []).reverse()

    return NextResponse.json({
      success: true,
      data: sortedMessages,
      hasMore: (messages || []).length === limit,
    })
  } catch (error) {
    logger.error('Get messages error:', error)
    return NextResponse.json({ error: '讀取訊息失敗' }, { status: 500 })
  }
}

// POST: 發送訊息
export async function POST(
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
    const { content, type = 'text', attachments, reply_to_id } = await request.json()

    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: '訊息內容不能為空' }, { status: 400 })
    }

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
      return NextResponse.json({ error: '無權限發送訊息' }, { status: 403 })
    }

    // 發送訊息
    const { data: message, error } = await serviceSupabase
      .from('traveler_messages')
      .insert({
        conversation_id: id,
        sender_id: user.id,
        content,
        type,
        attachments: attachments || [],
        reply_to_id: reply_to_id || null,
      })
      .select(`
        id,
        content,
        type,
        attachments,
        reactions,
        created_at,
        sender:traveler_profiles!sender_id(id, display_name, avatar_url)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: message,
    })
  } catch (error) {
    logger.error('Send message error:', error)
    return NextResponse.json({ error: '發送訊息失敗' }, { status: 500 })
  }
}
