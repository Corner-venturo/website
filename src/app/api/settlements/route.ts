import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const getSupabase = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing')
  }
  return createClient(supabaseUrl, supabaseKey)
}

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

    const supabase = getSupabase()

    let query = supabase
      .from('settlements')
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
      console.error('Query settlements error:', error)
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
    console.error('Get settlements error:', error)
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

    const supabase = getSupabase()

    // 如果是透過群組結算，取得群組關聯的 trip_id
    let effectiveTripId = tripId
    if (groupId && !tripId) {
      const { data: group } = await supabase
        .from('split_groups')
        .select('trip_id')
        .eq('id', groupId)
        .single()
      effectiveTripId = group?.trip_id || null
    }

    const { data: settlement, error } = await supabase
      .from('settlements')
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
      console.error('Insert settlement error:', error)
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
    console.error('Create settlement error:', error)
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

    const supabase = getSupabase()

    const updateData: Record<string, unknown> = { status }
    if (status === 'completed') {
      updateData.completed_at = completedAt || new Date().toISOString()
    }

    const { data: settlement, error } = await supabase
      .from('settlements')
      .update(updateData)
      .eq('id', settlementId)
      .select()
      .single()

    if (error) {
      console.error('Update settlement error:', error)
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
    console.error('Update settlement error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}
