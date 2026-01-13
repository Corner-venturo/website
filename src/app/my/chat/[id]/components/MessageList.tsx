'use client'

import Image from 'next/image'
import type { ChatMessage } from '@/stores/chat-store'

interface MessageListProps {
  messages: ChatMessage[]
  currentUserId: string
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    return date.toLocaleDateString('zh-TW', {
      month: 'long',
      day: 'numeric',
    })
  }

  const shouldShowDate = (index: number) => {
    if (index === 0) return true
    const current = new Date(messages[index].created_at).toDateString()
    const prev = new Date(messages[index - 1].created_at).toDateString()
    return current !== prev
  }

  const shouldShowAvatar = (index: number, message: ChatMessage) => {
    if (message.sender?.id === currentUserId) return false
    if (index === messages.length - 1) return true
    const next = messages[index + 1]
    return next.sender?.id !== message.sender?.id
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-[#c9aa7c]/10 rounded-full flex items-center justify-center mb-3">
          <span className="material-icons-round text-3xl text-[#c9aa7c]">waving_hand</span>
        </div>
        <p className="text-sm text-[#949494]">開始聊天吧！</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {messages.map((message, index) => {
        const isMe = message.sender?.id === currentUserId
        const showAvatar = shouldShowAvatar(index, message)
        const showDate = shouldShowDate(index)

        return (
          <div key={message.id}>
            {/* Date separator */}
            {showDate && (
              <div className="flex justify-center py-3">
                <span className="px-3 py-1 bg-white/60 rounded-full text-xs text-[#949494]">
                  {formatDate(message.created_at)}
                </span>
              </div>
            )}

            {/* Message */}
            <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              {/* Avatar placeholder for alignment */}
              <div className="w-8 flex-shrink-0">
                {showAvatar && !isMe && message.sender && (
                  message.sender.avatar_url ? (
                    <Image
                      src={message.sender.avatar_url}
                      alt={message.sender.display_name || '用戶'}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9aa7c] to-[#a8bfa6] flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {message.sender.display_name?.[0] || '?'}
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* Bubble */}
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Reply preview */}
                {message.reply_to && (
                  <div className={`mb-1 px-3 py-1 bg-black/5 rounded-lg text-xs ${isMe ? 'ml-auto' : ''}`}>
                    <span className="text-[#949494]">
                      回覆 {message.reply_to.sender?.display_name || '用戶'}
                    </span>
                    <p className="text-[#5C5C5C] truncate">
                      {message.reply_to.content || '[媒體訊息]'}
                    </p>
                  </div>
                )}

                {/* Content */}
                {message.type === 'text' && (
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isMe
                        ? 'bg-[#c9aa7c] text-white rounded-br-md'
                        : 'bg-white text-[#5C5C5C] rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                )}

                {message.type === 'image' && message.attachments?.[0] && (
                  <Image
                    src={message.attachments[0].url}
                    alt="圖片"
                    width={200}
                    height={200}
                    className="rounded-2xl object-cover"
                  />
                )}

                {message.type === 'system' && (
                  <div className="text-center py-2">
                    <span className="text-xs text-[#949494]">{message.content}</span>
                  </div>
                )}

                {/* Time */}
                <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : ''}`}>
                  <span className="text-[10px] text-[#949494]">
                    {formatTime(message.created_at)}
                  </span>
                  {message.edited_at && (
                    <span className="text-[10px] text-[#949494]">· 已編輯</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
