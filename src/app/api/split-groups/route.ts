import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, errorResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

// GET: 取得我的所有分帳群組
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const tripId = searchParams.get('tripId') // 可選：只取得某旅遊團的分帳群組

    if (!userId) {
      return errorResponse('請提供使用者 ID', 400)
    }

    const supabase = getOnlineSupabase()

    // 取得用戶所屬的群組 ID
    const { data: memberOf, error: memberError } = await supabase
      .from('traveler_split_group_members')
      .select('group_id')
      .eq('user_id', userId)

    if (memberError) {
      logger.error('Query member groups error:', memberError)
      return errorResponse('取得群組失敗', 500)
    }

    const groupIds = memberOf?.map(m => m.group_id) || []

    if (groupIds.length === 0) {
      return jsonResponse({ success: true, data: [] }, { cache: CACHE_CONFIGS.privateShort })
    }

    // 平行取得所有需要的資料（避免 N+1 查詢）
    let groupQuery = supabase
      .from('traveler_split_groups')
      .select(`
        *,
        trip:trips(id, title, cover_image, start_date, end_date),
        members:split_group_members(
          id,
          user_id,
          nickname,
          role,
          user:profiles(id, display_name, avatar_url)
        )
      `)
      .in('id', groupIds)
      .order('updated_at', { ascending: false })

    if (tripId) {
      groupQuery = groupQuery.eq('trip_id', tripId)
    }

    // 平行執行所有查詢 - 優化 N+1 問題
    const [groupsResult, allExpensesResult, userSplitsResult] = await Promise.all([
      groupQuery,
      // 一次取得所有群組的費用
      supabase
        .from('traveler_expenses')
        .select('id, amount, paid_by, split_group_id')
        .in('split_group_id', groupIds),
      // 一次取得用戶在所有群組的分攤
      supabase
        .from('traveler_expense_splits')
        .select('amount, is_settled, expense_id')
        .eq('user_id', userId)
    ])

    if (groupsResult.error) {
      logger.error('Query groups error:', groupsResult.error)
      return errorResponse('取得群組失敗', 500)
    }

    const groups = groupsResult.data || []
    const allExpenses = allExpensesResult.data || []
    const userSplits = userSplitsResult.data || []

    // 建立費用 ID 到群組 ID 的映射
    const expenseToGroup = new Map<string, string>()
    allExpenses.forEach(e => expenseToGroup.set(e.id, e.split_group_id))

    // 在記憶體中計算每個群組的餘額（超快速）
    const groupsWithBalance = groups.map((group) => {
      const groupExpenses = allExpenses.filter(e => e.split_group_id === group.id)

      // 計算用戶付款總額
      const totalPaid = groupExpenses
        .filter(e => e.paid_by === userId)
        .reduce((sum, e) => sum + Number(e.amount), 0)

      // 計算用戶在此群組的分攤
      const groupExpenseIds = new Set(groupExpenses.map(e => e.id))
      const totalOwed = userSplits
        .filter(s => !s.is_settled && groupExpenseIds.has(s.expense_id))
        .reduce((sum, s) => sum + Number(s.amount), 0)

      return {
        ...group,
        totalExpenses: groupExpenses.reduce((sum, e) => sum + Number(e.amount), 0),
        myBalance: totalPaid - totalOwed,
        memberCount: group.members?.length || 0,
      }
    })

    return jsonResponse({
      success: true,
      data: groupsWithBalance,
    }, { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Get split groups error:', error)
    return errorResponse('系統錯誤', 500)
  }
}

// POST: 建立新分帳群組
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      coverImage,
      tripId, // 可選：關聯旅遊團
      createdBy,
      members = [], // 初始成員 user_id 陣列
      defaultCurrency = 'TWD',
    } = body

    if (!name || !createdBy) {
      return NextResponse.json(
        { error: '請提供必要欄位：name, createdBy' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    // 建立群組
    const { data: group, error: groupError } = await supabase
      .from('traveler_split_groups')
      .insert({
        name,
        description,
        cover_image: coverImage,
        trip_id: tripId || null,
        created_by: createdBy,
        default_currency: defaultCurrency,
      })
      .select()
      .single()

    if (groupError) {
      logger.error('Insert group error:', groupError)
      return NextResponse.json(
        { error: '建立群組失敗' },
        { status: 500 }
      )
    }

    // 將建立者加入成員（owner 角色）
    const allMembers = [
      { group_id: group.id, user_id: createdBy, role: 'owner' },
      ...members
        .filter((userId: string) => userId !== createdBy)
        .map((userId: string) => ({
          group_id: group.id,
          user_id: userId,
          role: 'member',
        })),
    ]

    const { error: memberError } = await supabase
      .from('traveler_split_group_members')
      .insert(allMembers)

    if (memberError) {
      logger.error('Insert members error:', memberError)
      // 不中斷，群組已建立
    }

    // 回傳完整群組資料
    const { data: fullGroup } = await supabase
      .from('traveler_split_groups')
      .select(`
        *,
        trip:trips(id, title, cover_image),
        members:split_group_members(
          id,
          user_id,
          role,
          user:profiles(id, display_name, avatar_url)
        )
      `)
      .eq('id', group.id)
      .single()

    return NextResponse.json({
      success: true,
      data: fullGroup,
    })
  } catch (error) {
    logger.error('Create split group error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}
