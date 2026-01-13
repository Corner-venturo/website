'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  Plus,
  Target,
  TrendingUp,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import type { Budget } from '@/app/api/budgets/route'

interface BudgetData {
  budgets: Budget[]
  summary: {
    total_budget: number
    total_spent: number
    total_remaining: number
    overall_percentage: number
  }
}

export default function BudgetPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const [data, setData] = useState<BudgetData | null>(null)
  const [loading, setLoading] = useState(true)

  // 新增預算
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBudget, setNewBudget] = useState({
    name: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly',
    category_id: '',
    alert_threshold: 80,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/expense/budget')
    }
  }, [isInitialized, user, router])

  useEffect(() => {
    if (user) {
      fetchBudgets()
    }
  }, [user])

  const fetchBudgets = async () => {
    try {
      const res = await fetch('/api/budgets')
      if (res.ok) {
        setData(await res.json())
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }

  const handleAddBudget = async () => {
    if (!newBudget.amount) return

    setSaving(true)
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBudget.name || '總預算',
          amount: parseFloat(newBudget.amount),
          period: newBudget.period,
          category_id: newBudget.category_id || null,
          alert_threshold: newBudget.alert_threshold,
        }),
      })

      if (res.ok) {
        setShowAddModal(false)
        setNewBudget({
          name: '',
          amount: '',
          period: 'monthly',
          category_id: '',
          alert_threshold: 80,
        })
        fetchBudgets()
      }
    } catch {
      // Handle error
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBudget = async (id: string) => {
    try {
      const res = await fetch(`/api/budgets?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchBudgets()
      }
    } catch {
      // Handle error
    }
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('zh-TW')
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-orange-500'
    return 'bg-emerald-500'
  }

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">預算管理</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 -mr-2 text-emerald-600"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 預算總覽 */}
      {data?.summary && data.summary.total_budget > 0 && (
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-white/80">本月總預算</p>
              <p className="text-3xl font-bold">${formatAmount(data.summary.total_budget)}</p>
            </div>
            <div className="w-20 h-20 relative">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeDasharray={`${Math.min(data.summary.overall_percentage, 100) * 2.26} 226`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{data.summary.overall_percentage}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/70">已花費</p>
              <p className="text-lg font-bold">${formatAmount(data.summary.total_spent)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/70">剩餘</p>
              <p className={`text-lg font-bold ${data.summary.total_remaining < 0 ? 'text-red-200' : ''}`}>
                ${formatAmount(Math.abs(data.summary.total_remaining))}
                {data.summary.total_remaining < 0 && ' (超支)'}
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : !data?.budgets.length ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">還沒有設定預算</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-emerald-600 font-medium"
            >
              設定第一個預算
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {data.budgets.map(budget => (
              <div key={budget.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {budget.category ? (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: budget.category.color + '20' }}
                      >
                        <span
                          className="material-icons-round text-lg"
                          style={{ color: budget.category.color }}
                        >
                          {budget.category.icon}
                        </span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Target className="w-5 h-5 text-purple-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">
                        {budget.category?.name || budget.name || '總預算'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {budget.period === 'monthly' ? '每月' : budget.period === 'weekly' ? '每週' : '每年'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 進度條 */}
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all ${getProgressColor(budget.percentage || 0)}`}
                    style={{ width: `${Math.min(budget.percentage || 0, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    ${formatAmount(budget.spent || 0)} / ${formatAmount(budget.amount)}
                  </span>
                  <div className="flex items-center gap-1">
                    {(budget.percentage || 0) >= 80 && (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    )}
                    <span className={`font-medium ${(budget.percentage || 0) >= 100 ? 'text-red-500' : 'text-gray-700'}`}>
                      {budget.percentage}%
                    </span>
                  </div>
                </div>

                {(budget.remaining || 0) > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    還可以花 ${formatAmount(budget.remaining || 0)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 新增預算 Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">新增預算</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">預算名稱（選填）</label>
                <input
                  type="text"
                  value={newBudget.name}
                  onChange={e => setNewBudget({ ...newBudget, name: e.target.value })}
                  placeholder="例如：生活費"
                  className="w-full mt-1 p-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">預算金額</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl text-gray-400">$</span>
                  <input
                    type="number"
                    value={newBudget.amount}
                    onChange={e => setNewBudget({ ...newBudget, amount: e.target.value })}
                    placeholder="10000"
                    className="flex-1 text-2xl p-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">週期</label>
                <div className="flex gap-2 mt-1">
                  {(['weekly', 'monthly', 'yearly'] as const).map(period => (
                    <button
                      key={period}
                      onClick={() => setNewBudget({ ...newBudget, period })}
                      className={`flex-1 py-2 rounded-lg transition ${
                        newBudget.period === period
                          ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {period === 'weekly' ? '每週' : period === 'monthly' ? '每月' : '每年'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">提醒門檻</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    value={newBudget.alert_threshold}
                    onChange={e => setNewBudget({ ...newBudget, alert_threshold: parseInt(e.target.value) })}
                    min="50"
                    max="100"
                    step="5"
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {newBudget.alert_threshold}%
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  當花費達到預算的 {newBudget.alert_threshold}% 時提醒
                </p>
              </div>

              <button
                onClick={handleAddBudget}
                disabled={!newBudget.amount || saving}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold rounded-2xl transition"
              >
                {saving ? '儲存中...' : '新增預算'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 快速新增按鈕 */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-4 w-14 h-14 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  )
}
