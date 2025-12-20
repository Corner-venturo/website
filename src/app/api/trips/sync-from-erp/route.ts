import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// ERP Supabase（來源）
const getErpSupabase = () => {
  const url = process.env.ERP_SUPABASE_URL
  const key = process.env.ERP_SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('ERP Supabase configuration missing')
  }
  return createClient(url, key)
}

// Online Supabase（目標）
const getOnlineSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Online Supabase configuration missing')
  }
  return createClient(url, key)
}

interface ErpItinerary {
  id: string
  tour_id: string
  tour_code: string
  title: string
  subtitle: string
  description: string
  departure_date: string
  cover_image: string
  country: string
  city: string
  outbound_flight: Record<string, unknown>
  return_flight: Record<string, unknown>
  daily_itinerary: Array<{
    day: number
    date: string
    title: string
    items: Array<{
      time: string
      title: string
      description?: string
      type?: string
      icon?: string
    }>
  }>
  hotels: Record<string, unknown>
  leader: Record<string, unknown>
  meeting_info: Record<string, unknown>
}

// POST: 從 ERP 同步行程到 Online
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tourCode, userId } = body // tourCode: 團號, userId: 建立者 ID

    if (!tourCode) {
      return NextResponse.json(
        { error: '請提供團號 (tourCode)' },
        { status: 400 }
      )
    }

    const erpSupabase = getErpSupabase()

    // 1. 從 ERP 取得團資料（必須有）
    const { data: erpTour, error: tourError } = await erpSupabase
      .from('tours')
      .select('*')
      .eq('code', tourCode)
      .single()

    if (tourError || !erpTour) {
      console.error('ERP tour query error:', tourError)
      return NextResponse.json(
        { error: '找不到此團號' },
        { status: 404 }
      )
    }

    // 2. 嘗試從 ERP 取得行程資料（可選）
    const { data: erpItinerary } = await erpSupabase
      .from('itineraries')
      .select('*')
      .eq('tour_code', tourCode)
      .single()

    const itinerary = erpItinerary as ErpItinerary | null

    // 使用行程資料或團資料
    const tripTitle = itinerary?.title || erpTour.name || `${erpTour.location} ${tourCode}`
    const tripDescription = itinerary?.description || itinerary?.subtitle || erpTour.description || ''
    const tripCoverImage = itinerary?.cover_image || ''
    const tripStartDate = itinerary?.departure_date || erpTour.departure_date
    const tripEndDate = erpTour.return_date || null

    // 3. 檢查 Online 是否已有此行程（用團號或標題+日期查詢）
    const { data: existingTrip } = await getOnlineSupabase()
      .from('trips')
      .select('id')
      .eq('title', tripTitle)
      .eq('start_date', tripStartDate)
      .single()

    let tripId: string

    if (existingTrip) {
      // 更新現有行程
      tripId = existingTrip.id

      const { error: updateError } = await getOnlineSupabase()
        .from('trips')
        .update({
          title: tripTitle,
          description: tripDescription,
          cover_image: tripCoverImage,
          start_date: tripStartDate,
          end_date: tripEndDate,
          status: 'upcoming',
          updated_at: new Date().toISOString(),
        })
        .eq('id', tripId)

      if (updateError) {
        console.error('Update trip error:', updateError)
      }
    } else {
      // 建立新行程
      const { data: newTrip, error: insertError } = await getOnlineSupabase()
        .from('trips')
        .insert({
          title: tripTitle,
          description: tripDescription,
          cover_image: tripCoverImage,
          start_date: tripStartDate,
          end_date: tripEndDate,
          status: 'upcoming',
          default_currency: 'JPY',
          created_by: userId || null,
        })
        .select()
        .single()

      if (insertError || !newTrip) {
        console.error('Insert trip error:', insertError)
        return NextResponse.json(
          { error: '建立行程失敗' },
          { status: 500 }
        )
      }

      tripId = newTrip.id

      // 如果有 userId，將其加為 owner
      if (userId) {
        await getOnlineSupabase()
          .from('trip_members')
          .insert({
            trip_id: tripId,
            user_id: userId,
            role: 'owner',
          })
      }
    }

    // 4. 同步每日行程項目（如果有行程資料）
    if (itinerary?.daily_itinerary && Array.isArray(itinerary.daily_itinerary)) {
      // 先刪除舊的行程項目
      await getOnlineSupabase()
        .from('trip_itinerary_items')
        .delete()
        .eq('trip_id', tripId)

      // 插入新的行程項目
      const items = itinerary.daily_itinerary.flatMap((day) => {
        if (!day.items) return []

        return day.items.map((item, index) => ({
          trip_id: tripId,
          day_number: day.day,
          start_time: item.time || '09:00',
          title: item.title,
          description: item.description || null,
          category: mapCategory(item.type),
          icon: item.icon || 'place',
          sort_order: index,
        }))
      })

      if (items.length > 0) {
        const { error: itemsError } = await getOnlineSupabase()
          .from('trip_itinerary_items')
          .insert(items)

        if (itemsError) {
          console.error('Insert items error:', itemsError)
        }
      }
    }

    // 5. 同步航班資訊（如果有行程資料）
    if (itinerary?.outbound_flight || itinerary?.return_flight) {
      // 先刪除舊的航班
      await getOnlineSupabase()
        .from('trip_flights')
        .delete()
        .eq('trip_id', tripId)

      const flights = []

      if (itinerary.outbound_flight) {
        const ob = itinerary.outbound_flight as Record<string, string>
        flights.push({
          trip_id: tripId,
          flight_type: 'outbound',
          airline: ob.airline || '',
          flight_no: ob.flightNumber || ob.flight_no || '',
          departure_time: ob.departureTime || '00:00',
          departure_date: itinerary.departure_date,
          departure_airport: ob.departureAirport || '',
          departure_code: ob.departureCode || 'TPE',
          arrival_time: ob.arrivalTime || '00:00',
          arrival_date: itinerary.departure_date,
          arrival_airport: ob.arrivalAirport || '',
          arrival_code: ob.arrivalCode || '',
        })
      }

      if (itinerary.return_flight) {
        const rt = itinerary.return_flight as Record<string, string>
        flights.push({
          trip_id: tripId,
          flight_type: 'return',
          airline: rt.airline || '',
          flight_no: rt.flightNumber || rt.flight_no || '',
          departure_time: rt.departureTime || '00:00',
          departure_date: erpTour?.return_date || itinerary.departure_date,
          departure_airport: rt.departureAirport || '',
          departure_code: rt.departureCode || '',
          arrival_time: rt.arrivalTime || '00:00',
          arrival_date: erpTour?.return_date || itinerary.departure_date,
          arrival_airport: rt.arrivalAirport || '',
          arrival_code: rt.arrivalCode || 'TPE',
        })
      }

      if (flights.length > 0) {
        await getOnlineSupabase()
          .from('trip_flights')
          .insert(flights)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        tripId,
        tourCode,
        title: tripTitle,
        message: existingTrip ? '行程已更新' : '行程已建立',
      },
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: '同步失敗' },
      { status: 500 }
    )
  }
}

// 將 ERP 類別對應到 Online 類別
function mapCategory(type?: string): string {
  const mapping: Record<string, string> = {
    '景點': '景點',
    '餐食': '美食',
    '用餐': '美食',
    '交通': '交通',
    '住宿': '住宿',
    '體驗': '體驗',
    '購物': '購物',
    'attraction': '景點',
    'food': '美食',
    'transport': '交通',
    'hotel': '住宿',
    'experience': '體驗',
    'shopping': '購物',
  }
  return mapping[type || ''] || '其他'
}
