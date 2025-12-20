import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// 使用 ERP Supabase
const erpSupabase = createClient(
  process.env.ERP_SUPABASE_URL!,
  process.env.ERP_SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tourId = searchParams.get('tourId')

    if (!tourId) {
      return NextResponse.json(
        { error: '請提供團 ID' },
        { status: 400 }
      )
    }

    // 從 Authorization header 取得 token
    const authHeader = request.headers.get('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]

    // 驗證 token
    const { data: { user }, error: authError } = await erpSupabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: '無效的 token' },
        { status: 401 }
      )
    }

    // 查詢團資料
    const { data: tour, error: tourError } = await erpSupabase
      .from('tours')
      .select(`
        id,
        code,
        name,
        status,
        start_date,
        end_date,
        locked_quote_id,
        locked_itinerary_id,
        locked_at
      `)
      .eq('id', tourId)
      .single()

    if (tourError || !tour) {
      return NextResponse.json(
        { error: '找不到團資料' },
        { status: 404 }
      )
    }

    // 如果團已鎖定，取得鎖定的行程版本
    let finalItinerary = null
    let finalQuote = null

    if (tour.locked_itinerary_id) {
      const { data: itinerary } = await erpSupabase
        .from('itineraries')
        .select('*')
        .eq('id', tour.locked_itinerary_id)
        .single()

      finalItinerary = itinerary
    } else {
      // 否則取得最新的行程
      const { data: itineraries } = await erpSupabase
        .from('itineraries')
        .select('*')
        .eq('tour_id', tourId)
        .order('updated_at', { ascending: false })
        .limit(1)

      finalItinerary = itineraries?.[0] || null
    }

    if (tour.locked_quote_id) {
      const { data: quote } = await erpSupabase
        .from('quotes')
        .select('id, code, name, status, total_amount')
        .eq('id', tour.locked_quote_id)
        .single()

      finalQuote = quote
    }

    return NextResponse.json({
      success: true,
      data: {
        tour: {
          id: tour.id,
          code: tour.code,
          name: tour.name,
          status: tour.status,
          start_date: tour.start_date,
          end_date: tour.end_date,
          is_locked: !!tour.locked_at,
          locked_at: tour.locked_at,
        },
        finalItinerary,
        finalQuote,
      },
    })
  } catch (error) {
    console.error('Final itinerary error:', error)
    return NextResponse.json(
      { error: '取得最終行程失敗' },
      { status: 500 }
    )
  }
}
