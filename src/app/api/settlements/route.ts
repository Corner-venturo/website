import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

// GET: 取得結算記錄
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tripId = searchParams.get('tripId')
    const groupId = searchParams.get('groupId')
    const userId = searchParams.get('userId')

    if (!tripId && !groupId && !userId) {
      return NextResponse.json(
        { error: '請提供查詢條件：tripId, groupId 或 userId' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    let query = supabase
      .from('traveler_settlements')
      .select(`
        *,
        from_profile:profiles!settlements_from_user_fkey(id, display_name, avatar_url),
        to_profile:profiles!settlements_to_user_fkey(id, display_name, avatar_url),
        trip:trips(id, title),
        split_group:split_groups(id, name)
      `)
      .order('created_at', { ascending: false })

    if (groupId) {
      query = query.eq('split_group_id', groupId)
    } else if (tripId) {
      query = query.eq('trip_id', tripId)
    } else if (userId) {
      query = query.or(`from_user.eq.${userId},to_user.eq.${userId}`)
    }

    const { data: settlements, error } = await query

    if (error) {
      logger.error('Query settlements error:', error)
      return NextResponse.json(
        { error: '取得結算記錄失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: settlements,
    })
  } catch (error) {
    logger.error('Get settlements error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// POST: 建立結算記錄
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      tripId,
      groupId,
      fromUser,
      toUser,
      amount,
      currency = 'TWD',
      note,
    } = body

    if ((!tripId && !groupId) || !fromUser || !toUser || !amount) {
      return NextResponse.json(
        { error: '請提供必要欄位：(tripId 或 groupId), fromUser, toUser, amount' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    // 如果是透過群組結算，取得群組關聯的 trip_id
    let effectiveTripId = tripId
    if (groupId && !tripId) {
      const { data: group } = await supabase
        .from('traveler_split_groups')
        .select('trip_id')
        .eq('id', groupId)
        .single()
      effectiveTripId = group?.trip_id || null
    }

    const { data: settlement, error } = await supabase
      .from('traveler_settlements')
      .insert({
        trip_id: effectiveTripId,
        split_group_id: groupId || null,
        from_user: fromUser,
        to_user: toUser,
        amount: parseFloat(amount),
        currency,
        note,
        status: 'pending',
      })
      .select(`
        *,
        from_profile:profiles!settlements_from_user_fkey(id, display_name, avatar_url),
        to_profile:profiles!settlements_to_user_fkey(id, display_name, avatar_url)
      `)
      .single()

    if (error) {
      logger.error('Insert settlement error:', error)
      return NextResponse.json(
        { error: '建立結算記錄失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: settlement,
    })
  } catch (error) {
    logger.error('Create settlement error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// PUT: 更新結算狀態（確認收款）
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { settlementId, status, completedAt } = body

    if (!settlementId || !status) {
      return NextResponse.json(
        { error: '請提供 settlementId 和 status' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    const updateData: Record<string, unknown> = { status }
    if (status === 'completed') {
      updateData.completed_at = completedAt || new Date().toISOString()
    }

    const { data: settlement, error } = await supabase
      .from('traveler_settlements')
      .update(updateData)
      .eq('id', settlementId)
      .select()
      .single()

    if (error) {
      logger.error('Update settlement error:', error)
      return NextResponse.json(
        { error: '更新結算記錄失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: settlement,
    })
  } catch (error) {
    logger.error('Update settlement error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}
