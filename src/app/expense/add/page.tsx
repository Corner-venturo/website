'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check, Users, ChevronDown, Wallet } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useTripStore } from '@/stores/trip-store'
import type { Account } from '@/app/api/accounts/route'
import type { ExpenseCategory } from '@/app/api/expense-categories/route'

export default function AddExpensePage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const { splitGroups, fetchMySplitGroups } = useTripStore()

  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')

  // 帳戶和分類資料
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [showAccountPicker, setShowAccountPicker] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)

  // 分帳相關
  const [showSplitOption, setShowSplitOption] = useState(false)
  const [isSplit, setIsSplit] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/expense/add')
    }
  }, [isInitialized, user, router])

  // 載入帳戶和分類
  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  // 載入分帳群組
  useEffect(() => {
    if (user?.id) {
      fetchMySplitGroups(user.id)
    }
  }, [user?.id, fetchMySplitGroups])

  // 檢查是否有分帳群組
  useEffect(() => {
    setShowSplitOption(splitGroups.length > 0)
  }, [splitGroups])

  const fetchData = async () => {
    try {
      const [accountsRes, categoriesRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch(`/api/expense-categories?type=${type}`),
      ])

      if (accountsRes.ok) {
        const data = await accountsRes.json()
        setAccounts(data.accounts || [])
        // 設定預設帳戶
        const defaultAccount = data.accounts?.find((a: Account) => a.is_default)
        if (defaultAccount) {
          setAccountId(defaultAccount.id)
        }
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data)
        // 設定預設分類
        if (data.length > 0 && !categoryId) {
          setCategoryId(data[0].id)
        }
      }
    } catch {
      // Silent fail
    }
  }

  // 當類型改變時重新載入分類
  useEffect(() => {
    if (user) {
      fetch(`/api/expense-categories?type=${type}`)
        .then(res => res.json())
        .then(data => {
          setCategories(data)
          if (data.length > 0) {
            setCategoryId(data[0].id)
          }
        })
    }
  }, [type, user])

  const activeGroups = splitGroups
  const selectedAccount = accounts.find(a => a.id === accountId)
  const selectedCategory = categories.find(c => c.id === categoryId) ||
    categories.flatMap(c => c.children || []).find(c => c.id === categoryId)

  const handleSave = async () => {
    if (!amount || !title) return

    setSaving(true)
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type,
          title,
          category: selectedCategory?.name || 'more_horiz',
          category_id: categoryId || null,
          account_id: accountId || null,
          expense_date: expenseDate,
          description,
          is_split: isSplit,
          split_group_id: isSplit ? selectedGroupId : null,
        }),
      })

      if (res.ok) {
        // 如果選擇分帳，跳轉到分帳記錄頁面
        if (isSplit && selectedGroupId) {
          router.push(`/split/record?groupId=${selectedGroupId}&amount=${amount}&title=${encodeURIComponent(title)}`)
        } else {
          router.push('/expense')
        }
      }
    } catch {
      // Handle error
    } finally {
      setSaving(false)
    }
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
          <h1 className="text-lg font-bold">新增記錄</h1>
          <button
            onClick={handleSave}
            disabled={!amount || !title || saving}
            className="p-2 -mr-2 text-emerald-600 disabled:text-gray-300"
          >
            <Check className="w-6 h-6" />
          </button>
        </div>
      </div>

      <main className="p-4 space-y-4">
        {/* 類型切換 */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setType('expense')}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              type === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500'
            }`}
          >
            支出
          </button>
          <button
            onClick={() => setType('income')}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              type === 'income' ? 'bg-white text-green-500 shadow-sm' : 'text-gray-500'
            }`}
          >
            收入
          </button>
        </div>

        {/* 金額輸入 */}
        <div className="bg-white rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className={`text-3xl font-bold ${type === 'income' ? 'text-green-500' : 'text-gray-800'}`}>
              {type === 'income' ? '+' : '-'}$
            </span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="text-4xl font-bold w-40 text-center bg-transparent outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* 標題 */}
        <div className="bg-white rounded-2xl p-4">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="輸入項目名稱"
            className="w-full text-lg outline-none"
          />
        </div>

        {/* 帳戶選擇 */}
        {accounts.length > 0 && (
          <div className="bg-white rounded-2xl p-4">
            <button
              onClick={() => setShowAccountPicker(!showAccountPicker)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {selectedAccount ? (
                  <>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: selectedAccount.color + '20' }}
                    >
                      <span className="material-icons-round" style={{ color: selectedAccount.color }}>
                        {selectedAccount.icon}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">{selectedAccount.name}</p>
                      <p className="text-xs text-gray-400">
                        餘額 ${selectedAccount.current_balance.toLocaleString()}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-gray-400" />
                    </div>
                    <span className="text-gray-500">選擇帳戶</span>
                  </>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition ${showAccountPicker ? 'rotate-180' : ''}`} />
            </button>

            {showAccountPicker && (
              <div className="mt-3 pt-3 border-t space-y-2">
                <button
                  onClick={() => {
                    setAccountId('')
                    setShowAccountPicker(false)
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition ${
                    !accountId ? 'bg-emerald-50 ring-2 ring-emerald-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">不選</span>
                  </div>
                  <span className="text-sm text-gray-600">不指定帳戶</span>
                </button>
                {accounts.filter(a => a.is_active).map(account => (
                  <button
                    key={account.id}
                    onClick={() => {
                      setAccountId(account.id)
                      setShowAccountPicker(false)
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition ${
                      accountId === account.id ? 'bg-emerald-50 ring-2 ring-emerald-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: account.color + '20' }}
                    >
                      <span className="material-icons-round text-sm" style={{ color: account.color }}>
                        {account.icon}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-800">{account.name}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      ${account.current_balance.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 分類選擇 */}
        <div className="bg-white rounded-2xl p-4">
          <button
            onClick={() => setShowCategoryPicker(!showCategoryPicker)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {selectedCategory ? (
                <>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: selectedCategory.color + '20' }}
                  >
                    <span className="material-icons-round" style={{ color: selectedCategory.color }}>
                      {selectedCategory.icon}
                    </span>
                  </div>
                  <span className="font-medium text-gray-800">{selectedCategory.name}</span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="material-icons-round text-gray-400">category</span>
                  </div>
                  <span className="text-gray-500">選擇分類</span>
                </>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition ${showCategoryPicker ? 'rotate-180' : ''}`} />
          </button>

          {showCategoryPicker && (
            <div className="mt-3 pt-3 border-t space-y-1 max-h-64 overflow-y-auto">
              {categories.map(category => {
                const hasChildren = category.children && category.children.length > 0
                const isExpanded = expandedCategoryId === category.id

                return (
                  <div key={category.id}>
                    <button
                      onClick={() => {
                        if (hasChildren) {
                          setExpandedCategoryId(isExpanded ? null : category.id)
                        } else {
                          setCategoryId(category.id)
                          setShowCategoryPicker(false)
                        }
                      }}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl transition ${
                        categoryId === category.id ? 'bg-emerald-50 ring-2 ring-emerald-500' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        <span className="material-icons-round text-sm" style={{ color: category.color }}>
                          {category.icon}
                        </span>
                      </div>
                      <span className="flex-1 text-left text-sm font-medium text-gray-800">
                        {category.name}
                      </span>
                      {hasChildren && (
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition ${isExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </button>

                    {/* 子分類 */}
                    {hasChildren && isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {category.children?.map(child => (
                          <button
                            key={child.id}
                            onClick={() => {
                              setCategoryId(child.id)
                              setShowCategoryPicker(false)
                            }}
                            className={`w-full flex items-center gap-3 p-2 rounded-xl transition ${
                              categoryId === child.id ? 'bg-emerald-50 ring-2 ring-emerald-500' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: child.color + '20' }}
                            >
                              <span className="material-icons-round text-xs" style={{ color: child.color }}>
                                {child.icon}
                              </span>
                            </div>
                            <span className="text-sm text-gray-700">{child.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 日期 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">日期</h3>
          <input
            type="date"
            value={expenseDate}
            onChange={e => setExpenseDate(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* 分帳選項 - 只有在有活躍群組時顯示 */}
        {showSplitOption && type === 'expense' && (
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-gray-800">這筆要分帳嗎？</h3>
              </div>
              <button
                onClick={() => {
                  setIsSplit(!isSplit)
                  if (!isSplit && activeGroups.length > 0) {
                    setSelectedGroupId(activeGroups[0].id)
                  }
                }}
                className={`w-12 h-6 rounded-full transition ${
                  isSplit ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    isSplit ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {isSplit && (
              <div className="space-y-3 pt-2 border-t">
                <p className="text-sm text-gray-500">選擇分帳群組</p>
                <div className="space-y-2">
                  {activeGroups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroupId(group.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                        selectedGroupId === group.id
                          ? 'bg-blue-50 ring-2 ring-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-800">{group.name}</p>
                        <p className="text-xs text-gray-500">
                          {group.members?.length || 0} 人
                        </p>
                      </div>
                      {selectedGroupId === group.id && (
                        <Check className="w-5 h-5 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 備註 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">備註</h3>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="選填"
            rows={2}
            className="w-full p-2 border rounded-lg resize-none"
          />
        </div>

        {/* 儲存按鈕 */}
        <button
          onClick={handleSave}
          disabled={!amount || !title || saving}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold rounded-2xl shadow-lg transition"
        >
          {saving ? '儲存中...' : isSplit ? '儲存並前往分帳' : '儲存'}
        </button>
      </main>
    </div>
  )
}
