import { create } from 'zustand'
import { getSupabaseClient } from '@/lib/supabase'

// Types
export type TripStatus = 'planning' | 'upcoming' | 'ongoing' | 'completed'
export type ExpenseCategory = 'transport' | 'accommodation' | 'food' | 'ticket' | 'shopping' | 'insurance' | 'other'
export type SettlementStatus = 'pending' | 'completed' | 'cancelled'

export interface Trip {
  id: string
  title: string
  description: string | null
  cover_image: string | null
  start_date: string | null
  end_date: string | null
  status: TripStatus
  created_by: string
  default_currency: string
  created_at: string
  updated_at: string
}

export interface TripMember {
  id: string
  trip_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  nickname: string | null
  joined_at: string
  // 報到狀態
  checked_in: boolean
  checked_in_at: string | null
  checked_in_by: string | null
  // Joined profile data
  profile?: {
    display_name: string | null
    avatar_url: string | null
  }
}

export interface Expense {
  id: string
  trip_id: string
  title: string
  description: string | null
  category: ExpenseCategory
  amount: number
  currency: string
  paid_by: string
  expense_date: string
  receipt_url: string | null
  created_at: string
  updated_at: string
  // Joined data
  payer?: {
    display_name: string | null
    avatar_url: string | null
  }
  splits?: ExpenseSplit[]
}

export interface ExpenseSplit {
  id: string
  expense_id: string
  user_id: string
  amount: number
  is_settled: boolean
  settled_at: string | null
  // Joined profile
  profile?: {
    display_name: string | null
    avatar_url: string | null
  }
}

export interface Settlement {
  id: string
  trip_id: string
  split_group_id: string | null
  from_user: string
  to_user: string
  amount: number
  currency: string
  status: SettlementStatus
  note: string | null
  created_at: string
  completed_at: string | null
}

// 分帳群組
export interface SplitGroup {
  id: string
  name: string
  description: string | null
  cover_image: string | null
  trip_id: string | null
  default_currency: string
  created_by: string
  created_at: string
  updated_at: string
  // Joined data
  trip?: {
    id: string
    title: string
    cover_image: string | null
    start_date: string | null
    end_date: string | null
  }
  members?: SplitGroupMember[]
  // Computed
  totalExpenses?: number
  myBalance?: number
  memberCount?: number
}

export interface SplitGroupMember {
  id: string
  group_id: string
  user_id: string
  nickname: string | null
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  user?: {
    id: string
    display_name: string | null
    avatar_url: string | null
  }
}

export interface SplitGroupDetail extends SplitGroup {
  expenses: Expense[]
  memberBalances: {
    userId: string
    displayName: string | null
    avatarUrl: string | null
    totalPaid: number
    totalOwed: number
    balance: number
  }[]
  debts: {
    from: string
    fromName: string
    to: string
    toName: string
    amount: number
  }[]
}

// 行程項目
export interface TripItineraryItem {
  id: string
  trip_id: string
  day_number: number
  item_date: string
  start_time: string | null
  end_time: string | null
  title: string
  description: string | null
  category: string | null
  location_name: string | null
  location_address: string | null
  location_url: string | null
  estimated_cost: number | null
  currency: string
  paid_by: string | null
  icon: string | null
  image_url: string | null
  color: string | null
  sort_order: number
  inquiry_by: string | null
  created_at: string
  updated_at: string
  // 出席記錄（joined）
  attendance?: TripItemAttendance[]
}

// 出席記錄
export interface TripItemAttendance {
  id: string
  item_id: string
  user_id: string
  status: 'attending' | 'not_attending' | 'pending'
  created_at: string
  updated_at: string
}

// Calculate balance for each member in a trip
export interface MemberBalance {
  user_id: string
  display_name: string | null
  avatar_url: string | null
  total_paid: number      // 總共付出
  total_owed: number      // 應該付的
  balance: number         // 餘額 (正數=別人欠他, 負數=他欠別人)
}

interface TripState {
  trips: Trip[]
  currentTrip: Trip | null
  members: TripMember[]
  expenses: Expense[]
  settlements: Settlement[]
  itineraryItems: TripItineraryItem[]
  isLoading: boolean
  error: string | null

  // Split groups
  splitGroups: SplitGroup[]
  currentSplitGroup: SplitGroupDetail | null

  // Trip actions
  fetchMyTrips: (userId: string) => Promise<void>
  fetchTripById: (tripId: string) => Promise<void>
  createTrip: (userId: string, data: Partial<Trip>) => Promise<{ success: boolean; trip?: Trip; error?: string }>

  // Member actions
  fetchTripMembers: (tripId: string) => Promise<void>
  addTripMember: (tripId: string, userId: string, role?: string) => Promise<{ success: boolean; error?: string }>

  // Expense actions
  fetchTripExpenses: (tripId: string) => Promise<void>
  createExpense: (data: {
    trip_id: string
    title: string
    amount: number
    paid_by: string
    category?: ExpenseCategory
    description?: string
    expense_date?: string
    split_with: string[]  // user IDs to split with
  }) => Promise<{ success: boolean; expense?: Expense; error?: string }>

  // Itinerary actions
  fetchTripItineraryItems: (tripId: string) => Promise<void>
  createItineraryItem: (data: Partial<TripItineraryItem>) => Promise<{ success: boolean; item?: TripItineraryItem; error?: string }>
  updateItineraryItem: (itemId: string, data: Partial<TripItineraryItem>) => Promise<{ success: boolean; error?: string }>
  deleteItineraryItem: (itemId: string) => Promise<{ success: boolean; error?: string }>

  // Balance calculation
  calculateBalances: (tripId: string) => MemberBalance[]

  // Settlement actions
  fetchSettlements: (tripId: string) => Promise<void>
  createSettlement: (data: {
    trip_id: string
    from_user: string
    to_user: string
    amount: number
  }) => Promise<{ success: boolean; error?: string }>

  // Split group actions
  fetchMySplitGroups: (userId: string, tripId?: string) => Promise<void>
  fetchSplitGroupById: (groupId: string, userId?: string) => Promise<void>
  createSplitGroup: (data: {
    name: string
    description?: string
    tripId?: string
    createdBy: string
    members?: string[]
  }) => Promise<{ success: boolean; group?: SplitGroup; error?: string }>
  inviteToSplitGroup: (groupId: string, userIds: string[]) => Promise<{ success: boolean; error?: string }>
  removeFromSplitGroup: (groupId: string, userId: string) => Promise<{ success: boolean; error?: string }>

  clearTrip: () => void
  clearSplitGroup: () => void
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  currentTrip: null,
  members: [],
  expenses: [],
  settlements: [],
  itineraryItems: [],
  isLoading: false,
  error: null,

  // Split groups
  splitGroups: [],
  currentSplitGroup: null,

  fetchMyTrips: async (userId: string) => {
    set({ isLoading: true, error: null })

    try {
      // 使用 API 取得行程（繞過 RLS）
      const response = await fetch(`/api/my-trips?userId=${userId}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || '載入旅程失敗')
      }

      set({ trips: data.data || [], isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '載入旅程失敗'
      set({ isLoading: false, error: message })
    }
  },

  fetchTripById: async (tripId: string) => {
    set({ isLoading: true, error: null })

    try {
      // 使用 API 取得行程（繞過 RLS）
      const response = await fetch(`/api/my-trips?tripId=${tripId}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || '載入旅程失敗')
      }

      set({ currentTrip: data.data, isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '載入旅程失敗'
      set({ isLoading: false, error: message })
    }
  },

  createTrip: async (userId: string, data: Partial<Trip>) => {
    const supabase = getSupabaseClient()
    set({ isLoading: true, error: null })

    try {
      const { data: trip, error } = await supabase
        .from('trips')
        .insert({
          ...data,
          created_by: userId,
        })
        .select()
        .single()

      if (error) throw error

      // Add creator as owner member
      await supabase
        .from('trip_members')
        .insert({
          trip_id: trip.id,
          user_id: userId,
          role: 'owner',
        })

      set((state) => ({
        trips: [trip, ...state.trips],
        isLoading: false,
      }))

      return { success: true, trip }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '建立旅程失敗'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  fetchTripMembers: async (tripId: string) => {
    try {
      // 使用 API 取得成員（繞過 RLS）
      const response = await fetch(`/api/trips/${tripId}/members`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || '載入成員失敗')
      }

      set({ members: data.data || [] })
    } catch (error: unknown) {
      console.error('Failed to fetch trip members:', error)
    }
  },

  addTripMember: async (tripId: string, userId: string, role = 'member') => {
    const supabase = getSupabaseClient()

    try {
      const { error } = await supabase
        .from('trip_members')
        .insert({
          trip_id: tripId,
          user_id: userId,
          role,
        })

      if (error) throw error

      // Refresh members
      await get().fetchTripMembers(tripId)

      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '新增成員失敗'
      return { success: false, error: message }
    }
  },

  fetchTripExpenses: async (tripId: string) => {
    const supabase = getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          payer:profiles!paid_by(display_name, avatar_url),
          splits:expense_splits(
            *,
            profile:profiles(display_name, avatar_url)
          )
        `)
        .eq('trip_id', tripId)
        .order('expense_date', { ascending: false })

      if (error) throw error

      set({ expenses: data || [] })
    } catch (error: unknown) {
      console.error('Failed to fetch expenses:', error)
    }
  },

  createExpense: async (data) => {
    const supabase = getSupabaseClient()

    try {
      // Create expense
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          trip_id: data.trip_id,
          title: data.title,
          amount: data.amount,
          paid_by: data.paid_by,
          category: data.category || 'other',
          description: data.description,
          expense_date: data.expense_date || new Date().toISOString().split('T')[0],
        })
        .select()
        .single()

      if (expenseError) throw expenseError

      // Create splits
      const splitAmount = data.amount / data.split_with.length
      const splits = data.split_with.map(userId => ({
        expense_id: expense.id,
        user_id: userId,
        amount: splitAmount,
      }))

      const { error: splitError } = await supabase
        .from('expense_splits')
        .insert(splits)

      if (splitError) throw splitError

      // Refresh expenses
      await get().fetchTripExpenses(data.trip_id)

      return { success: true, expense }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '新增費用失敗'
      return { success: false, error: message }
    }
  },

  fetchTripItineraryItems: async (tripId: string) => {
    try {
      // 使用 API 取得行程項目（繞過 RLS）
      const response = await fetch(`/api/trips/${tripId}/itinerary`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || '載入行程項目失敗')
      }

      set({ itineraryItems: data.data || [] })
    } catch (error: unknown) {
      console.error('Failed to fetch itinerary items:', error)
    }
  },

  createItineraryItem: async (data: Partial<TripItineraryItem>) => {
    const supabase = getSupabaseClient()

    try {
      const { data: item, error } = await supabase
        .from('trip_itinerary_items')
        .insert(data)
        .select()
        .single()

      if (error) throw error

      // Refresh items
      if (data.trip_id) {
        await get().fetchTripItineraryItems(data.trip_id)
      }

      return { success: true, item }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '新增行程項目失敗'
      return { success: false, error: message }
    }
  },

  updateItineraryItem: async (itemId: string, data: Partial<TripItineraryItem>) => {
    const supabase = getSupabaseClient()

    try {
      const { error } = await supabase
        .from('trip_itinerary_items')
        .update(data)
        .eq('id', itemId)

      if (error) throw error

      // Refresh items if we have trip_id
      const { itineraryItems } = get()
      const item = itineraryItems.find(i => i.id === itemId)
      if (item) {
        await get().fetchTripItineraryItems(item.trip_id)
      }

      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '更新行程項目失敗'
      return { success: false, error: message }
    }
  },

  deleteItineraryItem: async (itemId: string) => {
    const supabase = getSupabaseClient()

    try {
      // Get trip_id before deleting
      const { itineraryItems } = get()
      const item = itineraryItems.find(i => i.id === itemId)
      const tripId = item?.trip_id

      const { error } = await supabase
        .from('trip_itinerary_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      // Refresh items
      if (tripId) {
        await get().fetchTripItineraryItems(tripId)
      }

      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '刪除行程項目失敗'
      return { success: false, error: message }
    }
  },

  calculateBalances: (tripId: string) => {
    const { members, expenses } = get()

    // Filter expenses for this trip
    const tripExpenses = expenses.filter(e => e.trip_id === tripId)

    // Initialize balances
    const balanceMap: Record<string, MemberBalance> = {}
    members.forEach(m => {
      balanceMap[m.user_id] = {
        user_id: m.user_id,
        display_name: m.profile?.display_name || m.nickname,
        avatar_url: m.profile?.avatar_url || null,
        total_paid: 0,
        total_owed: 0,
        balance: 0,
      }
    })

    // Calculate totals
    tripExpenses.forEach(expense => {
      // Add to payer's paid total
      if (balanceMap[expense.paid_by]) {
        balanceMap[expense.paid_by].total_paid += expense.amount
      }

      // Add to each splitter's owed total
      expense.splits?.forEach(split => {
        if (balanceMap[split.user_id]) {
          balanceMap[split.user_id].total_owed += split.amount
        }
      })
    })

    // Calculate balance (paid - owed)
    Object.values(balanceMap).forEach(member => {
      member.balance = member.total_paid - member.total_owed
    })

    return Object.values(balanceMap)
  },

  fetchSettlements: async (tripId: string) => {
    const supabase = getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('settlements')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ settlements: data || [] })
    } catch (error: unknown) {
      console.error('Failed to fetch settlements:', error)
    }
  },

  createSettlement: async (data) => {
    const supabase = getSupabaseClient()

    try {
      const { error } = await supabase
        .from('settlements')
        .insert({
          trip_id: data.trip_id,
          from_user: data.from_user,
          to_user: data.to_user,
          amount: data.amount,
        })

      if (error) throw error

      // Refresh settlements
      await get().fetchSettlements(data.trip_id)

      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '建立結算失敗'
      return { success: false, error: message }
    }
  },

  clearTrip: () => set({
    currentTrip: null,
    members: [],
    expenses: [],
    settlements: [],
    itineraryItems: [],
    error: null,
  }),

  // Split group actions
  fetchMySplitGroups: async (userId: string, tripId?: string) => {
    set({ isLoading: true, error: null })

    try {
      let url = `/api/split-groups?userId=${userId}`
      if (tripId) {
        url += `&tripId=${tripId}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || '載入分帳群組失敗')
      }

      set({ splitGroups: data.data || [], isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '載入分帳群組失敗'
      set({ isLoading: false, error: message })
    }
  },

  fetchSplitGroupById: async (groupId: string, userId?: string) => {
    set({ isLoading: true, error: null })

    try {
      let url = `/api/split-groups/${groupId}`
      if (userId) {
        url += `?userId=${userId}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || '載入分帳群組失敗')
      }

      set({ currentSplitGroup: data.data, isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '載入分帳群組失敗'
      set({ isLoading: false, error: message })
    }
  },

  createSplitGroup: async (data) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch('/api/split-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          tripId: data.tripId,
          createdBy: data.createdBy,
          members: data.members,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || '建立分帳群組失敗')
      }

      // Refresh split groups
      await get().fetchMySplitGroups(data.createdBy)

      set({ isLoading: false })
      return { success: true, group: result.data }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '建立分帳群組失敗'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  inviteToSplitGroup: async (groupId: string, userIds: string[]) => {
    try {
      const response = await fetch(`/api/split-groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || '邀請成員失敗')
      }

      // Refresh current group
      const { currentSplitGroup } = get()
      if (currentSplitGroup) {
        await get().fetchSplitGroupById(groupId)
      }

      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '邀請成員失敗'
      return { success: false, error: message }
    }
  },

  removeFromSplitGroup: async (groupId: string, userId: string) => {
    try {
      const response = await fetch(`/api/split-groups/${groupId}/members?userId=${userId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || '移除成員失敗')
      }

      // Refresh current group
      const { currentSplitGroup } = get()
      if (currentSplitGroup) {
        await get().fetchSplitGroupById(groupId)
      }

      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '移除成員失敗'
      return { success: false, error: message }
    }
  },

  clearSplitGroup: () => set({
    currentSplitGroup: null,
  }),
}))
