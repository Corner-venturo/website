"use client";

import Link from "next/link";
import { useState } from "react";

// 點數紀錄資料
const pointsHistory = [
  {
    id: 1,
    icon: "task_alt",
    iconBg: "bg-[#A8BFA6]/20",
    iconColor: "text-[#A8BFA6]",
    title: "完成新手任務",
    date: "2024/04/15 14:30",
    source: "系統獎勵",
    amount: 50,
    type: "earn",
  },
  {
    id: 2,
    icon: "shopping_bag",
    iconBg: "bg-[#CFA5A5]/20",
    iconColor: "text-[#CFA5A5]",
    title: "兌換復古行李吊牌",
    date: "2024/04/12 09:15",
    source: "點數商店",
    amount: 120,
    type: "spend",
  },
  {
    id: 3,
    icon: "flight_takeoff",
    iconBg: "bg-[#A5BCCF]/20",
    iconColor: "text-[#A5BCCF]",
    title: "訂購東京來回機票",
    date: "2024/04/01 18:20",
    source: "訂單回饋",
    amount: 350,
    type: "earn",
  },
  {
    id: 4,
    icon: "local_cafe",
    iconBg: "bg-[#CFA5A5]/20",
    iconColor: "text-[#CFA5A5]",
    title: "兌換機場咖啡券",
    date: "2024/03/28 10:05",
    source: "點數商店",
    amount: 80,
    type: "spend",
  },
  {
    id: 5,
    icon: "event_busy",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-400",
    title: "2023年度點數到期",
    date: "2023/12/31 23:59",
    source: "系統過期",
    amount: 25,
    type: "expired",
  },
];

const filterTabs = ["全部", "獲得紀錄", "使用紀錄", "即將到期"];

export default function PointsPage() {
  const [activeFilter, setActiveFilter] = useState("全部");
  const currentPoints = 2450;
  const expiringPoints = 350;
  const expiryDate = "2024/06/30";

  const filteredHistory = pointsHistory.filter((item) => {
    if (activeFilter === "全部") return true;
    if (activeFilter === "獲得紀錄") return item.type === "earn";
    if (activeFilter === "使用紀錄") return item.type === "spend";
    if (activeFilter === "即將到期") return item.type === "expired";
    return true;
  });

  return (
    <div className="bg-[#F5F4F0] min-h-screen font-sans">
      {/* 背景 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-[#CFA5A5]/15 rounded-full blur-[70px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-5 pt-12 pb-2 flex items-center justify-between">
        <Link
          href="/my"
          className="bg-white/60 backdrop-blur-xl border border-white/50 p-2.5 rounded-full shadow-sm text-[#5C5C5C] hover:text-[#Cfb9a5] transition-colors flex items-center justify-center w-10 h-10"
        >
          <span className="material-icons-round text-xl">arrow_back</span>
        </Link>
        <h1 className="text-lg font-bold text-[#5C5C5C] tracking-tight">
          我的點數
        </h1>
        <div className="w-10 h-10 opacity-0 pointer-events-none" />
      </header>

      {/* 主要內容 */}
      <main className="relative z-10 pb-32">
        {/* 點數卡片 */}
        <section className="px-5 py-4">
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E0D6A8]/20 rounded-bl-full -mr-8 -mt-8 blur-xl" />
            <div className="relative z-10 flex flex-col items-center">
              <p className="text-sm font-medium text-[#949494] mb-1">當前點數</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-bold text-[#5C5C5C] tracking-tight">
                  {currentPoints.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-[#Cfb9a5]">P</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-full text-[11px] font-medium text-[#5C5C5C] backdrop-blur-sm border border-white/20 mb-5">
                <span className="material-icons-round text-[14px] text-[#CFA5A5]">
                  event
                </span>
                {expiringPoints} 點將於 {expiryDate} 到期
              </div>
              <button className="text-xs text-[#Cfb9a5] font-bold flex items-center gap-1 hover:text-[#c0aa96] transition-colors bg-[#Cfb9a5]/10 px-4 py-2 rounded-full">
                <span className="material-icons-round text-sm">info</span>
                點數用途說明
              </button>
            </div>
          </div>
        </section>

        {/* 篩選標籤 */}
        <section className="px-5 mb-4 sticky top-0 z-20 pt-2 pb-2 backdrop-blur-sm">
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === tab
                    ? "bg-[#Cfb9a5] text-white shadow-md shadow-[#Cfb9a5]/20"
                    : "bg-white/60 backdrop-blur-xl border border-white/50 text-[#5C5C5C] hover:bg-white/80"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {/* 點數紀錄列表 */}
        <section className="px-5 space-y-3 pb-10">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className={`bg-white/60 backdrop-blur-xl border border-white/50 p-4 rounded-2xl flex items-center justify-between hover:bg-white/80 transition-colors cursor-pointer ${
                item.type === "expired" ? "opacity-70" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full ${item.iconBg} flex items-center justify-center ${item.iconColor} shrink-0`}
                >
                  <span className="material-icons-round">{item.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#5C5C5C] text-sm mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#949494] font-medium">
                    {item.date} · {item.source}
                  </p>
                </div>
              </div>
              <span
                className={`font-bold text-base ${
                  item.type === "earn"
                    ? "text-[#A8BFA6]"
                    : item.type === "spend"
                    ? "text-[#CFA5A5]"
                    : "text-gray-400"
                }`}
              >
                {item.type === "earn" ? "+" : "-"}
                {item.amount}
              </span>
            </div>
          ))}
        </section>
      </main>

      {/* 底部按鈕 */}
      <div className="fixed bottom-0 left-0 right-0 p-5 z-50 bg-gradient-to-t from-[#F5F4F0] via-[#F5F4F0]/90 to-transparent pt-12">
        <button className="w-full bg-[#Cfb9a5] hover:bg-[#c0aa96] text-white text-base font-bold py-4 rounded-2xl shadow-lg shadow-[#Cfb9a5]/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
          <span className="material-icons-round">storefront</span>
          前往點數商店
        </button>
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
