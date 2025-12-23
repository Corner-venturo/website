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

// GET: 查詢邀請碼資訊
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const serviceSupabase = getOnlineSupabase()

    // 查詢邀請
    const { data: invitation, error } = await serviceSupabase
      .from('trip_invitations')
      .select(`
        id,
        invite_code,
        status,
        role,
        expires_at,
        message,
        trip:trips(
          id,
          title,
          cover_image,
          start_date,
          end_date,
          destination
        ),
        inviter:profiles!trip_invitations_inviter_id_fkey(
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('invite_code', code.toUpperCase())
      .single()

    if (error || !invitation) {
      return NextResponse.json({ error: '找不到邀請碼' }, { status: 404 })
    }

    // 檢查狀態
    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: '此邀請碼已失效' }, { status: 400 })
    }

    // 檢查過期
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: '此邀請碼已過期' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: invitation,
    })
  } catch (error) {
    console.error('Get invite code error:', error)
    return NextResponse.json({ error: '查詢失敗' }, { status: 500 })
  }
}

// POST: 使用邀請碼加入行程
export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const supabase = await getAuthSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const { code } = await params
    const serviceSupabase = getOnlineSupabase()

    // 查詢邀請
    const { data: invitation, error: fetchError } = await serviceSupabase
      .from('trip_invitations')
      .select('*, trip:trips(id, title)')
      .eq('invite_code', code.toUpperCase())
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json({ error: '找不到邀請碼' }, { status: 404 })
    }

    // 檢查狀態
    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: '此邀請碼已失效' }, { status: 400 })
    }

    // 檢查過期
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      await serviceSupabase
        .from('trip_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)
      return NextResponse.json({ error: '此邀請碼已過期' }, { status: 400 })
    }

    // 檢查是否已是成員
    const { data: existingMember } = await serviceSupabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', invitation.trip_id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return NextResponse.json({
        success: true,
        message: '你已經是這個行程的成員',
        tripId: invitation.trip_id,
        alreadyMember: true,
      })
    }

    // 加入行程
    const { error: memberError } = await serviceSupabase
      .from('trip_members')
      .insert({
        trip_id: invitation.trip_id,
        user_id: user.id,
        role: invitation.role || 'member',
      })

    if (memberError) throw memberError

    // 如果邀請碼是一次性的，更新狀態
    // 這裡我們保持邀請碼可重複使用，不更新狀態

    return NextResponse.json({
      success: true,
      message: '已成功加入行程',
      tripId: invitation.trip_id,
      tripTitle: invitation.trip?.title,
    })
  } catch (error) {
    console.error('Join by invite code error:', error)
    return NextResponse.json({ error: '加入失敗' }, { status: 500 })
  }
}
