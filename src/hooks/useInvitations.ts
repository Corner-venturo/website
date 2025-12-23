'use client'

import { useState, useCallback } from 'react'

// Types
export interface FriendInvitation {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'rejected'
  expires_at: string | null
  invite_message: string | null
  created_at: string
  updated_at: string
  inviter?: {
    id: string
    display_name: string | null
    avatar_url: string | null
    username: string | null
  }
  invitee?: {
    id: string
    display_name: string | null
    avatar_url: string | null
    username: string | null
  }
}

export interface TripInvitation {
  id: string
  trip_id: string
  inviter_id: string
  invitee_id: string | null
  invite_code: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled'
  message: string | null
  role: string
  expires_at: string
  responded_at: string | null
  created_at: string
  trip?: {
    id: string
    title: string
    cover_image: string | null
    start_date: string
    end_date: string
  }
  inviter?: {
    id: string
    display_name: string | null
    avatar_url: string | null
    username: string | null
  }
  invitee?: {
    id: string
    display_name: string | null
    avatar_url: string | null
    username: string | null
  }
}

export interface SplitGroupInvitation {
  id: string
  group_id: string
  inviter_id: string
  invitee_id: string | null
  invite_code: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled'
  message: string | null
  expires_at: string
  responded_at: string | null
  created_at: string
  group?: {
    id: string
    name: string
    cover_image: string | null
  }
  inviter?: {
    id: string
    display_name: string | null
    avatar_url: string | null
    username: string | null
  }
  invitee?: {
    id: string
    display_name: string | null
    avatar_url: string | null
    username: string | null
  }
}

export interface InvitationCounts {
  friendsReceived: number
  friendsSent: number
  tripsReceived: number
  tripsSent: number
  splitGroupsReceived: number
  splitGroupsSent: number
  totalReceived: number
  totalSent: number
}

export function useInvitations() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ============================================
  // 好友邀請
  // ============================================

  const fetchFriendInvitations = useCallback(async (type: 'received' | 'sent' | 'all' = 'received') => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/invitations/friends?type=${type}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data.data as FriendInvitation[]
    } catch (err) {
      const message = err instanceof Error ? err.message : '載入失敗'
      setError(message)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendFriendInvitation = useCallback(async (params: {
    friendId?: string
    username?: string
    message?: string
    expiresInDays?: number
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/invitations/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return { success: true, data: data.data }
    } catch (err) {
      const message = err instanceof Error ? err.message : '發送失敗'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const respondToFriendInvitation = useCallback(async (id: string, action: 'accept' | 'reject') => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/invitations/friends/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return { success: true, message: data.message }
    } catch (err) {
      const message = err instanceof Error ? err.message : '處理失敗'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cancelFriendInvitation = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/invitations/friends/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return { success: true, message: data.message }
    } catch (err) {
      const message = err instanceof Error ? err.message : '撤回失敗'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ============================================
  // 行程邀請
  // ============================================

  const fetchTripInvitations = useCallback(async (params?: {
    type?: 'received' | 'sent' | 'all'
    tripId?: string
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const searchParams = new URLSearchParams()
      if (params?.type) searchParams.set('type', params.type)
      if (params?.tripId) searchParams.set('tripId', params.tripId)

      const res = await fetch(`/api/invitations/trips?${searchParams}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data.data as TripInvitation[]
    } catch (err) {
      const message = err instanceof Error ? err.message : '載入失敗'
      setError(message)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendTripInvitation = useCallback(async (params: {
    tripId: string
    inviteeId?: string
    username?: string
    message?: string
    role?: string
    generateCode?: boolean
    expiresInDays?: number
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/invitations/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return { success: true, data: data.data, inviteLink: data.inviteLink }
    } catch (err) {
      const message = err instanceof Error ? err.message : '發送失敗'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const respondToTripInvitation = useCallback(async (id: string, action: 'accept' | 'reject' | 'cancel') => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/invitations/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return { success: true, message: data.message, tripId: data.tripId }
    } catch (err) {
      const message = err instanceof Error ? err.message : '處理失敗'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const lookupTripInviteCode = useCallback(async (code: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/invitations/trips/code/${code}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return { success: true, data: data.data }
    } catch (err) {
      const message = err instanceof Error ? err.message : '查詢失敗'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const joinTripByCode = useCallback(async (code: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/invitations/trips/code/${code}`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return {
        success: true,
        message: data.message,
        tripId: data.tripId,
        tripTitle: data.tripTitle,
        alreadyMember: data.alreadyMember,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '加入失敗'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ============================================
  // 分帳群組邀請
  // ============================================

  const fetchSplitGroupInvitations = useCallback(async (params?: {
    type?: 'received' | 'sent' | 'all'
    groupId?: string
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const searchParams = new URLSearchParams()
      if (params?.type) searchParams.set('type', params.type)
      if (params?.groupId) searchParams.set('groupId', params.groupId)

      const res = await fetch(`/api/invitations/split-groups?${searchParams}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data.data as SplitGroupInvitation[]
    } catch (err) {
      const message = err instanceof Error ? err.message : '載入失敗'
      setError(message)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendSplitGroupInvitation = useCallback(async (params: {
    groupId: string
    inviteeId?: string
    username?: string
    message?: string
    generateCode?: boolean
    expiresInDays?: number
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/invitations/split-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return { success: true, data: data.data, inviteLink: data.inviteLink }
    } catch (err) {
      const message = err instanceof Error ? err.message : '發送失敗'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const respondToSplitGroupInvitation = useCallback(async (id: string, action: 'accept' | 'reject' | 'cancel') => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/invitations/split-groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return { success: true, message: data.message, groupId: data.groupId }
    } catch (err) {
      const message = err instanceof Error ? err.message : '處理失敗'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ============================================
  // 統計
  // ============================================

  const fetchInvitationCounts = useCallback(async (): Promise<InvitationCounts> => {
    try {
      const [
        friendsReceived,
        friendsSent,
        tripsReceived,
        tripsSent,
        splitGroupsReceived,
        splitGroupsSent,
      ] = await Promise.all([
        fetchFriendInvitations('received'),
        fetchFriendInvitations('sent'),
        fetchTripInvitations({ type: 'received' }),
        fetchTripInvitations({ type: 'sent' }),
        fetchSplitGroupInvitations({ type: 'received' }),
        fetchSplitGroupInvitations({ type: 'sent' }),
      ])

      return {
        friendsReceived: friendsReceived.length,
        friendsSent: friendsSent.length,
        tripsReceived: tripsReceived.length,
        tripsSent: tripsSent.filter(i => i.status === 'pending').length,
        splitGroupsReceived: splitGroupsReceived.length,
        splitGroupsSent: splitGroupsSent.filter(i => i.status === 'pending').length,
        totalReceived: friendsReceived.length + tripsReceived.length + splitGroupsReceived.length,
        totalSent: friendsSent.length + tripsSent.filter(i => i.status === 'pending').length + splitGroupsSent.filter(i => i.status === 'pending').length,
      }
    } catch {
      return {
        friendsReceived: 0,
        friendsSent: 0,
        tripsReceived: 0,
        tripsSent: 0,
        splitGroupsReceived: 0,
        splitGroupsSent: 0,
        totalReceived: 0,
        totalSent: 0,
      }
    }
  }, [fetchFriendInvitations, fetchTripInvitations, fetchSplitGroupInvitations])

  return {
    isLoading,
    error,

    // 好友
    fetchFriendInvitations,
    sendFriendInvitation,
    respondToFriendInvitation,
    cancelFriendInvitation,

    // 行程
    fetchTripInvitations,
    sendTripInvitation,
    respondToTripInvitation,
    lookupTripInviteCode,
    joinTripByCode,

    // 分帳群組
    fetchSplitGroupInvitations,
    sendSplitGroupInvitation,
    respondToSplitGroupInvitation,

    // 統計
    fetchInvitationCounts,
  }
}
