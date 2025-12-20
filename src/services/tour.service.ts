/**
 * Tour Service - 領隊專用的團資料服務
 */

import { getErpSession } from '@/lib/erp-supabase'

// 類型定義
export interface Tour {
  id: string
  code: string | null
  name: string | null
  status: string | null
  start_date: string | null
  end_date: string | null
  destination: string | null
  locked_quote_id: string | null
  locked_itinerary_id: string | null
  locked_at: string | null
}

export interface QuoteVersion {
  id: string
  code: string | null
  name: string | null
  status: string | null
  total_amount: number | null
  version: number
  created_at: string | null
  updated_at: string | null
}

export interface ItineraryVersion {
  id: string
  code: string | null
  title: string | null
  status: string | null
  version: number
  created_at: string | null
  updated_at: string | null
}

export interface Employee {
  id: string
  employee_number: string
  name: string | null
  roles: string[]
}

export interface MyToursResponse {
  employee: Employee
  activeTours: Tour[]
  pastTours: Tour[]
  total: number
}

export interface FinalItineraryResponse {
  tour: Tour & { is_locked: boolean }
  finalItinerary: unknown
  finalQuote: QuoteVersion | null
}

// 取得 Authorization header
async function getAuthHeader(): Promise<Record<string, string>> {
  const session = await getErpSession()
  if (!session?.access_token) {
    throw new Error('未登入或 session 已過期')
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  }
}

/**
 * 取得領隊的所有團
 */
export async function getMyTours(): Promise<MyToursResponse> {
  const headers = await getAuthHeader()

  const response = await fetch('/api/my-tours', { headers })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || '取得我的團失敗')
  }

  return data.data
}

/**
 * 取得團的報價單版本列表
 */
export async function getQuoteVersions(tourId: string): Promise<QuoteVersion[]> {
  const response = await fetch(`/api/tours/${tourId}/quote-versions`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || '取得報價單版本失敗')
  }

  return data.data
}

/**
 * 取得團的行程版本列表
 */
export async function getItineraryVersions(tourId: string): Promise<ItineraryVersion[]> {
  const response = await fetch(`/api/tours/${tourId}/itinerary-versions`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || '取得行程版本失敗')
  }

  return data.data
}

/**
 * 取得團的最終行程（鎖定版本或最新版本）
 */
export async function getFinalItinerary(tourId: string): Promise<FinalItineraryResponse> {
  const headers = await getAuthHeader()

  const response = await fetch(`/api/my-tours/final-itinerary?tourId=${tourId}`, { headers })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || '取得最終行程失敗')
  }

  return data.data
}

/**
 * 格式化日期
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * 計算團狀態標籤樣式
 */
export function getStatusStyle(status: string | null): {
  bg: string
  text: string
} {
  switch (status) {
    case '提案':
      return { bg: 'bg-gray-100', text: 'text-gray-700' }
    case '確認中':
      return { bg: 'bg-blue-100', text: 'text-blue-700' }
    case '已確認':
      return { bg: 'bg-green-100', text: 'text-green-700' }
    case '修改中':
      return { bg: 'bg-amber-100', text: 'text-amber-700' }
    case '進行中':
      return { bg: 'bg-purple-100', text: 'text-purple-700' }
    case '待結案':
      return { bg: 'bg-orange-100', text: 'text-orange-700' }
    case '結案':
      return { bg: 'bg-slate-100', text: 'text-slate-700' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600' }
  }
}
