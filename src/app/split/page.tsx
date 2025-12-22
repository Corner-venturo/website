"use client";

import { useEffect } from "react";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import { useTripStore, SplitGroup } from "@/stores/trip-store";
import { useAuthStore } from "@/stores/auth-store";

// 群組卡片元件
function GroupCard({ group }: { group: SplitGroup }) {
  const balance = group.myBalance || 0;

  return (
    <Link
      href={`/split/${group.id}`}
      className="block bg-white rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#Cfb9a5] to-[#B8A090] flex items-center justify-center overflow-hidden">
          {group.cover_image ? (
            <img src={group.cover_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="material-icons-round text-white text-xl">account_balance_wallet</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 truncate">{group.name}</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-icons-round text-xs">group</span>
            {group.memberCount || 0} 人
          </p>
        </div>
        <div className="text-right">
          <p className={`font-bold ${balance >= 0 ? "text-green-600" : "text-red-500"}`}>
            {balance >= 0 ? "+" : "-"}${Math.abs(balance).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">
            {balance > 0 ? "可收" : balance < 0 ? "應付" : "已清"}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function SplitPage() {
  const { splitGroups, fetchMySplitGroups, isLoading } = useTripStore();
  const { user, initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  useEffect(() => {
    if (user?.id) {
      fetchMySplitGroups(user.id);
    }
  }, [user?.id, fetchMySplitGroups]);

  // 計算總覽數據
  const totalOwed = splitGroups.reduce(
    (sum, g) => ((g.myBalance || 0) < 0 ? sum + Math.abs(g.myBalance || 0) : sum),
    0
  );
  const totalToReceive = splitGroups.reduce(
    (sum, g) => ((g.myBalance || 0) > 0 ? sum + (g.myBalance || 0) : sum),
    0
  );

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden relative bg-[#F0EEE6] font-sans">
      {/* 背景 */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-5 pt-4 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#5C5C5C]">分帳</h1>
          <p className="text-sm text-[#949494] mt-1">和朋友輕鬆分帳</p>
        </div>
        <Link
          href="/split/new"
          className="w-10 h-10 rounded-full bg-[#Cfb9a5] flex items-center justify-center shadow-md active:scale-95 transition-transform"
        >
          <span className="material-icons-round text-white">add</span>
        </Link>
      </header>

      {/* 主要內容 */}
      <div className="h-full overflow-y-auto pt-20 pb-32">
        {/* 總覽卡片 */}
        <div className="px-5 mb-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">我要收</p>
                <p className="text-2xl font-bold text-green-600">
                  +${totalToReceive.toLocaleString()}
                </p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="flex-1 text-right">
                <p className="text-xs text-gray-500 mb-1">我要付</p>
                <p className="text-2xl font-bold text-red-500">
                  -${totalOwed.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 快捷入口 */}
        <div className="px-5 mb-6 flex gap-3">
          <Link
            href="/split/tasks"
            className="flex-1 bg-gradient-to-br from-[#DBCBB9] to-[#Cfb9a5] rounded-2xl p-4 shadow-md relative overflow-hidden group active:scale-[0.98] transition-transform"
          >
            <div className="absolute top-0 right-0 opacity-20">
              <span className="material-icons-round text-5xl text-white transform rotate-12">
                emoji_events
              </span>
            </div>
            <div className="relative z-10">
              <span className="material-icons-round text-white/90 text-xl mb-1">task_alt</span>
              <p className="text-white font-bold text-sm">新手任務</p>
              <p className="text-white/70 text-xs mt-0.5">完成任務領點數</p>
            </div>
          </Link>
          <Link
            href="/split/points"
            className="flex-1 bg-gradient-to-br from-[#B8C9D4] to-[#A5BCCF] rounded-2xl p-4 shadow-md relative overflow-hidden group active:scale-[0.98] transition-transform"
          >
            <div className="absolute top-0 right-0 opacity-20">
              <span className="material-icons-round text-5xl text-white transform rotate-12">
                monetization_on
              </span>
            </div>
            <div className="relative z-10">
              <span className="material-icons-round text-white/90 text-xl mb-1">
                account_balance_wallet
              </span>
              <p className="text-white font-bold text-sm">我的點數</p>
              <p className="text-white/70 text-xs mt-0.5">查看點數紀錄</p>
            </div>
          </Link>
        </div>

        {/* 分帳群組列表 */}
        <div className="px-5 space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <span className="material-icons-round text-4xl text-[#Cfb9a5] animate-spin">
                sync
              </span>
              <p className="mt-2 text-gray-500">載入中...</p>
            </div>
          ) : splitGroups.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons-round text-5xl text-gray-300 mb-2">
                account_balance_wallet
              </span>
              <p className="text-gray-500">還沒有任何分帳群組</p>
              <p className="text-sm text-gray-400 mt-1">點擊右上角 + 建立第一個群組</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#5C5C5C] flex items-center gap-2">
                  <span className="material-icons-round text-lg text-[#Cfb9a5]">account_balance_wallet</span>
                  我的分帳群組
                </h2>
                <span className="text-xs text-[#949494]">{splitGroups.length} 個</span>
              </div>
              <div className="space-y-3">
                {splitGroups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
