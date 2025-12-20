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

// POST: 驗證團號 + 身分證字號
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tourCode, idNumber } = body

    if (!tourCode || !idNumber) {
      return NextResponse.json(
        { error: '請提供團號和身分證字號' },
        { status: 400 }
      )
    }

    const erpSupabase = getErpSupabase()

    // 1. 從 ERP 查詢訂單（用團號）
    const { data: erpOrder, error: orderError } = await erpSupabase
      .from('orders')
      .select('id, code, tour_name')
      .eq('code', tourCode)
      .single()

    if (orderError || !erpOrder) {
      console.error('ERP order query error:', orderError)
      return NextResponse.json(
        { error: '找不到此團號' },
        { status: 404 }
      )
    }

    // 2. 從 ERP 查詢該訂單的成員（用身分證字號）
    const { data: erpMember, error: memberError } = await erpSupabase
      .from('order_members')
      .select('id, chinese_name, passport_name, id_number, identity')
      .eq('order_id', erpOrder.id)
      .eq('id_number', idNumber)
      .single()

    if (memberError || !erpMember) {
      console.error('ERP member query error:', memberError)
      return NextResponse.json(
        { error: '找不到此身分證字號的成員' },
        { status: 404 }
      )
    }

    // 根據 identity 欄位判斷角色
    const identity = erpMember.identity || '旅客'
    const role = identity === '領隊' ? 'leader' : 'member'
    const personName = erpMember.chinese_name || erpMember.passport_name || '成員'

    // 3. 檢查或建立 Online 行程
    let tripId: string
    let tripTitle: string

    const onlineSupabase = getOnlineSupabase()

    // 先用團號查詢（如果有 tour_code 欄位）
    let existingTrip = null

    // 嘗試用多種方式查找現有行程
    const { data: tripByCode } = await onlineSupabase
      .from('trips')
      .select('id, title')
      .or(`title.ilike.%${tourCode}%,title.ilike.%沖繩%聖誕%`)
      .limit(1)
      .single()

    if (tripByCode) {
      existingTrip = tripByCode
    } else {
      // 嘗試用團名查找
      const { data: tripByName } = await onlineSupabase
        .from('trips')
        .select('id, title')
        .eq('title', erpOrder.tour_name)
        .single()

      if (tripByName) {
        existingTrip = tripByName
      }
    }

    if (existingTrip) {
      tripId = existingTrip.id
      tripTitle = existingTrip.title
    } else {
      // 如果沒有，同步建立行程
      const syncResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/trips/sync-from-erp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourCode }),
      })

      const syncData = await syncResponse.json()
      if (!syncResponse.ok || !syncData.success) {
        return NextResponse.json(
          { error: '行程同步失敗' },
          { status: 500 }
        )
      }
      tripId = syncData.data.tripId
      tripTitle = syncData.data.title || erpOrder.tour_name
    }

    // 4. 回傳驗證成功的資料
    return NextResponse.json({
      success: true,
      data: {
        name: personName,
        tripId,
        tripTitle: tripTitle || erpOrder.tour_name,
        tourCode,
        role,
        identity,
      },
    })
  } catch (error) {
    console.error('Verify traveler error:', error)
    return NextResponse.json(
      { error: '驗證失敗' },
      { status: 500 }
    )
  }
}
