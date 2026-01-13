import { NextResponse } from 'next/server'
import { getErpSupabase } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

interface ItineraryVersion {
  id: string
  code: string | null
  title: string | null
  status: string | null
  version: number | null
  created_at: string | null
  updated_at: string | null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const erpSupabase = getErpSupabase()
    const { id: tourId } = await params

    // 查詢該團的所有行程表
    const { data: itineraries, error } = await erpSupabase
      .from('itineraries')
      .select('id, code, title, status, created_at, updated_at')
      .eq('tour_id', tourId)
      .order('updated_at', { ascending: false })

    if (error) {
      logger.error('Error fetching itinerary versions:', error)
      return NextResponse.json(
        { error: '無法取得行程版本' },
        { status: 500 }
      )
    }

    // 分配版本號（最新的是最高版本）
    const versionsWithNumber: ItineraryVersion[] = (itineraries || []).map((it, index, arr) => ({
      ...it,
      version: arr.length - index,
    }))

    return NextResponse.json({
      success: true,
      data: versionsWithNumber,
      total: versionsWithNumber.length,
    })
  } catch (error) {
    logger.error('Itinerary versions error:', error)
    return NextResponse.json(
      { error: '取得行程版本失敗' },
      { status: 500 }
    )
  }
}
