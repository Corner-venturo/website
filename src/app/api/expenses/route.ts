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

// GET: 取得行程的所有費用
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tripId = searchParams.get('tripId')

    if (!tripId) {
      return NextResponse.json(
        { error: '請提供行程 ID' },
        { status: 400 }
      )
    }

    // 取得費用列表（含分攤資訊）
    const supabase = getSupabase()
    const { data: expenses, error } = await supabase
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
      .eq('trip_id', tripId)
      .order('expense_date', { ascending: false })

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

    if (!tripId || !title || !amount || !paidBy) {
      return NextResponse.json(
        { error: '請提供必要欄位：tripId, title, amount, paidBy' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // 新增費用記錄
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        trip_id: tripId,
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
