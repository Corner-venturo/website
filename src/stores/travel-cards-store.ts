import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'

// 快取設定
const CACHE_DURATION = 10 * 60 * 1000 // 10 分鐘

// 類別中文對照
export const CATEGORY_LABELS: Record<string, string> = {
  dietary: '飲食限制',
  allergy: '過敏',
  medical: '醫療',
  accommodation: '住宿需求',
  hotel: '旅館服務',
  transport: '交通',
  shopping: '購物',
  restaurant: '餐廳',
  emergency: '緊急',
  daily: '日常溝通',
  special: '特殊需求',
}

// 類別圖示
export const CATEGORY_ICONS: Record<string, string> = {
  dietary: '🍽️',
  allergy: '⚠️',
  medical: '🏥',
  accommodation: '🏨',
  hotel: '🛎️',
  transport: '🚕',
  shopping: '🛒',
  restaurant: '🍜',
  emergency: '🆘',
  daily: '💬',
  special: '♿',
}

// 類別順序
export const CATEGORY_ORDER = [
  'dietary',
  'allergy',
  'medical',
  'accommodation',
  'hotel',
  'transport',
  'shopping',
  'restaurant',
  'emergency',
  'daily',
  'special',
]

export interface TravelCardTemplate {
  id: string
  category: string
  code: string
  icon: string
  label_zh: string
  translations: {
    ja?: string
    en?: string
    ko?: string
    th?: string
  }
  sort_order: number
}

export interface CustomerTravelCard {
  id: string
  customer_id: string
  template_id: string | null
  icon: string | null
  label_zh: string | null
  translations: Record<string, string>
  is_active: boolean
  sort_order: number
  // 關聯的模板資料（join 時取得）
  template?: TravelCardTemplate
}

interface TravelCardsState {
  // 所有可用模板
  templates: TravelCardTemplate[]
  templatesLoading: boolean
  templatesLastFetchedAt: number | null

  // 用戶已選擇的小卡
  myCards: CustomerTravelCard[]
  myCardsLoading: boolean
  myCardsLastFetchedAt: number | null

  // 當前顯示的語言
  displayLanguage: 'ja' | 'en' | 'ko' | 'th'

  // Actions
  fetchTemplates: (forceRefresh?: boolean) => Promise<void>
  fetchMyCards: (customerId: string, forceRefresh?: boolean) => Promise<void>
  addCard: (customerId: string, templateId: string) => Promise<{ success: boolean; error?: string }>
  removeCard: (cardId: string) => Promise<{ success: boolean; error?: string }>
  reorderCards: (customerId: string, cardIds: string[]) => Promise<{ success: boolean; error?: string }>
  setDisplayLanguage: (lang: 'ja' | 'en' | 'ko' | 'th') => void
  clearCache: () => void
}

export const useTravelCardsStore = create<TravelCardsState>()(
  persist(
    (set, get) => ({
      templates: [],
      templatesLoading: false,
      templatesLastFetchedAt: null,

      myCards: [],
      myCardsLoading: false,
      myCardsLastFetchedAt: null,

      displayLanguage: 'ja',

      fetchTemplates: async (forceRefresh = false) => {
        const state = get()
        const now = Date.now()

        // 檢查快取
        const hasCache = state.templates.length > 0
        const timeSinceLastFetch = state.templatesLastFetchedAt
          ? now - state.templatesLastFetchedAt
          : Infinity

        if (hasCache && !forceRefresh && timeSinceLastFetch < CACHE_DURATION) {
          return
        }

        const showLoading = !hasCache || forceRefresh
        if (showLoading) {
          set({ templatesLoading: true })
        }

        try {
          const supabase = getSupabaseClient()
          const { data, error } = await supabase
            .from('travel_card_templates')
            .select('*')
            .order('sort_order')

          if (error) throw error

          set({
            templates: data || [],
            templatesLoading: false,
            templatesLastFetchedAt: now,
          })
        } catch (error) {
          logger.error('Failed to fetch travel card templates:', error)
          set({ templatesLoading: false })
        }
      },

      fetchMyCards: async (customerId: string, forceRefresh = false) => {
        const state = get()
        const now = Date.now()

        // 檢查快取
        const hasCache = state.myCards.length > 0
        const timeSinceLastFetch = state.myCardsLastFetchedAt
          ? now - state.myCardsLastFetchedAt
          : Infinity

        if (hasCache && !forceRefresh && timeSinceLastFetch < CACHE_DURATION) {
          return
        }

        const showLoading = !hasCache || forceRefresh
        if (showLoading) {
          set({ myCardsLoading: true })
        }

        try {
          const supabase = getSupabaseClient()
          const { data, error } = await supabase
            .from('customer_travel_cards')
            .select(`
              *,
              template:travel_card_templates(*)
            `)
            .eq('customer_id', customerId)
            .eq('is_active', true)
            .order('sort_order')

          if (error) throw error

          set({
            myCards: data || [],
            myCardsLoading: false,
            myCardsLastFetchedAt: now,
          })
        } catch (error) {
          logger.error('Failed to fetch my travel cards:', error)
          set({ myCardsLoading: false })
        }
      },

      addCard: async (customerId: string, templateId: string) => {
        try {
          const supabase = getSupabaseClient()

          // 取得當前最大 sort_order
          const { data: existing } = await supabase
            .from('customer_travel_cards')
            .select('sort_order')
            .eq('customer_id', customerId)
            .order('sort_order', { ascending: false })
            .limit(1)

          const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1

          const { error } = await supabase
            .from('customer_travel_cards')
            .insert({
              customer_id: customerId,
              template_id: templateId,
              is_active: true,
              sort_order: nextOrder,
            })

          if (error) {
            // 可能是重複選擇
            if (error.code === '23505') {
              return { success: false, error: '此小卡已加入' }
            }
            throw error
          }

          // 重新載入
          await get().fetchMyCards(customerId, true)
          return { success: true }
        } catch (error) {
          logger.error('Failed to add travel card:', error)
          return { success: false, error: '新增失敗' }
        }
      },

      removeCard: async (cardId: string) => {
        try {
          const supabase = getSupabaseClient()
          const { error } = await supabase
            .from('customer_travel_cards')
            .delete()
            .eq('id', cardId)

          if (error) throw error

          // 直接從本地移除
          set(state => ({
            myCards: state.myCards.filter(c => c.id !== cardId),
          }))

          return { success: true }
        } catch (error) {
          logger.error('Failed to remove travel card:', error)
          return { success: false, error: '移除失敗' }
        }
      },

      reorderCards: async (customerId: string, cardIds: string[]) => {
        try {
          const supabase = getSupabaseClient()

          // 批量更新 sort_order
          const updates = cardIds.map((id, index) => ({
            id,
            customer_id: customerId,
            sort_order: index,
          }))

          const { error } = await supabase
            .from('customer_travel_cards')
            .upsert(updates, { onConflict: 'id' })

          if (error) throw error

          // 重新排序本地資料
          set(state => ({
            myCards: state.myCards
              .slice()
              .sort((a, b) => cardIds.indexOf(a.id) - cardIds.indexOf(b.id)),
          }))

          return { success: true }
        } catch (error) {
          logger.error('Failed to reorder travel cards:', error)
          return { success: false, error: '排序失敗' }
        }
      },

      setDisplayLanguage: (lang) => {
        set({ displayLanguage: lang })
      },

      clearCache: () => {
        set({
          templatesLastFetchedAt: null,
          myCardsLastFetchedAt: null,
        })
      },
    }),
    {
      name: 'venturo-travel-cards',
      partialize: (state) => ({
        templates: state.templates,
        templatesLastFetchedAt: state.templatesLastFetchedAt,
        myCards: state.myCards,
        myCardsLastFetchedAt: state.myCardsLastFetchedAt,
        displayLanguage: state.displayLanguage,
      }),
    }
  )
)

// Helper: 取得卡片顯示內容
export function getCardDisplay(
  card: CustomerTravelCard,
  language: 'ja' | 'en' | 'ko' | 'th'
): { icon: string; labelZh: string; translation: string } {
  // 如果是使用模板
  if (card.template) {
    return {
      icon: card.template.icon,
      labelZh: card.template.label_zh,
      translation: card.template.translations[language] || card.template.translations.en || '',
    }
  }

  // 自訂卡片
  return {
    icon: card.icon || '📌',
    labelZh: card.label_zh || '',
    translation: card.translations[language] || card.translations.en || '',
  }
}
