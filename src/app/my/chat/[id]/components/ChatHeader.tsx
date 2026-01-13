'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Conversation } from '@/stores/chat-store'

interface ChatHeaderProps {
  conversation: Conversation | null
}

export default function ChatHeader({ conversation }: ChatHeaderProps) {
  const router = useRouter()

  const getTypeLabel = (type: Conversation['type']) => {
    switch (type) {
      case 'trip':
        return '行程群組'
      case 'split':
        return '分帳群組'
      case 'tour_announcement':
        return '團公告'
      case 'tour_support':
        return '客服'
      default:
        return null
    }
  }

  const getTypeIcon = (type: Conversation['type']) => {
    switch (type) {
      case 'tour_announcement':
        return 'campaign'
      case 'tour_support':
        return 'support_agent'
      default:
        return null
    }
  }

  const getTypeColor = (type: Conversation['type']) => {
    switch (type) {
      case 'tour_announcement':
        return 'from-[#c9aa7c] to-[#b8996b]' // 金色
      case 'tour_support':
        return 'from-[#a8bfa6] to-[#8fa68a]' // 綠色
      default:
        return 'from-[#c9aa7c] to-[#a8bfa6]'
    }
  }

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-white/50">
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Back button */}
        <button
          onClick={() => router.push('/my/chat')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 hover:bg-white transition"
        >
          <span className="material-icons-round text-[#5C5C5C]">arrow_back</span>
        </button>

        {/* Avatar */}
        {conversation?.display_avatar ? (
          <Image
            src={conversation.display_avatar}
            alt={conversation.display_name || '對話'}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${conversation ? getTypeColor(conversation.type) : 'from-[#c9aa7c] to-[#a8bfa6]'} flex items-center justify-center`}>
            {conversation && getTypeIcon(conversation.type) ? (
              <span className="material-icons-round text-white text-lg">
                {getTypeIcon(conversation.type)}
              </span>
            ) : (
              <span className="text-white font-medium">
                {conversation?.display_name?.[0] || '?'}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-[#5C5C5C] truncate">
            {conversation?.display_name || '載入中...'}
          </h1>
          {conversation && getTypeLabel(conversation.type) && (
            <p className="text-xs text-[#949494]">
              {(conversation.type === 'tour_announcement' || conversation.type === 'tour_support') && conversation.tour
                ? `${getTypeLabel(conversation.type)} · ${conversation.tour.name}`
                : `${getTypeLabel(conversation.type)} · ${conversation.members?.length || 0} 位成員`
              }
            </p>
          )}
        </div>

        {/* More button */}
        <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/50 transition">
          <span className="material-icons-round text-[#5C5C5C]">more_vert</span>
        </button>
      </div>
    </header>
  )
}
