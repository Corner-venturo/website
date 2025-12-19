import { create } from 'zustand'
import { getSupabaseClient } from '@/lib/supabase'

// 資料庫返回的好友關係記錄
interface FriendshipRecord {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

// Profile 資料
interface ProfileRecord {
  id: string
  display_name: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
}

export interface Friend extends FriendshipRecord {
  // 關聯的 profile 資料
  profile?: ProfileRecord
}

interface FriendsState {
  // 已接受的好友
  friends: Friend[]
  // 收到的待處理邀請
  pendingReceived: Friend[]
  // 發出的待處理邀請
  pendingSent: Friend[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchFriends: (userId: string) => Promise<void>
  sendFriendRequest: (userId: string, friendId: string) => Promise<{ success: boolean; error?: string }>
  acceptFriendRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>
  rejectFriendRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>
  removeFriend: (friendshipId: string) => Promise<{ success: boolean; error?: string }>
  searchUsers: (query: string, currentUserId: string) => Promise<{ id: string; display_name: string | null; avatar_url: string | null }[]>
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  pendingReceived: [],
  pendingSent: [],
  isLoading: false,
  error: null,

  fetchFriends: async (userId: string) => {
    const supabase = getSupabaseClient()
    set({ isLoading: true, error: null })

    try {
      // 取得已接受的好友（我發起或對方發起）
      const { data: acceptedData, error: acceptedError } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          updated_at
        `)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted')

      if (acceptedError) throw acceptedError

      // 取得收到的待處理邀請
      const { data: receivedData, error: receivedError } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          updated_at
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending')

      if (receivedError) throw receivedError

      // 取得發出的待處理邀請
      const { data: sentData, error: sentError } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          updated_at
        `)
        .eq('user_id', userId)
        .eq('status', 'pending')

      if (sentError) throw sentError

      // 收集所有需要查詢 profile 的 user IDs
      const userIds = new Set<string>()
      ;(acceptedData as FriendshipRecord[] | null)?.forEach((f: FriendshipRecord) => {
        userIds.add(f.user_id === userId ? f.friend_id : f.user_id)
      })
      ;(receivedData as FriendshipRecord[] | null)?.forEach((f: FriendshipRecord) => userIds.add(f.user_id))
      ;(sentData as FriendshipRecord[] | null)?.forEach((f: FriendshipRecord) => userIds.add(f.friend_id))

      // 批次查詢 profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, avatar_url, bio, location')
        .in('id', Array.from(userIds))

      const profileMap = new Map((profiles as ProfileRecord[] | null)?.map((p: ProfileRecord) => [p.id, p]) || [])

      // 組合資料
      const friends: Friend[] = ((acceptedData || []) as FriendshipRecord[]).map((f: FriendshipRecord) => ({
        ...f,
        profile: profileMap.get(f.user_id === userId ? f.friend_id : f.user_id)
      }))

      const pendingReceived: Friend[] = ((receivedData || []) as FriendshipRecord[]).map((f: FriendshipRecord) => ({
        ...f,
        profile: profileMap.get(f.user_id)
      }))

      const pendingSent: Friend[] = ((sentData || []) as FriendshipRecord[]).map((f: FriendshipRecord) => ({
        ...f,
        profile: profileMap.get(f.friend_id)
      }))

      set({
        friends,
        pendingReceived,
        pendingSent,
        isLoading: false
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '載入好友列表失敗'
      set({ isLoading: false, error: message })
    }
  },

  sendFriendRequest: async (userId: string, friendId: string) => {
    const supabase = getSupabaseClient()

    try {
      // 檢查是否已經有好友關係
      const { data: existing } = await supabase
        .from('friends')
        .select('id, status')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
        .maybeSingle()

      if (existing) {
        if (existing.status === 'accepted') {
          return { success: false, error: '已經是好友了' }
        }
        if (existing.status === 'pending') {
          return { success: false, error: '邀請已送出或對方已發送邀請給你' }
        }
      }

      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: 'pending'
        })

      if (error) throw error

      // 重新載入
      await get().fetchFriends(userId)
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '發送邀請失敗'
      return { success: false, error: message }
    }
  },

  acceptFriendRequest: async (requestId: string) => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', requestId)

      if (error) throw error

      if (user?.id) {
        await get().fetchFriends(user.id)
      }
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '接受邀請失敗'
      return { success: false, error: message }
    }
  },

  rejectFriendRequest: async (requestId: string) => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'rejected' })
        .eq('id', requestId)

      if (error) throw error

      if (user?.id) {
        await get().fetchFriends(user.id)
      }
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '拒絕邀請失敗'
      return { success: false, error: message }
    }
  },

  removeFriend: async (friendshipId: string) => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId)

      if (error) throw error

      if (user?.id) {
        await get().fetchFriends(user.id)
      }
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '移除好友失敗'
      return { success: false, error: message }
    }
  },

  searchUsers: async (query: string, currentUserId: string) => {
    if (!query.trim()) return []

    const supabase = getSupabaseClient()

    // 移除 @ 符號（如果有的話）
    const cleanQuery = query.replace(/^@/, '').trim()
    if (!cleanQuery) return []

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .neq('id', currentUserId)
        .or(`username.ilike.%${cleanQuery}%,display_name.ilike.%${cleanQuery}%,full_name.ilike.%${cleanQuery}%`)
        .limit(10)

      if (error) throw error
      return data || []
    } catch {
      return []
    }
  }
}))
