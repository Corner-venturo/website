"use client";

import { useState, useEffect } from "react";
import MobileNav from "@/components/MobileNav";
import { getSupabaseClient } from "@/lib/supabase";
import {
  ChatHeader,
  UserMessage,
  AIMessage,
  ChatInput,
  JourneyBuilder,
  SuggestionDatabase,
  Message,
  JourneyItem,
  SuggestionItem,
  recommendedTrips,
  kyotoItinerary,
  kyotoSuggestions,
  typeConfig,
  autoReplies,
  WILLIAM_USER_ID,
  WILLIAM_DEFAULT_AVATAR,
} from "./components";

export default function AIPlannerPage() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      type: "ai",
      content:
        "嗨！我是威廉的AI替身 ✨\n\n想去哪裡玩呢？告訴我你想去的國家或城市，我來幫你規劃一趟完美的旅程！",
    },
  ]);
  const [williamAvatar, setWilliamAvatar] = useState<string>(WILLIAM_DEFAULT_AVATAR);

  // 行程相關狀態
  const [journeyItems, setJourneyItems] = useState<JourneyItem[]>([]);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // 取得 William 的頭像
  useEffect(() => {
    const fetchWilliamProfile = async () => {
      if (!WILLIAM_USER_ID) return;

      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, display_name")
        .eq("id", WILLIAM_USER_ID)
        .single();

      if (data?.avatar_url) {
        setWilliamAvatar(data.avatar_url);
      }
    };

    fetchWilliamProfile();
  }, []);

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 新增項目到行程
  const handleAddSuggestion = (item: SuggestionItem) => {
    const newItem: JourneyItem = {
      id: `j-${Date.now()}`,
      day: 1,
      time: getNextTime(journeyItems),
      title: item.title,
      type: item.type,
      description: item.description,
      image: item.image,
    };
    setJourneyItems([...journeyItems, newItem]);
    setIsSuggestionOpen(false);
    showNotification(`已將「${item.title}」加入行程！`);

    // 加入 AI 回覆
    const aiResponse: Message = {
      id: Date.now(),
      type: "ai",
      content: `太棒了！已將「${item.title}」加入你的行程 🎉\n${item.description}`,
    };
    setMessages((prev) => [...prev, aiResponse]);
  };

  // 移除行程項目
  const handleRemoveItem = (id: string) => {
    const item = journeyItems.find((i) => i.id === id);
    setJourneyItems(journeyItems.filter((i) => i.id !== id));
    if (item) {
      showNotification(`已移除「${item.title}」`);
    }
  };

  // 自動生成行程
  const handleAutoGenerate = () => {
    // 使用預設的京都行程資料生成
    const generatedItems: JourneyItem[] = kyotoItinerary
      .slice(0, 2) // 只取前兩天
      .flatMap((day) =>
        day.items.map((item, index) => ({
          id: `auto-${day.day}-${index}`,
          day: day.day,
          time: item.time,
          title: item.title,
          type: item.type as JourneyItem["type"],
          description: item.description,
        }))
      );

    setJourneyItems(generatedItems);
    showNotification("已為你自動生成行程！");

    const aiResponse: Message = {
      id: Date.now(),
      type: "ai",
      content:
        "好的！我已經幫你自動生成了京都兩天的精彩行程 ✨\n\n包含清水寺、和服體驗、伏見稻荷大社等經典景點，你可以自由調整順序或新增其他項目！",
    };
    setMessages((prev) => [...prev, aiResponse]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: inputValue.trim(),
    };

    const input = inputValue.trim().toLowerCase();
    const matchedReply = autoReplies.find((rule) =>
      rule.keywords.some((keyword) => input.includes(keyword.toLowerCase()))
    );

    const aiResponse: Message = {
      id: Date.now() + 1,
      type: "ai",
      content:
        matchedReply?.response ||
        `「${inputValue.trim()}」聽起來很有趣！威廉正在研究這個目的地，之後會有更完整的行程推薦給你～有其他想去的地方也可以告訴我！`,
      showRecommendations: matchedReply?.showRecommendations || false,
    };

    setMessages([...messages, userMessage, aiResponse]);
    setInputValue("");
  };

  const handleTripClick = (tripTitle: string) => {
    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: `我想看「${tripTitle}」的詳細行程`,
    };

    const aiResponse: Message = {
      id: Date.now() + 1,
      type: "ai",
      content: `好的！以下是「${tripTitle}」的完整行程規劃：`,
      showItinerary: true,
      tripTitle: tripTitle,
    };

    setMessages([...messages, userMessage, aiResponse]);
  };

  return (
    <div className="bg-[#F7F5F2] font-sans antialiased text-gray-900 min-h-screen flex flex-col">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-black/80 text-white text-sm rounded-full backdrop-blur-sm">
          {toastMessage}
        </div>
      )}

      {/* 背景紋理 */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-5">
        <img
          alt="Background Texture"
          className="w-full h-full object-cover filter blur-3xl scale-110"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQxdpG2RE5XLEWK6ikPUSOrtPRwSqlSU7iJ6pbjL8J7PW_cnbAoiwIYp6mTaBqkRK3mdYLRXVbNS2VRUP8uJgT-igXHym-u1wTQEMDlwCL3fHMRn2U4GMvmxMX-_aTrnY_-c3u_aoifLUZeMRnTDhVN8WeRyzwtSz7HYK2vgEvLpa7bVPuUZdY_bnLC15Ron7tOGB0esLisiM305SNNU1301EMQh4eugnCtB4j9ZK_jnZsZcxx5Put2e17rOhKmyhvmLCi84G_53Dk"
        />
      </div>

      {/* Header */}
      <ChatHeader avatarUrl={williamAvatar} />

      {/* 主要內容 */}
      <main className="relative z-10 w-full flex-1 flex flex-col pb-28 overflow-hidden">
        {/* 對話區域 */}
        <section className="px-5 pt-2 pb-2 flex flex-col gap-4 max-h-[40vh] overflow-y-auto hide-scrollbar">
          {messages.map((message) => (
            <div key={message.id}>
              {message.type === "user" ? (
                <UserMessage content={message.content} />
              ) : (
                <AIMessage
                  message={message}
                  avatarUrl={williamAvatar}
                  recommendedTrips={recommendedTrips}
                  itinerary={kyotoItinerary}
                  typeConfig={typeConfig}
                  onTripClick={handleTripClick}
                  onAddToItinerary={() => setIsSuggestionOpen(true)}
                />
              )}
            </div>
          ))}
        </section>

        {/* 輸入框 */}
        <div className="px-5 py-2 z-20 sticky top-0">
          <ChatInput value={inputValue} onChange={setInputValue} onSend={handleSendMessage} />
        </div>

        {/* 拼湊你的旅程 */}
        <JourneyBuilder
          items={journeyItems}
          onAddClick={() => setIsSuggestionOpen(true)}
          onRemoveItem={handleRemoveItem}
          onAutoGenerate={handleAutoGenerate}
        />
      </main>

      {/* 底部導航 */}
      <MobileNav />

      {/* 建議資料庫 */}
      <SuggestionDatabase
        isOpen={isSuggestionOpen}
        onClose={() => setIsSuggestionOpen(false)}
        onAddItem={handleAddSuggestion}
        suggestions={kyotoSuggestions}
        destination="京都"
      />

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

// 取得下一個時間（簡單遞增）
function getNextTime(items: JourneyItem[]): string {
  const times = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00", "18:30", "20:00"];
  const usedTimes = items.filter((i) => i.day === 1).map((i) => i.time);
  return times.find((t) => !usedTimes.includes(t)) || "21:00";
}
