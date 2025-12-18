"use client";

import { useState } from "react";
import Link from "next/link";

// 推薦行程資料
const recommendedTrips = [
  {
    id: 1,
    title: "京都秋日賞楓五日遊",
    description: "清水寺、嵐山小火車、和服體驗",
    duration: "5天4夜",
    price: "NT$32,900",
    note: "含機票/住宿",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ",
  },
  {
    id: 2,
    title: "關西三都深度漫遊",
    description: "京都、大阪、奈良一次滿足",
    duration: "6天5夜",
    price: "NT$28,500",
    note: "特色民宿",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ",
  },
  {
    id: 3,
    title: "京都職人文化體驗",
    description: "茶道、花道、陶藝製作",
    duration: "5天4夜",
    price: "NT$35,000",
    note: "精緻小團",
    image: null,
  },
];

// 行程項目資料
const itineraryItems = [
  {
    id: 1,
    type: "attraction",
    title: "清水寺",
    description: "京都最著名的古老寺院，必訪之地。",
    time: "09:00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ",
  },
  {
    id: 2,
    type: "experience",
    title: "和服租借",
    description: "漫步古都，體驗傳統服飾。",
    time: "11:30",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ",
  },
];

export default function AIPlannerPage() {
  const [inputValue, setInputValue] = useState("");

  const typeConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    attraction: { label: "景點", color: "text-[#A5BCCF]", bgColor: "bg-[#A5BCCF]/10" },
    experience: { label: "體驗", color: "text-[#CFA5A5]", bgColor: "bg-[#CFA5A5]/10" },
    food: { label: "美食", color: "text-[#A8BFA6]", bgColor: "bg-[#A8BFA6]/10" },
  };

  return (
    <div className="bg-[#F7F5F2] font-sans antialiased text-gray-900 min-h-screen flex flex-col">
      {/* 背景紋理 */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-5">
        <img
          alt="Background Texture"
          className="w-full h-full object-cover filter blur-3xl scale-110"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQxdpG2RE5XLEWK6ikPUSOrtPRwSqlSU7iJ6pbjL8J7PW_cnbAoiwIYp6mTaBqkRK3mdYLRXVbNS2VRUP8uJgT-igXHym-u1wTQEMDlwCL3fHMRn2U4GMvmxMX-_aTrnY_-c3u_aoifLUZeMRnTDhVN8WeRyzwtSz7HYK2vgEvLpa7bVPuUZdY_bnLC15Ron7tOGB0esLisiM305SNNU1301EMQh4eugnCtB4j9ZK_jnZsZcxx5Put2e17rOhKmyhvmLCi84G_53Dk"
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 px-5 py-4 bg-[#F7F5F2]/95 backdrop-blur-md flex items-center justify-between">
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <span className="material-icons-round text-gray-800 text-[22px]">arrow_back</span>
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="text-base font-bold text-gray-800 tracking-wide">威廉AI</h1>
          <span className="text-[10px] text-gray-500 font-medium">您的旅行規劃師</span>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all active:scale-95">
          <span className="material-icons-round text-gray-800 text-[22px]">keyboard_arrow_down</span>
        </button>
      </header>

      {/* 主要內容 */}
      <main className="relative z-10 w-full max-w-md mx-auto flex-1 flex flex-col pb-28 overflow-hidden">
        {/* 對話區域 */}
        <section className="px-5 pt-2 pb-2 flex flex-col gap-4 max-h-[45vh] overflow-y-auto hide-scrollbar">
          {/* AI 訊息 1 */}
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-[#Cfb9a5] flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white">
              <span className="material-icons-round text-white text-[18px]">smart_toy</span>
            </div>
            <div className="flex flex-col gap-1 items-start max-w-[85%]">
              <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm text-sm text-gray-700 leading-relaxed border border-gray-100">
                你好！我是威廉AI。<br />這次想去哪個國家旅行呢？
              </div>
            </div>
          </div>

          {/* 用戶訊息 */}
          <div className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 shadow-sm overflow-hidden border-2 border-white">
              <img
                alt="User"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvF2J-hlJIbdIC1Zhk3h66lPKdCASqxoUNDT5DR9he5w1MfhJDXI1O_frJyo2uYhLobQ0_u1nLH0eQeEifXxnEQb0cz5wn2MJRTHFXe0Pkfa3JepHynrlVFLiyd66xSfjKz5z8Jxk2DzcoYdfFA2cCeba_l5jqRdopIxaedRspIjNrtHf3-Nyhhetfd2kO4xkzRwcxejVimNu5QbVu4NZz99d1uv1N4LpbDeXDMwpo0GHzix50XR4ZAGUWfcon0Ci41_X8fWT8xn16"
              />
            </div>
            <div className="flex flex-col gap-1 items-end max-w-[85%]">
              <div className="bg-[#D6C4B4] text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-sm text-sm leading-relaxed">
                日本，京都。
              </div>
            </div>
          </div>

          {/* AI 訊息 2 - 推薦行程 */}
          <div className="flex gap-3 w-full">
            <div className="w-8 h-8 rounded-full bg-[#Cfb9a5] flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white">
              <span className="material-icons-round text-white text-[18px]">smart_toy</span>
            </div>
            <div className="flex flex-col gap-3 items-start flex-1 min-w-0">
              <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm text-sm text-gray-700 leading-relaxed border border-gray-100 max-w-[95%]">
                太棒了！京都充滿了豐富的體驗。<br />
                我為您整理了以下幾個<strong>推薦行程</strong>，您可以直接點擊查看詳情或拖曳到下方行程中喔！
              </div>

              {/* 推薦行程卡片 */}
              <div className="flex gap-3 overflow-x-auto pb-2 w-full hide-scrollbar snap-x pr-2">
                {recommendedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="min-w-[220px] max-w-[220px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col snap-center shrink-0 cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="h-28 w-full relative bg-gray-200">
                      {trip.image ? (
                        <img alt={trip.title} className="w-full h-full object-cover" src={trip.image} />
                      ) : (
                        <div className="w-full h-full bg-[#A8BFA6]/20 flex items-center justify-center">
                          <span className="material-icons-round text-[#A8BFA6] text-4xl">landscape</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-sm">
                        <span className="material-icons-round text-[16px] text-[#Cfb9a5]">drag_indicator</span>
                      </div>
                      <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                        {trip.duration}
                      </span>
                    </div>
                    <div className="p-3 flex flex-col gap-1">
                      <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{trip.title}</h4>
                      <p className="text-[10px] text-gray-500 line-clamp-1">{trip.description}</p>
                      <div className="flex justify-between items-end mt-1">
                        <span className="text-[10px] text-gray-400">{trip.note}</span>
                        <span className="text-sm font-bold text-[#Cfb9a5]">{trip.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors self-start ml-1 mt-[-4px]">
                <span className="material-icons-round text-[16px]">expand_more</span>
                展開更多推薦項目 (景點、美食、住宿)
              </button>
            </div>
          </div>
        </section>

        {/* 輸入框 */}
        <div className="px-5 py-2 z-20 sticky top-0">
          <div className="bg-white/85 backdrop-blur-xl rounded-full p-1.5 flex items-center shadow-lg border border-white/40 ring-1 ring-black/5">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 ml-1 text-gray-400">
              <span className="material-icons-round text-[18px]">mic</span>
            </div>
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-gray-700 placeholder-gray-400 px-3 py-1 min-w-0"
              placeholder="我想去哪個國家/城市？"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className="w-9 h-9 rounded-full bg-[#Cfb9a5] hover:bg-[#b09b88] flex items-center justify-center shrink-0 shadow-sm text-white transition-colors active:scale-95">
              <span className="material-icons-round text-[18px]">send</span>
            </button>
          </div>
        </div>

        {/* 行程拼湊區 */}
        <section className="flex-1 px-5 mt-1 flex flex-col min-h-0 relative">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-[#A8BFA6]"></span>
              拼湊你的旅程
            </h2>
            <button className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#Cfb9a5] to-[#dccebd] text-white rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 ring-2 ring-[#Cfb9a5]/20">
              <span className="material-icons-round text-[16px]">auto_awesome</span>
              自動生成
            </button>
          </div>

          <div className="relative flex-1 bg-white/60 rounded-t-[2.5rem] border border-white/40 overflow-hidden flex flex-col shadow-lg backdrop-blur-sm">
            {/* 地圖背景 */}
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-cover bg-center grayscale mix-blend-multiply" />

            <div className="flex-1 p-5 relative z-10 overflow-y-auto hide-scrollbar pb-36">
              <div className="flex flex-col gap-4">
                {/* Day 標題 */}
                <div className="flex items-center gap-3 sticky top-0 z-10 py-2 -mx-2 px-2 rounded-xl backdrop-blur-md bg-white/30">
                  <div className="px-3 py-1 bg-gray-800 text-white rounded-full text-xs font-bold tracking-wide shadow-sm">
                    Day 1
                  </div>
                  <div className="h-px bg-gradient-to-r from-gray-400/50 to-transparent flex-1"></div>
                  <span className="text-[10px] text-gray-500 font-medium">11月25日 (五)</span>
                </div>

                {/* 行程項目 */}
                {itineraryItems.map((item, index) => {
                  const config = typeConfig[item.type] || typeConfig.attraction;
                  const dotColor = item.type === "attraction" ? "bg-[#A5BCCF]" : "bg-[#CFA5A5]";

                  return (
                    <div key={item.id} className="flex items-start gap-3 group">
                      <div className="flex flex-col items-center gap-1 pt-3">
                        <div className={`w-3 h-3 rounded-full ${dotColor} ring-4 ring-white shadow-sm`}></div>
                        {index < itineraryItems.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 min-h-[3rem]"></div>
                        )}
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-3 relative transition-all hover:shadow-md hover:-translate-y-0.5">
                        <img
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover bg-gray-100 shadow-sm"
                          src={item.image}
                        />
                        <div className="flex-1 flex flex-col justify-center gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded-md ${config.bgColor} text-[10px] ${config.color} font-bold`}>
                              {config.label}
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                              <span className="material-icons-round text-[10px]">schedule</span> {item.time}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-800">{item.title}</h4>
                          <p className="text-[10px] text-gray-400 line-clamp-1">{item.description}</p>
                        </div>
                        <button className="absolute -top-2 -right-2 bg-red-50 rounded-full p-1 shadow-sm text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                          <span className="material-icons-round text-[16px]">remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 新增項目按鈕 */}
                <div className="flex items-start gap-3 opacity-70 hover:opacity-100 transition-all cursor-pointer group py-2">
                  <div className="flex flex-col items-center gap-1 pt-3 opacity-20 group-hover:opacity-100 transition-opacity">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                  </div>
                  <div className="flex-1 h-16 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium bg-white/20 hover:bg-white/40 transition-colors">
                    <span className="material-icons-round text-base">add_circle</span>
                    拖曳項目或點擊新增
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 底部導航 */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/85 backdrop-blur-xl rounded-full px-7 py-3.5 flex items-center gap-9 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/40">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-icons-round text-[26px]">home</span>
          </Link>
          <Link href="/explore" className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-icons-round text-[26px]">explore</span>
          </Link>
          <button className="text-[#Cfb9a5] relative transform scale-110 hover:text-[#b09b88] transition-colors">
            <span className="material-icons-round text-[26px]">favorite</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#CFA5A5] rounded-full border border-white"></span>
          </button>
          <Link href="/my" className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-icons-round text-[26px]">person_outline</span>
          </Link>
        </div>
      </nav>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
