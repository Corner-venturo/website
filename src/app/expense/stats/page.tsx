'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import type { ExpenseStats } from '@/app/api/expenses/stats/route'

const CATEGORY_INFO: Record<string, { icon: string; color: string; name: string }> = {
  restaurant: { icon: 'restaurant', color: '#FF6B6B', name: '餐飲' },
  directions_car: { icon: 'directions_car', color: '#4ECDC4', name: '交通' },
  shopping_bag: { icon: 'shopping_bag', color: '#45B7D1', name: '購物' },
  movie: { icon: 'movie', color: '#96CEB4', name: '娛樂' },
  hotel: { icon: 'hotel', color: '#FFEAA7', name: '住宿' },
  local_hospital: { icon: 'local_hospital', color: '#DDA0DD', name: '醫療' },
  school: { icon: 'school', color: '#98D8C8', name: '教育' },
  home: { icon: 'home', color: '#F7DC6F', name: '日用品' },
  phone: { icon: 'phone', color: '#BB8FCE', name: '通訊' },
  more_horiz: { icon: 'more_horiz', color: '#95A5A6', name: '其他' },
  groups: { icon: 'groups', color: '#F8B195', name: '社交' },
}

const PAYMENT_INFO: Record<string, { name: string; color: string }> = {
  cash: { name: '現金', color: '#10B981' },
  credit_card: { name: '信用卡', color: '#EF4444' },
  debit_card: { name: '金融卡', color: '#8B5CF6' },
  mobile_pay: { name: '行動支付', color: '#F59E0B' },
  transfer: { name: '轉帳', color: '#3B82F6' },
  other: { name: '其他', color: '#6B7280' },
}

export default function StatsPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  })
  const [stats, setStats] = useState<ExpenseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'category' | 'payment' | 'trend'>('category')

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/expense/stats')
    }
  }, [isInitialized, user, router])

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user, currentMonth])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/expenses/stats?month=${currentMonth}`)
      if (res.ok) {
        setStats(await res.json())
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }

  const changeMonth = (delta: number) => {
    const [year, month] = currentMonth.split('-').map(Number)
    const date = new Date(year, month - 1 + delta, 1)
    setCurrentMonth(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`)
  }

  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    return `${year} 年 ${parseInt(month)} 月`
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('zh-TW')
  }

  const getCategoryInfo = (category: string) => {
    return CATEGORY_INFO[category] || CATEGORY_INFO.more_horiz
  }

  // 計算圓餅圖角度
  const calculatePieSlices = (data: { amount: number }[]) => {
    const total = data.reduce((sum, d) => sum + d.amount, 0)
    if (total === 0) return []

    let currentAngle = 0
    return data.map(d => {
      const percentage = d.amount / total
      const startAngle = currentAngle
      const angle = percentage * 360
      currentAngle += angle
      return {
        ...d,
        percentage: Math.round(percentage * 100),
        startAngle,
        angle,
      }
    })
  }

  // SVG 圓餅圖路徑
  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end = polarToCartesian(cx, cy, r, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`
  }

  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = (angle - 90) * Math.PI / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    }
  }

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  const categorySlices = stats ? calculatePieSlices(stats.by_category) : []
  const paymentSlices = stats ? calculatePieSlices(stats.by_payment.map(p => ({ ...p, amount: p.amount }))) : []

  // 計算趨勢圖的最大值
  const maxDailyAmount = stats
    ? Math.max(...stats.daily_trend.map(d => Math.max(d.expense, d.income)), 1)
    : 1

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h1 className="text-lg font-bold">{formatMonthDisplay(currentMonth)}</h1>
            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* 收支總覽 */}
      {stats && (
        <div className="bg-white p-6 border-b">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-500">${formatAmount(stats.total_expense)}</p>
              <p className="text-xs text-gray-500">支出</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-500">${formatAmount(stats.total_income)}</p>
              <p className="text-xs text-gray-500">收入</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${stats.net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                ${formatAmount(Math.abs(stats.net))}
              </p>
              <p className="text-xs text-gray-500">{stats.net >= 0 ? '結餘' : '超支'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 切換視圖 */}
      <div className="bg-white border-b px-4 py-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('category')}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm transition ${
              activeView === 'category'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <PieChart className="w-4 h-4" />
            分類
          </button>
          <button
            onClick={() => setActiveView('payment')}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm transition ${
              activeView === 'payment'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <PieChart className="w-4 h-4" />
            付款方式
          </button>
          <button
            onClick={() => setActiveView('trend')}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm transition ${
              activeView === 'trend'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            趨勢
          </button>
        </div>
      </div>

      <main className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : activeView === 'category' ? (
          /* 分類統計 */
          <div className="space-y-4">
            {/* 圓餅圖 */}
            {categorySlices.length > 0 && (
              <div className="bg-white rounded-2xl p-6">
                <h3 className="font-medium text-gray-800 mb-4">支出分類佔比</h3>
                <div className="flex items-center justify-center">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    {categorySlices.map((slice, i) => {
                      const catInfo = getCategoryInfo((slice as unknown as { category: string }).category)
                      return (
                        <path
                          key={i}
                          d={describeArc(100, 100, 80, slice.startAngle, slice.startAngle + slice.angle)}
                          fill={catInfo.color}
                          stroke="white"
                          strokeWidth="2"
                        />
                      )
                    })}
                    <circle cx="100" cy="100" r="50" fill="white" />
                    <text x="100" y="95" textAnchor="middle" className="text-2xl font-bold" fill="#374151">
                      ${formatAmount(stats?.total_expense || 0)}
                    </text>
                    <text x="100" y="115" textAnchor="middle" className="text-xs" fill="#9CA3AF">
                      總支出
                    </text>
                  </svg>
                </div>
              </div>
            )}

            {/* 分類列表 */}
            <div className="bg-white rounded-2xl overflow-hidden">
              {stats?.by_category.map((cat, i) => {
                const catInfo = getCategoryInfo(cat.category)
                const percentage = stats.total_expense > 0
                  ? Math.round((cat.amount / stats.total_expense) * 100)
                  : 0

                return (
                  <div
                    key={cat.category}
                    className={`flex items-center gap-3 p-4 ${
                      i < stats.by_category.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: catInfo.color + '20' }}
                    >
                      <span className="material-icons-round" style={{ color: catInfo.color }}>
                        {catInfo.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800">{catInfo.name}</span>
                        <span className="font-bold text-gray-800">${formatAmount(cat.amount)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${percentage}%`, backgroundColor: catInfo.color }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right">{percentage}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : activeView === 'payment' ? (
          /* 付款方式統計 */
          <div className="space-y-4">
            {/* 圓餅圖 */}
            {paymentSlices.length > 0 && (
              <div className="bg-white rounded-2xl p-6">
                <h3 className="font-medium text-gray-800 mb-4">付款方式佔比</h3>
                <div className="flex items-center justify-center">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    {paymentSlices.map((slice, i) => {
                      const payInfo = PAYMENT_INFO[(slice as unknown as { method: string }).method] || PAYMENT_INFO.other
                      return (
                        <path
                          key={i}
                          d={describeArc(100, 100, 80, slice.startAngle, slice.startAngle + slice.angle)}
                          fill={payInfo.color}
                          stroke="white"
                          strokeWidth="2"
                        />
                      )
                    })}
                    <circle cx="100" cy="100" r="50" fill="white" />
                  </svg>
                </div>
              </div>
            )}

            {/* 付款方式列表 */}
            <div className="bg-white rounded-2xl overflow-hidden">
              {stats?.by_payment.map((pay, i) => {
                const payInfo = PAYMENT_INFO[pay.method] || PAYMENT_INFO.other
                const percentage = stats.total_expense > 0
                  ? Math.round((pay.amount / stats.total_expense) * 100)
                  : 0

                return (
                  <div
                    key={pay.method}
                    className={`flex items-center gap-3 p-4 ${
                      i < stats.by_payment.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: payInfo.color + '20' }}
                    >
                      <span className="material-icons-round" style={{ color: payInfo.color }}>
                        {pay.method === 'cash' ? 'payments' : pay.method === 'credit_card' ? 'credit_card' : 'account_balance_wallet'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800">{payInfo.name}</span>
                        <span className="font-bold text-gray-800">${formatAmount(pay.amount)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${percentage}%`, backgroundColor: payInfo.color }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right">{percentage}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* 每日趨勢 */
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-medium text-gray-800 mb-4">每日收支趨勢</h3>
            <div className="overflow-x-auto">
              <div className="min-w-[600px] h-48 flex items-end gap-1">
                {stats?.daily_trend.map((day, i) => {
                  const expenseHeight = (day.expense / maxDailyAmount) * 100
                  const incomeHeight = (day.income / maxDailyAmount) * 100
                  const dayNum = parseInt(day.date.split('-')[2])

                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div className="w-full h-36 flex items-end justify-center gap-0.5">
                        {day.expense > 0 && (
                          <div
                            className="w-2 bg-red-400 rounded-t"
                            style={{ height: `${expenseHeight}%` }}
                            title={`支出: $${formatAmount(day.expense)}`}
                          />
                        )}
                        {day.income > 0 && (
                          <div
                            className="w-2 bg-green-400 rounded-t"
                            style={{ height: `${incomeHeight}%` }}
                            title={`收入: $${formatAmount(day.income)}`}
                          />
                        )}
                      </div>
                      {(i === 0 || dayNum === 1 || dayNum === 10 || dayNum === 20 || i === stats.daily_trend.length - 1) && (
                        <span className="text-xs text-gray-400">{dayNum}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded" />
                <span className="text-xs text-gray-500">支出</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded" />
                <span className="text-xs text-gray-500">收入</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
