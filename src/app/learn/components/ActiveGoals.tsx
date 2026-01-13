'use client'

import Link from 'next/link'
import type { LearningGoal } from '@/features/learn/types'

interface ActiveGoalsProps {
  goals: LearningGoal[]
}

export function ActiveGoals({ goals }: ActiveGoalsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">進行中的目標</h3>
        <Link href="/learn/goals" className="text-blue-600 text-sm">
          查看全部
        </Link>
      </div>

      <div className="space-y-3">
        {goals.slice(0, 3).map((goal) => {
          const daysLeft = Math.ceil(
            (new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
          const isUrgent = daysLeft <= 7

          return (
            <Link
              key={goal.id}
              href={`/learn/scenarios/${goal.scenario_id}`}
              className="block p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{goal.scenario?.icon || '📖'}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 truncate">
                    {goal.scenario?.name_zh || '學習目標'}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{Math.round(goal.progress_percentage)}% 完成</span>
                    <span>•</span>
                    <span className={isUrgent ? 'text-red-500 font-medium' : ''}>
                      剩餘 {daysLeft} 天
                    </span>
                  </div>
                </div>
              </div>

              {/* 進度條 */}
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isUrgent ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${goal.progress_percentage}%` }}
                />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
