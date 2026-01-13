'use client'

interface StreakCardProps {
  currentStreak: number
  longestStreak: number
  todayComplete: boolean
}

export function StreakCard({ currentStreak, longestStreak, todayComplete }: StreakCardProps) {
  // 產生最近 7 天的日期
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      day: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
      isActive: i < currentStreak || (i === 6 && todayComplete),
      isToday: i === 6,
    }
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <h2 className="font-bold text-lg">連續 {currentStreak} 天</h2>
            <p className="text-gray-500 text-sm">最長紀錄：{longestStreak} 天</p>
          </div>
        </div>
        {todayComplete && (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            今日完成
          </span>
        )}
      </div>

      {/* 一週日曆 */}
      <div className="flex justify-between">
        {days.map((day, index) => (
          <div
            key={index}
            className={`flex flex-col items-center ${day.isToday ? 'scale-110' : ''}`}
          >
            <span className={`text-xs mb-1 ${day.isToday ? 'font-bold text-blue-600' : 'text-gray-400'}`}>
              {day.day}
            </span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                day.isActive
                  ? 'bg-orange-500 text-white'
                  : day.isToday
                  ? 'bg-gray-100 border-2 border-dashed border-gray-300'
                  : 'bg-gray-100'
              }`}
            >
              {day.isActive ? '🔥' : day.isToday ? '?' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
