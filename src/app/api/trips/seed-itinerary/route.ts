import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'

// POST: 建立沖繩聖誕團行程資料
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tourCode } = body

    if (tourCode !== 'OKA251223A') {
      return NextResponse.json(
        { error: '目前只支援 OKA251223A' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    // 1. 查找現有的 trip（用多種方式查詢）
    const tripStartDate = '2025-12-23'
    const tripEndDate = '2025-12-27'

    // 優先使用已有成員加入的舊 trip
    let { data: trip } = await supabase
      .from('trips')
      .select('id')
      .or('title.ilike.%沖繩%,title.ilike.%聖誕%')
      .single()

    let tripId: string

    if (!trip) {
      // 建立新 trip
      const { data: newTrip, error: insertError } = await supabase
        .from('trips')
        .insert({
          title: '2025沖繩聖誕趴踢趴踢',
          description: '沖繩五日遊 - 美麗海水族館、美國村、國際通',
          cover_image: null,
          start_date: tripStartDate,
          end_date: tripEndDate,
          status: 'upcoming', // 準備出發
          default_currency: 'JPY',
        })
        .select()
        .single()

      if (insertError || !newTrip) {
        console.error('Create trip error:', insertError)
        return NextResponse.json(
          { error: '建立行程失敗' },
          { status: 500 }
        )
      }

      tripId = newTrip.id
    } else {
      tripId = trip.id
      // 更新 trip 資訊
      await supabase
        .from('trips')
        .update({
          title: '2025沖繩聖誕趴踢趴踢',
          description: '沖繩五日遊 - 美麗海水族館、美國村、國際通',
          start_date: tripStartDate,
          end_date: tripEndDate,
          status: 'upcoming'
        })
        .eq('id', tripId)
    }

    // 2. 刪除舊的行程項目
    await supabase
      .from('trip_itinerary_items')
      .delete()
      .eq('trip_id', tripId)

    // 3. 建立行程項目
    const itineraryItems = [
      // Day 1 - 12/23
      { day_number: 1, item_date: '2025-12-23', start_time: '12:00', title: '桃園機場集合', description: '桃園機場T1泰越捷航空櫃檯集合', category: '交通', icon: 'flight', sort_order: 1 },
      { day_number: 1, item_date: '2025-12-23', start_time: '14:45', title: '桃園機場 → 那霸機場', description: '泰越捷航空 VZ568 14:45-17:10', category: '交通', icon: 'flight', sort_order: 2 },
      { day_number: 1, item_date: '2025-12-23', start_time: '17:30', title: '飯店辦理入住', description: '搭乘單軌電車前往飯店（牧志站），車程約20分鐘（8站）', category: '住宿', icon: 'hotel', location_name: '琉球Orion那霸國際通飯店', location_address: '1 Chome-2-21 Asato, Naha, Okinawa 902-0067', location_url: 'https://maps.app.goo.gl/KiTR7Uqr3Ss9moVY8', sort_order: 3 },
      { day_number: 1, item_date: '2025-12-23', start_time: '19:00', title: '國際通散策', description: '自由逛街購物', category: '購物', icon: 'shopping', sort_order: 4 },
      { day_number: 1, item_date: '2025-12-23', start_time: '20:00', title: '七輪燒肉', description: '晚餐', category: '美食', icon: 'restaurant', sort_order: 5 },
      { day_number: 1, item_date: '2025-12-23', start_time: '22:00', title: '飯店休憩', description: null, category: '住宿', icon: 'hotel', sort_order: 6 },

      // Day 2 - 12/24
      { day_number: 2, item_date: '2025-12-24', start_time: '07:00', title: '晨喚', description: '早餐', category: '其他', icon: 'wb_sunny', sort_order: 1 },
      { day_number: 2, item_date: '2025-12-24', start_time: '09:00', title: '沖繩美麗海水族館', description: '世界最大的水族館之一，黑潮之海大水槽', category: '景點', icon: 'attractions', location_name: '沖繩美麗海水族館', location_url: 'https://share.google/5DPTZrn4ARkTsbmul', sort_order: 2 },
      { day_number: 2, item_date: '2025-12-24', start_time: '15:00', title: '美國村', description: '沖繩最熱鬧的購物娛樂區', category: '購物', icon: 'shopping', location_name: '美國村', location_url: 'https://share.google/7nMVjSQkUYQcfBYIH', sort_order: 3 },
      { day_number: 2, item_date: '2025-12-24', start_time: '21:00', title: '飯店休憩', description: null, category: '住宿', icon: 'hotel', sort_order: 4 },

      // Day 3 - 12/25 (Christmas)
      { day_number: 3, item_date: '2025-12-25', start_time: '07:00', title: '晨喚', description: '早餐', category: '其他', icon: 'wb_sunny', sort_order: 1 },
      { day_number: 3, item_date: '2025-12-25', start_time: '09:00', title: '殘波岬', description: '沖繩最西端的海岬，壯觀的斷崖絕壁', category: '景點', icon: 'landscape', location_name: '殘波岬', location_url: 'https://maps.app.goo.gl/exPoPGBDUXMotyy18', sort_order: 2 },
      { day_number: 3, item_date: '2025-12-25', start_time: '11:00', title: 'BANTA CAFE', description: '絕景海景咖啡廳', category: '美食', icon: 'local_cafe', location_name: 'BANTA CAFE', location_url: 'https://maps.app.goo.gl/hrssZe8fKhQwbYkP7', sort_order: 3 },
      { day_number: 3, item_date: '2025-12-25', start_time: '14:00', title: 'AEON MALL Okinawa Rycom', description: '寶可夢中心', category: '購物', icon: 'shopping', location_name: 'AEON MALL Okinawa Rycom', location_url: 'https://maps.app.goo.gl/7oRpnGffC4DGW6is8', sort_order: 4 },
      { day_number: 3, item_date: '2025-12-25', start_time: '17:00', title: '東南植物樂園', description: '沖繩最大的植物園，冬季有美麗燈飾', category: '景點', icon: 'park', location_name: '東南植物樂園', location_url: 'https://maps.app.goo.gl/sSkrNgTF1ck77cJF8', sort_order: 5 },
      { day_number: 3, item_date: '2025-12-25', start_time: '19:00', title: '國際通散策（無菜單料理）', description: '聖誕晚餐', category: '美食', icon: 'restaurant', sort_order: 6 },
      { day_number: 3, item_date: '2025-12-25', start_time: '22:00', title: '飯店休憩', description: null, category: '住宿', icon: 'hotel', sort_order: 7 },

      // Day 4 - 12/26
      { day_number: 4, item_date: '2025-12-26', start_time: '07:00', title: '晨喚', description: '早餐', category: '其他', icon: 'wb_sunny', sort_order: 1 },
      { day_number: 4, item_date: '2025-12-26', start_time: '09:00', title: 'DMM Kariyushi水族館', description: '結合科技與自然的新型態水族館', category: '景點', icon: 'attractions', location_name: 'DMM Kariyushi水族館', location_url: 'https://share.google/mGZ5fOqvecdx3HCsb', sort_order: 2 },
      { day_number: 4, item_date: '2025-12-26', start_time: '12:00', title: 'iias 沖繩豐崎', description: '大型購物中心', category: '購物', icon: 'shopping', location_name: 'iias 沖繩豐崎', location_url: 'https://maps.app.goo.gl/qF3HPDth2S8uVSRZ6', sort_order: 3 },
      { day_number: 4, item_date: '2025-12-26', start_time: '15:00', title: '自由活動', description: null, category: '其他', icon: 'explore', sort_order: 4 },
      { day_number: 4, item_date: '2025-12-26', start_time: '18:00', title: 'Churasun 6 沖繩看表演', description: '沖繩傳統表演', category: '體驗', icon: 'theater_comedy', location_name: 'Churasun 6 沖繩', location_url: 'https://share.google/vsYdzZRaZsVRGavzg', sort_order: 5 },
      { day_number: 4, item_date: '2025-12-26', start_time: '21:00', title: '飯店休憩', description: null, category: '住宿', icon: 'hotel', sort_order: 6 },

      // Day 5 - 12/27
      { day_number: 5, item_date: '2025-12-27', start_time: '07:00', title: '晨喚', description: '早餐', category: '其他', icon: 'wb_sunny', sort_order: 1 },
      { day_number: 5, item_date: '2025-12-27', start_time: '10:00', title: '敘敘苑燒肉 歌町店', description: '高級燒肉午餐', category: '美食', icon: 'restaurant', location_name: '敘敘苑燒肉 歌町店', location_url: 'https://share.google/E59lMkdHFPdQkPxmL', sort_order: 2 },
      { day_number: 5, item_date: '2025-12-27', start_time: '15:00', title: '那霸機場', description: '辦理登機手續', category: '交通', icon: 'flight', sort_order: 3 },
      { day_number: 5, item_date: '2025-12-27', start_time: '18:05', title: '那霸機場 → 桃園機場', description: '泰越捷航空 VZ569 18:05-18:45', category: '交通', icon: 'flight', sort_order: 4 },
    ]

    // 加上 trip_id
    const itemsWithTripId = itineraryItems.map(item => ({
      ...item,
      trip_id: tripId,
      currency: 'JPY',
    }))

    const { error: itemsError } = await supabase
      .from('trip_itinerary_items')
      .insert(itemsWithTripId)

    if (itemsError) {
      console.error('Insert items error:', itemsError)
      return NextResponse.json(
        { error: '建立行程項目失敗: ' + itemsError.message },
        { status: 500 }
      )
    }

    // 4. 建立航班資訊（如果表存在）
    try {
      await supabase
        .from('trip_flights')
        .delete()
        .eq('trip_id', tripId)

      await supabase
        .from('trip_flights')
        .insert([
          {
            trip_id: tripId,
            flight_type: 'outbound',
            airline: '泰越捷航空',
            flight_no: 'VZ568',
            departure_time: '14:45',
            departure_date: '2024-12-23',
            departure_airport: '桃園機場',
            departure_code: 'TPE',
            arrival_time: '17:10',
            arrival_date: '2024-12-23',
            arrival_airport: '那霸機場',
            arrival_code: 'OKA',
          },
          {
            trip_id: tripId,
            flight_type: 'return',
            airline: '泰越捷航空',
            flight_no: 'VZ569',
            departure_time: '18:05',
            departure_date: '2024-12-27',
            departure_airport: '那霸機場',
            departure_code: 'OKA',
            arrival_time: '18:45',
            arrival_date: '2024-12-27',
            arrival_airport: '桃園機場',
            arrival_code: 'TPE',
          },
        ])
    } catch {
      // trip_flights 表可能不存在，跳過
      console.log('trip_flights table may not exist, skipping')
    }

    return NextResponse.json({
      success: true,
      data: {
        tripId,
        itemCount: itineraryItems.length,
        message: '行程資料已建立',
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: '建立失敗' },
      { status: 500 }
    )
  }
}

// GET: 確認行程狀態
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tourCode = searchParams.get('tourCode')

    if (tourCode !== 'OKA251223A') {
      return NextResponse.json(
        { error: '目前只支援 OKA251223A' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    const { data: trip } = await supabase
      .from('trips')
      .select('id, title, status, start_date, end_date')
      .eq('title', '2024沖繩聖誕趴踢趴踢')
      .single()

    if (!trip) {
      return NextResponse.json({ exists: false })
    }

    const { data: items } = await supabase
      .from('trip_itinerary_items')
      .select('id')
      .eq('trip_id', trip.id)

    return NextResponse.json({
      exists: true,
      trip,
      itemCount: items?.length || 0,
    })
  } catch (error) {
    console.error('Get error:', error)
    return NextResponse.json(
      { error: '查詢失敗' },
      { status: 500 }
    )
  }
}
