import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'

// POST: 將行程項目從新 trip 轉移到舊 trip，並清理重複資料
export async function POST() {
  try {
    const supabase = getOnlineSupabase()

    const OLD_TRIP_ID = '15248559-8b86-4d5b-bef9-81ffa7b140c0' // 舊的（用戶已加入）
    const NEW_TRIP_ID = '0e13e6be-1444-4319-bc5e-9c043ee660f3' // 新的（有行程項目）

    // 1. 更新舊 trip 的資訊
    const { error: updateError } = await supabase
      .from('trips')
      .update({
        title: '2024沖繩聖誕趴踢趴踢',
        description: '沖繩五日遊 - 美麗海水族館、美國村、國際通',
        start_date: '2024-12-23',
        end_date: '2024-12-27',
        status: 'upcoming'
      })
      .eq('id', OLD_TRIP_ID)

    if (updateError) {
      console.error('Update old trip error:', updateError)
    }

    // 2. 刪除舊 trip 的行程項目（如果有）
    await supabase
      .from('trip_itinerary_items')
      .delete()
      .eq('trip_id', OLD_TRIP_ID)

    // 3. 將新 trip 的行程項目轉移到舊 trip
    const { error: migrateError } = await supabase
      .from('trip_itinerary_items')
      .update({ trip_id: OLD_TRIP_ID })
      .eq('trip_id', NEW_TRIP_ID)

    if (migrateError) {
      console.error('Migrate items error:', migrateError)
      return NextResponse.json(
        { error: '轉移行程項目失敗: ' + migrateError.message },
        { status: 500 }
      )
    }

    // 4. 刪除新的空 trip
    await supabase
      .from('trips')
      .delete()
      .eq('id', NEW_TRIP_ID)

    // 5. 驗證結果
    const { data: items } = await supabase
      .from('trip_itinerary_items')
      .select('id')
      .eq('trip_id', OLD_TRIP_ID)

    const { data: trip } = await supabase
      .from('trips')
      .select('id, title, status, start_date')
      .eq('id', OLD_TRIP_ID)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        tripId: OLD_TRIP_ID,
        trip,
        itemCount: items?.length || 0,
        message: '行程資料已合併'
      }
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: '合併失敗' },
      { status: 500 }
    )
  }
}
