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

// GET: 取得我的所有分帳群組
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const tripId = searchParams.get('tripId') // 可選：只取得某旅遊團的分帳群組

    if (!userId) {
      return NextResponse.json(
        { error: '請提供使用者 ID' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // 取得用戶所屬的群組 ID
    const { data: memberOf, error: memberError } = await supabase
      .from('split_group_members')
      .select('group_id')
      .eq('user_id', userId)

    if (memberError) {
      console.error('Query member groups error:', memberError)
      return NextResponse.json(
        { error: '取得群組失敗' },
        { status: 500 }
      )
    }

    const groupIds = memberOf?.map(m => m.group_id) || []

    if (groupIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // 取得群組詳情
    let query = supabase
      .from('split_groups')
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

    // 如果指定了 tripId，過濾只顯示該旅遊團的群組
    if (tripId) {
      query = query.eq('trip_id', tripId)
    }

    const { data: groups, error: groupsError } = await query

    if (groupsError) {
      console.error('Query groups error:', groupsError)
      return NextResponse.json(
        { error: '取得群組失敗' },
        { status: 500 }
      )
    }

    // 計算每個群組的餘額（簡化版：只計算費用總額）
    const groupsWithBalance = await Promise.all(
      (groups || []).map(async (group) => {
        // 取得群組費用
        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount, paid_by')
          .eq('split_group_id', group.id)

        // 取得用戶的分攤
        const { data: splits } = await supabase
          .from('expense_splits')
          .select('amount, is_settled, expense:expenses!inner(split_group_id)')
          .eq('user_id', userId)
          .eq('expense.split_group_id', group.id)

        // 計算用戶在此群組的餘額
        // 正數 = 別人欠你，負數 = 你欠別人
        const totalPaid = expenses
          ?.filter(e => e.paid_by === userId)
          .reduce((sum, e) => sum + Number(e.amount), 0) || 0

        const totalOwed = splits
          ?.filter(s => !s.is_settled)
          .reduce((sum, s) => sum + Number(s.amount), 0) || 0

        const myBalance = totalPaid - totalOwed

        return {
          ...group,
          totalExpenses: expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0,
          myBalance,
          memberCount: group.members?.length || 0,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: groupsWithBalance,
    })
  } catch (error) {
    console.error('Get split groups error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
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

    const supabase = getSupabase()

    // 建立群組
    const { data: group, error: groupError } = await supabase
      .from('split_groups')
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
      console.error('Insert group error:', groupError)
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
      .from('split_group_members')
      .insert(allMembers)

    if (memberError) {
      console.error('Insert members error:', memberError)
      // 不中斷，群組已建立
    }

    // 回傳完整群組資料
    const { data: fullGroup } = await supabase
      .from('split_groups')
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
    console.error('Create split group error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}
