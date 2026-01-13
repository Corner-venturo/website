'use client'

import { useRouter } from 'next/navigation'

export default function EmptyState() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-[#c9aa7c]/20 to-[#a8bfa6]/20 rounded-full flex items-center justify-center mb-4">
        <span className="material-icons-round text-4xl text-[#c9aa7c]">chat_bubble_outline</span>
      </div>

      <h3 className="text-lg font-medium text-[#5C5C5C] mb-2">
        還沒有對話
      </h3>

      <p className="text-sm text-[#949494] mb-6 max-w-[240px]">
        找個朋友開始聊天吧！或是在行程、分帳群組中發起對話
      </p>

      <button
        onClick={() => router.push('/my/friends')}
        className="px-6 py-2.5 bg-[#c9aa7c] text-white font-medium rounded-xl hover:bg-[#b8996b] transition flex items-center gap-2"
      >
        <span className="material-icons-round text-lg">people</span>
        查看朋友
      </button>
    </div>
  )
}
