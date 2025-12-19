"use client";

import { useState } from "react";
import Link from "next/link";
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
  {
    id: "okinawa-winter",
    month: "Dec",
    day: "23",
    chipText: "4 天後出發",
    chipColor: "bg-[#94A3B8]",
    title: "沖繩冬季五日遊",
    dateRange: "12/23 - 12/27, 2024",
    travelers: "3 成人",
    progress: 100,
    filter: "upcoming",
    statusTags: [
      { label: "航班資訊", tone: "green", href: "/flight" },
      { label: "住宿資訊", tone: "green", href: "/stay" },
    ],
    image: "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800",
  },
];

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showMenu, setShowMenu] = useState(false);

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

      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">我的行程</h1>
        <button
          onClick={() => setShowMenu(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm hover:bg-white/80 transition-all active:scale-95"
        >
          <span className="material-icons-round text-gray-600">more_horiz</span>
        </button>
      </header>

      {/* 主要內容區域 */}
      <main className="flex-1 px-4 pb-24">
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

      {/* 選單 Modal */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setShowMenu(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-slide-up">
            <div className="p-5">
              {/* 拖曳指示器 */}
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />

              {/* 選單項目 */}
              <div className="space-y-2">
                <Link
                  href="/my/friends/invite"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#A5BCCF]/15 flex items-center justify-center">
                    <span className="material-icons-round text-[#A5BCCF] text-2xl">person_add</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">邀請旅伴</div>
                    <div className="text-xs text-gray-500">分享連結或 QR Code 邀請好友</div>
                  </div>
                  <span className="material-icons-round text-gray-300">chevron_right</span>
                </Link>

                <Link
                  href="/split"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#A8BFA6]/15 flex items-center justify-center">
                    <span className="material-icons-round text-[#A8BFA6] text-2xl">account_balance_wallet</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">記帳</div>
                    <div className="text-xs text-gray-500">記錄旅途中的花費</div>
                  </div>
                  <span className="material-icons-round text-gray-300">chevron_right</span>
                </Link>
              </div>

              {/* 取消按鈕 */}
              <button
                onClick={() => setShowMenu(false)}
                className="w-full mt-4 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98]"
              >
                取消
              </button>
            </div>
          </div>
        </>
      )}

      {/* 新增行程浮動按鈕 */}
      <button className="fixed bottom-24 right-5 z-40 w-14 h-14 bg-[#Cfb9a5] hover:bg-[#c0a996] text-white rounded-full shadow-lg shadow-[#Cfb9a5]/30 flex items-center justify-center transition-all active:scale-95 hover:shadow-xl">
        <span className="material-icons-round text-2xl">add</span>
      </button>

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
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
