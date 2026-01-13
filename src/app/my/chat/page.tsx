'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useChatStore } from '@/stores/chat-store'
import ChatList from './components/ChatList'
import EmptyState from './components/EmptyState'

export default function ChatPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuthStore()
  const { conversations, isLoading, fetchConversations } = useChatStore()

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login')
    }
  }, [user, isInitialized, router])

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user, fetchConversations])

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-[#F0EEE6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9aa7c]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0EEE6]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-white/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 hover:bg-white transition"
          >
            <span className="material-icons-round text-[#5C5C5C]">arrow_back</span>
          </button>
          <h1 className="text-lg font-semibold text-[#5C5C5C]">訊息</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Content */}
      <main className="pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9aa7c]" />
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState />
        ) : (
          <ChatList conversations={conversations} />
        )}
      </main>
    </div>
  )
}
