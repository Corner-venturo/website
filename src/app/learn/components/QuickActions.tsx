'use client'

import Link from 'next/link'

interface QuickActionsProps {
  dueCount: number
}

export function QuickActions({ dueCount }: QuickActionsProps) {
  const actions = [
    {
      href: '/learn/review',
      icon: '📝',
      title: '複習詞彙',
      subtitle: dueCount > 0 ? `${dueCount} 個待複習` : '今日已完成',
      color: 'bg-orange-50 border-orange-200',
      highlight: dueCount > 0,
    },
    {
      href: '/learn/scenarios',
      icon: '🎯',
      title: '學習情境',
      subtitle: '選擇學習主題',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      href: '/learn/goals',
      icon: '📊',
      title: '我的目標',
      subtitle: '管理學習計畫',
      color: 'bg-green-50 border-green-200',
    },
    {
      href: '/learn/achievements',
      icon: '🏆',
      title: '成就徽章',
      subtitle: '查看獲得成就',
      color: 'bg-purple-50 border-purple-200',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={`p-4 rounded-xl border ${action.color} hover:scale-[1.02] transition ${
            action.highlight ? 'ring-2 ring-orange-400 ring-offset-2' : ''
          }`}
        >
          <span className="text-2xl block mb-2">{action.icon}</span>
          <h3 className="font-semibold text-gray-800">{action.title}</h3>
          <p className="text-xs text-gray-500">{action.subtitle}</p>
        </Link>
      ))}
    </div>
  )
}
