"use client";

import { useState } from "react";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import DesktopHeader from "@/components/DesktopHeader";

type FilterType = "all" | "upcoming" | "pending" | "planning";

const orders = [
  {
    id: "kyoto-autumn",
    month: "Nov",
    day: "15",
    chipText: "3 天後出發",
    chipColor: "bg-[#94A3B8]",
    title: "京都秋日賞楓五日遊",
    dateRange: "11/15 - 11/20, 2023",
    travelers: "2 成人, 1 兒童",
    progress: 85,
    filter: "upcoming" as FilterType,
    statusTags: [
      { label: "機票已開", tone: "green", href: "/flight" },
      { label: "住宿確認", tone: "green", href: "/stay" },
      { label: "行前說明會", tone: "yellow" },
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAeCbTrGygE4_uzH0tj_DTbI3KKdnoQ-66HvcsNlfYVxQPtIEx94CzY2pXOnEqdq6FuX7wN-DhOHQPde4bxA4F3BCP7FN5iIfmUJNn7PT9aQFYAf9SvhzNGXL8ziV6L53mb9MeTbWDT1WJg4zcMfSvp1Mv21IiatJBbRZrilIDpDHA1o8leWHUifwEN2S4aN9duWIv9AzqngFYHlaRSfm83EjpSie_ZKPMSnOQBzWGJl5eeYSL-ryZMDgEmgNzTolv5VpqE1PnA4Ydl",
  },
  {
    id: "tokyo-disney",
    month: "Dec",
    day: "24",
    chipText: "等待付款",
    chipColor: "bg-[#C5B6AF]",
    title: "東京迪士尼夢幻之旅",
    dateRange: "12/24 - 12/28, 2023",
    travelers: "剩餘 23 小時付款",
    total: "$45,200",
    actionLabel: "前往付款",
    filter: "pending" as FilterType,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCG3AJ90z0fRZUHbKu5cYlgYt0LZAkNc3uQYelVS-hJk9_kNA7CNAkyo4hBOCE25UqvUGwiMmQR2JEL8CE070Jx7fcBeNrNLbLY6AFWGqkW66DFMZQr3fpDGCa7oTu1wRwgqbdl812uGJyDjnUf7_BDfbts_gT17M79ShHbBgfODyTFMzxfn33oBnZLoKzkKCN5WiNwVJISRRQKf_MH6rzMsfQ2Wc8hcCu8tuHIRxOUXmUdukUK9SXVV4WsT1YiL5SgpqQJ0N9qk6za",
  },
  {
    id: "hokkaido-ski",
    month: "Jan",
    day: "2024",
    chipText: "規劃中",
    chipColor: "bg-[#A8BCA1]",
    title: "北海道滑雪初體驗",
    dateRange: "2024年 1月 (暫定)",
    travelers: "已儲存草稿",
    filter: "planning" as FilterType,
  },
];

// 訂單卡片組件
function OrderCard({ order }: { order: (typeof orders)[0] }) {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-4 sm:p-5 relative group overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className={`absolute top-0 right-0 px-3 py-1 ${order.chipColor}/20 rounded-bl-xl`}>
        <span className={`text-[10px] font-bold`} style={{ color: order.chipColor === "bg-[#94A3B8]" ? "#94A3B8" : order.chipColor === "bg-[#C5B6AF]" ? "#C5B6AF" : "#A8BCA1" }}>
          {order.chipText}
        </span>
      </div>

      <div className="flex gap-3 sm:gap-4 mb-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shadow-sm shrink-0 bg-[#E8E2DD] flex items-center justify-center">
          {order.image ? (
            <img src={order.image} alt={order.title} className="w-full h-full object-cover" />
          ) : (
            <span className="material-icons-round text-[#C5B6AF] text-2xl sm:text-3xl">map</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[#5C5C5C] text-base sm:text-lg mb-1 truncate">{order.title}</h3>
          <div className="flex items-center gap-1 text-[#949494] text-xs mb-1">
            <span className="material-icons-round text-sm">calendar_today</span>
            <span className="truncate">{order.dateRange}</span>
          </div>
          <div className="flex items-center gap-1 text-[#949494] text-xs">
            <span className="material-icons-round text-sm">{order.id === "tokyo-disney" ? "timer" : "group"}</span>
            <span className={`truncate ${order.id === "tokyo-disney" ? "text-[#C5B6AF] font-medium" : ""}`}>{order.travelers}</span>
          </div>
        </div>
      </div>

      {order.id === "kyoto-autumn" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-[#5C5C5C]">行程準備進度</span>
            <span className="font-bold text-[#94A3B8]">{order.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#E8E2DD] rounded-full overflow-hidden">
            <div className="h-full bg-[#94A3B8] rounded-full" style={{ width: `${order.progress}%` }} />
          </div>
          <div className="flex gap-2 pt-2 overflow-x-auto hide-scrollbar">
            {order.statusTags?.map((tag) => {
              const tagContent = (
                <>
                  <span className="material-icons-round text-[10px]">
                    {tag.tone === "green" ? "check_circle" : "pending"}
                  </span>
                  {tag.label}
                </>
              );
              const tagClassName = `px-2 py-1 rounded text-[10px] border flex items-center gap-1 whitespace-nowrap ${
                tag.tone === "green"
                  ? "bg-[#E8F5E9]/50 text-[#6B8E6B] border-[#C8E6C9]"
                  : "bg-[#FFF8E1]/50 text-[#B8A065] border-[#FFE082]/40"
              } ${tag.href ? "hover:opacity-80 transition-opacity cursor-pointer" : ""}`;

              return tag.href ? (
                <Link key={tag.label} href={tag.href} className={tagClassName}>
                  {tagContent}
                </Link>
              ) : (
                <span key={tag.label} className={tagClassName}>
                  {tagContent}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {order.id === "tokyo-disney" && (
        <div className="flex justify-between items-center border-t border-[#E8E2DD] pt-3 mt-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#949494]">總金額</span>
            <span className="font-bold text-[#5C5C5C]">{order.total}</span>
          </div>
          <button className="px-4 py-2 bg-[#C5B6AF] text-white text-xs font-bold rounded-full shadow-md shadow-[#C5B6AF]/30 hover:bg-[#B5A69F] transition-colors">
            {order.actionLabel}
          </button>
        </div>
      )}

      {order.id === "hokkaido-ski" && (
        <div className="flex items-center gap-2 mt-2">
          <button className="flex-1 py-2 rounded-lg border border-[#94A3B8]/30 text-[#94A3B8] text-xs font-medium hover:bg-[#94A3B8]/5 transition-colors">
            編輯行程
          </button>
          <button className="flex-1 py-2 rounded-lg bg-[#94A3B8]/10 text-[#94A3B8] text-xs font-medium hover:bg-[#94A3B8]/20 transition-colors">
            繼續預訂
          </button>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredOrders = activeFilter === "all"
    ? orders
    : orders.filter(order => order.filter === activeFilter);

  return (
    <div className="bg-[#F5F4F0] font-sans antialiased text-[#5C5C5C] min-h-screen flex flex-col">
      {/* 背景光暈 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute top-[40%] left-[20%] w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[#E6DFDA] opacity-30 blur-[70px] rounded-full" />
      </div>

      {/* ========== Header 區域（響應式） ========== */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
        <div className="flex items-center justify-between py-3 sm:py-4 px-4 sm:px-6 lg:px-8 bg-white/60 backdrop-blur-2xl rounded-xl sm:rounded-2xl border border-white/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)]">
          {/* Logo + Nav */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#D6CDC8] text-white font-bold text-sm sm:text-base flex items-center justify-center">
                V
              </div>
              <span className="hidden sm:block text-lg sm:text-xl font-bold text-[#5C5C5C]">VENTURO</span>
            </Link>
            {/* 桌面導航 */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 ml-6 lg:ml-12">
              <Link href="/" className="text-[#949494] hover:text-[#5C5C5C] transition text-sm lg:text-base">首頁</Link>
              <Link href="/explore" className="text-[#949494] hover:text-[#5C5C5C] transition text-sm lg:text-base">探索</Link>
              <Link href="/orders" className="text-[#94A3B8] font-medium border-b-2 border-[#94A3B8] pb-1 text-sm lg:text-base">訂單</Link>
              <Link href="/wishlist" className="text-[#949494] hover:text-[#5C5C5C] transition text-sm lg:text-base">收藏</Link>
            </nav>
          </div>
          {/* 右側 */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-white/60 border border-white/40 text-[#5C5C5C]">
              <span className="material-icons-round text-xl">search</span>
            </button>
            <Link href="/my" className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white/60 rounded-full border border-white/40 hover:bg-white/80 transition">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D6CDC8] text-white font-bold text-xs sm:text-sm flex items-center justify-center">
                A
              </div>
              <span className="hidden sm:block text-sm font-medium text-[#5C5C5C]">我的</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ========== 主要內容區域（左側資訊 + 右側內容） ========== */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 min-h-[calc(100vh-140px)]">

          {/* ========== 左側資訊欄（響應式） ========== */}
          <aside className="w-full lg:w-64 xl:w-80 shrink-0">
            {/* 手機/平板：水平滾動篩選 */}
            <div className="lg:hidden mb-4">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                    activeFilter === "all"
                      ? "bg-[#94A3B8] text-white shadow-md shadow-[#94A3B8]/30"
                      : "bg-white/60 border border-white/40 text-[#5C5C5C] font-medium"
                  }`}
                >
                  <span className="material-icons-round text-sm">list</span>
                  全部訂單
                </button>
                <button
                  onClick={() => setActiveFilter("upcoming")}
                  className={`px-4 py-2.5 rounded-full text-xs whitespace-nowrap flex items-center gap-2 transition-all ${
                    activeFilter === "upcoming"
                      ? "bg-[#94A3B8] text-white shadow-md shadow-[#94A3B8]/30 font-bold"
                      : "bg-white/60 border border-white/40 text-[#5C5C5C] font-medium"
                  }`}
                >
                  <span className={`material-icons-round text-sm ${activeFilter === "upcoming" ? "" : "text-[#94A3B8]"}`}>flight_takeoff</span>
                  即將出發
                </button>
                <button
                  onClick={() => setActiveFilter("pending")}
                  className={`px-4 py-2.5 rounded-full text-xs whitespace-nowrap flex items-center gap-2 transition-all ${
                    activeFilter === "pending"
                      ? "bg-[#C5B6AF] text-white shadow-md shadow-[#C5B6AF]/30 font-bold"
                      : "bg-white/60 border border-white/40 text-[#5C5C5C] font-medium"
                  }`}
                >
                  <span className={`material-icons-round text-sm ${activeFilter === "pending" ? "" : "text-[#C5B6AF]"}`}>pending</span>
                  待確認
                </button>
                <button
                  onClick={() => setActiveFilter("planning")}
                  className={`px-4 py-2.5 rounded-full text-xs whitespace-nowrap flex items-center gap-2 transition-all ${
                    activeFilter === "planning"
                      ? "bg-[#A8BCA1] text-white shadow-md shadow-[#A8BCA1]/30 font-bold"
                      : "bg-white/60 border border-white/40 text-[#5C5C5C] font-medium"
                  }`}
                >
                  <span className={`material-icons-round text-sm ${activeFilter === "planning" ? "" : "text-[#A8BCA1]"}`}>edit_note</span>
                  規劃中
                </button>
              </div>

              {/* 手機/平板：統計摘要（橫向） */}
              <div className="flex gap-3 mt-3">
                <div className="flex-1 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-3 text-center">
                  <span className="text-lg sm:text-xl font-bold text-[#5C5C5C]">3</span>
                  <p className="text-[10px] text-[#949494]">進行中</p>
                </div>
                <div className="flex-1 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-3 text-center">
                  <span className="text-lg sm:text-xl font-bold text-[#C5B6AF]">1</span>
                  <p className="text-[10px] text-[#949494]">待付款</p>
                </div>
                <div className="flex-1 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 p-3 text-center">
                  <span className="text-lg sm:text-xl font-bold text-[#5C5C5C]">12</span>
                  <p className="text-[10px] text-[#949494]">已完成</p>
                </div>
              </div>
            </div>

            {/* 桌面：垂直篩選欄 */}
            <div className="hidden lg:flex flex-col h-full">
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-4 xl:p-5 flex-1 flex flex-col">
                {/* 新增行程按鈕 */}
                <button className="w-full px-3 xl:px-4 py-3 xl:py-3.5 rounded-xl bg-[#94A3B8] text-white text-xs xl:text-sm font-bold shadow-md shadow-[#94A3B8]/30 flex items-center justify-center gap-2 mb-5 hover:bg-[#8291A6] transition-colors">
                  <span className="material-icons-round text-base xl:text-lg">add</span>
                  新增行程
                </button>

                <h2 className="text-base xl:text-lg font-bold text-[#5C5C5C] mb-4">訂單篩選</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={`w-full px-3 xl:px-4 py-2.5 xl:py-3 rounded-xl text-xs xl:text-sm font-bold text-left flex items-center gap-2 xl:gap-3 cursor-pointer active:scale-[0.98] transition-all ${
                      activeFilter === "all"
                        ? "bg-[#94A3B8]/15 border border-[#94A3B8]/30 text-[#94A3B8]"
                        : "bg-white/60 border border-white/40 text-[#5C5C5C] font-medium hover:bg-white/80"
                    }`}
                  >
                    <span className="material-icons-round text-base xl:text-lg">list</span>
                    全部訂單
                  </button>
                  <button
                    onClick={() => setActiveFilter("upcoming")}
                    className={`w-full px-3 xl:px-4 py-2.5 xl:py-3 rounded-xl text-xs xl:text-sm text-left flex items-center gap-2 xl:gap-3 cursor-pointer active:scale-[0.98] transition-all ${
                      activeFilter === "upcoming"
                        ? "bg-[#94A3B8]/15 border border-[#94A3B8]/30 text-[#94A3B8] font-bold"
                        : "bg-white/60 border border-white/40 text-[#5C5C5C] font-medium hover:bg-white/80"
                    }`}
                  >
                    <span className="material-icons-round text-base xl:text-lg text-[#94A3B8]">flight_takeoff</span>
                    即將出發
                  </button>
                  <button
                    onClick={() => setActiveFilter("pending")}
                    className={`w-full px-3 xl:px-4 py-2.5 xl:py-3 rounded-xl text-xs xl:text-sm text-left flex items-center gap-2 xl:gap-3 cursor-pointer active:scale-[0.98] transition-all ${
                      activeFilter === "pending"
                        ? "bg-[#C5B6AF]/15 border border-[#C5B6AF]/30 text-[#C5B6AF] font-bold"
                        : "bg-white/60 border border-white/40 text-[#5C5C5C] font-medium hover:bg-white/80"
                    }`}
                  >
                    <span className="material-icons-round text-base xl:text-lg text-[#C5B6AF]">pending</span>
                    待確認
                  </button>
                  <button
                    onClick={() => setActiveFilter("planning")}
                    className={`w-full px-3 xl:px-4 py-2.5 xl:py-3 rounded-xl text-xs xl:text-sm text-left flex items-center gap-2 xl:gap-3 cursor-pointer active:scale-[0.98] transition-all ${
                      activeFilter === "planning"
                        ? "bg-[#A8BCA1]/15 border border-[#A8BCA1]/30 text-[#A8BCA1] font-bold"
                        : "bg-white/60 border border-white/40 text-[#5C5C5C] font-medium hover:bg-white/80"
                    }`}
                  >
                    <span className="material-icons-round text-base xl:text-lg text-[#A8BCA1]">edit_note</span>
                    規劃中
                  </button>
                </div>

                {/* 快速統計 - 放在篩選下方，用 mt-auto 推到底部 */}
                <div className="mt-auto pt-6 border-t border-white/40">
                  <h3 className="text-xs xl:text-sm font-bold text-[#5C5C5C] mb-3">快速統計</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#949494]">進行中</span>
                      <span className="text-sm font-bold text-[#5C5C5C]">3 個</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#949494]">待付款</span>
                      <span className="text-sm font-bold text-[#C5B6AF]">1 個</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#949494]">已完成</span>
                      <span className="text-sm font-bold text-[#5C5C5C]">12 個</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ========== 右側內容區（響應式） ========== */}
          <section className="flex-1 min-w-0">
            {/* 訂單卡片網格（響應式） */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-5">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

            {/* 沒有結果時顯示 */}
            {filteredOrders.length === 0 && (
              <div className="mt-8 p-8 text-center bg-white/40 rounded-2xl border border-white/50">
                <span className="material-icons-outlined text-[#D8D0C9] text-5xl mb-3">search_off</span>
                <p className="text-sm text-[#949494]">此分類沒有訂單</p>
              </div>
            )}

            {/* 空狀態提示 */}
            <div className="mt-6 lg:mt-8 p-6 lg:p-8 text-center opacity-60">
              <span className="material-icons-outlined text-[#D8D0C9] text-4xl lg:text-5xl mb-2 lg:mb-3">add_circle_outline</span>
              <p className="text-xs sm:text-sm text-[#949494]">想去哪裡玩？<br />開始規劃下一趟旅程吧</p>
            </div>
          </section>
        </div>
      </main>

      {/* 手機版底部導航 */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
