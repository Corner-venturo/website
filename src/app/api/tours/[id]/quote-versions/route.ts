import { NextResponse } from 'next/server'
import { getErpSupabase } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

interface QuoteVersion {
  id: string
  code: string | null
  name: string | null
  status: string | null
  total_amount: number | null
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

    // 查詢該團的所有報價單
    const { data: quotes, error } = await erpSupabase
      .from('quotes')
      .select('id, code, name, status, total_amount, version, created_at, updated_at')
      .eq('tour_id', tourId)
      .order('version', { ascending: false })

    if (error) {
      logger.error('Error fetching quote versions:', error)
      return NextResponse.json(
        { error: '無法取得報價單版本' },
        { status: 500 }
      )
    }

    // 如果沒有 version 欄位，用 created_at 順序來分配版本號
    const versionsWithNumber: QuoteVersion[] = (quotes || []).map((q, index, arr) => ({
      ...q,
      version: q.version || arr.length - index,
    }))

    return NextResponse.json({
      success: true,
      data: versionsWithNumber,
      total: versionsWithNumber.length,
    })
  } catch (error) {
    logger.error('Quote versions error:', error)
    return NextResponse.json(
      { error: '取得報價單版本失敗' },
      { status: 500 }
    )
  }
}
