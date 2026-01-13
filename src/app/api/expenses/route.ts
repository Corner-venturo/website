import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

export interface PersonalExpense {
  id?: string
  user_id?: string
  amount: number
  type: 'expense' | 'income'
  title: string
  description?: string
  category: string
  payment_method?: string
  expense_date: string
  expense_time?: string
  is_split?: boolean
  split_group_id?: string
  split_expense_id?: string
  tags?: string[]
  receipt_url?: string
  location?: string
  created_at?: string
}

// GET /api/expenses - 取得用戶的支出記錄
export async function GET(request: Request) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const month = searchParams.get('month') // 格式: '2026-01'
    const category = searchParams.get('category')
    const type = searchParams.get('type') // 'expense' | 'income'

    let query = supabase
      .from('personal_expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (month) {
      const [year, mon] = month.split('-')
      const startDate = `${year}-${mon}-01`
      const endDate = new Date(parseInt(year), parseInt(mon), 0).toISOString().split('T')[0]
      query = query.gte('expense_date', startDate).lte('expense_date', endDate)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query.range(offset, offset + limit - 1)

    if (error) throw error

    return jsonResponse(data || [], { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get expenses:', error)
    return NextResponse.json({ error: 'Failed to get expenses' }, { status: 500 })
  }
}

// POST /api/expenses - 新增支出記錄
export async function POST(request: Request) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: PersonalExpense = await request.json()

    // 驗證必填欄位
    if (!body.amount || !body.title || !body.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const expenseData = {
      user_id: user.id,
      amount: body.amount,
      type: body.type || 'expense',
      title: body.title,
      description: body.description,
      category: body.category,
      payment_method: body.payment_method || 'cash',
      expense_date: body.expense_date || new Date().toISOString().split('T')[0],
      expense_time: body.expense_time,
      is_split: body.is_split || false,
      split_group_id: body.split_group_id,
      split_expense_id: body.split_expense_id,
      tags: body.tags,
      receipt_url: body.receipt_url,
      location: body.location,
    }

    const { data, error } = await supabase
      .from('personal_expenses')
      .insert(expenseData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Failed to create expense:', error)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
