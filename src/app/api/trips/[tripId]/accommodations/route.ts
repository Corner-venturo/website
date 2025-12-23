import { NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'

// GET: 取得行程的住宿資訊
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

    const { data: accommodations, error } = await supabase
      .from('trip_accommodations')
      .select('*')
      .eq('trip_id', tripId)
      .order('check_in_date', { ascending: true })

    if (error) {
      console.error('Query accommodations error:', error)
      return NextResponse.json(
        { error: '取得住宿資料失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: accommodations,
    })
  } catch (error) {
    console.error('Get accommodations error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// POST: 新增住宿資訊
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
      name,
      nameEn,
      address,
      phone,
      email,
      website,
      checkInDate,
      checkOutDate,
      checkInTime = '15:00',
      checkOutTime = '11:00',
      roomType,
      roomCount = 1,
      guestsCount,
      confirmationNumber,
      bookingPlatform,
      coverImage,
      notes,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: '請提供飯店名稱' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    const { data: accommodation, error } = await supabase
      .from('trip_accommodations')
      .insert({
        trip_id: tripId,
        name,
        name_en: nameEn,
        address,
        phone,
        email,
        website,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        check_in_time: checkInTime,
        check_out_time: checkOutTime,
        room_type: roomType,
        room_count: roomCount,
        guests_count: guestsCount,
        confirmation_number: confirmationNumber,
        booking_platform: bookingPlatform,
        cover_image: coverImage,
        notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Insert accommodation error:', error)
      return NextResponse.json(
        { error: '新增住宿資料失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: accommodation,
    })
  } catch (error) {
    console.error('Create accommodation error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// PUT: 更新住宿資訊
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const body = await request.json()
    const { accommodationId, ...updateData } = body

    if (!tripId || !accommodationId) {
      return NextResponse.json(
        { error: '請提供行程 ID 和住宿 ID' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    // Convert camelCase to snake_case
    const dbData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (updateData.name !== undefined) dbData.name = updateData.name
    if (updateData.nameEn !== undefined) dbData.name_en = updateData.nameEn
    if (updateData.address !== undefined) dbData.address = updateData.address
    if (updateData.phone !== undefined) dbData.phone = updateData.phone
    if (updateData.email !== undefined) dbData.email = updateData.email
    if (updateData.website !== undefined) dbData.website = updateData.website
    if (updateData.checkInDate !== undefined) dbData.check_in_date = updateData.checkInDate
    if (updateData.checkOutDate !== undefined) dbData.check_out_date = updateData.checkOutDate
    if (updateData.checkInTime !== undefined) dbData.check_in_time = updateData.checkInTime
    if (updateData.checkOutTime !== undefined) dbData.check_out_time = updateData.checkOutTime
    if (updateData.roomType !== undefined) dbData.room_type = updateData.roomType
    if (updateData.roomCount !== undefined) dbData.room_count = updateData.roomCount
    if (updateData.guestsCount !== undefined) dbData.guests_count = updateData.guestsCount
    if (updateData.confirmationNumber !== undefined) dbData.confirmation_number = updateData.confirmationNumber
    if (updateData.bookingPlatform !== undefined) dbData.booking_platform = updateData.bookingPlatform
    if (updateData.coverImage !== undefined) dbData.cover_image = updateData.coverImage
    if (updateData.notes !== undefined) dbData.notes = updateData.notes

    const { data: accommodation, error } = await supabase
      .from('trip_accommodations')
      .update(dbData)
      .eq('id', accommodationId)
      .eq('trip_id', tripId)
      .select()
      .single()

    if (error) {
      console.error('Update accommodation error:', error)
      return NextResponse.json(
        { error: '更新住宿資料失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: accommodation,
    })
  } catch (error) {
    console.error('Update accommodation error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}

// DELETE: 刪除住宿資訊
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const { searchParams } = new URL(request.url)
    const accommodationId = searchParams.get('accommodationId')

    if (!tripId || !accommodationId) {
      return NextResponse.json(
        { error: '請提供行程 ID 和住宿 ID' },
        { status: 400 }
      )
    }

    const supabase = getOnlineSupabase()

    const { error } = await supabase
      .from('trip_accommodations')
      .delete()
      .eq('id', accommodationId)
      .eq('trip_id', tripId)

    if (error) {
      console.error('Delete accommodation error:', error)
      return NextResponse.json(
        { error: '刪除住宿資料失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '住宿資料已刪除',
    })
  } catch (error) {
    console.error('Delete accommodation error:', error)
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    )
  }
}
