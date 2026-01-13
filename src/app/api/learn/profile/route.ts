import { NextRequest, NextResponse } from 'next/server'
import { getOnlineSupabase } from '@/lib/supabase-server'
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

// GET /api/learn/profile - 取得用戶學習檔案
export async function GET() {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('learning_profiles')
      .select(`
        *,
        role:learning_roles(*)
      `)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile not found
        return NextResponse.json(null, { status: 404 })
      }
      throw error
    }

    return jsonResponse(profile, { cache: CACHE_CONFIGS.privateShort })
  } catch (error) {
    logger.error('Failed to get learning profile:', error)
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 })
  }
}

// POST /api/learn/profile - 建立用戶學習檔案
export async function POST(request: NextRequest) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      display_name,
      gender,
      role_id,
      target_language = 'ja',
      daily_goal_minutes = 15,
      daily_goal_xp = 50,
    } = body

    // 檢查是否已有 profile
    const { data: existing } = await supabase
      .from('learning_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Profile already exists' }, { status: 400 })
    }

    const { data: profile, error } = await supabase
      .from('learning_profiles')
      .insert({
        user_id: user.id,
        display_name,
        gender,
        role_id,
        target_language,
        daily_goal_minutes,
        daily_goal_xp,
      })
      .select(`
        *,
        role:learning_roles(*)
      `)
      .single()

    if (error) throw error

    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    logger.error('Failed to create learning profile:', error)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}

// PATCH /api/learn/profile - 更新用戶學習檔案
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getOnlineSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const allowedFields = [
      'display_name',
      'gender',
      'role_id',
      'target_language',
      'daily_goal_minutes',
      'daily_goal_xp',
      'reminder_enabled',
      'reminder_time',
      'cefr_level',
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    updateData.updated_at = new Date().toISOString()

    const { data: profile, error } = await supabase
      .from('learning_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select(`
        *,
        role:learning_roles(*)
      `)
      .single()

    if (error) throw error

    return NextResponse.json(profile)
  } catch (error) {
    logger.error('Failed to update learning profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
