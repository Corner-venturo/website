"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTripStore } from "@/stores/trip-store";

export default function SplitGroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const { currentSplitGroup, fetchSplitGroupById, clearSplitGroup, isLoading } = useTripStore();

  const [activeTab, setActiveTab] = useState<"expenses" | "members" | "settle">("expenses");

  // 模擬用戶 ID（實際應從 auth 取得）
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "" : "";

  useEffect(() => {
    if (groupId && userId) {
      fetchSplitGroupById(groupId, userId);
    }
    return () => clearSplitGroup();
  }, [groupId, userId, fetchSplitGroupById, clearSplitGroup]);

  if (isLoading || !currentSplitGroup) {
    return (
      <div className="min-h-[100dvh] bg-[#F0EEE6] flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons-round text-4xl text-[#Cfb9a5] animate-spin">
            sync
          </span>
          <p className="mt-2 text-gray-500">載入中...</p>
        </div>
      </div>
    );
  }

  const group = currentSplitGroup;
  const myBalance = group.myBalance || 0;

  return (
    <div className="min-h-[100dvh] bg-[#F0EEE6] font-sans pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#F0EEE6]/95 backdrop-blur-sm px-5 py-4 flex items-center gap-4 border-b border-gray-200/50">
        <Link
          href="/split"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm active:scale-95 transition-transform"
        >
          <span className="material-icons-round text-gray-600">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#5C5C5C]">{group.name}</h1>
          {group.trip && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="material-icons-round text-xs">flight</span>
              {group.trip.title}
            </p>
          )}
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm">
          <span className="material-icons-round text-gray-600">more_vert</span>
        </button>
      </header>

      {/* 餘額總覽 */}
      <div className="px-5 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">我的餘額</span>
            <span className="text-xs text-gray-400">
              總支出 ${group.totalExpenses?.toLocaleString() || 0}
            </span>
          </div>
          <div className={`text-3xl font-bold ${myBalance >= 0 ? "text-green-600" : "text-red-500"}`}>
            {myBalance >= 0 ? "+" : "-"}${Math.abs(myBalance).toLocaleString()}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {myBalance > 0
              ? "別人欠你這麼多"
              : myBalance < 0
              ? "你欠別人這麼多"
              : "已結清"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex bg-white rounded-xl p-1 shadow-sm">
          {[
            { id: "expenses", label: "費用記錄", icon: "receipt_long" },
            { id: "members", label: "成員", icon: "group" },
            { id: "settle", label: "結算", icon: "payments" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#Cfb9a5] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="material-icons-round text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-5">
        {/* 費用記錄 */}
        {activeTab === "expenses" && (
          <div className="space-y-3">
            {group.expenses?.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <span className="material-icons-round text-5xl text-gray-300 mb-2">
                  receipt_long
                </span>
                <p>還沒有任何費用記錄</p>
                <p className="text-sm">點擊下方按鈕新增第一筆</p>
              </div>
            ) : (
              group.expenses?.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#Cfb9a5] to-[#B8A090] flex items-center justify-center">
                      <span className="material-icons-round text-white text-lg">
                        {expense.category === "food"
                          ? "restaurant"
                          : expense.category === "transport"
                          ? "directions_car"
                          : expense.category === "accommodation"
                          ? "hotel"
                          : expense.category === "shopping"
                          ? "shopping_bag"
                          : "receipt"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-gray-800">{expense.title}</p>
                          <p className="text-xs text-gray-500">
                            {(expense as { paid_by_profile?: { display_name: string } }).paid_by_profile?.display_name || "某人"} 付款
                          </p>
                        </div>
                        <p className="font-bold text-gray-800">
                          ${expense.amount.toLocaleString()}
                        </p>
                      </div>
                      {expense.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {expense.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {expense.expense_date}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 成員餘額 */}
        {activeTab === "members" && (
          <div className="space-y-3">
            {group.memberBalances?.map((member) => (
              <div
                key={member.userId}
                className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#Cfb9a5] to-[#B8A090] flex items-center justify-center overflow-hidden">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-icons-round text-white">person</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">
                    {member.displayName || "成員"}
                    {member.userId === userId && (
                      <span className="ml-1 text-xs text-[#Cfb9a5]">（你）</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    已付 ${member.totalPaid.toLocaleString()} / 應付 ${member.totalOwed.toLocaleString()}
                  </p>
                </div>
                <div className={`text-right ${member.balance >= 0 ? "text-green-600" : "text-red-500"}`}>
                  <p className="font-bold">
                    {member.balance >= 0 ? "+" : "-"}${Math.abs(member.balance).toLocaleString()}
                  </p>
                  <p className="text-xs">
                    {member.balance > 0 ? "可收" : member.balance < 0 ? "應付" : "已清"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 結算 */}
        {activeTab === "settle" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="material-icons-round text-[#Cfb9a5]">swap_horiz</span>
                最簡化的結算方式
              </h3>
              {group.debts?.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  太棒了！大家都結清了
                </p>
              ) : (
                <div className="space-y-3">
                  {group.debts?.map((debt, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex-1 flex items-center gap-2">
                        <span className="font-medium text-gray-800">
                          {debt.fromName}
                        </span>
                        <span className="material-icons-round text-gray-400">
                          arrow_forward
                        </span>
                        <span className="font-medium text-gray-800">
                          {debt.toName}
                        </span>
                      </div>
                      <span className="font-bold text-[#Cfb9a5]">
                        ${debt.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center">
              按照上方建議的方式結算，可以最少次數完成所有分帳
            </p>
          </div>
        )}
      </div>

      {/* 底部新增按鈕 */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#F0EEE6]/95 backdrop-blur-sm border-t border-gray-200/50">
        <Link
          href={`/split/record?groupId=${groupId}`}
          className="w-full py-4 bg-[#Cfb9a5] hover:bg-[#c0a996] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#Cfb9a5]/30"
        >
          <span className="material-icons-round">add</span>
          新增費用
        </Link>
      </div>
    </div>
  );
}
