import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

// GET: 取得行程的行前說明會
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

    const supabase = getOnlineSupabase()

    const { data: briefings, error } = await supabase
      .from('traveler_trip_briefings')
      .select('*')
      .eq('trip_id', tripId)
      .order('meeting_date', { ascending: true })

    if (error) {
      logger.error('Query briefings error:', error)
      return NextResponse.json(
        { error: '取得說明會資料失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: briefings,
    })
  } catch (error) {
    logger.error('Get briefings error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// POST: 新增行前說明會
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const body = await request.json()

    if (!tripId) {
      return NextResponse.json(
        { error: '請提供行程 ID' },
        { status: 400 }
      )
    }

    const {
      title = '行前說明會',
      meetingDate,
      meetingTime,
      endTime,
      locationName,
      locationAddress,
      locationUrl,
      onlineLink,
      onlinePassword,
      agenda = [],
      documents = [],
      notes,
    } = body

    const supabase = getOnlineSupabase()

    const { data: briefing, error } = await supabase
      .from('traveler_trip_briefings')
      .insert({
        trip_id: tripId,
        title,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        end_time: endTime,
        location_name: locationName,
        location_address: locationAddress,
        location_url: locationUrl,
        online_link: onlineLink,
        online_password: onlinePassword,
        agenda,
        documents,
        notes,
      })
      .select()
      .single()

    if (error) {
      logger.error('Insert briefing error:', error)
      return NextResponse.json(
        { error: '新增說明會失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: briefing,
    })
  } catch (error) {
    logger.error('Create briefing error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// PUT: 更新行前說明會
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const body = await request.json()
    const { briefingId, ...updateData } = body

    if (!tripId || !briefingId) {
      return NextResponse.json(
        { error: '請提供行程 ID 和說明會 ID' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    // Convert camelCase to snake_case
    const dbData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (updateData.title !== undefined) dbData.title = updateData.title
    if (updateData.meetingDate !== undefined) dbData.meeting_date = updateData.meetingDate
    if (updateData.meetingTime !== undefined) dbData.meeting_time = updateData.meetingTime
    if (updateData.endTime !== undefined) dbData.end_time = updateData.endTime
    if (updateData.locationName !== undefined) dbData.location_name = updateData.locationName
    if (updateData.locationAddress !== undefined) dbData.location_address = updateData.locationAddress
    if (updateData.locationUrl !== undefined) dbData.location_url = updateData.locationUrl
    if (updateData.onlineLink !== undefined) dbData.online_link = updateData.onlineLink
    if (updateData.onlinePassword !== undefined) dbData.online_password = updateData.onlinePassword
    if (updateData.agenda !== undefined) dbData.agenda = updateData.agenda
    if (updateData.documents !== undefined) dbData.documents = updateData.documents
    if (updateData.notes !== undefined) dbData.notes = updateData.notes
    if (updateData.status !== undefined) dbData.status = updateData.status

    const { data: briefing, error } = await supabase
      .from('traveler_trip_briefings')
      .update(dbData)
      .eq('id', briefingId)
      .eq('trip_id', tripId)
      .select()
      .single()

    if (error) {
      logger.error('Update briefing error:', error)
      return NextResponse.json(
        { error: '更新說明會失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: briefing,
    })
  } catch (error) {
    logger.error('Update briefing error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// DELETE: 刪除行前說明會
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const { searchParams } = new URL(request.url)
    const briefingId = searchParams.get('briefingId')

    if (!tripId || !briefingId) {
      return NextResponse.json(
        { error: '請提供行程 ID 和說明會 ID' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    const { error } = await supabase
      .from('traveler_trip_briefings')
      .delete()
      .eq('id', briefingId)
      .eq('trip_id', tripId)

    if (error) {
      logger.error('Delete briefing error:', error)
      return NextResponse.json(
        { error: '刪除說明會失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '說明會已刪除',
    })
  } catch (error) {
    logger.error('Delete briefing error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}
