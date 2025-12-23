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

// POST: 用身分證同步所有 ERP 訂單到 Online
export async function POST(request: Request) {
  try {
    const baseUrl = new URL(request.url)
    const baseUrlString = `${baseUrl.protocol}//${baseUrl.host}`

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: '請提供 userId' },
        { status: 400 }
      )
    }

    const onlineSupabase = getOnlineSupabase()
    const erpSupabase = getErpSupabase()

    // 1. 從 Online 取得用戶的身分證
    const { data: profile, error: profileError } = await onlineSupabase
      .from('profiles')
      .select('id_number, display_name')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: '找不到用戶資料' },
        { status: 404 }
      )
    }

    if (!profile.id_number) {
      // 尚未綁定身分證，無法同步
      return NextResponse.json({
        success: true,
        data: {
          synced: 0,
          message: '尚未綁定身分證，請先加入行程完成綁定',
          needsBinding: true,
        },
      })
    }

    // 2. 從 ERP 查詢該身分證的所有訂單
    const { data: erpMembers, error: erpError } = await erpSupabase
      .from('order_members')
      .select(`
        id,
        order_id,
        chinese_name,
        passport_name,
        identity,
        orders!inner (
          id,
          code,
          tour_name,
          start_date,
          end_date,
          status
        )
      `)
      .eq('id_number', profile.id_number)

    if (erpError) {
      console.error('ERP query error:', erpError)
      return NextResponse.json(
        { error: 'ERP 查詢失敗' },
        { status: 500 }
      )
    }

    if (!erpMembers || erpMembers.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          synced: 0,
          message: '目前沒有任何行程',
          trips: [],
        },
      })
    }

    // 3. 取得用戶已加入的行程（用 tour_code 比對）
    const { data: existingMemberships } = await onlineSupabase
      .from('trip_members')
      .select('trip_id, trips!inner(tour_code)')
      .eq('user_id', userId)

    const existingTourCodes = new Set(
      existingMemberships?.map((m: { trips: { tour_code: string } | { tour_code: string }[] }) => {
        // Handle both single object and array cases from Supabase joins
        const trips = m.trips
        if (Array.isArray(trips)) {
          return trips[0]?.tour_code
        }
        return trips?.tour_code
      }).filter(Boolean) || []
    )

    // 4. 同步新的訂單
    let syncedCount = 0
    const syncedTrips: { tripId: string; title: string; role: string }[] = []

    for (const erpMember of erpMembers) {
      // Handle Supabase join - could be array or single object
      const ordersData = erpMember.orders
      const order = (Array.isArray(ordersData) ? ordersData[0] : ordersData) as {
        id: string
        code: string
        tour_name: string
        start_date: string
        end_date: string
        status: string
      }

      if (!order) continue

      // 跳過已加入的行程
      if (existingTourCodes.has(order.code)) {
        continue
      }

      // 跳過已取消的訂單
      if (order.status === 'cancelled') {
        continue
      }

      try {
        // 檢查或建立 Online 行程
        let tripId: string
        let tripTitle: string

        // 嘗試用 tour_code 查找
        const { data: existingTrip } = await onlineSupabase
          .from('trips')
          .select('id, title')
          .eq('tour_code', order.code)
          .single()

        if (existingTrip) {
          tripId = existingTrip.id
          tripTitle = existingTrip.title
        } else {
          // 同步建立行程
          const syncResponse = await fetch(`${baseUrlString}/api/trips/sync-from-erp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tourCode: order.code }),
          })

          const syncData = await syncResponse.json()
          if (!syncResponse.ok || !syncData.success) {
            console.error(`Sync failed for ${order.code}:`, syncData)
            continue
          }
          tripId = syncData.data.tripId
          tripTitle = syncData.data.title || order.tour_name
        }

        // 加入成員
        const identity = erpMember.identity || '旅客'
        const role = identity === '領隊' ? 'owner' : 'member'
        const nickname = erpMember.chinese_name || erpMember.passport_name || profile.display_name

        const { error: memberError } = await onlineSupabase
          .from('trip_members')
          .upsert({
            trip_id: tripId,
            user_id: userId,
            role,
            nickname,
          }, {
            onConflict: 'trip_id,user_id',
          })

        if (memberError) {
          console.error(`Add member failed for trip ${tripId}:`, memberError)
          continue
        }

        syncedCount++
        syncedTrips.push({ tripId, title: tripTitle, role })
      } catch (err) {
        console.error(`Error syncing order ${order.code}:`, err)
        continue
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        synced: syncedCount,
        message: syncedCount > 0
          ? `已同步 ${syncedCount} 個新行程`
          : '所有行程都已是最新',
        trips: syncedTrips,
        totalOrders: erpMembers.length,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Sync my orders error:', errorMessage, error)
    return NextResponse.json(
      { error: `同步失敗: ${errorMessage}` },
      { status: 500 }
    )
  }
}
