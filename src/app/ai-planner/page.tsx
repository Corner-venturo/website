"use client";

import { useState, useEffect } from "react";
import MobileNav from "@/components/MobileNav";
import SideDrawer from "@/components/SideDrawer";
import { DrawerItem } from "@/types/wishlist.types";
import { getSupabaseClient } from "@/lib/supabase";
import {
  ChatHeader,
  UserMessage,
  AIMessage,
  ChatInput,
  Message,
  recommendedTrips,
  kyotoItinerary,
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [addedItems, setAddedItems] = useState<DrawerItem[]>([]);
  const [williamAvatar, setWilliamAvatar] = useState<string>(WILLIAM_DEFAULT_AVATAR);

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

  const handleAddItem = (item: DrawerItem) => {
    setAddedItems([...addedItems, item]);
    const aiResponse: Message = {
      id: Date.now(),
      type: "ai",
      content: `已將「${item.name}」加入行程！${item.description}`,
    };
    setMessages((prev) => [...prev, aiResponse]);
    setIsDrawerOpen(false);
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
      <main className="relative z-10 w-full flex-1 flex flex-col pb-40 overflow-hidden">
        {/* 對話區域 */}
        {messages.length > 0 && (
          <section className="px-5 pt-2 pb-2 flex flex-col gap-4 overflow-y-auto hide-scrollbar flex-1">
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
                    onAddToItinerary={() => setIsDrawerOpen(true)}
                  />
                )}
              </div>
            ))}
          </section>
        )}
      </main>

      {/* 底部輸入框 */}
      <ChatInput value={inputValue} onChange={setInputValue} onSend={handleSendMessage} />

      {/* 底部導航 */}
      <MobileNav />

      {/* 新增景點抽屜 */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectItem={handleAddItem}
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
