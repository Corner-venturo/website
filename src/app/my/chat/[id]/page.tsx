'use client'

import { useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useChatStore } from '@/stores/chat-store'
import ChatHeader from './components/ChatHeader'
import MessageList from './components/MessageList'
import MessageInput from './components/MessageInput'

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string

  const { user, isInitialized } = useAuthStore()
  const {
    currentConversation,
    currentMessages,
    isLoadingMessages,
    fetchConversation,
    fetchMessages,
    markAsRead,
    subscribeToMessages,
    clearCurrentConversation,
  } = useChatStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  // 檢查登入
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login')
    }
  }, [user, isInitialized, router])

  // 載入對話和訊息
  useEffect(() => {
    if (user && conversationId && !hasInitialized.current) {
      hasInitialized.current = true

      Promise.all([
        fetchConversation(conversationId),
        fetchMessages(conversationId),
      ]).then(() => {
        markAsRead(conversationId)
        subscribeToMessages(conversationId)
      })
    }

    return () => {
      clearCurrentConversation()
    }
  }, [user, conversationId, fetchConversation, fetchMessages, markAsRead, subscribeToMessages, clearCurrentConversation])

  // 捲動到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages])

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-[#F0EEE6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9aa7c]" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#F0EEE6]">
      {/* Header */}
      <ChatHeader conversation={currentConversation} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9aa7c]" />
          </div>
        ) : (
          <>
            <MessageList
              messages={currentMessages}
              currentUserId={user.id}
            />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  )
}
