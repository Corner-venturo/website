'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import MobileNav from '@/components/MobileNav'
import { useAuthStore } from '@/stores/auth-store'

interface Expense {
  id: string
  title: string
  time: string
  paymentMethod: string
  amount: number
  icon: string
  tripId?: string
  tripName?: string
  tripCategory?: string
}

interface Trip {
  id: string
  name: string
  dateRange: string
  progress: number
  icon: string
  status: 'active' | 'upcoming' | 'planning'
}

export default function ExpenseListPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'personal' | 'split'>('personal')
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const touchStartX = useRef(0)
  const touchCurrentX = useRef(0)

  // Mock data
  const [expenses] = useState<Expense[]>([
    {
      id: '1',
      title: '午餐 - 豚骨拉麵',
      time: '12:30',
      paymentMethod: '現金',
      amount: 280,
      icon: 'restaurant',
    },
    {
      id: '2',
      title: '藥妝品購買',
      time: '14:15',
      paymentMethod: '信用卡',
      amount: 1850,
      icon: 'shopping_bag',
    },
    {
      id: '3',
      title: '交通 IC 卡儲值',
      time: '16:30',
      paymentMethod: '現金',
      amount: 350,
      icon: 'directions_subway',
      tripId: '1',
      tripName: '東京 5 日秋季賞楓',
      tripCategory: '交通',
    },
  ])

  const [trips] = useState<Trip[]>([
    {
      id: '1',
      name: '東京 5 日秋季賞楓',
      dateRange: '11.11 - 11.15',
      progress: 81,
      icon: 'map',
      status: 'active',
    },
    {
      id: '2',
      name: '北海道跨年滑雪之旅',
      dateRange: '12.28 - 01.03',
      progress: 0,
      icon: 'landscape',
      status: 'upcoming',
    },
    {
      id: '3',
      name: '台南美食兩天一夜',
      dateRange: '11.23 - 11.24',
      progress: 0,
      icon: 'explore',
      status: 'planning',
    },
  ])

  const todayTotal = expenses.reduce((sum, e) => sum + e.amount, 0)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/expense/list')
    }
  }, [isInitialized, user, router])

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('zh-TW')
  }

  const handleTouchStart = (e: React.TouchEvent, expenseId: string) => {
    touchStartX.current = e.touches[0].clientX
    touchCurrentX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent, expenseId: string) => {
    touchCurrentX.current = e.touches[0].clientX
    const diff = touchStartX.current - touchCurrentX.current

    if (diff > 50) {
      setSwipedItemId(expenseId)
    } else if (diff < -30) {
      setSwipedItemId(null)
    }
  }

  const handleTouchEnd = () => {
    touchStartX.current = 0
    touchCurrentX.current = 0
  }

  const openLinkModal = (expense: Expense) => {
    setSelectedExpense(expense)
    setSelectedTripId(expense.tripId || null)
    setShowLinkModal(true)
    setSwipedItemId(null)
  }

  const handleLinkTrip = () => {
    // API call to link expense to trip
    console.log('Linking expense', selectedExpense?.id, 'to trip', selectedTripId)
    setShowLinkModal(false)
    setSelectedExpense(null)
  }

  const handleDelete = (expenseId: string) => {
    // API call to delete expense
    console.log('Deleting expense', expenseId)
    setSwipedItemId(null)
  }

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-base-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="font-display text-primary antialiased bg-base-bg">
      <div className="relative min-h-screen w-full flex flex-col max-w-md mx-auto bg-base-bg overflow-hidden">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-base-bg/80 backdrop-blur-md pt-12 pb-4 px-4 max-w-md mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="text-[20px] font-bold tracking-tight">記帳管理中心</h1>
              <div className="flex items-center gap-3">
                <button className="material-symbols-outlined text-[24px] font-light">search</button>
                <button className="material-symbols-outlined text-[24px] font-light">notifications</button>
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
          {/* Date Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[12px] text-slate-muted font-medium mb-1">11月 15日 星期五</p>
              <h2 className="text-[20px] font-bold">今日支出</h2>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-slate-muted font-medium mb-1">總計</p>
              <p className="text-[18px] font-bold font-display">NT$ {formatAmount(todayTotal)}</p>
            </div>
          </div>

          {/* Expense List */}
          <div className="space-y-3">
            {expenses.map(expense => (
              <div key={expense.id} className="relative">
                {/* Swipe Actions Background */}
                <div className="absolute inset-0 flex items-center justify-end px-4 gap-2 bg-primary rounded-[16px]">
                  <button
                    onClick={() => openLinkModal(expense)}
                    className="flex flex-col items-center gap-1 text-white"
                  >
                    <span className="material-symbols-outlined text-[22px]">link</span>
                    <span className="text-[10px] font-medium">連結行程</span>
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="flex flex-col items-center gap-1 text-white opacity-40"
                  >
                    <span className="material-symbols-outlined text-[22px]">delete</span>
                    <span className="text-[10px] font-medium">刪除</span>
                  </button>
                </div>

                {/* Expense Card */}
                <div
                  onClick={() => router.push(`/expense/${expense.id}`)}
                  onTouchStart={e => handleTouchStart(e, expense.id)}
                  onTouchMove={e => handleTouchMove(e, expense.id)}
                  onTouchEnd={handleTouchEnd}
                  className={`relative glass-panel p-4 flex items-center gap-4 bg-white border border-divider shadow-sm rounded-[16px] transition-transform duration-300 cursor-pointer ${
                    swipedItemId === expense.id ? '-translate-x-[140px]' : 'translate-x-0'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-venturo-bone flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      {expense.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-bold">{expense.title}</h4>
                      {expense.tripId && (
                        <span className="px-1.5 py-0.5 rounded-md bg-accent-gold/10 text-accent-gold text-[9px] font-bold tracking-tight uppercase">
                          Trip
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-muted">
                      {expense.tripId
                        ? `${expense.tripName} · ${expense.tripCategory}`
                        : `${expense.time} · ${expense.paymentMethod}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-bold font-display">NT$ {formatAmount(expense.amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Link Trip Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-auto">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setShowLinkModal(false)}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white rounded-t-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
              {/* Decorative blurs */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent-gold/5 rounded-full blur-[80px]" />
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-[60px]" />

              <div className="relative px-6 pt-3 pb-10">
                {/* Handle */}
                <div className="w-12 h-1.5 bg-divider rounded-full mx-auto mb-8" />

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-[20px] font-bold tracking-tight">連結至行程</h3>
                    <p className="text-[12px] text-slate-muted">選擇此筆支出的所屬旅遊行程</p>
                  </div>
                  <button
                    onClick={() => setShowLinkModal(false)}
                    className="w-8 h-8 rounded-full bg-divider/50 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                {/* Trip List */}
                <div className="space-y-4">
                  {trips.map(trip => (
                    <button
                      key={trip.id}
                      onClick={() => setSelectedTripId(trip.id)}
                      className={`w-full p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden transition-colors ${
                        selectedTripId === trip.id
                          ? 'border-2 border-primary bg-primary/[0.02]'
                          : 'border border-divider hover:border-primary/20'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        selectedTripId === trip.id
                          ? 'bg-primary text-white'
                          : 'bg-venturo-bone'
                      }`}>
                        <span className={`material-symbols-outlined ${
                          selectedTripId === trip.id ? '' : 'text-slate-muted'
                        }`}>
                          {trip.icon}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="text-[14px] font-bold">{trip.name}</h4>
                        <p className="text-[11px] text-slate-muted">
                          {trip.dateRange} · {trip.status === 'active' ? `已支出 ${trip.progress}%` : trip.status === 'upcoming' ? '尚未開始' : '籌備中'}
                        </p>
                      </div>
                      <span className={`material-symbols-outlined ${
                        selectedTripId === trip.id ? 'text-primary' : 'text-divider'
                      }`}>
                        {selectedTripId === trip.id ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleLinkTrip}
                  disabled={!selectedTripId}
                  className="w-full mt-8 py-4 bg-primary text-white rounded-2xl font-bold text-[15px] shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  確認連結
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <MobileNav />
      </div>
    </div>
  )
}
