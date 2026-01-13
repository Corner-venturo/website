'use client'

import { useState, useRef, useEffect } from 'react'
import { useChatStore } from '@/stores/chat-store'

interface MessageInputProps {
  conversationId: string
}

export default function MessageInput({ conversationId }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const { sendMessage, isSending, currentConversation } = useChatStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 公告頻道：旅客無法發送訊息
  const isReadOnly = currentConversation?.type === 'tour_announcement'

  // 自動調整高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [message])

  const handleSubmit = async () => {
    const content = message.trim()
    if (!content || isSending) return

    setMessage('')
    await sendMessage(conversationId, content)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // 公告頻道：顯示唯讀提示
  if (isReadOnly) {
    return (
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-white/50 p-3">
        <div className="flex items-center justify-center gap-2 py-2 text-[#949494] text-sm">
          <span className="material-icons-round text-lg">campaign</span>
          <span>此為團公告頻道，僅供瀏覽</span>
        </div>
      </div>
    )
  }

  return (
    <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-white/50 p-3">
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F0EEE6] transition">
          <span className="material-icons-round text-[#949494]">add_circle_outline</span>
        </button>

        {/* Input */}
        <div className="flex-1 bg-[#F0EEE6] rounded-2xl px-4 py-2 flex items-end">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="輸入訊息..."
            className="flex-1 bg-transparent text-sm text-[#5C5C5C] placeholder:text-[#949494] resize-none outline-none min-h-[24px] max-h-[120px]"
            rows={1}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || isSending}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition ${
            message.trim() && !isSending
              ? 'bg-[#c9aa7c] text-white hover:bg-[#b8996b]'
              : 'bg-[#E8E4DE] text-[#949494]'
          }`}
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <span className="material-icons-round text-lg">send</span>
          )}
        </button>
      </div>
    </div>
  )
}
