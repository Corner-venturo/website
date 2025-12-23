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

// POST: 驗證團號 + 身分證字號，並綁定身分證到用戶帳號
export async function POST(request: Request) {
  try {
    // 從 request 取得 base URL
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`

    const body = await request.json()
    const { tourCode, idNumber, userId } = body

    if (!tourCode || !idNumber) {
      return NextResponse.json(
        { error: '請提供團號和身分證字號' },
        { status: 400 }
      )
    }

    const erpSupabase = getErpSupabase()
    const onlineSupabase = getOnlineSupabase()

    // 0. 檢查身分證是否已被其他帳號綁定
    if (userId) {
      const { data: existingBinding } = await onlineSupabase
        .from('profiles')
        .select('id, display_name')
        .eq('id_number', idNumber)
        .single()

      if (existingBinding && existingBinding.id !== userId) {
        // 身分證已被其他帳號綁定
        return NextResponse.json(
          { error: '此身分證已被其他帳號綁定，請使用該帳號登入' },
          { status: 409 }
        )
      }
    }

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
    // 資料庫只允許 owner, admin, member
    const role = identity === '領隊' ? 'owner' : 'member'
    const personName = erpMember.chinese_name || erpMember.passport_name || '成員'

    // 3. 檢查或建立 Online 行程
    let tripId: string
    let tripTitle: string

    // 先用 tour_code 欄位查詢
    let existingTrip = null

    // 嘗試用 tour_code 查找
    const { data: tripByTourCode } = await onlineSupabase
      .from('trips')
      .select('id, title')
      .eq('tour_code', tourCode)
      .single()

    if (tripByTourCode) {
      existingTrip = tripByTourCode
    } else {
      // 嘗試用標題包含團號查找
      const { data: tripByTitle } = await onlineSupabase
        .from('trips')
        .select('id, title')
        .ilike('title', `%${tourCode}%`)
        .limit(1)
        .single()

      if (tripByTitle) {
        existingTrip = tripByTitle
      }
    }

    if (existingTrip) {
      tripId = existingTrip.id
      tripTitle = existingTrip.title
    } else {
      // 如果沒有，同步建立行程
      const syncResponse = await fetch(`${baseUrl}/api/trips/sync-from-erp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourCode }),
      })

      const syncData = await syncResponse.json()
      if (!syncResponse.ok || !syncData.success) {
        console.error('Sync failed:', syncData)
        return NextResponse.json(
          { error: `行程同步失敗: ${syncData.error || '未知錯誤'}` },
          { status: 500 }
        )
      }
      tripId = syncData.data.tripId
      tripTitle = syncData.data.title || erpOrder.tour_name
    }

    // 4. 綁定身分證到用戶帳號（如果有提供 userId 且尚未綁定）
    if (userId) {
      const { data: currentProfile } = await onlineSupabase
        .from('profiles')
        .select('id_number')
        .eq('id', userId)
        .single()

      if (!currentProfile?.id_number) {
        // 尚未綁定，進行綁定
        await onlineSupabase
          .from('profiles')
          .update({ id_number: idNumber })
          .eq('id', userId)

        console.log(`已綁定身分證 ${idNumber} 到用戶 ${userId}`)
      }
    }

    // 5. 回傳驗證成功的資料
    return NextResponse.json({
      success: true,
      data: {
        name: personName,
        tripId,
        tripTitle: tripTitle || erpOrder.tour_name,
        tourCode,
        role,
        identity,
        idNumberBound: !!userId, // 告訴前端是否已綁定身分證
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Verify traveler error:', errorMessage, error)
    return NextResponse.json(
      { error: `驗證失敗: ${errorMessage}` },
      { status: 500 }
    )
  }
}
