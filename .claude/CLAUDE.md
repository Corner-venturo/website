# Claude Code 工作規範 (Venturo Online)

> **最後更新**: 2026-01-11 (新增 VENTURO_VISION.md)
> **專案類型**: 客戶端 App (旅客、領隊使用)

---

## 🚨🚨🚨 對話開始必做 (P0) 🚨🚨🚨

### 第一步：理解 Venturo 願景

**首先閱讀 VENTURO_VISION.md：**
```
Read /Users/williamchien/Projects/venturo-online/.claude/VENTURO_VISION.md
```

**核心概念**：
- Venturo 是一個**雙平台生態系統**（ERP + Online）
- **venturo-erp**：旅行社員工內部營運系統（資料來源）
- **venturo-online**：旅客會員體驗系統（你在這裡）
- 兩個系統**共享 Supabase 資料庫**，但 Online **只能讀取 ERP 資料庫**
- 價值飛輪：銷售 → 出發 → 回憶 → 推薦 → 新客戶

### 第二步：閱讀 SITEMAP

**查閱完整系統地圖：**
```
Read /Users/williamchien/Projects/SITEMAP.md
```

此檔案包含：
- 兩個專案的完整頁面路由
- API 路由列表
- Store 結構
- 關鍵檔案位置
- 資料庫連接關係

**避免重複探索整個 codebase，先查 SITEMAP！**

---

## 📍 必讀清單（開發前必看）

### 0. Venturo 願景文件（最重要！）
```
/Users/williamchien/Projects/venturo-online/.claude/VENTURO_VISION.md
```
- 雙平台架構（ERP + Online）
- Online 在價值飛輪中的角色
- 雙資料庫規則（ERP 唯讀、Online 可寫）
- 效能優化策略

### 1. 專案網站地圖
```
/Users/williamchien/Projects/SITEMAP.md
```

---

## 專案資訊

```
專案名稱: Venturo Online (旅客 App)
工作目錄: /Users/williamchien/Projects/venturo-online
開發端口: 3001
技術棧:   Next.js 16 + React 19 + TypeScript + Zustand 5 + Supabase
```

---

## 資料庫架構

此專案連接**兩個** Supabase 資料庫：

| 資料庫 | 用途 | Client 檔案 |
|--------|------|-------------|
| Online (vvtlknlbnbnbavlnzrzs) | 主要資料 | `src/lib/supabase.ts` |
| ERP (pfqvdacxowpgfamuvnsn) | 唯讀同步團資料 | `src/lib/erp-supabase.ts` |

---

## 🚨 效能開發規範 (重要！)

> **背景**: 2025-12 效能優化後，頁面載入從 20+ 秒降至 2-5 秒。
> 以下規範確保新功能不會重蹈覆轍。

### ❌ 絕對禁止

```typescript
// ❌ 1. 禁止在 API route 內直接 createClient
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key)  // 每次請求都建新連線，浪費 200-500ms

// ❌ 2. 禁止 N+1 查詢 (map + await)
const results = await Promise.all(
  items.map(async (item) => {
    return await supabase.from('table').select().eq('id', item.id) // 10 筆 = 10 次查詢
  })
)

// ❌ 3. 禁止 waterfall 查詢
const users = await supabase.from('users').select()
const orders = await supabase.from('orders').select()  // 等 users 完成才開始
const items = await supabase.from('items').select()    // 等 orders 完成才開始
```

### ✅ 正確做法

```typescript
// ✅ 1. 使用單例模式
import { getOnlineSupabase, getErpSupabase } from '@/lib/supabase-server'
const supabase = getOnlineSupabase()  // 重用連線

// ✅ 2. 批量查詢取代 N+1
const itemIds = items.map(i => i.id)
const { data } = await supabase
  .from('table')
  .select()
  .in('id', itemIds)  // 1 次查詢取得所有

// ✅ 3. 平行查詢 Promise.all
const [users, orders, items] = await Promise.all([
  supabase.from('users').select(),
  supabase.from('orders').select(),
  supabase.from('items').select(),
])

// ✅ 4. Store 使用 dedup 防重複請求
import { dedup } from '@/lib/request-dedup'
const data = await dedup(`key:${id}`, async () => {
  return await fetch(`/api/resource/${id}`)
})

// ✅ 5. API 回傳加快取標頭
import { jsonResponse, CACHE_CONFIGS } from '@/lib/api-utils'
return jsonResponse({ data }, { cache: CACHE_CONFIGS.privateShort })
```

### 效能工具檔案

| 檔案 | 用途 |
|------|------|
| `src/lib/supabase-server.ts` | API 用 Supabase 單例 |
| `src/lib/request-dedup.ts` | 請求去重 + SWR 快取 |
| `src/lib/api-utils.ts` | API 回應快取標頭 |

---

## 🚨 前端效能優化規範 (2025-12-24 新增)

### 1. Image Blur Placeholder - 圖片載入優化

```typescript
// ❌ 錯誤：直接使用 Image
<Image src={url} alt="..." width={200} height={150} />

// ✅ 正確：使用 blur placeholder
import { getOptimizedImageProps } from '@/lib/image-utils'

<Image
  src={url}
  alt="..."
  width={200}
  height={150}
  {...getOptimizedImageProps(url)}
/>
```

**效果**：載入時顯示模糊佔位符，改善視覺體驗

### 2. useVirtualList - 大資料虛擬化 (可選)

```typescript
import { useVirtualList } from '@/hooks/useVirtualList'

const { parentRef, virtualItems, totalSize, measureElement } = useVirtualList({
  data: largeData,
  estimateSize: 80,
  overscan: 5,
})

return (
  <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
    <div style={{ height: totalSize, position: 'relative' }}>
      {virtualItems.map((virtualRow) => (
        <div
          key={virtualRow.key}
          ref={measureElement}
          data-index={virtualRow.index}
          style={{
            position: 'absolute',
            top: virtualRow.start,
            width: '100%',
          }}
        >
          {data[virtualRow.index].name}
        </div>
      ))}
    </div>
  </div>
)
```

**使用時機**：列表 >100 筆資料時考慮使用

### 效能組件一覽表

| 組件/工具 | 檔案位置 | 用途 |
|---------|---------|------|
| `useVirtualList` | `src/hooks/useVirtualList.ts` | 虛擬列表 Hook |
| `getOptimizedImageProps` | `src/lib/image-utils.ts` | 圖片 blur placeholder |

---

## 🚨 Next.js 16 RSC 邊界規範 (重要！)

> **背景**: Next.js 16 使用 Turbopack，對 Server/Client Component 邊界檢查更嚴格。

### ❌ 常見錯誤

```typescript
// ❌ 錯誤：在 Server Component 中使用 client hooks
// page.tsx (Server Component)
import { useMyHook } from './hooks'  // 會報錯！

// ❌ 錯誤：barrel export 混合 server/client
// features/index.ts
export * from './components'  // 包含 client components
export * from './hooks'       // 包含 client hooks
// 當 Server Component import 這個 index 時會失敗
```

### ✅ 正確做法

```typescript
// ✅ 1. Client Hooks 檔案必須加 'use client'
// hooks/useMyHook.ts
'use client'
import useSWR from 'swr'
export function useMyHook() { ... }

// ✅ 2. 使用 client hooks 的 index 也要加 'use client'
// features/my-feature/hooks/index.ts
'use client'
export * from './useMyHook'
export * from './useAnotherHook'

// ✅ 3. 頁面使用 client component 包裝
// page.tsx (Server Component)
import { MyClientComponent } from './components/MyClientComponent'
export default function Page() {
  return <MyClientComponent />  // 委託給 client component
}

// ✅ 4. 或直接標記頁面為 client
// page.tsx
'use client'
import { useMyHook } from './hooks'
```

### RSC 邊界檢查清單

- [ ] 使用 `useState`, `useEffect`, SWR 等 hooks 的檔案有 `'use client'`
- [ ] 使用 `onClick`, `onChange` 等事件的組件有 `'use client'`
- [ ] barrel export (`index.ts`) 如果包含 client code，整個檔案加 `'use client'`
- [ ] 避免 Server Component 直接 import client hooks

---

## 🚨 Console.log 規範

> **原則**: 使用統一的 logger 工具，禁止直接使用 console

### ❌ 禁止

```typescript
// ❌ 直接使用 console
console.log('debug:', data)
console.error('錯誤:', error)
```

### ✅ 正確做法

```typescript
// ✅ 使用 logger 工具
import { logger } from '@/lib/logger'

logger.log('重要資訊:', data)
logger.error('錯誤:', error)
```

### Logger 優勢
- 統一格式
- 可控制輸出級別
- 生產環境可關閉
- 便於追蹤問題

---

## 核心規則

### 禁止事項

| 禁止 | 說明 |
|------|------|
| **禁止 any** | 不使用 `: any`、`as any` |
| **禁止直接寫 ERP** | ERP 資料庫只能讀取，不可寫入 |
| **禁止大型檔案** | 單檔不超過 500 行 |
| **禁止 createClient()** | API 內必須用 `getOnlineSupabase()` 單例 |
| **禁止 N+1 查詢** | 用 `.in()` 批量或 `Promise.all` 平行 |

### 資料流向

```
ERP 資料庫 (團、員工資料)
    ↓ 唯讀
  /api/trips/sync-from-erp  → 同步到 Online 資料庫
    ↓
Online 資料庫 (旅客、行程、費用)
    ↓
前端 Stores (trip-store, profile-store, etc.)
```

---

## 新功能開發檢查清單

### 寫 API Route 前

- [ ] 使用 `getOnlineSupabase()` 或 `getErpSupabase()` 單例
- [ ] 多個獨立查詢用 `Promise.all` 平行執行
- [ ] 避免 `.map(async)` 內做資料庫查詢
- [ ] GET 請求考慮加 `CACHE_CONFIGS.privateShort`

### 寫 Store 前

- [ ] fetch 函數使用 `dedup()` 包裝
- [ ] 有快取時背景刷新，無快取才顯示 loading
- [ ] 考慮 localStorage persist 的必要性

### 寫頁面前

- [ ] 多個資料來源用 `Promise.all` 平行載入
- [ ] 避免 useEffect 內連續 await 多個 fetch

---

## 關鍵檔案

| 檔案 | 用途 |
|------|------|
| `src/stores/trip-store.ts` | 主要狀態管理 (行程、分帳、費用) |
| `src/stores/profile-store.ts` | 個人資料 (含 5 分鐘快取) |
| `src/lib/supabase.ts` | 前端 Supabase Client |
| `src/lib/supabase-server.ts` | API 用 Supabase 單例 ⭐️ |
| `src/lib/request-dedup.ts` | 請求去重工具 ⭐️ |
| `src/lib/api-utils.ts` | API 回應工具 ⭐️ |

---

## Store 結構

```
src/stores/
├── auth-store.ts     # 認證狀態
├── profile-store.ts  # 個人資料 (含快取邏輯)
├── trip-store.ts     # 行程/分帳/費用 (主要，含 dedup)
├── friends-store.ts  # 好友系統
└── group-store.ts    # 群組功能
```

---

## 常用指令

```bash
cd /Users/williamchien/Projects/venturo-online
npm run dev          # 啟動開發 (port 3001)
npm run build        # 建置
npm run type-check   # 型別檢查
```

---

## 效能優化歷程 (2025-12-23)

### 已完成的優化

| 優化項目 | 改動 | 效果 |
|---------|------|------|
| Supabase 單例 | 34 個 API 改用單例 | 省 200-500ms/請求 |
| N+1 修復 | split-groups 從 2N+2 → 4 查詢 | 大幅加速 |
| 請求去重 | trip-store 所有 fetch 加 dedup | 防重複請求 |
| 平行查詢 | my-trips, final-itinerary | 減少等待時間 |
| API 快取 | 加入 Cache-Control 標頭 | 瀏覽器快取 |

### 效能數據

| 場景 | 優化前 | 優化後 |
|------|--------|--------|
| 分帳群組列表 | ~12 查詢 | 4 查詢 |
| 整體頁面載入 | 20+ 秒 | 2-5 秒 |
