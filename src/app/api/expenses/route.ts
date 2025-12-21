import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// 使用 venturo-online Supabase (使用 anon key，依賴 RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const getSupabase = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing')
  }
  return createClient(supabaseUrl, supabaseKey)
}

// GET: 取得費用列表（支援 tripId 或 groupId）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tripId = searchParams.get('tripId')
    const groupId = searchParams.get('groupId')

    if (!tripId && !groupId) {
      return NextResponse.json(
        { error: '請提供行程 ID 或分帳群組 ID' },
        { status: 400 }
      )
    }

    // 取得費用列表（含分攤資訊）
    const supabase = getSupabase()
    let query = supabase
      .from('expenses')
      .select(`
        *,
        paid_by_profile:profiles!expenses_paid_by_fkey(id, display_name, avatar_url),
        expense_splits(
          id,
          user_id,
          amount,
          is_settled,
          user:profiles(id, display_name, avatar_url)
        )
      `)
      .order('expense_date', { ascending: false })

    // 根據參數過濾
    if (groupId) {
      query = query.eq('split_group_id', groupId)
    } else if (tripId) {
      query = query.eq('trip_id', tripId)
    }

    const { data: expenses, error } = await query

    if (error) {
      console.error('Query expenses error:', error)
      return NextResponse.json(
        { error: '取得費用失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: expenses,
    })
  } catch (error) {
    console.error('Get expenses error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// POST: 新增費用記錄
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      tripId,
      groupId, // 分帳群組 ID（可選，與 tripId 二擇一）
      title,
      description,
      category,
      amount,
      currency = 'TWD',
      paidBy,
      expenseDate,
      splitWith = [], // 分攤對象的 user_id 陣列
      itineraryItemId, // 關聯的行程項目 ID（選填）
    } = body

    if ((!tripId && !groupId) || !title || !amount || !paidBy) {
      return NextResponse.json(
        { error: '請提供必要欄位：(tripId 或 groupId), title, amount, paidBy' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // 如果是透過群組記帳，取得群組關聯的 trip_id（如果有的話）
    let effectiveTripId = tripId
    if (groupId && !tripId) {
      const { data: group } = await supabase
        .from('split_groups')
        .select('trip_id')
        .eq('id', groupId)
        .single()
      effectiveTripId = group?.trip_id || null
    }

    // 新增費用記錄
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        trip_id: effectiveTripId,
        split_group_id: groupId || null,
        title,
        description,
        category: category || 'other',
        amount: parseFloat(amount),
        currency,
        paid_by: paidBy,
        expense_date: expenseDate || new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (expenseError) {
      console.error('Insert expense error:', expenseError)
      return NextResponse.json(
        { error: '新增費用失敗' },
        { status: 500 }
      )
    }

    // 如果有分攤對象，新增分攤記錄
    if (splitWith.length > 0) {
      const splitAmount = parseFloat(amount) / splitWith.length

      const splits = splitWith.map((userId: string) => ({
        expense_id: expense.id,
        user_id: userId,
        amount: splitAmount,
        is_settled: false,
      }))

      const { error: splitError } = await supabase
        .from('expense_splits')
        .insert(splits)

      if (splitError) {
        console.error('Insert splits error:', splitError)
        // 不中斷，費用已建立
      }
    }

    // 如果有關聯行程項目，更新項目的 paid_by
    if (itineraryItemId) {
      await supabase
        .from('trip_itinerary_items')
        .update({ paid_by: paidBy })
        .eq('id', itineraryItemId)
    }

    return NextResponse.json({
      success: true,
      data: expense,
    })
  } catch (error) {
    console.error('Create expense error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}
