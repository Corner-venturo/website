"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import { OrderCard, FilterTabs, FilterType, Order } from "./components";
import { useAuthStore } from "@/stores/auth-store";
import { useTripStore, Trip } from "@/stores/trip-store";

// 將 Trip 轉換為 Order 格式
function tripToOrder(trip: Trip): Order {
  const now = new Date();
  const startDate = trip.start_date ? new Date(trip.start_date) : null;
  const endDate = trip.end_date ? new Date(trip.end_date) : null;

  // 計算月份和日期顯示
  let month = "";
  let day = "";
  if (startDate) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    month = monthNames[startDate.getMonth()];
    day = String(startDate.getDate());
  } else {
    month = "TBD";
    day = "---";
  }

  // 計算 chipText 和 chipColor
  let chipText = "";
  let chipColor = "";
  let filter: FilterType = "planning";

  if (trip.status === "completed") {
    chipText = "已完成";
    chipColor = "bg-[#949494]";
    filter = "planning"; // 已完成的放在 planning 分類（或可新增 completed 分類）
  } else if (trip.status === "ongoing") {
    chipText = "進行中";
    chipColor = "bg-[#A8BCA1]";
    filter = "upcoming";
  } else if (trip.status === "upcoming" && startDate) {
    const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 0) {
      chipText = "今天出發";
      chipColor = "bg-[#CFA5A5]";
    } else if (daysUntil === 1) {
      chipText = "明天出發";
      chipColor = "bg-[#CFA5A5]";
    } else {
      chipText = `${daysUntil} 天後出發`;
      chipColor = "bg-[#94A3B8]";
    }
    filter = "upcoming";
  } else {
    chipText = "規劃中";
    chipColor = "bg-[#A8BCA1]";
    filter = "planning";
  }

  // 計算日期範圍顯示
  let dateRange = "";
  if (startDate && endDate) {
    const startMonth = startDate.getMonth() + 1;
    const startDay = startDate.getDate();
    const endMonth = endDate.getMonth() + 1;
    const endDay = endDate.getDate();
    const year = startDate.getFullYear();
    dateRange = `${startMonth}/${startDay} - ${endMonth}/${endDay}, ${year}`;
  } else if (startDate) {
    const startMonth = startDate.getMonth() + 1;
    const startDay = startDate.getDate();
    const year = startDate.getFullYear();
    dateRange = `${startMonth}/${startDay}, ${year}`;
  } else {
    dateRange = "日期待定";
  }

  // 計算進度（這裡簡化處理，實際可根據更多條件判斷）
  let progress: number | undefined;
  if (trip.status === "upcoming" || trip.status === "ongoing") {
    progress = trip.status === "upcoming" ? 80 : 100;
  }

  return {
    id: trip.id,
    month,
    day,
    chipText,
    chipColor,
    title: trip.title,
    dateRange,
    travelers: "", // 從 trip_members 獲取，這裡先留空
    progress,
    filter,
    statusTags: trip.status === "upcoming" ? [
      { label: "航班資訊", tone: "green", href: `/orders/${trip.id}/flight` },
      { label: "住宿資訊", tone: "green", href: `/orders/${trip.id}/flight?tab=stay` },
    ] : undefined,
    image: trip.cover_image || undefined,
  };
}

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showMenu, setShowMenu] = useState(false);

  const { user, isInitialized } = useAuthStore();
  const { trips, isLoading, fetchMyTrips } = useTripStore();

  // 取得用戶的行程
  useEffect(() => {
    if (isInitialized && user?.id) {
      fetchMyTrips(user.id);
    }
  }, [isInitialized, user?.id, fetchMyTrips]);

  // 將 trips 轉換為 orders 並按日期排序
  const orders = useMemo(() => {
    const orderList = trips.map(tripToOrder);

    // 按照開始日期排序（最近的在前面，沒有日期的在最後）
    return orderList.sort((a, b) => {
      const tripA = trips.find(t => t.id === a.id);
      const tripB = trips.find(t => t.id === b.id);

      const dateA = tripA?.start_date ? new Date(tripA.start_date).getTime() : Infinity;
      const dateB = tripB?.start_date ? new Date(tripB.start_date).getTime() : Infinity;

      return dateA - dateB;
    });
  }, [trips]);

  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((order) => order.filter === activeFilter);

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden relative bg-[#F5F4F0] font-sans antialiased text-[#5C5C5C]">
      {/* 背景光暈 */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[300px] h-[300px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[250px] h-[250px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute top-[40%] left-[20%] w-[200px] h-[200px] bg-[#E6DFDA] opacity-30 blur-[70px] rounded-full" />
      </div>

      {/* Header - absolute 定位 */}
      <header className="absolute top-0 left-0 right-0 z-20 px-5 pt-4 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">我的行程</h1>
        <button
          onClick={() => setShowMenu(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm hover:bg-white/80 transition-all active:scale-95"
        >
          <span className="material-icons-round text-gray-600">more_horiz</span>
        </button>
      </header>

      {/* 主要內容區域 */}
      <main className="h-full overflow-y-auto px-4 pt-16 pb-24">
        {/* 篩選標籤 */}
        <div className="mb-4">
          <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* 訂單卡片列表 */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-3 border-[#Cfb9a5]/30 border-t-[#Cfb9a5] rounded-full animate-spin mb-4" />
            <p className="text-sm text-[#949494]">載入中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* 沒有結果時顯示 */}
        {!isLoading && filteredOrders.length === 0 && (
          <div className="mt-8 p-8 text-center bg-white/40 rounded-2xl border border-white/50">
            <span className="material-icons-outlined text-[#D8D0C9] text-5xl mb-3">
              search_off
            </span>
            <p className="text-sm text-[#949494]">
              {activeFilter === "all" ? "還沒有任何行程" : "此分類沒有訂單"}
            </p>
          </div>
        )}

        {/* 空狀態提示 - 只在有訂單時顯示 */}
        {!isLoading && orders.length > 0 && (
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
        )}
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
