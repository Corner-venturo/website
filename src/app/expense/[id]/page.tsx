'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

interface ExpenseDetail {
  id: string
  description: string
  amount: number
  category: string
  categoryIcon: string
  date: string
  paymentMethod: string
  accountName: string
  accountLast4?: string
  tripId?: string
  tripName?: string
}

interface TripMember {
  id: string
  name: string
  avatar?: string
  selected: boolean
  isMe: boolean
}

export default function ExpenseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const expenseId = params.id as string
  const { user, initialize, isInitialized } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [enableSplit, setEnableSplit] = useState(true)
  const [members, setMembers] = useState<TripMember[]>([
    { id: '1', name: '我', avatar: '', selected: true, isMe: true },
    { id: '2', name: '阿強', avatar: '', selected: true, isMe: false },
    { id: '3', name: '小美', avatar: '', selected: true, isMe: false },
  ])

  // Mock expense data (will be replaced with API)
  const [expense] = useState<ExpenseDetail>({
    id: expenseId,
    description: '築地壽司 · 午餐',
    amount: 2480,
    category: '餐飲美食',
    categoryIcon: 'restaurant',
    date: '2023年 11月 12日',
    paymentMethod: 'credit_card',
    accountName: '國泰世華',
    accountLast4: '882',
    tripId: '1',
    tripName: '東京 5 日秋季賞楓',
  })

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push(`/login?redirect=/expense/${expenseId}`)
    }
  }, [isInitialized, user, router, expenseId])

  useEffect(() => {
    if (user) {
      // Fetch expense detail
      setLoading(false)
    }
  }, [user])

  const toggleMember = (memberId: string) => {
    setMembers(prev =>
      prev.map(m =>
        m.id === memberId ? { ...m, selected: !m.selected } : m
      )
    )
  }

  const selectAll = () => {
    setMembers(prev => prev.map(m => ({ ...m, selected: true })))
  }

  const selectedCount = members.filter(m => m.selected).length
  const perPersonAmount = selectedCount > 0 ? Math.ceil(expense.amount / selectedCount) : 0

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('zh-TW')
  }

  const handleConfirm = async () => {
    setSaving(true)
    try {
      // API call to save split
      await new Promise(resolve => setTimeout(resolve, 500))
      router.back()
    } catch {
      // Handle error
    } finally {
      setSaving(false)
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'credit_card'
      case 'cash':
        return 'payments'
      case 'e_wallet':
        return 'account_balance_wallet'
      default:
        return 'payment'
    }
  }

  if (!isInitialized || !user || loading) {
    return (
      <div className="min-h-screen bg-venturo-bone flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="font-display text-primary antialiased bg-venturo-bone min-h-screen">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-64 h-64 bg-accent-gold/[0.03] rounded-full blur-[80px]" />
        <div className="absolute top-[50%] right-[20%] w-48 h-48 bg-primary/[0.02] rounded-full blur-[60px]" />
      </div>

      <div className="relative min-h-screen w-full flex flex-col max-w-md mx-auto">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-venturo-bone/80 backdrop-blur-md pt-14 pb-4 px-6 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="material-symbols-outlined text-[24px]"
            >
              arrow_back_ios_new
            </button>
            <h2 className="text-[17px] font-bold">支出詳情</h2>
            <button className="material-symbols-outlined text-[24px]">
              more_horiz
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1 px-6 pt-[100px] pb-32">
          {/* Receipt Card */}
          <div className="bg-white rounded-[28px] shadow-xl shadow-black/5 overflow-hidden mb-8">
            {/* Receipt Header */}
            <div className="p-8 flex flex-col items-center border-b border-dashed border-divider relative">
              {/* Receipt edge decorations */}
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-venturo-bone rounded-full" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-venturo-bone rounded-full" />

              <div className="w-14 h-14 bg-venturo-bone rounded-2xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-[32px]">
                  {expense.categoryIcon}
                </span>
              </div>
              <p className="text-[14px] text-slate-muted mb-1">{expense.description}</p>
              <h3 className="text-4xl font-bold tracking-tight">NT$ {formatAmount(expense.amount)}</h3>
            </div>

            {/* Receipt Details */}
            <div className="p-8 space-y-5">
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-slate-muted">日期</span>
                <span className="font-medium">{expense.date}</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-slate-muted">支付方式</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    {getPaymentMethodIcon(expense.paymentMethod)}
                  </span>
                  <span className="font-medium">
                    {expense.accountName}
                    {expense.accountLast4 && ` (*** ${expense.accountLast4})`}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-slate-muted">分類</span>
                <span className="bg-venturo-bone px-3 py-1 rounded-full text-[12px] font-medium">
                  {expense.category}
                </span>
              </div>
            </div>
          </div>

          {/* Split Expense Card */}
          <div className="glass-panel p-6 mb-8 bg-white/60 backdrop-blur-sm border-accent-gold/20 rounded-[20px] border border-divider">
            {/* Toggle Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-accent-gold">group</span>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold">加入行程分帳</h4>
                  <p className="text-[11px] text-slate-muted">與旅伴平均分攤此筆支出</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSplit}
                  onChange={() => setEnableSplit(!enableSplit)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-divider peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            {/* Members Selection */}
            {enableSplit && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium">選擇參與成員</span>
                  <button
                    onClick={selectAll}
                    className="text-[12px] text-accent-gold"
                  >
                    全選
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {members.map(member => (
                    <button
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-full border-2 p-0.5 flex items-center justify-center ${
                          member.selected ? 'border-primary' : 'border-divider'
                        }`}>
                          <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-muted text-[20px]">
                              person
                            </span>
                          </div>
                        </div>
                        {member.selected && (
                          <div className="absolute -bottom-1 -right-1 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center scale-90">
                            <span className="material-symbols-outlined text-[14px]">check</span>
                          </div>
                        )}
                      </div>
                      <span className={`text-[11px] ${member.isMe ? 'font-bold' : 'text-slate-muted'}`}>
                        {member.name}
                      </span>
                    </button>
                  ))}

                  {/* Add Member Button */}
                  <button className="flex flex-col items-center gap-2 opacity-40">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-muted flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-muted">add</span>
                    </div>
                    <span className="text-[11px] text-slate-muted">新增</span>
                  </button>
                </div>

                {/* Split Summary */}
                <div className="mt-6 pt-4 border-t border-divider">
                  <div className="flex justify-between items-center text-[13px] mb-2">
                    <span className="text-slate-muted">預計分攤金額 ({selectedCount}人)</span>
                    <span className="font-bold">NT$ {formatAmount(perPersonAmount)} / 人</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-slate-muted font-light">行程：{expense.tripName}</span>
                    <span className="material-symbols-outlined text-[16px] text-slate-muted">
                      chevron_right
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-venturo-bone via-venturo-bone to-transparent max-w-md mx-auto">
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="w-full bg-primary text-white h-[58px] rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{enableSplit ? '確認加入行程分帳' : '儲存變更'}</span>
            <span className="material-symbols-outlined text-[20px]">
              {enableSplit ? 'done_all' : 'check'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
