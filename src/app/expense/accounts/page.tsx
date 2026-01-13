'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import type { Account } from '@/app/api/accounts/route'

const ACCOUNT_ICONS: Record<string, { icon: string; defaultColor: string }> = {
  cash: { icon: 'payments', defaultColor: '#1A1C1E' },
  bank: { icon: 'account_balance', defaultColor: '#C5A358' },
  credit_card: { icon: 'credit_card', defaultColor: '#4A6FA5' },
  debit_card: { icon: 'credit_card', defaultColor: '#8B5CF6' },
  e_wallet: { icon: 'qr_code_2', defaultColor: '#5FC9A4' },
  investment: { icon: 'trending_up', defaultColor: '#06B6D4' },
  savings: { icon: 'savings', defaultColor: '#C5A358' },
  other: { icon: 'account_balance_wallet', defaultColor: '#6B7280' },
}

interface AccountsData {
  accounts: Account[]
  summary: {
    total_assets: number
    total_liabilities: number
    net_worth: number
    by_type: Record<string, number>
  }
}

export default function AccountsPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const [data, setData] = useState<AccountsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/expense/accounts')
    }
  }, [isInitialized, user, router])

  useEffect(() => {
    if (user) {
      fetchAccounts()
    }
  }, [user])

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts')
      if (res.ok) {
        setData(await res.json())
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

  const getAccountIcon = (account: Account) => {
    return account.icon || ACCOUNT_ICONS[account.type]?.icon || 'account_balance_wallet'
  }

  const getAccountColor = (account: Account) => {
    return account.color || ACCOUNT_ICONS[account.type]?.defaultColor || '#1A1C1E'
  }

  const getAccountSubtitle = (account: Account) => {
    if (account.type === 'cash') return '預設帳戶'
    if (account.type === 'credit_card') return `信用卡 • ${account.name.slice(-4)}`
    if (account.type === 'bank' || account.type === 'savings') return '儲蓄帳戶'
    if (account.type === 'e_wallet') return '行動支付'
    return account.type
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
      <div className="relative min-h-screen w-full flex flex-col max-w-md mx-auto bg-base-bg">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-base-bg/80 backdrop-blur-md pt-14 pb-6 px-6 max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="material-symbols-outlined text-[24px] font-light hover:opacity-70 transition-opacity"
            >
              arrow_back_ios_new
            </button>
            <h1 className="text-[20px] font-bold tracking-tight">錢包帳戶管理</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1 px-6 pt-[120px] pb-32 w-full">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              {/* Account List */}
              <div className="mb-8">
                <p className="text-[13px] text-slate-muted mb-6 px-1">目前的錢包與帳戶資產</p>
                <div className="space-y-4">
                  {data?.accounts.map(account => (
                    <button
                      key={account.id}
                      onClick={() => router.push(`/expense/accounts/${account.id}`)}
                      className="wallet-card glass-panel w-full p-5 flex items-center justify-between bg-white border border-divider shadow-sm rounded-[20px] active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                          style={{ backgroundColor: getAccountColor(account) }}
                        >
                          <span className="material-symbols-outlined text-[24px]">
                            {getAccountIcon(account)}
                          </span>
                        </div>
                        <div className="text-left">
                          <h3 className="text-[15px] font-bold">{account.name}</h3>
                          <p className="text-[12px] text-slate-muted">{getAccountSubtitle(account)}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <p
                          className={`text-[16px] font-bold font-display ${
                            account.current_balance < 0 ? 'text-red-500' : ''
                          }`}
                        >
                          NT$ {formatAmount(Math.abs(account.current_balance))}
                          {account.current_balance < 0 && (
                            <span className="text-red-500"> </span>
                          )}
                        </p>
                        <span className="material-symbols-outlined text-[18px] text-slate-muted/50">
                          chevron_right
                        </span>
                      </div>
                    </button>
                  ))}

                  {/* Empty State */}
                  {(!data?.accounts || data.accounts.length === 0) && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-2xl bg-divider flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-[32px] text-slate-muted">
                          account_balance_wallet
                        </span>
                      </div>
                      <p className="text-slate-muted mb-4">還沒有帳戶</p>
                      <button
                        onClick={() => router.push('/expense/accounts/add')}
                        className="text-accent-gold font-medium"
                      >
                        新增第一個帳戶
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Card */}
              {data?.summary && data.accounts.length > 0 && (
                <div className="p-6 bg-venturo-bone rounded-3xl border border-divider/50 mb-10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[13px] font-medium opacity-60">資產總計</span>
                    <span className="material-symbols-outlined text-[18px] opacity-40">info</span>
                  </div>
                  <h2 className="text-2xl font-bold font-display tracking-tight mb-1">
                    NT$ {formatAmount(data.summary.net_worth)}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex -space-x-2">
                      {data.accounts.slice(0, 4).map((account, i) => (
                        <div
                          key={account.id}
                          className="w-5 h-5 rounded-full border-2 border-venturo-bone"
                          style={{ backgroundColor: getAccountColor(account), zIndex: 4 - i }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-muted">
                      分佈於 {data.accounts.length} 個帳戶
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* Bottom Add Button */}
        <div className="fixed bottom-12 left-0 right-0 px-6 max-w-md mx-auto z-50">
          <button
            onClick={() => router.push('/expense/accounts/add')}
            className="w-full bg-primary text-white h-[58px] rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-[0.97] transition-all"
          >
            <span className="material-symbols-outlined font-light">add_circle</span>
            <span className="text-[15px] font-bold tracking-wide">新增帳戶</span>
          </button>
        </div>

        {/* Home Indicator */}
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/5 rounded-full" />
      </div>
    </div>
  )
}
