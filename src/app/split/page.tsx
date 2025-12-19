"use client";

import MobileNav from "@/components/MobileNav";
import { SummaryCard, TripCard, EmptyState, trips } from "./components";

export default function SplitPage() {
  // 計算總覽數據
  const totalOwed = trips.reduce(
    (sum, t) => (t.myBalance < 0 ? sum + Math.abs(t.myBalance) : sum),
    0
  );
  const totalToReceive = trips.reduce(
    (sum, t) => (t.myBalance > 0 ? sum + t.myBalance : sum),
    0
  );

  return (
    <div className="bg-[#F5F4F0] min-h-screen font-sans">
      {/* 背景 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
      </div>

      {/* 主要內容 */}
      <div className="relative z-10 pb-32">
        {/* Header */}
        <header className="px-5 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-[#5C5C5C]">旅費分帳</h1>
          <p className="text-sm text-[#949494] mt-1">選擇旅程來記錄或查看分帳</p>
        </header>

        {/* 總覽卡片 */}
        <div className="px-5 mb-6">
          <SummaryCard totalToReceive={totalToReceive} totalOwed={totalOwed} />
        </div>

        {/* 行程列表 */}
        <div className="px-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#5C5C5C]">我的旅程</h2>
            <span className="text-xs text-[#949494]">{trips.length} 個旅程</span>
          </div>

          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}

          {trips.length === 0 && <EmptyState />}
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
