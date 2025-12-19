"use client";

import { useState } from "react";
import MobileNav from "@/components/MobileNav";
import { OrderCard, FilterTabs, FilterType, Order } from "./components";

const orders: Order[] = [
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
    filter: "upcoming",
    statusTags: [
      { label: "航班資訊", tone: "green", href: "/flight" },
      { label: "住宿資訊", tone: "green", href: "/stay" },
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
    filter: "pending",
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
    filter: "planning",
  },
];

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((order) => order.filter === activeFilter);

  return (
    <div className="bg-[#F5F4F0] font-sans antialiased text-[#5C5C5C] min-h-screen flex flex-col">
      {/* 背景光暈 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[300px] h-[300px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[250px] h-[250px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute top-[40%] left-[20%] w-[200px] h-[200px] bg-[#E6DFDA] opacity-30 blur-[70px] rounded-full" />
      </div>

      {/* 主要內容區域 */}
      <main className="flex-1 px-4 pt-6 pb-24">
        {/* 篩選標籤 */}
        <div className="mb-4">
          <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* 訂單卡片列表 */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>

        {/* 沒有結果時顯示 */}
        {filteredOrders.length === 0 && (
          <div className="mt-8 p-8 text-center bg-white/40 rounded-2xl border border-white/50">
            <span className="material-icons-outlined text-[#D8D0C9] text-5xl mb-3">
              search_off
            </span>
            <p className="text-sm text-[#949494]">此分類沒有訂單</p>
          </div>
        )}

        {/* 空狀態提示 */}
        <div className="mt-6 p-6 text-center opacity-60">
          <span className="material-icons-outlined text-[#D8D0C9] text-4xl mb-2">
            add_circle_outline
          </span>
          <p className="text-xs text-[#949494]">
            想去哪裡玩？
            <br />
            開始規劃下一趟旅程吧
          </p>
        </div>
      </main>

      {/* 手機版底部導航 */}
      <MobileNav />

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
