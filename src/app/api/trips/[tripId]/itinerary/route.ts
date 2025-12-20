import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// 使用 service role key 繞過 RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const getSupabase = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing')
  }
  return createClient(supabaseUrl, supabaseKey)
}

// GET: 取得行程的所有項目
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

    const { data: items, error } = await supabase
      .from('trip_itinerary_items')
      .select(`
        *,
        attendance:trip_item_attendance(*)
      `)
      .eq('trip_id', tripId)
      .order('day_number', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Query itinerary items error:', error)
      return NextResponse.json(
        { error: '取得行程項目失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: items,
    })
  } catch (error) {
    console.error('Get itinerary items error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// POST: 新增行程項目
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const body = await request.json()

    if (!tripId) {
      return NextResponse.json(
        { error: '請提供行程 ID' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    const { data: item, error } = await supabase
      .from('trip_itinerary_items')
      .insert({
        ...body,
        trip_id: tripId,
      })
      .select()
      .single()

    if (error) {
      console.error('Insert itinerary item error:', error)
      return NextResponse.json(
        { error: '新增行程項目失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: item,
    })
  } catch (error) {
    console.error('Create itinerary item error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}
