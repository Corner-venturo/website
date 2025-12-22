import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// 使用 venturo-online Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const getSupabase = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing')
  }
  return createClient(supabaseUrl, supabaseKey)
}

// GET: 取得行程的所有成員
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params

    if (!tripId) {
      return NextResponse.json(
        { error: '請提供行程 ID' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // 取得成員列表（含用戶資訊）
    const { data: members, error } = await supabase
      .from('trip_members')
      .select(`
        id,
        trip_id,
        user_id,
        role,
        nickname,
        joined_at,
        profile:profiles(display_name, avatar_url)
      `)
      .eq('trip_id', tripId)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Query members error:', error)
      return NextResponse.json(
        { error: '取得成員失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: members,
    })
  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// POST: 新增或更新成員（UPSERT）
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const body = await request.json()
    const { userId, role = 'member', nickname } = body

    if (!tripId || !userId) {
      return NextResponse.json(
        { error: '請提供 tripId 和 userId' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // 檢查是否已經是成員
    const { data: existing } = await supabase
      .from('trip_members')
      .select('id, role')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .single()

    let member
    let isUpdate = false

    if (existing) {
      // 已存在：更新角色和暱稱
      const { data: updated, error: updateError } = await supabase
        .from('trip_members')
        .update({
          role,
          nickname,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select(`
          id,
          trip_id,
          user_id,
          role,
          nickname,
          joined_at,
          user:profiles(id, display_name, full_name, avatar_url)
        `)
        .single()

      if (updateError) {
        console.error('Update member error:', updateError)
        return NextResponse.json(
          { error: '更新成員失敗' },
          { status: 500 }
        )
      }
      member = updated
      isUpdate = true
    } else {
      // 新增成員
      const { data: inserted, error: insertError } = await supabase
        .from('trip_members')
        .insert({
          trip_id: tripId,
          user_id: userId,
          role,
          nickname,
        })
        .select(`
          id,
          trip_id,
          user_id,
          role,
          nickname,
          joined_at,
          user:profiles(id, display_name, full_name, avatar_url)
        `)
        .single()

      if (insertError) {
        console.error('Insert member error:', insertError)
        return NextResponse.json(
          { error: '新增成員失敗' },
          { status: 500 }
        )
      }
      member = inserted
    }

    return NextResponse.json({
      success: true,
      data: member,
      alreadyMember: isUpdate,
      message: isUpdate ? '已經加入過此行程' : '已加入行程',
    })
  } catch (error) {
    console.error('Add member error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// DELETE: 移除成員
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!tripId || !userId) {
      return NextResponse.json(
        { error: '請提供 tripId 和 userId' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    const { error } = await supabase
      .from('trip_members')
      .delete()
      .eq('trip_id', tripId)
      .eq('user_id', userId)

    if (error) {
      console.error('Delete member error:', error)
      return NextResponse.json(
        { error: '移除成員失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '已移除成員',
    })
  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}
