# Venturo UI Style Guide

## 色彩系統

### 主色調
| 變數 | 色碼 | 用途 |
|------|------|------|
| `--primary` | `#cfb9a5` | 主要按鈕、強調色 |
| `--primary-dark` | `#b09b88` | hover 狀態 |
| `--primary-light` | `#e8ded4` | 淺色背景 |

### Morandi 色系
| 變數 | 色碼 | 用途 |
|------|------|------|
| `--morandi-blue` | `#a5bccf` | 資訊、時間相關 |
| `--morandi-pink` | `#cfa5a5` | 結束、警示 |
| `--morandi-green` | `#a8bfa6` | 成功、開始 |
| `--morandi-yellow` | `#e0d6a8` | 日期、費用 |

### 文字顏色
| Class | 色碼 | 用途 |
|-------|------|------|
| `text-[#5C5C5C]` | `#5C5C5C` | 主要文字 |
| `text-[#949494]` | `#949494` | 次要文字、描述 |
| `text-gray-400` | - | placeholder |
| `text-gray-800` | - | 標題 |

### 背景顏色
| 用途 | 色碼/Class |
|------|------------|
| 頁面背景 | `bg-[#F0EEE6]` |
| 卡片背景 | `bg-white` 或 `bg-white/80` |
| 輸入框背景 | `bg-[#F7F5F2]` |

---

## 圓角規範

| 元素 | Class | 像素 |
|------|-------|------|
| 按鈕（小） | `rounded-xl` | 12px |
| 按鈕（大） | `rounded-2xl` | 16px |
| 卡片 | `rounded-2xl` | 16px |
| Modal | `rounded-2xl` | 16px |
| 頭像 | `rounded-full` | 50% |
| 輸入框 | `rounded-2xl` | 16px |
| 標籤/Chip | `rounded-full` | 50% |

---

## 陰影規範

| 用途 | Class |
|------|-------|
| 一般卡片 | `shadow-sm` |
| 強調卡片 | `shadow-lg` |
| Modal | `shadow-2xl` |
| 主要按鈕 | `shadow-lg shadow-[#Cfb9a5]/30` |

---

## 間距規範

### Padding
| 元素 | Class |
|------|-------|
| 頁面 | `px-5` 或 `px-6` (手機) |
| 卡片 | `p-5` 或 `p-6` |
| Modal | `p-6` |
| 按鈕 | `py-3 px-4` |

### Gap
| 用途 | Class |
|------|-------|
| 表單欄位間 | `space-y-4` 或 `space-y-6` |
| 按鈕組 | `gap-3` |
| 圖示與文字 | `gap-2` |

---

## 元件規範

### Modal / 彈窗
```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
    <div className="text-center">
      {/* 圖示 */}
      <div className="w-16 h-16 mx-auto mb-4 bg-{color}-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-{color}-500" ... />
      </div>
      {/* 標題 */}
      <h3 className="text-lg font-bold text-[#5C5C5C] mb-2">標題</h3>
      {/* 描述 */}
      <p className="text-sm text-[#949494] mb-6">描述文字</p>
      {/* 按鈕 */}
      <button className="w-full py-3 px-4 bg-gray-100 text-[#5C5C5C] rounded-xl font-medium hover:bg-gray-200 transition">
        按鈕文字
      </button>
    </div>
  </div>
</div>
```

### 主要按鈕
```jsx
<button className="py-3.5 px-6 rounded-2xl bg-[#Cfb9a5] text-white font-bold shadow-lg shadow-[#Cfb9a5]/30 hover:bg-[#b09b88] transition active:scale-95">
  按鈕文字
</button>
```

### 次要按鈕
```jsx
<button className="py-3 px-4 bg-gray-100 text-[#5C5C5C] rounded-xl font-medium hover:bg-gray-200 transition">
  按鈕文字
</button>
```

### 輸入框
```jsx
<input
  className="w-full rounded-2xl border-none bg-[#F7F5F2] py-3.5 px-4 text-sm text-gray-800 placeholder-gray-300 shadow-sm focus:ring-2 focus:ring-[rgba(207,185,165,0.5)]"
  placeholder="placeholder"
/>
```

### Glass 效果卡片
```jsx
<div className="glass-card p-5 rounded-2xl">
  {/* 內容 */}
</div>
```

---

## Z-Index 層級

| 層級 | 值 | 用途 |
|------|-----|------|
| 背景 | `z-0` | 背景裝飾 |
| 內容 | `z-10` | 一般內容 |
| Header | `z-20` | 頂部導航 |
| 浮動按鈕 | `z-40` | FAB |
| Modal | `z-50` | 彈窗 |
| Toast | `z-[100]` | 通知 |
| Badge 動畫 | `z-[200]` | 特殊動畫 |

---

## 圖示規範

使用 **Material Icons Round** (`material-icons-round`)

```jsx
<span className="material-icons-round text-lg">icon_name</span>
```

常用尺寸：
- 小圖示：`text-sm` (14px)
- 一般：`text-lg` (18px)
- 大圖示：`text-2xl` (24px)
- 特大：`text-3xl` (30px)

---

## 現有共用元件

| 元件 | 路徑 | 用途 |
|------|------|------|
| `ConfirmModal` | `@/components/ConfirmModal` | 確認彈窗（雙按鈕） |
| `BadgeNotification` | `@/components/BadgeNotification` | 徽章獲得通知 |
| `MobileNav` | `@/components/MobileNav` | 底部導航 |

---

## 命名規範

### 顏色變數
- 使用 CSS 變數：`var(--primary)`
- 或 Tailwind：`text-[#5C5C5C]`

### Class 命名
- 使用 Tailwind 原生 class
- 自訂 class 在 `globals.css` 定義（如 `glass`, `glass-card`）

---

## 動畫

### 常用 Transition
```jsx
transition        // 預設
transition-all    // 全屬性
transition-colors // 顏色變化
```

### Hover 效果
```jsx
hover:bg-gray-200
hover:scale-105
active:scale-95
```
