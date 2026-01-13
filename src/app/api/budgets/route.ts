import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

export interface Budget {
  id: string
  user_id: string
  category_id?: string
  name?: string
  amount: number
  period: 'monthly' | 'weekly' | 'yearly'
  start_date?: string
  alert_threshold: number
  is_active: boolean
  created_at: string
  updated_at: string
  // 加入分類資訊
  category?: {
    id: string
    name: string
    icon: string
    color: string
  }
  // 加入使用情況
  spent?: number
  remaining?: number
  percentage?: number
}

// GET /api/budgets - 取得用戶的預算列表
export async function GET(request: Request) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)

    // 取得預算設定
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select(`
        *,
        category:expense_categories(id, name, icon, color)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (budgetError) throw budgetError

    // 計算當月支出
    const [year, mon] = month.split('-')
    const startDate = `${year}-${mon}-01`
    const lastDay = new Date(parseInt(year), parseInt(mon), 0).getDate()
    const endDate = `${year}-${mon}-${lastDay.toString().padStart(2, '0')}`

    const { data: expenses, error: expenseError } = await supabase
      .from('personal_expenses')
      .select('category, amount')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)

    if (expenseError) throw expenseError

    // 計算每個分類的支出
    const categorySpending = new Map<string, number>()
    let totalSpending = 0

    expenses?.forEach(exp => {
      const current = categorySpending.get(exp.category) || 0
      categorySpending.set(exp.category, current + Number(exp.amount))
      totalSpending += Number(exp.amount)
    })

    // 加入使用情況到預算
    const budgetsWithSpent = (budgets || []).map(budget => {
      let spent = 0

      if (budget.category_id) {
        // 分類預算
        spent = categorySpending.get(budget.category?.name || '') || 0
      } else {
        // 總預算
        spent = totalSpending
      }

      const remaining = budget.amount - spent
      const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0

      return {
        ...budget,
        spent,
        remaining,
        percentage,
      }
    })

    // 計算總覽
    const totalBudget = budgetsWithSpent
      .filter(b => !b.category_id) // 只計算總預算
      .reduce((sum, b) => sum + b.amount, 0)

    const summary = {
      total_budget: totalBudget,
      total_spent: totalSpending,
      total_remaining: totalBudget - totalSpending,
      overall_percentage: totalBudget > 0 ? Math.round((totalSpending / totalBudget) * 100) : 0,
    }

    return jsonResponse({ budgets: budgetsWithSpent, summary }, { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get budgets:', error)
    return NextResponse.json({ error: 'Failed to get budgets' }, { status: 500 })
  }
}

// POST /api/budgets - 新增預算
export async function POST(request: Request) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const budgetData = {
      user_id: user.id,
      category_id: body.category_id,
      name: body.name,
      amount: body.amount,
      period: body.period || 'monthly',
      start_date: body.start_date,
      alert_threshold: body.alert_threshold || 80,
      is_active: body.is_active ?? true,
    }

    const { data, error } = await supabase
      .from('budgets')
      .insert(budgetData)
      .select(`
        *,
        category:expense_categories(id, name, icon, color)
      `)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Failed to create budget:', error)
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 })
  }
}

// PATCH /api/budgets - 更新預算
export async function PATCH(request: Request) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Missing budget id' }, { status: 400 })
    }

    const { id, ...updateData } = body

    const { data, error } = await supabase
      .from('budgets')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        category:expense_categories(id, name, icon, color)
      `)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Failed to update budget:', error)
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 })
  }
}

// DELETE /api/budgets - 刪除預算
export async function DELETE(request: Request) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing budget id' }, { status: 400 })
    }

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to delete budget:', error)
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 })
  }
}
