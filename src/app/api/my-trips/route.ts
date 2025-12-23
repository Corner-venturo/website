import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'

// GET: 取得用戶的所有行程 或 單一行程
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const tripId = searchParams.get('tripId')

    const supabase = getOnlineSupabase()

    // 如果有 tripId，取得單一行程
    if (tripId) {
      const { data: trip, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single()

      if (error) {
        console.error('Query trip error:', error)
        return NextResponse.json(
          { error: '找不到行程' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: trip,
      })
    }

    // 否則取得用戶的所有行程
    if (!userId) {
      return NextResponse.json(
        { error: '請提供 userId 或 tripId' },
        { status: 400 }
      )
    }

    // 1. 平行取得用戶的行程 (作為成員 + 建立者)
    const [memberResult, createdResult] = await Promise.all([
      supabase.from('trip_members').select('trip_id').eq('user_id', userId),
      supabase.from('trips').select('id').eq('created_by', userId),
    ])

    if (memberResult.error) {
      console.error('Query trip_members error:', memberResult.error)
    }
    if (createdResult.error) {
      console.error('Query created trips error:', createdResult.error)
    }

    const tripIds = memberResult.data?.map((m) => m.trip_id) || []
    const createdTrips = createdResult.data

    // 3. 合併並去重
    const allTripIds = [...new Set([...tripIds, ...(createdTrips?.map((t) => t.id) || [])])]

    if (allTripIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // 4. 取得完整行程資料（排除 planning 狀態）
    // 旅客只能看到 upcoming（準備出發）、ongoing（進行中）、completed（已完成）的行程
    const { data: trips, error: tripsError } = await supabase
      .from('trips')
      .select('*')
      .in('id', allTripIds)
      .neq('status', 'planning') // 規劃中的行程不顯示給旅客
      .order('start_date', { ascending: true })

    if (tripsError) {
      console.error('Query trips error:', tripsError)
      return NextResponse.json(
        { error: '取得行程失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: trips,
    })
  } catch (error) {
    console.error('Get my trips error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}
