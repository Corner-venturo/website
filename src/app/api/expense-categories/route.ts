import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

export interface ExpenseCategory {
  id: string
  user_id?: string
  parent_id?: string
  name: string
  icon: string
  color: string
  type: 'expense' | 'income' | 'both'
  is_system: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  // 子分類
  children?: ExpenseCategory[]
}

// GET /api/expense-categories - 取得分類列表
export async function GET(request: Request) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'expense' | 'income' | 'both'
    const flat = searchParams.get('flat') === 'true' // 是否返回扁平結構

    let query = supabase
      .from('expense_categories')
      .select('*')
      .or(`is_system.eq.true,user_id.eq.${user.id}`)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (type) {
      query = query.or(`type.eq.${type},type.eq.both`)
    }

    const { data, error } = await query

    if (error) throw error

    const categories = data || []

    if (flat) {
      return jsonResponse(categories, { cache: CACHE_CONFIGS.privateShort })
    }

    // 建立階層結構
    const parentCategories = categories.filter(c => !c.parent_id)
    const childCategories = categories.filter(c => c.parent_id)

    const hierarchical = parentCategories.map(parent => ({
      ...parent,
      children: childCategories.filter(child => child.parent_id === parent.id),
    }))

    return jsonResponse(hierarchical, { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get categories:', error)
    return NextResponse.json({ error: 'Failed to get categories' }, { status: 500 })
  }
}

// POST /api/expense-categories - 新增自訂分類
export async function POST(request: Request) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.name) {
      return NextResponse.json({ error: 'Missing category name' }, { status: 400 })
    }

    const categoryData = {
      user_id: user.id,
      parent_id: body.parent_id,
      name: body.name,
      icon: body.icon || 'category',
      color: body.color || '#6B7280',
      type: body.type || 'expense',
      is_system: false,
      is_active: true,
      sort_order: body.sort_order || 0,
    }

    const { data, error } = await supabase
      .from('expense_categories')
      .insert(categoryData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Failed to create category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

// PATCH /api/expense-categories - 更新分類
export async function PATCH(request: Request) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Missing category id' }, { status: 400 })
    }

    const { id, ...updateData } = body

    // 不允許修改系統分類
    const { data: existing } = await supabase
      .from('expense_categories')
      .select('is_system')
      .eq('id', id)
      .single()

    if (existing?.is_system) {
      return NextResponse.json({ error: 'Cannot modify system category' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('expense_categories')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Failed to update category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE /api/expense-categories - 刪除分類
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
      return NextResponse.json({ error: 'Missing category id' }, { status: 400 })
    }

    // 不允許刪除系統分類
    const { data: existing } = await supabase
      .from('expense_categories')
      .select('is_system')
      .eq('id', id)
      .single()

    if (existing?.is_system) {
      return NextResponse.json({ error: 'Cannot delete system category' }, { status: 403 })
    }

    // 軟刪除（設為停用）
    const { data, error } = await supabase
      .from('expense_categories')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    logger.error('Failed to delete category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
