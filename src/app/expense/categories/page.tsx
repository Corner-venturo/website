'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  Plus,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import type { ExpenseCategory } from '@/app/api/expense-categories/route'

const ICONS = [
  'restaurant', 'local_cafe', 'fastfood', 'lunch_dining',
  'directions_car', 'directions_transit', 'local_taxi', 'flight',
  'shopping_bag', 'shopping_cart', 'checkroom', 'devices',
  'movie', 'sports_esports', 'fitness_center', 'music_note',
  'home', 'hotel', 'bolt', 'wifi',
  'medical_services', 'medication', 'school', 'menu_book',
  'groups', 'card_giftcard', 'redeem', 'phone',
  'payments', 'account_balance', 'trending_up', 'work',
  'category', 'more_horiz',
]

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#95A5A6', '#2ECC71', '#F39C12',
  '#3498DB', '#E74C3C', '#9B59B6', '#1ABC9C', '#34495E', '#F8B195',
]

export default function CategoriesPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')

  // 新增分類
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'category',
    color: '#6B7280',
    type: 'expense' as 'expense' | 'income',
    parent_id: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/expense/categories')
    }
  }, [isInitialized, user, router])

  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/expense-categories')
      if (res.ok) {
        setCategories(await res.json())
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name) return

    setSaving(true)
    try {
      const res = await fetch('/api/expense-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name,
          icon: newCategory.icon,
          color: newCategory.color,
          type: newCategory.type,
          parent_id: newCategory.parent_id || null,
        }),
      })

      if (res.ok) {
        setShowAddModal(false)
        setNewCategory({
          name: '',
          icon: 'category',
          color: '#6B7280',
          type: 'expense',
          parent_id: '',
        })
        fetchCategories()
      }
    } catch {
      // Handle error
    } finally {
      setSaving(false)
    }
  }

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedIds(newSet)
  }

  const filteredCategories = categories.filter(c =>
    c.type === activeTab || c.type === 'both'
  )

  const parentCategories = filteredCategories.filter(c => !c.parent_id)

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
          <h1 className="text-lg font-bold">分類管理</h1>
          <button
            onClick={() => {
              setNewCategory({ ...newCategory, type: activeTab })
              setShowAddModal(true)
            }}
            className="p-2 -mr-2 text-emerald-600"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Tab 切換 */}
      <div className="bg-white border-b px-4 py-2">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('expense')}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              activeTab === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500'
            }`}
          >
            支出分類
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              activeTab === 'income' ? 'bg-white text-green-500 shadow-sm' : 'text-gray-500'
            }`}
          >
            收入分類
          </button>
        </div>
      </div>

      <main className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {parentCategories.map((category, i) => {
              const hasChildren = category.children && category.children.length > 0
              const isExpanded = expandedIds.has(category.id)

              return (
                <div key={category.id}>
                  <button
                    onClick={() => hasChildren && toggleExpand(category.id)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 ${
                      i < parentCategories.length - 1 && !isExpanded ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <span className="material-icons-round" style={{ color: category.color }}>
                        {category.icon}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-800">{category.name}</p>
                      {category.is_system && (
                        <p className="text-xs text-gray-400">系統預設</p>
                      )}
                    </div>
                    {hasChildren && (
                      <div className="flex items-center gap-1 text-gray-400">
                        <span className="text-xs">{category.children?.length} 個子分類</span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* 子分類 */}
                  {hasChildren && isExpanded && (
                    <div className="bg-gray-50 border-t border-b border-gray-100">
                      {category.children?.map((child, j) => (
                        <div
                          key={child.id}
                          className={`flex items-center gap-3 p-4 pl-8 ${
                            j < (category.children?.length || 0) - 1 ? 'border-b border-gray-100' : ''
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: child.color + '20' }}
                          >
                            <span
                              className="material-icons-round text-sm"
                              style={{ color: child.color }}
                            >
                              {child.icon}
                            </span>
                          </div>
                          <p className="font-medium text-gray-700">{child.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* 新增自訂分類提示 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-2xl">
          <p className="text-sm text-blue-800">
            <span className="font-medium">提示：</span>
            系統預設分類無法刪除或修改。你可以新增自訂分類來滿足個人需求。
          </p>
        </div>
      </main>

      {/* 新增分類 Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">新增分類</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 類型 */}
              <div>
                <label className="text-sm text-gray-500">類型</label>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setNewCategory({ ...newCategory, type: 'expense' })}
                    className={`flex-1 py-2 rounded-lg transition ${
                      newCategory.type === 'expense'
                        ? 'bg-red-100 text-red-600 ring-2 ring-red-500'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    支出
                  </button>
                  <button
                    onClick={() => setNewCategory({ ...newCategory, type: 'income' })}
                    className={`flex-1 py-2 rounded-lg transition ${
                      newCategory.type === 'income'
                        ? 'bg-green-100 text-green-600 ring-2 ring-green-500'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    收入
                  </button>
                </div>
              </div>

              {/* 名稱 */}
              <div>
                <label className="text-sm text-gray-500">分類名稱</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="例如：寵物"
                  className="w-full mt-1 p-3 border rounded-xl"
                />
              </div>

              {/* 父分類 */}
              <div>
                <label className="text-sm text-gray-500">父分類（選填）</label>
                <select
                  value={newCategory.parent_id}
                  onChange={e => setNewCategory({ ...newCategory, parent_id: e.target.value })}
                  className="w-full mt-1 p-3 border rounded-xl bg-white"
                >
                  <option value="">無（作為主分類）</option>
                  {filteredCategories
                    .filter(c => !c.parent_id)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* 圖標 */}
              <div>
                <label className="text-sm text-gray-500">圖標</label>
                <div className="grid grid-cols-8 gap-2 mt-2">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewCategory({ ...newCategory, icon })}
                      className={`p-2 rounded-lg transition ${
                        newCategory.icon === icon
                          ? 'bg-emerald-100 ring-2 ring-emerald-500'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <span
                        className="material-icons-round"
                        style={{ color: newCategory.color }}
                      >
                        {icon}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 顏色 */}
              <div>
                <label className="text-sm text-gray-500">顏色</label>
                <div className="grid grid-cols-9 gap-2 mt-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategory({ ...newCategory, color })}
                      className={`w-8 h-8 rounded-full transition ${
                        newCategory.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* 預覽 */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2">預覽</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: newCategory.color + '20' }}
                  >
                    <span
                      className="material-icons-round"
                      style={{ color: newCategory.color }}
                    >
                      {newCategory.icon}
                    </span>
                  </div>
                  <p className="font-medium text-gray-800">
                    {newCategory.name || '分類名稱'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleAddCategory}
                disabled={!newCategory.name || saving}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold rounded-2xl transition"
              >
                {saving ? '儲存中...' : '新增分類'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
