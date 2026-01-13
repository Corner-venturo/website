'use client'

import { create } from 'zustand'
import { getSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { dedup } from '@/lib/request-dedup'

// 類型定義
export interface ChatUser {
  id: string
  display_name: string | null
  avatar_url: string | null
}

export interface ChatMessage {
  id: string
  content: string | null
  type: 'text' | 'image' | 'file' | 'system' | 'location'
  attachments: Array<{
    url: string
    type: string
    name?: string
  }>
  reactions: Record<string, string[]>
  metadata?: Record<string, unknown>
  edited_at: string | null
  created_at: string
  reply_to_id: string | null
  sender: ChatUser | null
  reply_to?: {
    id: string
    content: string | null
    type: string
    sender: { id: string; display_name: string | null } | null
  } | null
}

export interface Conversation {
  id: string
  type: 'direct' | 'trip' | 'split' | 'tour_announcement' | 'tour_support'
  name: string | null
  avatar_url: string | null
  trip_id: string | null
  split_group_id: string | null
  tour_id: string | null
  is_open: boolean
  last_message_preview: string | null
  last_message_at: string | null
  created_at: string
  updated_at: string
  display_name: string | null
  display_avatar: string | null
  unread_count: number
  // 團資訊（tour_announcement/tour_support 類型用）
  tour?: {
    tour_code: string
    name: string
    departure_date: string
  } | null
  members: Array<{
    user_id: string
    role: string
    user: ChatUser | null
  }>
}

interface ChatState {
  // 對話列表
  conversations: Conversation[]
  currentConversation: Conversation | null
  currentMessages: ChatMessage[]

  // 狀態
  isLoading: boolean
  isLoadingMessages: boolean
  isSending: boolean
  error: string | null

  // Realtime 訂閱
  messageSubscription: ReturnType<typeof getSupabaseClient>['channel'] | null

  // Actions
  fetchConversations: () => Promise<void>
  fetchConversation: (conversationId: string) => Promise<void>
  fetchMessages: (conversationId: string, before?: string) => Promise<{ hasMore: boolean }>
  sendMessage: (conversationId: string, content: string, options?: {
    type?: 'text' | 'image' | 'file' | 'location'
    attachments?: Array<{ url: string; type: string; name?: string }>
    reply_to_id?: string
  }) => Promise<boolean>
  markAsRead: (conversationId: string) => Promise<void>
  startDirectChat: (otherUserId: string) => Promise<string | null>
  subscribeToMessages: (conversationId: string) => void
  unsubscribeFromMessages: () => void
  clearCurrentConversation: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  currentMessages: [],
  isLoading: false,
  isLoadingMessages: false,
  isSending: false,
  error: null,
  messageSubscription: null,

  fetchConversations: async () => {
    set({ isLoading: true, error: null })

    try {
      const data = await dedup('chat:conversations', async () => {
        const response = await fetch('/api/chat/conversations')
        if (!response.ok) throw new Error('讀取對話失敗')
        return response.json()
      })

      set({ conversations: data.data || [], isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : '讀取對話失敗'
      logger.error('fetchConversations error:', error)
      set({ isLoading: false, error: message })
    }
  },

  fetchConversation: async (conversationId: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`)
      if (!response.ok) throw new Error('讀取對話失敗')
      const data = await response.json()

      set({ currentConversation: data.data, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : '讀取對話失敗'
      logger.error('fetchConversation error:', error)
      set({ isLoading: false, error: message })
    }
  },

  fetchMessages: async (conversationId: string, before?: string) => {
    const isFirstLoad = !before
    if (isFirstLoad) {
      set({ isLoadingMessages: true, error: null })
    }

    try {
      const url = before
        ? `/api/chat/conversations/${conversationId}/messages?before=${before}`
        : `/api/chat/conversations/${conversationId}/messages`

      const response = await fetch(url)
      if (!response.ok) throw new Error('讀取訊息失敗')
      const data = await response.json()

      const newMessages = data.data || []

      set(state => ({
        currentMessages: before
          ? [...newMessages, ...state.currentMessages]
          : newMessages,
        isLoadingMessages: false,
      }))

      return { hasMore: data.hasMore }
    } catch (error) {
      const message = error instanceof Error ? error.message : '讀取訊息失敗'
      logger.error('fetchMessages error:', error)
      set({ isLoadingMessages: false, error: message })
      return { hasMore: false }
    }
  },

  sendMessage: async (conversationId, content, options = {}) => {
    set({ isSending: true, error: null })

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          type: options.type || 'text',
          attachments: options.attachments,
          reply_to_id: options.reply_to_id,
        }),
      })

      if (!response.ok) throw new Error('發送訊息失敗')
      const data = await response.json()

      // 樂觀更新：立即加入訊息列表
      set(state => ({
        currentMessages: [...state.currentMessages, data.data],
        isSending: false,
      }))

      // 更新對話列表的最後訊息
      set(state => ({
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                last_message_preview: content.substring(0, 100),
                last_message_at: data.data.created_at,
              }
            : conv
        ),
      }))

      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : '發送訊息失敗'
      logger.error('sendMessage error:', error)
      set({ isSending: false, error: message })
      return false
    }
  },

  markAsRead: async (conversationId: string) => {
    try {
      await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read' }),
      })

      // 更新未讀數
      set(state => ({
        conversations: state.conversations.map(conv =>
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        ),
      }))
    } catch (error) {
      logger.error('markAsRead error:', error)
    }
  },

  startDirectChat: async (otherUserId: string) => {
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'direct',
          otherUserId,
        }),
      })

      if (!response.ok) throw new Error('建立對話失敗')
      const data = await response.json()

      // 重新載入對話列表
      await get().fetchConversations()

      return data.conversationId
    } catch (error) {
      logger.error('startDirectChat error:', error)
      return null
    }
  },

  subscribeToMessages: (conversationId: string) => {
    const supabase = getSupabaseClient()

    // 取消之前的訂閱
    get().unsubscribeFromMessages()

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'traveler_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload: { new: { id: string; conversation_id: string } }) => {
          logger.log('New message received:', payload)

          // 取得完整的訊息資料（包含 sender）
          const { data: message } = await supabase
            .from('traveler_messages')
            .select(`
              id,
              content,
              type,
              attachments,
              reactions,
              created_at,
              sender:traveler_profiles!sender_id(id, display_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single()

          if (message) {
            set(state => {
              // 避免重複訊息
              if (state.currentMessages.some(m => m.id === message.id)) {
                return state
              }
              return {
                currentMessages: [...state.currentMessages, message as unknown as ChatMessage],
              }
            })
          }
        }
      )
      .subscribe()

    set({ messageSubscription: channel as unknown as typeof channel })
  },

  unsubscribeFromMessages: () => {
    const { messageSubscription } = get()
    if (messageSubscription) {
      const supabase = getSupabaseClient()
      supabase.removeChannel(messageSubscription as unknown as ReturnType<typeof supabase.channel>)
      set({ messageSubscription: null })
    }
  },

  clearCurrentConversation: () => {
    get().unsubscribeFromMessages()
    set({
      currentConversation: null,
      currentMessages: [],
    })
  },
}))
