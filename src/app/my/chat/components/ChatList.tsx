'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Conversation } from '@/stores/chat-store'

interface ChatListProps {
  conversations: Conversation[]
}

export default function ChatList({ conversations }: ChatListProps) {
  const router = useRouter()

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ''

    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      const weekdays = ['日', '一', '二', '三', '四', '五', '六']
      return `週${weekdays[date.getDay()]}`
    } else {
      return date.toLocaleDateString('zh-TW', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  const getTypeIcon = (type: Conversation['type']) => {
    switch (type) {
      case 'trip':
        return 'flight'
      case 'split':
        return 'receipt_long'
      case 'tour_announcement':
        return 'campaign'
      case 'tour_support':
        return 'support_agent'
      default:
        return null
    }
  }

  // 團對話的背景色
  const getTypeColor = (type: Conversation['type']) => {
    switch (type) {
      case 'tour_announcement':
        return 'bg-[#c9aa7c]' // 金色 - 公告
      case 'tour_support':
        return 'bg-[#a8bfa6]' // 綠色 - 客服
      default:
        return 'bg-[#c9aa7c]'
    }
  }

  return (
    <div className="divide-y divide-[#E8E4DE]">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => router.push(`/my/chat/${conv.id}`)}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/50 transition text-left"
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {conv.display_avatar ? (
              <Image
                src={conv.display_avatar}
                alt={conv.display_name || '對話'}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9aa7c] to-[#a8bfa6] flex items-center justify-center">
                <span className="text-white font-medium">
                  {conv.display_name?.[0] || '?'}
                </span>
              </div>
            )}

            {/* Type indicator */}
            {getTypeIcon(conv.type) && (
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getTypeColor(conv.type)} rounded-full flex items-center justify-center`}>
                <span className="material-icons-round text-white text-xs">
                  {getTypeIcon(conv.type)}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-[#5C5C5C] truncate">
                {conv.display_name || '對話'}
              </span>
              <span className="text-xs text-[#949494] flex-shrink-0">
                {formatTime(conv.last_message_at)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <p className="text-sm text-[#949494] truncate">
                {conv.last_message_preview || '尚無訊息'}
              </p>
              {conv.unread_count > 0 && (
                <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-[#c9aa7c] rounded-full text-white text-xs font-medium flex items-center justify-center">
                  {conv.unread_count > 99 ? '99+' : conv.unread_count}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
