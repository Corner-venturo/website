import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

// GET: 取得單筆費用詳情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: '請提供費用 ID' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    const { data: expense, error } = await supabase
      .from('traveler_expenses')
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
      .eq('id', id)
      .single()

    if (error) {
      logger.error('Query expense error:', error)
      return NextResponse.json(
        { error: '找不到此費用記錄' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: expense,
    })
  } catch (error) {
    logger.error('Get expense error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// PUT: 更新費用記錄
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: '請提供費用 ID' },
        { status: 400 }
      )
    }

    const {
      title,
      description,
      category,
      amount,
      currency,
      paidBy,
      expenseDate,
      splitWith, // 新的分攤對象（可選）
    } = body

    const supabase = getOnlineSupabase()

    // 建立更新物件（只更新有提供的欄位）
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (currency !== undefined) updateData.currency = currency
    if (paidBy !== undefined) updateData.paid_by = paidBy
    if (expenseDate !== undefined) updateData.expense_date = expenseDate

    // 更新費用記錄
    const { data: expense, error: updateError } = await supabase
      .from('traveler_expenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      logger.error('Update expense error:', updateError)
      return NextResponse.json(
        { error: '更新費用失敗' },
        { status: 500 }
      )
    }

    // 如果有提供新的分攤對象，重新建立分攤記錄
    if (splitWith && Array.isArray(splitWith)) {
      // 刪除舊的分攤記錄
      await supabase
        .from('traveler_expense_splits')
        .delete()
        .eq('expense_id', id)

      // 建立新的分攤記錄
      if (splitWith.length > 0) {
        const splitAmount = expense.amount / splitWith.length

        const splits = splitWith.map((userId: string) => ({
          expense_id: id,
          user_id: userId,
          amount: splitAmount,
          is_settled: false,
        }))

        const { error: splitError } = await supabase
          .from('traveler_expense_splits')
          .insert(splits)

        if (splitError) {
          logger.error('Update splits error:', splitError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: expense,
      message: '費用已更新',
    })
  } catch (error) {
    logger.error('Update expense error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// DELETE: 刪除費用記錄
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: '請提供費用 ID' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    // 先刪除相關的分攤記錄（CASCADE 應該會自動處理，但保險起見）
    await supabase
      .from('traveler_expense_splits')
      .delete()
      .eq('expense_id', id)

    // 刪除費用記錄
    const { error: deleteError } = await supabase
      .from('traveler_expenses')
      .delete()
      .eq('id', id)

    if (deleteError) {
      logger.error('Delete expense error:', deleteError)
      return NextResponse.json(
        { error: '刪除費用失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '費用已刪除',
    })
  } catch (error) {
    logger.error('Delete expense error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}
