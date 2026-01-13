import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

export interface ExpenseStats {
  month: string
  total_expense: number
  total_income: number
  net: number
  by_category: { category: string; amount: number; count: number }[]
  by_payment: { method: string; amount: number; count: number }[]
  daily_trend: { date: string; expense: number; income: number }[]
  split_summary: {
    total_paid: number
    total_owed_to_me: number
    net_split: number
  }
}

// GET /api/expenses/stats - 取得月度統計
export async function GET(request: Request) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)

    const [year, mon] = month.split('-')
    const startDate = `${year}-${mon}-01`
    const lastDay = new Date(parseInt(year), parseInt(mon), 0).getDate()
    const endDate = `${year}-${mon}-${lastDay.toString().padStart(2, '0')}`

    // 取得當月所有記錄
    const { data: expenses, error } = await supabase
      .from('personal_expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)

    if (error) throw error

    const records = expenses || []

    // 計算總收支
    const total_expense = records
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    const total_income = records
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    // 按分類統計
    const categoryMap = new Map<string, { amount: number; count: number }>()
    records.filter(e => e.type === 'expense').forEach(e => {
      const existing = categoryMap.get(e.category) || { amount: 0, count: 0 }
      categoryMap.set(e.category, {
        amount: existing.amount + Number(e.amount),
        count: existing.count + 1,
      })
    })
    const by_category = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.amount - a.amount)

    // 按付款方式統計
    const paymentMap = new Map<string, { amount: number; count: number }>()
    records.filter(e => e.type === 'expense').forEach(e => {
      const method = e.payment_method || 'cash'
      const existing = paymentMap.get(method) || { amount: 0, count: 0 }
      paymentMap.set(method, {
        amount: existing.amount + Number(e.amount),
        count: existing.count + 1,
      })
    })
    const by_payment = Array.from(paymentMap.entries())
      .map(([method, data]) => ({ method, ...data }))
      .sort((a, b) => b.amount - a.amount)

    // 每日趨勢
    const dailyMap = new Map<string, { expense: number; income: number }>()
    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${year}-${mon}-${d.toString().padStart(2, '0')}`
      dailyMap.set(dateStr, { expense: 0, income: 0 })
    }
    records.forEach(e => {
      const existing = dailyMap.get(e.expense_date)
      if (existing) {
        if (e.type === 'expense') {
          existing.expense += Number(e.amount)
        } else {
          existing.income += Number(e.amount)
        }
      }
    })
    const daily_trend = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // 分帳統計
    const splitExpenses = records.filter(e => e.is_split)
    const total_paid = splitExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const total_owed_to_me = 0 // TODO: 查詢分帳詳情

    const stats: ExpenseStats = {
      month,
      total_expense,
      total_income,
      net: total_income - total_expense,
      by_category,
      by_payment,
      daily_trend,
      split_summary: {
        total_paid,
        total_owed_to_me,
        net_split: total_owed_to_me - total_paid,
      },
    }

    return jsonResponse(stats, { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get expense stats:', error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
}
