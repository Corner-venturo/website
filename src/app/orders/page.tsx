"use client";

import Link from "next/link";
import MobileNav from "@/components/MobileNav";

const accentStyles = {
  blue: {
    bubbleBg: "bg-morandi-blue",
    chipBg: "bg-morandi-blue/20",
    chipText: "text-morandi-blue",
  },
  pink: {
    bubbleBg: "bg-morandi-pink",
    chipBg: "bg-morandi-pink/20",
    chipText: "text-morandi-pink",
  },
  green: {
    bubbleBg: "bg-morandi-green",
    chipBg: "bg-morandi-green/20",
    chipText: "text-morandi-green",
  },
} as const;

const orders = [
  {
    id: "kyoto-autumn",
    month: "Nov",
    day: "15",
    chipText: "3 天後出發",
    accent: "blue" as const,
    title: "京都秋日賞楓五日遊",
    dateRange: "11/15 - 11/20, 2023",
    travelers: "2 成人, 1 兒童",
    progress: 85,
    statusTags: [
      { label: "機票已開", tone: "green" },
      { label: "住宿確認", tone: "green" },
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
    accent: "pink" as const,
    title: "東京迪士尼夢幻之旅",
    dateRange: "12/24 - 12/28, 2023",
    travelers: "剩餘 23 小時付款",
    total: "$45,200",
    actionLabel: "前往付款",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCG3AJ90z0fRZUHbKu5cYlgYt0LZAkNc3uQYelVS-hJk9_kNA7CNAkyo4hBOCE25UqvUGwiMmQR2JEL8CE070Jx7fcBeNrNLbLY6AFWGqkW66DFMZQr3fpDGCa7oTu1wRwgqbdl812uGJyDjnUf7_BDfbts_gT17M79ShHbBgfODyTFMzxfn33oBnZLoKzkKCN5WiNwVJISRRQKf_MH6rzMsfQ2Wc8hcCu8tuHIRxOUXmUdukUK9SXVV4WsT1YiL5SgpqQJ0N9qk6za",
  },
  {
    id: "hokkaido-ski",
    month: "Jan",
    day: "2024",
    chipText: "規劃中",
    accent: "green" as const,
    title: "北海道滑雪初體驗",
    dateRange: "2024年 1月 (暫定)",
    travelers: "已儲存草稿",
  },
];

export default function OrdersPage() {
  return (
    <div className="bg-[#F0EEE6] font-sans antialiased text-gray-900 transition-colors duration-300 min-h-[884px] min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#EFEFE8] texture-bg" />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-morandi-blue/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[20%] w-64 h-64 bg-morandi-pink/15 rounded-full blur-3xl" />
      </div>

      <header className="relative z-50 px-6 pt-12 pb-2 flex items-center justify-between">
        <button className="glass w-10 h-10 flex items-center justify-center rounded-full shadow-sm text-gray-600 hover:text-primary transition-colors">
          <span className="material-icons-round text-xl">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-800 tracking-tight">進行中的訂單</h1>
        <div className="w-10" />
      </header>

      <main className="relative z-10 flex-1 w-full h-full overflow-y-auto hide-scrollbar pb-32">
        <div className="px-6 py-4 flex items-center gap-3 overflow-x-auto hide-scrollbar">
          <button className="px-4 py-2 rounded-full bg-primary text-white text-xs font-bold shadow-md shadow-primary/30 whitespace-nowrap">全部</button>
          <button className="px-4 py-2 rounded-full bg-white/60 border border-white/40 text-gray-500 text-xs font-medium whitespace-nowrap">即將出發</button>
          <button className="px-4 py-2 rounded-full bg-white/60 border border-white/40 text-gray-500 text-xs font-medium whitespace-nowrap">待確認</button>
          <button className="px-4 py-2 rounded-full bg-white/60 border border-white/40 text-gray-500 text-xs font-medium whitespace-nowrap">規劃中</button>
        </div>

        <div className="px-6 space-y-6 timeline-line relative">
          {orders.map((order) => {
            const accent = accentStyles[order.accent];

            return (
              <div key={order.id} className="relative z-10 pl-12">
                <div
                  className={`absolute left-0 top-6 w-10 h-10 rounded-full ${accent.bubbleBg} border-4 border-[#F0EEE6] flex flex-col items-center justify-center shadow-lg z-20`}
                >
                  <span className="text-[9px] font-bold text-white uppercase leading-none mt-0.5">{order.month}</span>
                  <span className={`text-sm font-bold text-white leading-none ${order.id === "hokkaido-ski" ? "text-[10px]" : ""}`}>
                    {order.day}
                  </span>
                </div>

                <div className="glass-card rounded-2xl shadow-soft p-5 relative group overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className={`absolute top-0 right-0 px-3 py-1 ${accent.chipBg} rounded-bl-xl`}>
                    <span className={`text-[10px] font-bold ${accent.chipText}`}>{order.chipText}</span>
                  </div>

                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm shrink-0 bg-gray-100 flex items-center justify-center">
                      {order.image ? (
                        <img src={order.image} alt={order.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-icons-round text-gray-300 text-3xl">map</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{order.title}</h3>
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <span className="material-icons-round text-sm">calendar_today</span>
                        <span>{order.dateRange}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <span className="material-icons-round text-sm">{order.id === "tokyo-disney" ? "timer" : "group"}</span>
                        <span className={order.id === "tokyo-disney" ? "text-morandi-pink font-medium" : ""}>{order.travelers}</span>
                      </div>
                    </div>
                  </div>

                  {order.id === "kyoto-autumn" && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-gray-600">行程準備進度</span>
                        <span className="font-bold text-morandi-blue">{order.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-morandi-blue rounded-full" style={{ width: `${order.progress}%` }} />
                      </div>
                      <div className="flex gap-2 pt-2 overflow-x-auto hide-scrollbar">
                        {order.statusTags?.map((tag) => (
                          <span
                            key={tag.label}
                            className={`px-2 py-1 rounded text-[10px] border flex items-center gap-1 ${
                              tag.tone === "green"
                                ? "bg-green-100/50 text-green-600 border-green-200"
                                : "bg-morandi-yellow/20 text-yellow-700 border-morandi-yellow/30"
                            }`}
                          >
                            <span className="material-icons-round text-[10px]">
                              {tag.tone === "green" ? "check_circle" : "pending"}
                            </span>
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {order.id === "tokyo-disney" && (
                    <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400">總金額</span>
                        <span className="font-bold text-gray-800">{order.total}</span>
                      </div>
                      <button className="px-4 py-2 bg-morandi-pink text-white text-xs font-bold rounded-full shadow-md shadow-morandi-pink/30 hover:bg-morandi-pink/90 transition-colors">
                        {order.actionLabel}
                      </button>
                    </div>
                  )}

                  {order.id === "hokkaido-ski" && (
                    <div className="flex items-center gap-2 mt-2">
                      <button className="flex-1 py-2 rounded-lg border border-primary/30 text-primary text-xs font-medium hover:bg-primary/5 transition-colors">
                        編輯行程
                      </button>
                      <button className="flex-1 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                        繼續預訂
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-10 py-8 text-center opacity-60">
          <span className="material-icons-outlined text-gray-300 text-4xl mb-2">add_circle_outline</span>
          <p className="text-xs text-gray-400">想去哪裡玩？<br />開始規劃下一趟旅程吧</p>
        </div>
      </main>

      <MobileNav />

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.6);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .glass-dark {
          background: rgba(30, 30, 30, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .texture-bg {
          background-size: 20px 20px;
        }
        .timeline-line::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 20px;
          width: 2px;
          background: #e5e7eb;
          z-index: 0;
        }
        :global(.dark) .timeline-line::before {
          background: #374151;
        }
      `}</style>
    </div>
  );
}
