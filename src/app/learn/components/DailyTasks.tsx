'use client'

import { useLearnStore } from '@/stores/learn-store'
import type { UserDailyTask } from '@/features/learn/types'

interface DailyTasksProps {
  tasks: UserDailyTask[]
}

export function DailyTasks({ tasks }: DailyTasksProps) {
  const { claimTaskReward } = useLearnStore()

  const handleClaim = async (taskId: string) => {
    await claimTaskReward(taskId)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="font-bold text-lg mb-4">每日任務</h3>

      <div className="space-y-3">
        {tasks.map((userTask) => {
          const task = userTask.task
          const progress = (userTask.current_value / userTask.target_value) * 100
          const isComplete = userTask.status === 'completed'
          const canClaim = isComplete && !userTask.reward_claimed

          return (
            <div
              key={userTask.id}
              className={`p-3 rounded-xl border ${
                isComplete ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">
                    {task?.name_zh || '任務'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {userTask.current_value} / {userTask.target_value}
                  </p>
                </div>

                {canClaim ? (
                  <button
                    onClick={() => handleClaim(userTask.id)}
                    className="px-3 py-1 bg-yellow-500 text-white text-sm font-medium rounded-full hover:bg-yellow-600 transition"
                  >
                    領取 +{task?.xp_reward || 10} XP
                  </button>
                ) : userTask.reward_claimed ? (
                  <span className="text-green-600 text-sm">✓ 已領取</span>
                ) : (
                  <span className="text-gray-400 text-sm">+{task?.xp_reward || 10} XP</span>
                )}
              </div>

              {/* 進度條 */}
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isComplete ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
