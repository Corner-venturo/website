import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'

// POST: 領隊掃碼報到
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const body = await request.json()
    const { travelerUserId, leaderUserId } = body

    if (!tripId || !travelerUserId || !leaderUserId) {
      return NextResponse.json(
        { error: '請提供 tripId, travelerUserId 和 leaderUserId' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    // 1. 驗證領隊權限（必須是 owner 或 admin）
    const { data: leaderMember, error: leaderError } = await supabase
      .from('trip_members')
      .select('id, role, nickname')
      .eq('trip_id', tripId)
      .eq('user_id', leaderUserId)
      .single()

    if (leaderError || !leaderMember) {
      return NextResponse.json(
        { error: '您不是此行程的成員' },
        { status: 403 }
      )
    }

    if (leaderMember.role !== 'owner' && leaderMember.role !== 'admin') {
      return NextResponse.json(
        { error: '您沒有報到權限，只有領隊或管理員可以執行報到' },
        { status: 403 }
      )
    }

    // 2. 驗證旅客是否為此行程的成員
    const { data: travelerMember, error: travelerError } = await supabase
      .from('trip_members')
      .select('id, nickname, checked_in, checked_in_at')
      .eq('trip_id', tripId)
      .eq('user_id', travelerUserId)
      .single()

    if (travelerError || !travelerMember) {
      return NextResponse.json(
        { error: '此旅客不是本行程的成員' },
        { status: 404 }
      )
    }

    // 3. 檢查是否已報到
    if (travelerMember.checked_in) {
      return NextResponse.json({
        success: true,
        data: {
          alreadyCheckedIn: true,
          travelerName: travelerMember.nickname,
          checkedInAt: travelerMember.checked_in_at,
        },
        message: `${travelerMember.nickname || '此旅客'} 已於先前報到`,
      })
    }

    // 4. 更新報到狀態
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('trip_members')
      .update({
        checked_in: true,
        checked_in_at: now,
        checked_in_by: leaderUserId,
      })
      .eq('id', travelerMember.id)

    if (updateError) {
      console.error('Update check-in error:', updateError)
      return NextResponse.json(
        { error: '報到失敗，請稍後再試' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        alreadyCheckedIn: false,
        travelerName: travelerMember.nickname,
        checkedInAt: now,
        checkedInBy: leaderMember.nickname,
      },
      message: `✅ ${travelerMember.nickname || '旅客'} 報到成功！`,
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// GET: 取得報到狀態統計
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params

    if (!tripId) {
      return NextResponse.json(
        { error: '請提供 tripId' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    // 取得所有成員的報到狀態
    const { data: members, error } = await supabase
      .from('trip_members')
      .select('id, user_id, nickname, role, checked_in, checked_in_at')
      .eq('trip_id', tripId)
      .order('checked_in', { ascending: false })
      .order('nickname', { ascending: true })

    if (error) {
      console.error('Query check-in status error:', error)
      return NextResponse.json(
        { error: '取得報到狀態失敗' },
        { status: 500 }
      )
    }

    const total = members?.length || 0
    const checkedIn = members?.filter(m => m.checked_in).length || 0

    return NextResponse.json({
      success: true,
      data: {
        total,
        checkedIn,
        notCheckedIn: total - checkedIn,
        members: members || [],
      },
    })
  } catch (error) {
    console.error('Get check-in status error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}
