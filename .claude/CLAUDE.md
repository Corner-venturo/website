# Claude Code 工作規範 (Venturo Online)

> **最後更新**: 2025-12-23
> **專案類型**: 客戶端 App (旅客、領隊使用)

---

## 📍 必讀：專案網站地圖

**在探索專案結構前，請先查閱：**

```
/Users/williamchien/Projects/SITEMAP.md
```

此檔案包含：
- 兩個專案的完整頁面路由
- API 路由列表
- Store 結構
- 關鍵檔案位置
- 資料庫連接關係

**避免重複探索整個 codebase，先查 SITEMAP！**

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

## 核心規則

### 禁止事項

| 禁止 | 說明 |
|------|------|
| **禁止 any** | 不使用 `: any`、`as any` |
| **禁止直接寫 ERP** | ERP 資料庫只能讀取，不可寫入 |
| **禁止大型檔案** | 單檔不超過 500 行 |

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

## 關鍵檔案

| 檔案 | 用途 |
|------|------|
| `src/stores/trip-store.ts` | 主要狀態管理 (行程、分帳、費用) |
| `src/stores/profile-store.ts` | 個人資料 (含 5 分鐘快取) |
| `src/lib/supabase.ts` | Online Supabase Client |
| `src/lib/erp-supabase.ts` | ERP Supabase Client (唯讀) |
| `src/services/tour-service.ts` | 團資料服務 |

---

## Store 結構

```
src/stores/
├── auth-store.ts     # 認證狀態
├── profile-store.ts  # 個人資料 (含快取邏輯)
├── trip-store.ts     # 行程/分帳/費用 (主要)
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

## 已知問題

1. **效能問題** - trip-store 的複雜 JOIN 查詢導致讀取慢
2. **前端直寫** - 部分 store 直接操作資料庫，應改走 API
3. **localStorage persist** - Zustand 快取可能造成同步問題
