"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTripStore, Trip, TripMember } from "@/stores/trip-store";

export default function NewSplitGroupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripIdFromUrl = searchParams.get("tripId");

  const { trips, members, fetchMyTrips, fetchTripMembers, createSplitGroup, isLoading } = useTripStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTripId, setSelectedTripId] = useState<string | null>(tripIdFromUrl);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showTripSelector, setShowTripSelector] = useState(false);

  // 模擬用戶 ID（實際應從 auth 取得）
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "" : "";

  // 載入用戶的旅程
  useEffect(() => {
    if (userId) {
      fetchMyTrips(userId);
    }
  }, [userId, fetchMyTrips]);

  // 如果選擇了旅程，載入該旅程的成員
  useEffect(() => {
    if (selectedTripId) {
      fetchTripMembers(selectedTripId);
    }
  }, [selectedTripId, fetchTripMembers]);

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("請輸入群組名稱");
      return;
    }

    if (!userId) {
      alert("請先登入");
      return;
    }

    const result = await createSplitGroup({
      name: name.trim(),
      description: description.trim() || undefined,
      tripId: selectedTripId || undefined,
      createdBy: userId,
      members: selectedMembers,
    });

    if (result.success && result.group) {
      router.push(`/split/${result.group.id}`);
    } else {
      alert(result.error || "建立失敗");
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <div className="min-h-[100dvh] bg-[#F0EEE6] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#F0EEE6]/95 backdrop-blur-sm px-5 py-4 flex items-center gap-4 border-b border-gray-200/50">
        <Link
          href="/split"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm active:scale-95 transition-transform"
        >
          <span className="material-icons-round text-gray-600">arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold text-[#5C5C5C]">新增分帳群組</h1>
      </header>

      {/* Form */}
      <div className="px-5 py-6 space-y-6">
        {/* 群組名稱 */}
        <div>
          <label className="text-sm font-bold text-gray-600 mb-2 block">
            群組名稱 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：陳家餐費、閨蜜購物"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#Cfb9a5] focus:ring-2 focus:ring-[#Cfb9a5]/20 outline-none transition-all text-gray-800"
          />
        </div>

        {/* 群組說明 */}
        <div>
          <label className="text-sm font-bold text-gray-600 mb-2 block">
            群組說明（選填）
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="簡單描述這個分帳群組的用途"
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#Cfb9a5] focus:ring-2 focus:ring-[#Cfb9a5]/20 outline-none transition-all text-gray-800 resize-none"
          />
        </div>

        {/* 關聯旅程 */}
        <div>
          <label className="text-sm font-bold text-gray-600 mb-2 block">
            關聯旅程（選填）
          </label>
          <button
            onClick={() => setShowTripSelector(true)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-left flex items-center justify-between"
          >
            {selectedTrip ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#Cfb9a5] to-[#B8A090] flex items-center justify-center">
                  <span className="material-icons-round text-white text-lg">flight</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{selectedTrip.title}</p>
                  <p className="text-xs text-gray-500">
                    {selectedTrip.start_date} ~ {selectedTrip.end_date}
                  </p>
                </div>
              </div>
            ) : (
              <span className="text-gray-400">選擇旅程（不選則為日常分帳）</span>
            )}
            <span className="material-icons-round text-gray-400">chevron_right</span>
          </button>
          {selectedTrip && (
            <button
              onClick={() => {
                setSelectedTripId(null);
                setSelectedMembers([]);
              }}
              className="mt-2 text-sm text-red-400 flex items-center gap-1"
            >
              <span className="material-icons-round text-sm">close</span>
              取消關聯
            </button>
          )}
        </div>

        {/* 選擇成員（當有選擇旅程時顯示） */}
        {selectedTripId && members.length > 0 && (
          <div>
            <label className="text-sm font-bold text-gray-600 mb-2 block">
              選擇成員
            </label>
            <p className="text-xs text-gray-500 mb-3">
              選擇要加入這個分帳群組的旅伴（可以之後再邀請）
            </p>
            <div className="space-y-2">
              {members
                .filter((m) => m.user_id !== userId)
                .map((member) => (
                  <button
                    key={member.user_id}
                    onClick={() => toggleMember(member.user_id)}
                    className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      selectedMembers.includes(member.user_id)
                        ? "border-[#Cfb9a5] bg-[#Cfb9a5]/10"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      {member.profile?.avatar_url ? (
                        <img
                          src={member.profile.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#Cfb9a5] to-[#B8A090]">
                          <span className="material-icons-round text-white">person</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-800">
                        {member.nickname || member.profile?.display_name || "旅伴"}
                      </p>
                    </div>
                    <span
                      className={`material-icons-round ${
                        selectedMembers.includes(member.user_id)
                          ? "text-[#Cfb9a5]"
                          : "text-gray-300"
                      }`}
                    >
                      {selectedMembers.includes(member.user_id)
                        ? "check_circle"
                        : "radio_button_unchecked"}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部按鈕 */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#F0EEE6]/95 backdrop-blur-sm border-t border-gray-200/50">
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || isLoading}
          className="w-full py-4 bg-[#Cfb9a5] hover:bg-[#c0a996] disabled:bg-gray-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#Cfb9a5]/30 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <span className="material-icons-round animate-spin">sync</span>
              建立中...
            </>
          ) : (
            <>
              <span className="material-icons-round">add</span>
              建立分帳群組
            </>
          )}
        </button>
      </div>

      {/* 旅程選擇器 Modal */}
      {showTripSelector && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowTripSelector(false)}
          />
          <div className="relative w-full max-h-[70vh] bg-white rounded-t-3xl overflow-hidden animate-slide-up">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">選擇旅程</h3>
                <button
                  onClick={() => setShowTripSelector(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <span className="material-icons-round text-gray-600">close</span>
                </button>
              </div>
            </div>
            <div className="p-5 space-y-3 overflow-y-auto max-h-[50vh]">
              {trips.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  還沒有任何旅程
                </p>
              ) : (
                trips.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => {
                      setSelectedTripId(trip.id);
                      setShowTripSelector(false);
                    }}
                    className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${
                      selectedTripId === trip.id
                        ? "border-[#Cfb9a5] bg-[#Cfb9a5]/10"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#Cfb9a5] to-[#B8A090] flex items-center justify-center overflow-hidden">
                      {trip.cover_image ? (
                        <img
                          src={trip.cover_image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-icons-round text-white">flight</span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-gray-800">{trip.title}</p>
                      <p className="text-sm text-gray-500">
                        {trip.start_date} ~ {trip.end_date}
                      </p>
                    </div>
                    {selectedTripId === trip.id && (
                      <span className="material-icons-round text-[#Cfb9a5]">
                        check_circle
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
