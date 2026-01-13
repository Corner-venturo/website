'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

const COLORS = [
  '#4A4E4D', // Charcoal
  '#7D8471', // Sage
  '#A8907E', // Taupe
  '#6B7B8E', // Steel Blue
  '#8E7B8E', // Dusty Mauve
  '#1A1C1E', // Black
  '#C5A358', // Gold
]

const ICONS = [
  'account_balance_wallet',
  'credit_card',
  'account_balance',
  'savings',
  'payments',
  'token',
  'receipt',
  'diamond',
  'paid',
  'database',
]

export default function AddAccountPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()

  const [name, setName] = useState('')
  const [icon, setIcon] = useState('account_balance_wallet')
  const [color, setColor] = useState('#4A4E4D')
  const [initialBalance, setInitialBalance] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/expense/accounts/add')
    }
  }, [isInitialized, user, router])

  const handleSave = async () => {
    if (!name) return

    setSaving(true)
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type: 'bank',
          icon,
          color,
          initial_balance: parseFloat(initialBalance) || 0,
          is_default: false,
          include_in_total: true,
        }),
      })

      if (res.ok) {
        router.push('/expense/accounts')
      }
    } catch {
      // Handle error
    } finally {
      setSaving(false)
    }
  }

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount) || 0
    return num.toLocaleString('zh-TW')
  }

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-base-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="font-display text-primary antialiased bg-venturo-bone">
      <div className="relative min-h-screen w-full flex flex-col max-w-md mx-auto bg-venturo-bone">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-venturo-bone/80 backdrop-blur-md pt-12 pb-4 px-6 max-w-md mx-auto">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="material-symbols-outlined text-[24px] font-light hover:opacity-70 transition-opacity"
            >
              close
            </button>
            <h1 className="text-[17px] font-bold tracking-tight">新增帳戶</h1>
            <button
              onClick={handleSave}
              disabled={!name || saving}
              className="text-[17px] font-bold text-accent-gold disabled:opacity-40 transition-opacity"
            >
              {saving ? '...' : '儲存'}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1 px-6 pt-[100px] pb-12 w-full">
          {/* Preview Card */}
          <section className="mb-10">
            <div
              className="relative h-[180px] w-full rounded-[28px] text-white p-7 shadow-2xl flex flex-col justify-between overflow-hidden"
              style={{
                backgroundColor: color,
                boxShadow: `0 25px 50px -12px ${color}33`,
              }}
            >
              {/* Decorative blur */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />

              <div className="flex justify-between items-start relative z-10">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                  <span className="material-symbols-outlined text-[28px]">{icon}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest opacity-60">
                    Personal Account
                  </span>
                  <div className="h-[2px] w-8 bg-accent-gold mt-1 ml-auto" />
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-[12px] opacity-70 mb-1">{name || '帳戶名稱'}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[24px] font-bold tracking-tight">
                    NT$ {formatAmount(initialBalance)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Form */}
          <div className="space-y-8">
            {/* Color Picker */}
            <section>
              <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2">
                卡片顏色
                <span className="text-[10px] text-slate-muted font-normal uppercase tracking-wider">
                  Appearance
                </span>
              </h3>
              <div className="flex justify-between items-center px-1">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 active:scale-95 border-2 ${
                      color === c ? 'border-primary' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </section>

            {/* Icon Picker */}
            <section>
              <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2">
                帳戶圖示
                <span className="text-[10px] text-slate-muted font-normal uppercase tracking-wider">
                  Iconography
                </span>
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {ICONS.map(i => (
                  <button
                    key={i}
                    onClick={() => setIcon(i)}
                    className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-white border transition-all cursor-pointer ${
                      icon === i
                        ? 'border-primary bg-primary text-white'
                        : 'border-transparent text-slate-muted'
                    }`}
                  >
                    <span className="material-symbols-outlined">{i}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Account Name */}
            <section className="space-y-5">
              <div>
                <label className="block text-[13px] font-bold mb-2 ml-1">帳戶名稱</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="輸入帳戶名稱"
                  className="w-full bg-white border-none rounded-2xl px-4 py-4 text-[16px] focus:ring-2 focus:ring-primary/5 transition-all shadow-sm"
                  autoFocus
                />
              </div>

              {/* Initial Balance */}
              <div>
                <label className="block text-[13px] font-bold mb-2 ml-1">初始餘額</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-slate-muted">
                    NT$
                  </span>
                  <input
                    type="number"
                    value={initialBalance}
                    onChange={e => setInitialBalance(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border-none rounded-2xl pl-14 pr-4 py-4 text-[16px] focus:ring-2 focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Spacer */}
        <div className="h-10" />
      </div>
    </div>
  )
}
