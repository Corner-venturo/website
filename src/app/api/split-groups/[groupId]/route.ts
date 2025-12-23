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

// GET: 取得群組詳情（含費用、成員餘額）
export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const supabase = getSupabase()

    // 取得群組基本資料
    const { data: group, error: groupError } = await supabase
      .from('split_groups')
      .select(`
        *,
        trip:trips(id, title, cover_image, start_date, end_date),
        members:split_group_members(
          id,
          user_id,
          nickname,
          role,
          joined_at,
          user:profiles(id, display_name, avatar_url)
        )
      `)
      .eq('id', groupId)
      .single()

    if (groupError) {
      console.error('Query group error:', groupError)
      return NextResponse.json(
        { error: '群組不存在' },
        { status: 404 }
      )
    }

    // 取得群組所有費用
    const { data: expenses } = await supabase
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
      .eq('split_group_id', groupId)
      .order('expense_date', { ascending: false })

    // 計算每個成員的餘額
    const memberBalances = (group.members || []).map((member: { user_id: string; role: string; user: { display_name: string; avatar_url: string } }) => {
      const memberId = member.user_id

      // 該成員支付的總額
      const totalPaid = (expenses || [])
        .filter(e => e.paid_by === memberId)
        .reduce((sum, e) => sum + Number(e.amount), 0)

      // 該成員應分攤的總額
      const totalOwed = (expenses || [])
        .flatMap(e => e.expense_splits || [])
        .filter(s => s.user_id === memberId)
        .reduce((sum, s) => sum + Number(s.amount), 0)

      // 餘額 = 支付 - 應付
      // 正數 = 別人欠他，負數 = 他欠別人
      const balance = totalPaid - totalOwed

      return {
        userId: memberId,
        displayName: member.user?.display_name,
        avatarUrl: member.user?.avatar_url,
        role: member.role, // 新增 role 欄位
        totalPaid,
        totalOwed,
        balance,
      }
    })

    // 計算誰欠誰（簡化版：使用最小交易演算法）
    const debts = calculateDebts(memberBalances)

    return NextResponse.json({
      success: true,
      data: {
        ...group,
        expenses: expenses || [],
        memberBalances,
        debts, // [{ from, to, amount }]
        totalExpenses: (expenses || []).reduce((sum, e) => sum + Number(e.amount), 0),
        myBalance: userId
          ? memberBalances.find((m: { userId: string }) => m.userId === userId)?.balance || 0
          : 0,
      },
    })
  } catch (error) {
    console.error('Get split group error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// PUT: 更新群組資訊
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const body = await request.json()
    const { name, description, coverImage, defaultCurrency } = body

    const supabase = getSupabase()

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (coverImage !== undefined) updateData.cover_image = coverImage
    if (defaultCurrency !== undefined) updateData.default_currency = defaultCurrency

    const { data: group, error } = await supabase
      .from('split_groups')
      .update(updateData)
      .eq('id', groupId)
      .select()
      .single()

    if (error) {
      console.error('Update group error:', error)
      return NextResponse.json(
        { error: '更新群組失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: group,
    })
  } catch (error) {
    console.error('Update split group error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// DELETE: 刪除群組
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const supabase = getSupabase()

    const { error } = await supabase
      .from('split_groups')
      .delete()
      .eq('id', groupId)

    if (error) {
      console.error('Delete group error:', error)
      return NextResponse.json(
        { error: '刪除群組失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete split group error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// 計算最簡化的債務關係
function calculateDebts(memberBalances: { userId: string; displayName: string; balance: number }[]) {
  const debts: { from: string; fromName: string; to: string; toName: string; amount: number }[] = []

  // 分成債務人（balance < 0）和債權人（balance > 0）
  const debtors = memberBalances
    .filter(m => m.balance < 0)
    .map(m => ({ ...m, remaining: Math.abs(m.balance) }))
    .sort((a, b) => b.remaining - a.remaining)

  const creditors = memberBalances
    .filter(m => m.balance > 0)
    .map(m => ({ ...m, remaining: m.balance }))
    .sort((a, b) => b.remaining - a.remaining)

  // 貪婪演算法配對
  for (const debtor of debtors) {
    for (const creditor of creditors) {
      if (debtor.remaining <= 0) break
      if (creditor.remaining <= 0) continue

      const amount = Math.min(debtor.remaining, creditor.remaining)
      if (amount > 0) {
        debts.push({
          from: debtor.userId,
          fromName: debtor.displayName,
          to: creditor.userId,
          toName: creditor.displayName,
          amount: Math.round(amount * 100) / 100, // 四捨五入到小數點後兩位
        })
        debtor.remaining -= amount
        creditor.remaining -= amount
      }
    }
  }

  return debts
}
