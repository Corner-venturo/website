"use client";

import { useState, useEffect, useRef } from "react";
import MobileNav from "@/components/MobileNav";
import { getSupabaseClient } from "@/lib/supabase";
import {
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
  const [williamAvatar, setWilliamAvatar] = useState<string>(WILLIAM_DEFAULT_AVATAR);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滾動到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 每當 messages 更新時，滾動到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#F7F5F2] font-sans antialiased text-gray-900">
      {/* 背景紋理 */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-5">
        <img
          alt="Background Texture"
          className="w-full h-full object-cover filter blur-3xl scale-110"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQxdpG2RE5XLEWK6ikPUSOrtPRwSqlSU7iJ6pbjL8J7PW_cnbAoiwIYp6mTaBqkRK3mdYLRXVbNS2VRUP8uJgT-igXHym-u1wTQEMDlwCL3fHMRn2U4GMvmxMX-_aTrnY_-c3u_aoifLUZeMRnTDhVN8WeRyzwtSz7HYK2vgEvLpa7bVPuUZdY_bnLC15Ron7tOGB0esLisiM305SNNU1301EMQh4eugnCtB4j9ZK_jnZsZcxx5Put2e17rOhKmyhvmLCi84G_53Dk"
        />
      </div>

      {/* 對話區域 - 可滾動 */}
      <main className="h-full overflow-y-auto relative z-10 px-5 pt-14 pb-40 hide-scrollbar">
        <div className="flex flex-col gap-4">
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
                  onAddToItinerary={() => {}}
                />
              )}
            </div>
          ))}
          {/* 滾動錨點 */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 固定輸入框 - 在 MobileNav 上方 */}
      <div className="fixed bottom-24 left-0 right-0 z-20 px-5 py-3 bg-gradient-to-t from-[#F7F5F2] via-[#F7F5F2] to-transparent">
        <ChatInput value={inputValue} onChange={setInputValue} onSend={handleSendMessage} />
      </div>

      {/* 底部導航 */}
      <MobileNav />

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
