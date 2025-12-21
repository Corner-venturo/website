/**
 * Venturo Design System
 * AI 可讀取的設計規範，用於生成符合風格的 UI
 */

export const DESIGN_SYSTEM = {
  // 品牌資訊
  brand: {
    name: "Venturo",
    style: "Morandi 莫蘭迪風格",
    description: "溫潤、優雅、低飽和度的旅遊 APP",
  },

  // 色彩系統
  colors: {
    primary: {
      main: "#cfb9a5",      // 莫蘭迪棕 - 主色
      dark: "#b09b88",      // 深棕
      light: "#e8ded4",     // 淺棕
    },
    morandi: {
      blue: "#a5bccf",      // 莫蘭迪藍
      pink: "#cfa5a5",      // 莫蘭迪粉
      green: "#a8bfa6",     // 莫蘭迪綠
      yellow: "#e0d6a8",    // 莫蘭迪黃
    },
    background: {
      page: "#F0EEE6",      // 頁面背景
      card: "#ffffff",      // 卡片背景
      glass: "rgba(255, 255, 255, 0.6)", // 玻璃效果
    },
    text: {
      primary: "#5C5C5C",   // 主文字
      secondary: "#949494", // 次要文字
      light: "#E8E2DD",     // 淺色文字
    },
    status: {
      success: "#6B8E6B",
      error: "#FF6B6B",
      info: "#5B9BD5",
    },
  },

  // 組件樣式
  components: {
    button: {
      primary: "px-4 py-2 rounded-full bg-[#cfb9a5] text-white hover:bg-[#b09b88] transition-colors shadow-md active:scale-95",
      secondary: "px-4 py-2 rounded-full bg-white/60 text-[#5C5C5C] border border-white/50 hover:bg-white/80 transition-colors",
      icon: "w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm active:scale-95 transition-transform",
      floating: "fixed bottom-24 right-5 w-14 h-14 rounded-full bg-[#cfb9a5] text-white shadow-lg flex items-center justify-center active:scale-95",
    },
    card: {
      standard: "bg-white rounded-2xl p-4 shadow-sm",
      glass: "bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-4",
      interactive: "bg-white rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform",
      gradient: "bg-gradient-to-br from-[#DBCBB9] to-[#cfb9a5] rounded-2xl p-4 shadow-md",
    },
    input: {
      standard: "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#cfb9a5] focus:ring-2 focus:ring-[#cfb9a5]/20 outline-none transition-all text-gray-800",
      glass: "w-full px-4 py-3 bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 text-[#5C5C5C] placeholder-[#949494] focus:ring-2 focus:ring-[#cfb9a5]/50",
    },
    avatar: {
      large: "w-20 h-20 rounded-full border-2 border-[#94A3B8]/30 overflow-hidden shadow-sm bg-[#D6CDC8]",
      medium: "w-12 h-12 rounded-full bg-gradient-to-br from-[#cfb9a5] to-[#B8A090] overflow-hidden",
      small: "w-10 h-10 rounded-full bg-[#D6CDC8] overflow-hidden",
    },
    chip: {
      standard: "px-3 py-1.5 rounded-full text-xs font-medium",
      success: "bg-[#E8F5E9] text-[#6B8E6B] border border-[#C8E6C9]",
      info: "bg-[#E3F2FD] text-[#5B9BD5] border border-[#B3D4FC]",
      warning: "bg-[#FFF3E0] text-[#F57C00] border border-[#FFCC80]",
    },
  },

  // 佈局模式
  layout: {
    page: "min-h-[100dvh] bg-[#F0EEE6] font-sans",
    header: "sticky top-0 z-20 bg-[#F0EEE6]/95 backdrop-blur-sm px-5 py-4",
    content: "px-5 pb-32",
    bottomNav: "fixed bottom-0 left-0 right-0 z-50 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
  },

  // 間距規範
  spacing: {
    xs: "4px",   // gap-1, p-1
    sm: "8px",   // gap-2, p-2
    md: "12px",  // gap-3, p-3
    lg: "16px",  // gap-4, p-4
    xl: "20px",  // gap-5, p-5
    xxl: "24px", // gap-6, p-6
  },

  // 字體規範
  typography: {
    pageTitle: "text-2xl font-bold text-[#5C5C5C]",
    sectionTitle: "text-lg font-bold text-[#5C5C5C]",
    cardTitle: "font-bold text-gray-800",
    body: "text-sm text-[#5C5C5C]",
    caption: "text-xs text-[#949494]",
    label: "text-xs font-bold text-gray-600",
  },

  // 特效
  effects: {
    glass: "bg-white/60 backdrop-blur-xl border border-white/50",
    shadow: {
      soft: "shadow-sm",
      medium: "shadow-md",
      strong: "shadow-lg",
      custom: "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]",
    },
    hover: {
      lift: "hover:-translate-y-1 hover:shadow-lg transition-all",
      scale: "hover:scale-[1.02] transition-transform",
    },
    active: {
      press: "active:scale-95 transition-transform",
      subtle: "active:scale-[0.98] transition-transform",
    },
    gradient: {
      primary: "bg-gradient-to-br from-[#DBCBB9] to-[#cfb9a5]",
      blue: "bg-gradient-to-br from-[#B8C9D4] to-[#a5bccf]",
    },
  },

  // 圖標（使用 Material Icons Round）
  icons: {
    library: "material-icons-round",
    common: {
      back: "arrow_back",
      close: "close",
      add: "add",
      edit: "edit",
      delete: "delete",
      search: "search",
      settings: "settings",
      person: "person",
      group: "group",
      flight: "flight",
      restaurant: "restaurant",
      hotel: "hotel",
      money: "payments",
      check: "check_circle",
      warning: "warning",
    },
  },
};

// AI 生成頁面的 Prompt 模板
export const UI_GENERATION_PROMPT = `
你是 Venturo 旅遊 APP 的 UI 設計師。根據用戶需求生成符合以下風格的 React/Next.js 頁面代碼。

## 設計風格
- Morandi 莫蘭迪風格：溫潤、優雅、低飽和度
- 主色：#cfb9a5（莫蘭迪棕）
- 背景：#F0EEE6
- 玻璃態效果：bg-white/60 backdrop-blur-xl

## 組件規範
- 按鈕：rounded-full, 主色背景, active:scale-95
- 卡片：rounded-2xl, shadow-sm, p-4
- 輸入框：rounded-xl, border border-gray-200
- 圖標：material-icons-round

## 佈局規範
- 頁面：min-h-[100dvh] bg-[#F0EEE6]
- Header：sticky top-0 z-20 backdrop-blur-sm
- 內容區：px-5 pb-32
- 底部導航空間：pb-32

## 代碼要求
- 使用 "use client" 指令
- 使用 Tailwind CSS
- 使用 material-icons-round 圖標
- 圖片使用普通 <img> 標籤（不要用 next/image）
- 使用 Unsplash 的示例圖片 URL
- 回傳完整可用的 React 組件，export default
`;

export default DESIGN_SYSTEM;
