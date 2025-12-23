# Venturo Online 效能審計報告

> **審計日期**: 2025-12-23
> **問題嚴重度**: 嚴重 - 頁面載入超過 20 秒

---

## 執行摘要

網站效能極差的根本原因不是資料庫，而是**程式架構問題**。主要有 5 大問題：

| 問題 | 嚴重度 | 影響 |
|------|--------|------|
| API 每次建立新 Supabase 連線 | 🔴 嚴重 | +3-5 秒/請求 |
| 頁面串聯載入（瀑布式） | 🔴 嚴重 | 總時間 = 所有請求相加 |
| 無 API 快取 | 🟠 高 | 重複請求相同資料 |
| Store 沒有 deduplication | 🟠 高 | 同時發出多個相同請求 |
| localStorage persist 同步問題 | 🟡 中 | 資料不一致 |

---

## 問題 1: API 每次建立新 Supabase 連線 🔴

### 現狀

**34 個 API routes 全部有這個問題**：

```typescript
// ❌ 每個 API 都這樣寫
const getSupabase = () => {
  return createClient(supabaseUrl, supabaseKey)  // 每次都新建連線！
}

export async function GET() {
  const supabase = getSupabase()  // 新連線
  // ...
}

export async function POST() {
  const supabase = getSupabase()  // 又一個新連線
  // ...
}
```

### 影響

- 每次 API 請求都要建立新的 TCP 連線
- TLS 握手 + 認證 = 額外 **200-500ms**
- 頁面若呼叫 5 個 API = 額外 **1-2.5 秒**

### 修復方案

建立 `/src/lib/supabase-server.ts`：

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let serverClient: SupabaseClient | null = null

export function getServerSupabase() {
  if (!serverClient) {
    serverClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false }
      }
    )
  }
  return serverClient
}
```

然後所有 API 改用：

```typescript
import { getServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  const supabase = getServerSupabase()  // 重用連線
  // ...
}
```

---

## 問題 2: 頁面串聯載入（瀑布式） 🔴

### 現狀

以 `/split/[groupId]` 頁面為例：

```typescript
// page.tsx
useEffect(() => {
  if (!isInitialized) {
    initialize()  // 步驟 1: 等待 auth
  }
}, [])

useEffect(() => {
  if (user?.id && groupId) {
    fetchSplitGroupById(groupId, user.id)  // 步驟 2: 等 auth 完才能執行
  }
}, [user?.id, groupId])

useEffect(() => {
  if (user?.id && groupId) {
    fetchSettlements(groupId)  // 步驟 3: 又要等
  }
}, [user?.id, groupId])
```

**結果**：
```
initialize() → 2秒
  ↓ 等待
fetchSplitGroupById() → 3秒
  ↓ 等待
fetchSettlements() → 2秒
  ↓
總共 = 7秒（理想情況）
```

### 修復方案

```typescript
// 方案 A: 合併 API
// 把 settlements 放進 split-groups API 一起返回

// 方案 B: 平行載入
useEffect(() => {
  if (user?.id && groupId) {
    // 同時發出，不等待
    Promise.all([
      fetchSplitGroupById(groupId, user.id),
      fetchSettlements(groupId)
    ])
  }
}, [user?.id, groupId])
```

---

## 問題 3: API 內部串聯查詢 🟠

### 現狀

`/api/split-groups/[groupId]/route.ts`：

```typescript
export async function GET() {
  // 查詢 1: 群組 + 成員
  const { data: group } = await supabase
    .from('split_groups')
    .select(`*, trip:trips(...), members:split_group_members(...)`)
    .eq('id', groupId)
    .single()

  // 查詢 2: 費用（等查詢 1 完成才開始）
  const { data: expenses } = await supabase
    .from('expenses')
    .select(`*, paid_by_profile:profiles(...), expense_splits(...)`)
    .eq('split_group_id', groupId)

  // JS 計算...
}
```

### 修復方案

```typescript
export async function GET() {
  // 平行查詢
  const [groupResult, expensesResult] = await Promise.all([
    supabase.from('split_groups').select(...).eq('id', groupId).single(),
    supabase.from('expenses').select(...).eq('split_group_id', groupId)
  ])

  // ...
}
```

---

## 問題 4: Store 沒有 Request Deduplication 🟠

### 現狀

```typescript
// friends-store.ts 的 fetchFriends
fetchFriends: async (userId: string) => {
  set({ isLoading: true })  // 沒有檢查是否已在載入中

  // 發出 4 個查詢...
}
```

如果元件重新渲染，可能會發出**多個相同請求**。

### 修復方案

```typescript
let fetchPromise: Promise<void> | null = null

fetchFriends: async (userId: string) => {
  // 如果已經在載入，返回現有 promise
  if (fetchPromise) return fetchPromise

  set({ isLoading: true })

  fetchPromise = (async () => {
    try {
      // ... 查詢邏輯
    } finally {
      fetchPromise = null
    }
  })()

  return fetchPromise
}
```

---

## 問題 5: friends-store 發出 4 個串聯查詢 🟠

### 現狀

```typescript
fetchFriends: async (userId: string) => {
  // 查詢 1: accepted friends
  const { data: acceptedData } = await supabase.from('friends')...

  // 查詢 2: received pending（等查詢 1）
  const { data: receivedData } = await supabase.from('friends')...

  // 查詢 3: sent pending（等查詢 2）
  const { data: sentData } = await supabase.from('friends')...

  // 查詢 4: profiles（等查詢 3）
  const { data: profiles } = await supabase.from('profiles')...
}
```

### 修復方案

```typescript
fetchFriends: async (userId: string) => {
  // 前 3 個查詢可以平行
  const [acceptedResult, receivedResult, sentResult] = await Promise.all([
    supabase.from('friends').select(...).or(...).eq('status', 'accepted'),
    supabase.from('friends').select(...).eq('friend_id', userId).eq('status', 'pending'),
    supabase.from('friends').select(...).eq('user_id', userId).eq('status', 'pending')
  ])

  // 收集 IDs 後查 profiles
  const userIds = new Set([...])
  const { data: profiles } = await supabase.from('profiles').select(...).in('id', [...userIds])
}
```

---

## 問題 6: 複雜 RLS Policy 🟡

### 現狀

雖然 API 用 service role（繞過 RLS），但前端直接查詢時會受影響：

```sql
-- expenses 的 RLS
CREATE POLICY "Users can view expenses" ON expenses FOR SELECT
USING (
  EXISTS (SELECT 1 FROM trip_members WHERE ...) OR
  EXISTS (SELECT 1 FROM split_group_members WHERE ...)
);
```

每一行都要執行 2 個子查詢。

### 建議

目前 API 已用 service role 繞過，暫時不是瓶頸。但若未來改用 anon key，需要優化 RLS。

---

## 修復優先順序

### Phase 1: 立即修復（預估改善 70%）

1. **建立 `supabase-server.ts` 單例** - 1 小時
2. **所有 34 個 API 改用單例** - 2 小時
3. **API 內部改用 `Promise.all`** - 2 小時

### Phase 2: 中期優化（預估再改善 20%）

4. **頁面層級平行載入** - 3 小時
5. **Store 加入 deduplication** - 2 小時
6. **合併相關 API** - 4 小時

### Phase 3: 長期優化

7. **加入 API 快取層（SWR/React Query）**
8. **Server Components 預載資料**
9. **Edge Functions 優化冷啟動**

---

## 預期效果

| 階段 | 目前 | 預期 |
|------|------|------|
| 修復前 | 20+ 秒 | - |
| Phase 1 完成 | - | 5-7 秒 |
| Phase 2 完成 | - | 2-3 秒 |
| Phase 3 完成 | - | < 1 秒 |

---

## 需要修改的檔案清單

### API Routes（34 個）

```
src/app/api/
├── auth/leader-login/route.ts
├── expenses/route.ts
├── expenses/[id]/route.ts
├── generated-ui/route.ts
├── generated-ui/[id]/route.ts
├── invitations/friends/route.ts
├── invitations/friends/[id]/route.ts
├── invitations/split-groups/route.ts
├── invitations/split-groups/[id]/route.ts
├── invitations/trips/route.ts
├── invitations/trips/[id]/route.ts
├── invitations/trips/code/[code]/route.ts
├── my-tours/route.ts
├── my-tours/final-itinerary/route.ts
├── my-trips/route.ts
├── settlements/route.ts
├── split-groups/route.ts
├── split-groups/[groupId]/route.ts
├── split-groups/[groupId]/members/route.ts
├── split-groups/[groupId]/virtual-members/route.ts
├── sync-my-orders/route.ts
├── tours/[id]/itinerary-versions/route.ts
├── tours/[id]/quote-versions/route.ts
├── trips/[tripId]/accommodations/route.ts
├── trips/[tripId]/briefings/route.ts
├── trips/[tripId]/check-in/route.ts
├── trips/[tripId]/itinerary/route.ts
├── trips/[tripId]/members/route.ts
├── trips/migrate-itinerary/route.ts
├── trips/seed-itinerary/route.ts
├── trips/sync-from-erp/route.ts
├── verify-traveler/route.ts
└── ... 其他
```

### Stores（5 個）

```
src/stores/
├── trip-store.ts      # 最大，需要重構
├── friends-store.ts   # 4 個串聯查詢
├── group-store.ts     # 2 個串聯查詢
├── profile-store.ts   # OK，已有快取
└── auth-store.ts      # OK
```

### Pages（需要平行載入）

```
src/app/
├── split/page.tsx
├── split/[groupId]/page.tsx
├── explore/page.tsx
├── my/friends/page.tsx
└── ... 其他
```

---

## 結論

網站慢不是因為 Supabase 慢，而是程式碼架構問題。修復 Phase 1 後應該能從 20 秒降到 5 秒以內。
