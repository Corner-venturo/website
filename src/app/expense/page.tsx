'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import MobileNav from '@/components/MobileNav'
import { useAuthStore } from '@/stores/auth-store'
import type { ExpenseStats } from '@/app/api/expenses/stats/route'
import type { Account } from '@/app/api/accounts/route'

interface AccountsData {
  accounts: Account[]
  summary: {
    total_assets: number
    total_liabilities: number
    net_worth: number
  }
}

// Mock data for trip split (will be replaced with API data)
interface TripMember {
  id: string
  name: string
  avatar: string
  amount: number
  isMe: boolean
}

interface TripData {
  id: string
  name: string
  dateRange: string
  totalExpense: number
  budget: number
  days: { day: number; date: number; isToday: boolean }[]
  members: TripMember[]
  categories: { name: string; percent: number; color: string }[]
}

export default function ExpensePage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'personal' | 'split'>('personal')
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  })
  const [stats, setStats] = useState<ExpenseStats | null>(null)
  const [accountsData, setAccountsData] = useState<AccountsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTripDay, setSelectedTripDay] = useState(3) // D3 selected by default

  // Mock trip data (will be replaced with API)
  const tripData: TripData = useMemo(() => ({
    id: '1',
    name: '東京 5 日秋季賞楓',
    dateRange: '11.11 - 11.15',
    totalExpense: 48620,
    budget: 60000,
    days: [
      { day: 1, date: 11, isToday: false },
      { day: 2, date: 12, isToday: false },
      { day: 3, date: 13, isToday: true },
      { day: 4, date: 14, isToday: false },
      { day: 5, date: 15, isToday: false },
    ],
    members: [
      { id: '1', name: '我', avatar: '/avatars/me.jpg', amount: 3420, isMe: true },
      { id: '2', name: '小明', avatar: '/avatars/user2.jpg', amount: 1280, isMe: false },
      { id: '3', name: '小華', avatar: '/avatars/user3.jpg', amount: 2140, isMe: false },
    ],
    categories: [
      { name: '住宿機票', percent: 45, color: 'bg-primary' },
      { name: '餐飲美食', percent: 35, color: 'bg-accent-gold' },
      { name: '交通玩樂', percent: 20, color: 'bg-slate-muted/30' },
    ],
  }), [])

  // Generate week dates for personal tab
  const weekDates = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map((day, i) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      return {
        day,
        date: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
      }
    })
  }, [])

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/expense')
    }
  }, [isInitialized, user, router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, currentMonth])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, accountsRes] = await Promise.all([
        fetch(`/api/expenses/stats?month=${currentMonth}`),
        fetch('/api/accounts'),
      ])

      if (statsRes.ok) {
        setStats(await statsRes.json())
      }
      if (accountsRes.ok) {
        setAccountsData(await accountsRes.json())
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('zh-TW')
  }

  const formatMonthDisplay = () => {
    const [year, month] = currentMonth.split('-')
    return `${parseInt(month)}月 ${year}`
  }

  // Calculate budget progress for personal tab
  const budgetLimit = 25000
  const budgetSpent = stats?.total_expense || 0
  const budgetRemaining = Math.max(0, budgetLimit - budgetSpent)
  const budgetProgress = Math.min(100, (budgetSpent / budgetLimit) * 100)

  // Calculate trip budget progress
  const tripBudgetRemaining = tripData.budget - tripData.totalExpense
  const tripBudgetProgress = Math.min(100, (tripData.totalExpense / tripData.budget) * 100)

  // Category breakdown for personal chart
  const categoryBreakdown = [
    { name: '餐飲美食', percent: 60, color: 'bg-primary' },
    { name: '交通運輸', percent: 25, color: 'bg-accent-gold' },
    { name: '其他', percent: 15, color: 'bg-slate-muted/30' },
  ]

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-base-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="font-display text-primary antialiased bg-base-bg">
      <div className="relative min-h-screen w-full flex flex-col max-w-md mx-auto bg-base-bg">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-base-bg/80 backdrop-blur-md pt-12 pb-4 px-4 max-w-md mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="text-[20px] font-bold tracking-tight">記帳管理中心</h1>
              <div className="flex items-center gap-3">
                {activeTab === 'split' && (
                  <button className="material-symbols-outlined text-[24px] font-light">
                    group_add
                  </button>
                )}
                <button className="material-symbols-outlined text-[24px] font-light">
                  notifications
                </button>
              </div>
            </div>
            {/* Tab Pills */}
            <div className="flex p-1 bg-divider rounded-xl">
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex-1 py-2 text-[13px] rounded-lg transition-all ${
                  activeTab === 'personal'
                    ? 'bg-white shadow-sm font-bold'
                    : 'text-slate-muted font-medium'
                }`}
              >
                個人記帳
              </button>
              <button
                onClick={() => setActiveTab('split')}
                className={`flex-1 py-2 text-[13px] rounded-lg transition-all ${
                  activeTab === 'split'
                    ? 'bg-white shadow-sm font-bold'
                    : 'text-slate-muted font-medium'
                }`}
              >
                旅遊分帳
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1 px-4 pt-[148px] pb-24 w-full">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : activeTab === 'personal' ? (
            /* ========== Personal Expense Tab ========== */
            <>
              {/* Today Summary Card */}
              <section className="mb-6">
                <div className="glass-panel p-6 relative overflow-hidden bg-white border border-divider shadow-sm rounded-2xl">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-[12px] text-slate-muted mb-1">今日消費總額</p>
                        <h3 className="text-3xl font-bold font-display tracking-tight">
                          NT$ {formatAmount(stats?.total_expense || 0)}
                        </h3>
                      </div>
                      <button
                        onClick={() => router.push('/expense/add')}
                        className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                      </button>
                    </div>
                    {/* Budget Progress */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <p className="text-[12px] font-medium">本月預算進度</p>
                        <p className="text-[12px] text-slate-muted">
                          剩餘 <span className="text-primary font-bold">NT$ {formatAmount(budgetRemaining)}</span>
                        </p>
                      </div>
                      <div className="h-3 bg-divider rounded-full overflow-hidden relative">
                        <div
                          className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000"
                          style={{ width: `${budgetProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-muted uppercase tracking-wider">
                        <span>Spent {Math.round(budgetProgress)}%</span>
                        <span>Limit ${formatAmount(budgetLimit)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Decorative blur */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-accent-gold/5 rounded-full blur-3xl" />
                </div>
              </section>

              {/* Date Selector */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="text-[14px] font-bold">{formatMonthDisplay()}</h4>
                  <span className="material-symbols-outlined text-[18px] text-slate-muted">
                    calendar_today
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
                  {weekDates.map((item, i) => (
                    <div
                      key={i}
                      className={`flex flex-col items-center shrink-0 w-12 py-3 rounded-2xl transition-all ${
                        item.isToday
                          ? 'bg-primary text-white ring-4 ring-primary/10'
                          : 'border border-divider bg-white'
                      }`}
                    >
                      <span className={`text-[10px] mb-1 ${item.isToday ? 'opacity-70' : 'text-slate-muted'}`}>
                        {item.day}
                      </span>
                      <span className="text-[14px] font-bold">{item.date}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Wallet Accounts */}
              <section className="mb-8">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="text-[15px] font-bold">錢包帳戶</h3>
                  <button
                    onClick={() => router.push('/expense/accounts')}
                    className="text-[12px] text-slate-muted hover:text-primary transition-colors"
                  >
                    管理
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4">
                  {/* Cash Card */}
                  <div className="shrink-0 w-[160px] p-4 rounded-2xl bg-[#2D2D2D] text-white">
                    <div className="flex justify-between items-start mb-6">
                      <span className="material-symbols-outlined text-[20px] font-light">payments</span>
                      <span className="text-[10px] opacity-60">CASH</span>
                    </div>
                    <p className="text-[10px] opacity-60 mb-1">可用餘額</p>
                    <p className="text-[16px] font-bold">
                      NT$ {formatAmount(accountsData?.summary.total_assets || 0)}
                    </p>
                  </div>
                  {/* Credit Card */}
                  {accountsData?.accounts
                    .filter(a => a.type === 'credit_card')
                    .slice(0, 1)
                    .map(account => (
                      <div
                        key={account.id}
                        className="shrink-0 w-[160px] p-4 rounded-2xl border border-divider bg-white"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <span className="material-symbols-outlined text-[20px] font-light text-primary">
                            credit_card
                          </span>
                          <span className="text-[10px] text-slate-muted uppercase">
                            {account.name.slice(0, 4)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-muted mb-1">本期應繳</p>
                        <p className="text-[16px] font-bold text-primary">
                          NT$ {formatAmount(Math.abs(Number(account.balance)))}
                        </p>
                      </div>
                    ))}
                  {/* Add Account Button */}
                  <button
                    onClick={() => router.push('/expense/accounts/add')}
                    className="shrink-0 w-[80px] flex items-center justify-center rounded-2xl border border-dashed border-divider bg-white/50 hover:bg-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-slate-muted">add</span>
                  </button>
                </div>
              </section>

              {/* Statistics */}
              <section className="mb-4">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="text-[15px] font-bold">記帳統計</h3>
                  <button
                    onClick={() => router.push('/expense/stats')}
                    className="flex items-center gap-1 text-[12px] text-slate-muted hover:text-primary transition-colors"
                  >
                    <span>本週</span>
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>
                </div>
                <div className="bg-white border border-divider shadow-sm rounded-2xl p-6">
                  <div className="flex items-center gap-8">
                    {/* Donut Chart */}
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle
                          className="stroke-divider"
                          cx="18"
                          cy="18"
                          fill="none"
                          r="16"
                          strokeWidth="3"
                        />
                        <circle
                          className="stroke-primary"
                          cx="18"
                          cy="18"
                          fill="none"
                          r="16"
                          strokeDasharray="60, 100"
                          strokeWidth="3"
                        />
                        <circle
                          className="stroke-accent-gold"
                          cx="18"
                          cy="18"
                          fill="none"
                          r="16"
                          strokeDasharray="25, 100"
                          strokeDashoffset="-60"
                          strokeWidth="3"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-[10px] text-slate-muted">Total</span>
                        <span className="text-[14px] font-bold">{Math.round(budgetProgress)}%</span>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="flex-1 space-y-4">
                      {categoryBreakdown.map((cat, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                          <div className="flex-1">
                            <div className="flex justify-between text-[12px] mb-0.5">
                              <span className="font-medium">{cat.name}</span>
                              <span>{cat.percent}%</span>
                            </div>
                            <div className="h-1 bg-divider rounded-full">
                              <div
                                className={`h-full rounded-full ${cat.color}`}
                                style={{ width: `${cat.percent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            /* ========== Travel Split Tab ========== */
            <>
              {/* Trip Summary Card */}
              <section className="mb-6">
                <div className="glass-panel p-6 relative overflow-hidden bg-white border border-divider shadow-sm rounded-2xl">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[12px] text-slate-muted font-medium">行程總支出</span>
                          <span className="material-symbols-outlined text-[14px] text-slate-muted">info</span>
                        </div>
                        <h3 className="text-3xl font-bold font-display tracking-tight">
                          NT$ {formatAmount(tripData.totalExpense)}
                        </h3>
                      </div>
                      <button
                        onClick={() => router.push('/expense/add?type=split')}
                        className="bg-primary text-white p-2.5 rounded-xl shadow-lg shadow-primary/20"
                      >
                        <span className="material-symbols-outlined text-[22px]">add_card</span>
                      </button>
                    </div>
                    {/* Trip Budget Progress */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <p className="text-[12px] font-bold text-primary">{tripData.name}</p>
                          <p className="text-[10px] text-slate-muted">{tripData.dateRange}</p>
                        </div>
                        <p className="text-[12px] text-slate-muted text-right">
                          預算剩餘 <span className="text-primary font-bold">NT$ {formatAmount(tripBudgetRemaining)}</span>
                        </p>
                      </div>
                      <div className="h-3 bg-divider rounded-full overflow-hidden relative">
                        <div
                          className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000"
                          style={{ width: `${tripBudgetProgress}%` }}
                        />
                        <div className="absolute top-0 left-0 h-full w-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-muted uppercase tracking-wider font-medium">
                        <span>Expensed {Math.round(tripBudgetProgress)}%</span>
                        <span>Budget NT$ {formatAmount(tripData.budget)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Decorative blur */}
                  <div className="absolute -right-8 -top-8 w-40 h-40 bg-accent-gold/5 rounded-full blur-3xl" />
                  <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                </div>
              </section>

              {/* Trip Day Selector */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="text-[14px] font-bold">Day {selectedTripDay} · 11月 {tripData.days[selectedTripDay - 1]?.date}日</h4>
                  <span className="text-[12px] text-accent-gold font-medium">切換行程</span>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
                  {tripData.days.map((item) => (
                    <button
                      key={item.day}
                      onClick={() => setSelectedTripDay(item.day)}
                      className={`flex flex-col items-center shrink-0 w-12 py-3 rounded-2xl transition-all ${
                        item.day === selectedTripDay
                          ? 'bg-primary text-white ring-4 ring-primary/5 shadow-lg shadow-primary/10'
                          : 'border border-divider bg-white'
                      }`}
                    >
                      <span className={`text-[10px] mb-1 ${item.day === selectedTripDay ? 'opacity-70' : 'text-slate-muted'}`}>
                        D{item.day}
                      </span>
                      <span className="text-[14px] font-bold">{item.date}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Travel Companion Split */}
              <section className="mb-8">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="text-[15px] font-bold">旅伴成員分帳</h3>
                  <button className="text-[12px] text-slate-muted flex items-center">
                    結算 <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4">
                  {tripData.members.map((member) => (
                    <div
                      key={member.id}
                      className={`shrink-0 w-[150px] p-4 rounded-2xl ${
                        member.isMe
                          ? 'bg-primary text-white shadow-xl shadow-primary/10'
                          : 'border border-divider bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-8 h-8 rounded-full border overflow-hidden ${
                          member.isMe ? 'border-white/20 bg-venturo-bone' : 'border-divider bg-slate-100'
                        }`}>
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                            <span className={`material-symbols-outlined text-[16px] ${member.isMe ? 'text-primary' : 'text-slate-muted'}`}>
                              person
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] uppercase tracking-tighter ${
                          member.isMe ? 'opacity-60' : 'text-slate-muted'
                        }`}>
                          {member.isMe ? "I'M PAYING" : 'MEMBER'}
                        </span>
                      </div>
                      <p className={`text-[10px] mb-0.5 ${member.isMe ? 'opacity-60' : 'text-slate-muted'}`}>
                        {member.isMe ? '目前應收款項' : '應付給我'}
                      </p>
                      <p className={`text-[16px] font-bold ${member.isMe ? '' : 'text-primary'}`}>
                        {member.isMe ? '+' : ''}NT$ {formatAmount(member.amount)}
                      </p>
                    </div>
                  ))}
                  {/* Add Member Button */}
                  <button className="shrink-0 w-[80px] flex items-center justify-center rounded-2xl border border-dashed border-divider bg-white/50 hover:bg-white transition-colors">
                    <span className="material-symbols-outlined text-slate-muted">person_add</span>
                  </button>
                </div>
              </section>

              {/* Trip Statistics */}
              <section className="mb-4">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="text-[15px] font-bold">行程支出統計</h3>
                  <div className="flex items-center gap-1 text-[12px] text-slate-muted">
                    <span>全部類別</span>
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </div>
                </div>
                <div className="glass-panel p-6 bg-white border border-divider shadow-sm rounded-2xl">
                  <div className="flex items-center gap-8">
                    {/* Donut Chart */}
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle
                          className="stroke-divider"
                          cx="18"
                          cy="18"
                          fill="none"
                          r="16"
                          strokeWidth="3"
                        />
                        <circle
                          className="stroke-primary"
                          cx="18"
                          cy="18"
                          fill="none"
                          r="16"
                          strokeDasharray="45, 100"
                          strokeWidth="3"
                        />
                        <circle
                          className="stroke-accent-gold"
                          cx="18"
                          cy="18"
                          fill="none"
                          r="16"
                          strokeDasharray="35, 100"
                          strokeDashoffset="-45"
                          strokeWidth="3"
                        />
                        <circle
                          className="stroke-slate-muted/30"
                          cx="18"
                          cy="18"
                          fill="none"
                          r="16"
                          strokeDasharray="20, 100"
                          strokeDashoffset="-80"
                          strokeWidth="3"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-[10px] text-slate-muted leading-none">Total</span>
                        <span className="text-[14px] font-bold">100%</span>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="flex-1 space-y-4">
                      {tripData.categories.map((cat, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                          <div className="flex-1">
                            <div className="flex justify-between text-[12px] mb-0.5">
                              <span className="font-medium">{cat.name}</span>
                              <span>{cat.percent}%</span>
                            </div>
                            <div className="h-1 bg-divider rounded-full">
                              <div
                                className={`h-full rounded-full ${cat.color}`}
                                style={{ width: `${cat.percent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>

        {/* FAB - Add Button */}
        <button
          onClick={() => router.push(activeTab === 'personal' ? '/expense/add' : '/expense/add?type=split')}
          className="fixed bottom-28 right-6 w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 z-40 hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[32px]">add</span>
        </button>

        {/* Bottom Navigation */}
        <MobileNav />
      </div>

      {/* Tailwind custom styles */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
