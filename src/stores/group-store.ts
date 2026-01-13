import { create } from 'zustand'
import { getSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export interface Group {
  id: string
  title: string
  description: string | null
  cover_image: string | null
  category: 'food' | 'photo' | 'outdoor' | 'party' | 'music' | 'coffee' | 'other'
  location_name: string | null
  location_address: string | null
  latitude: number | null
  longitude: number | null
  event_date: string
  start_time: string | null
  end_time: string | null
  max_members: number
  current_members: number
  gender_limit: 'all' | 'male' | 'female'
  require_approval: boolean
  is_private: boolean
  estimated_cost: number | null
  status: 'draft' | 'active' | 'full' | 'completed' | 'cancelled'
  created_by: string
  created_at: string
  updated_at: string
  published_at: string | null
  // 關聯資料
  creator?: {
    id: string
    display_name: string | null
    avatar_url: string | null
  }
  tags?: string[]
}

export interface CreateGroupData {
  title: string
  description?: string
  cover_image?: string
  category: string
  location_name?: string
  location_address?: string
  latitude?: number
  longitude?: number
  event_date: string
  start_time?: string
  end_time?: string
  max_members: number
  gender_limit: string
  require_approval: boolean
  is_private: boolean
  estimated_cost?: number
  tags?: string[]
}

interface GroupState {
  groups: Group[]
  myGroups: Group[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchGroups: (options?: { category?: string; limit?: number }) => Promise<void>
  fetchMyGroups: (userId: string) => Promise<void>
  createGroup: (userId: string, data: CreateGroupData) => Promise<{ success: boolean; groupId?: string; error?: string }>
  updateGroup: (groupId: string, data: Partial<CreateGroupData & { status: string }>) => Promise<{ success: boolean; error?: string }>
  deleteGroup: (groupId: string) => Promise<{ success: boolean; error?: string }>
  joinGroup: (groupId: string, userId: string) => Promise<{ success: boolean; error?: string }>
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  myGroups: [],
  isLoading: false,
  error: null,

  fetchGroups: async (options = {}) => {
    const supabase = getSupabaseClient()
    set({ isLoading: true, error: null })

    try {
      // 恢復 JOIN 查詢（RLS 已修復）
      let query = supabase
        .from('social_groups')
        .select(`
          *,
          creator:profiles!created_by(id, display_name, avatar_url)
        `)
        .in('status', ['active', 'full'])
        .eq('is_private', false)
        .order('created_at', { ascending: false })

      if (options.category && options.category !== 'all') {
        query = query.eq('category', options.category)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      logger.log('fetchGroups result:', data, error)

      if (error) throw error

      set({ groups: data || [], isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '載入活動失敗'
      set({ isLoading: false, error: message })
    }
  },

  fetchMyGroups: async (userId: string) => {
    const supabase = getSupabaseClient()
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase
        .from('social_groups')
        .select(`
          *,
          creator:profiles!created_by(id, display_name, avatar_url)
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false })

      logger.log('fetchMyGroups result:', data, error)

      if (error) throw error

      set({ myGroups: data || [], isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '載入我的活動失敗'
      set({ isLoading: false, error: message })
    }
  },

  createGroup: async (userId: string, data: CreateGroupData) => {
    const supabase = getSupabaseClient()
    set({ isLoading: true, error: null })

    logger.log('createGroup called with userId:', userId)
    logger.log('createGroup data:', data)

    try {
      // 檢查是否可以創建更多活動
      const { data: canCreate, error: checkError } = await supabase
        .rpc('can_create_group', { user_id: userId })

      logger.log('can_create_group result:', canCreate, 'error:', checkError)

      if (checkError) {
        logger.error('Check create group error:', checkError)
      } else if (canCreate === false) {
        set({ isLoading: false })
        return {
          success: false,
          error: '你已有進行中的揪團活動，需等活動結束才能開新的揪團（升級會員可開更多）'
        }
      }

      // 建立活動
      const insertData = {
        title: data.title,
        description: data.description || null,
        cover_image: data.cover_image || null,
        category: data.category,
        location_name: data.location_name || null,
        location_address: data.location_address || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        event_date: data.event_date,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        max_members: data.max_members,
        gender_limit: data.gender_limit,
        require_approval: data.require_approval,
        is_private: data.is_private,
        estimated_cost: data.estimated_cost || null,
        status: 'active',
        created_by: userId,
        published_at: new Date().toISOString(),
      }
      logger.log('Inserting group data:', insertData)

      const { data: group, error: groupError } = await supabase
        .from('social_groups')
        .insert(insertData)
        .select()
        .single()

      logger.log('Insert result - group:', group, 'error:', groupError)

      if (groupError) throw groupError

      // 將創建者加入成員（作為 organizer）
      const { error: memberError } = await supabase
        .from('social_group_members')
        .insert({
          group_id: group.id,
          user_id: userId,
          role: 'organizer',
          status: 'approved',
          approved_at: new Date().toISOString(),
        })

      if (memberError) {
        logger.error('Failed to add organizer as member:', memberError)
      }

      // 新增標籤
      if (data.tags && data.tags.length > 0) {
        const tagInserts = data.tags.map(tag => ({
          group_id: group.id,
          tag: tag.replace('#', ''),
        }))

        await supabase.from('social_group_tags').insert(tagInserts)
      }

      // 嘗試授予徽章（揪團小白）
      try {
        await supabase.rpc('grant_badge', {
          p_user_id: userId,
          p_badge_type: 'group_newbie',
          p_metadata: { first_group_id: group.id }
        })
      } catch {
        // 徽章授予失敗不影響主流程
        logger.log('Badge grant skipped')
      }

      set({ isLoading: false })
      return { success: true, groupId: group.id }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '創建活動失敗'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  updateGroup: async (groupId: string, data: Partial<CreateGroupData & { status: string }>) => {
    const supabase = getSupabaseClient()
    set({ isLoading: true, error: null })

    try {
      const { error } = await supabase
        .from('social_groups')
        .update(data)
        .eq('id', groupId)

      if (error) throw error

      set({ isLoading: false })
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '更新活動失敗'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  deleteGroup: async (groupId: string) => {
    const supabase = getSupabaseClient()
    set({ isLoading: true, error: null })

    try {
      const { error } = await supabase
        .from('social_groups')
        .delete()
        .eq('id', groupId)

      if (error) throw error

      // 從本地狀態移除
      const { groups, myGroups } = get()
      set({
        groups: groups.filter(g => g.id !== groupId),
        myGroups: myGroups.filter(g => g.id !== groupId),
        isLoading: false
      })

      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '刪除活動失敗'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  joinGroup: async (groupId: string, userId: string) => {
    const supabase = getSupabaseClient()
    set({ isLoading: true, error: null })

    try {
      // 先檢查活動設定
      const { data: group, error: groupError } = await supabase
        .from('social_groups')
        .select('require_approval, max_members, current_members')
        .eq('id', groupId)
        .single()

      if (groupError) throw groupError

      if (group.current_members >= group.max_members) {
        throw new Error('活動已額滿')
      }

      // 加入成員
      const { error: memberError } = await supabase
        .from('social_group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member',
          status: group.require_approval ? 'pending' : 'approved',
          approved_at: group.require_approval ? null : new Date().toISOString(),
        })

      if (memberError) {
        if (memberError.code === '23505') {
          throw new Error('你已經申請過了')
        }
        throw memberError
      }

      set({ isLoading: false })
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '加入活動失敗'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },
}))
