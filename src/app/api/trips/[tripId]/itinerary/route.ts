import { NextResponse } from 'next/server'
import { getOnlineSupabase, getErpSupabase } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

// GET: 從 ERP 取得行程的每日行程
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

    const onlineSupabase = getOnlineSupabase()
    const erpSupabase = getErpSupabase()

    // 1. 從 Online 取得 trip 資訊（用來找 tour_code）
    const { data: trip } = await onlineSupabase
      .from('traveler_trips')
      .select('id, title, tour_code')
      .eq('id', tripId)
      .single()

    if (!trip) {
      return NextResponse.json(
        { error: '找不到此行程' },
        { status: 404 }
      )
    }

    // 2. 用 title 或 tour_code 從 ERP 找對應的 itinerary
    let itinerary = null

    // 先用 tour_code 查詢（如果有）
    if (trip.tour_code) {
      const { data } = await erpSupabase
        .from('itineraries')
        .select('id, title, daily_itinerary, outbound_flight, return_flight')
        .eq('tour_code', trip.tour_code)
        .single()
      itinerary = data
    }

    // 如果沒有，用 title 查詢
    if (!itinerary) {
      const { data } = await erpSupabase
        .from('itineraries')
        .select('id, title, daily_itinerary, outbound_flight, return_flight')
        .eq('title', trip.title)
        .single()
      itinerary = data
    }

    if (!itinerary || !itinerary.daily_itinerary) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // 3. 轉換 daily_itinerary 格式
    const items = itinerary.daily_itinerary.flatMap((day: {
      day?: number
      dayLabel?: string
      date?: string
      title?: string
      activities?: Array<{
        icon?: string
        title?: string
        description?: string
        attraction_id?: string
        image?: string
      }>
      items?: Array<{
        icon?: string
        title?: string
        description?: string
        attraction_id?: string
        time?: string
        type?: string
        image?: string
      }>
    }) => {
      const dayItems = day.activities || day.items || []
      const dayNumber = day.day || parseInt(day.dayLabel?.replace('Day ', '') || '1')

      return dayItems.map((item, index: number) => ({
        id: `${dayNumber}-${index}`,
        trip_id: tripId,
        day_number: dayNumber,
        day_title: day.title || '',
        item_date: day.date || null,
        start_time: null, // 時間由領隊自己安排，不從 ERP 帶入
        title: item.title || '',
        description: item.description || '',
        icon: item.icon || '📍',
        attraction_id: item.attraction_id || null,
        image: item.image || null,
        sort_order: index,
      }))
    })

    return NextResponse.json({
      success: true,
      data: items,
    })
  } catch (error) {
    logger.error('Get itinerary items error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}
