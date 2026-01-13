import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

export interface Account {
  id: string
  user_id: string
  name: string
  type: 'cash' | 'bank' | 'credit_card' | 'debit_card' | 'e_wallet' | 'investment' | 'other'
  icon: string
  color: string
  currency: string
  initial_balance: number
  current_balance: number
  credit_limit?: number
  billing_day?: number
  due_day?: number
  sort_order: number
  is_active: boolean
  is_default: boolean
  include_in_total: boolean
  note?: string
  created_at: string
  updated_at: string
}

// GET /api/accounts - 取得用戶的帳戶列表
export async function GET() {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw error

    // 計算帳戶總覽
    const accounts = data || []
    const summary = {
      total_assets: 0,
      total_liabilities: 0,
      net_worth: 0,
      by_type: {} as Record<string, number>,
    }

    accounts.forEach(acc => {
      if (acc.include_in_total) {
        if (acc.type === 'credit_card') {
          // 信用卡餘額為負數表示欠款
          summary.total_liabilities += Math.abs(acc.current_balance)
        } else {
          summary.total_assets += acc.current_balance
        }

        summary.by_type[acc.type] = (summary.by_type[acc.type] || 0) + acc.current_balance
      }
    })

    summary.net_worth = summary.total_assets - summary.total_liabilities

    return jsonResponse({ accounts, summary }, { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get accounts:', error)
    return NextResponse.json({ error: 'Failed to get accounts' }, { status: 500 })
  }
}

// POST /api/accounts - 新增帳戶
export async function POST(request: Request) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.name || !body.type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 如果設為預設帳戶，先取消其他預設
    if (body.is_default) {
      await supabase
        .from('accounts')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    const accountData = {
      user_id: user.id,
      name: body.name,
      type: body.type,
      icon: body.icon || getDefaultIcon(body.type),
      color: body.color || getDefaultColor(body.type),
      currency: body.currency || 'TWD',
      initial_balance: body.initial_balance || 0,
      current_balance: body.initial_balance || 0,
      credit_limit: body.credit_limit,
      billing_day: body.billing_day,
      due_day: body.due_day,
      sort_order: body.sort_order || 0,
      is_active: body.is_active ?? true,
      is_default: body.is_default ?? false,
      include_in_total: body.include_in_total ?? true,
      note: body.note,
    }

    const { data, error } = await supabase
      .from('accounts')
      .insert(accountData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Failed to create account:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}

function getDefaultIcon(type: string): string {
  const icons: Record<string, string> = {
    cash: 'payments',
    bank: 'account_balance',
    credit_card: 'credit_card',
    debit_card: 'credit_card',
    e_wallet: 'account_balance_wallet',
    investment: 'trending_up',
    other: 'wallet',
  }
  return icons[type] || 'wallet'
}

function getDefaultColor(type: string): string {
  const colors: Record<string, string> = {
    cash: '#10B981',
    bank: '#3B82F6',
    credit_card: '#EF4444',
    debit_card: '#8B5CF6',
    e_wallet: '#F59E0B',
    investment: '#06B6D4',
    other: '#6B7280',
  }
  return colors[type] || '#6B7280'
}
