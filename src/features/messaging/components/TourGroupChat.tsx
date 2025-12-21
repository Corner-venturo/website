// 檔案: venturo-online/src/features/messaging/components/TourGroupChat.tsx
// 目的: 提供一個功能齊全、風格一致的「旅遊團訊息」UI 元件骨架。

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client'; // 假設您的 Supabase client 在此路徑
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils'; // 假設您有 cn 函數來合併 class

// 模擬的訊息類型
interface GroupMessage {
  id: number;
  sender_id: string;
  content: string;
  created_at: string;
  sender: { // 發送者資訊
    display_name: string;
    avatar_url?: string;
    is_leader: boolean;
  }
}

// 模擬的當前使用者和團員資料
const MOCK_CURRENT_USER_ID = 'user-self-001';
const MOCK_TOUR_LEADER_ID = 'user-leader-007';
const MOCK_MESSAGES: GroupMessage[] = [
    { id: 1, sender_id: MOCK_TOUR_LEADER_ID, content: '大家好！歡迎參加本次的日本關西五日遊，請大家先確認一下自己的護照喔！', created_at: '2025-12-25T09:00:00Z', sender: { display_name: '廖人頡 (領隊)', is_leader: true, avatar_url: 'https://i.pravatar.cc/150?u=leader' } },
    { id: 2, sender_id: 'user-friend-002', content: '收到！好期待！', created_at: '2025-12-25T09:01:00Z', sender: { display_name: '黃亞萍', is_leader: false, avatar_url: 'https://i.pravatar.cc/150?u=friend2' } },
    { id: 3, sender_id: 'user-other-003', content: '請問機場集合時間是幾點？', created_at: '2025-12-25T09:05:00Z', sender: { display_name: '林熙捷', is_leader: false, avatar_url: 'https://i.pravatar.cc/150?u=friend3' } },
    { id: 4, sender_id: MOCK_TOUR_LEADER_ID, content: '我們是早上 6:30 在桃園機場第一航廈集合喔！', created_at: '2025-12-25T09:06:00Z', sender: { display_name: '廖人頡 (領隊)', is_leader: true, avatar_url: 'https://i.pravatar.cc/150?u=leader' } },
];


export function TourGroupChat() {
  const [messages, setMessages] = useState<GroupMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // TODO: Sprint 2 - 串接 Supabase Realtime Broadcast
  // useEffect(() => {
  //   const channel = supabase.channel('tour-group-chat-tour-id');
  //   channel
  //     .on('broadcast', { event: 'new-message' }, (payload) => {
  //       setMessages(currentMessages => [...currentMessages, payload.message as GroupMessage]);
  //     })
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const messageContent = newMessage;
    setNewMessage('');

    // TODO: Sprint 2 - 呼叫後端 API 或 broadcast 將訊息送出
    // try {
    //   const channel = supabase.channel('tour-group-chat-tour-id');
    //   await channel.send({
    //     type: 'broadcast',
    //     event: 'new-message',
    //     payload: { message: { ... } }, // 包含發送者資訊
    //   });
    // } catch (error) {
    //   console.error("Error sending message:", error);
    // }

    // 為了展示，直接在前端新增訊息
    const tempMessage: GroupMessage = {
        id: Date.now(),
        sender_id: MOCK_CURRENT_USER_ID,
        content: messageContent,
        created_at: new Date().toISOString(),
        sender: {
            display_name: '我',
            is_leader: false, // 假設當前使用者不是領隊
        }
    };
    setMessages(currentMessages => [...currentMessages, tempMessage]);
  };

  return (
    <div className="flex flex-col h-full bg-primary-light">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-primary-light bg-white shadow-sm">
        <div>
          <h2 className="font-semibold text-lg text-foreground">日本關西五日遊 - 團隊聊天室</h2>
          <p className="text-sm text-morandi-green">15 位成員在線</p>
        </div>
      </header>

      {/* Message List */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => {
          const isSelf = msg.sender_id === MOCK_CURRENT_USER_ID;
          const isLeader = msg.sender.is_leader;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isSelf ? 'justify-end' : 'justify-start'}`}
            >
              {/* 非自己的訊息顯示頭像和名字 */}
              {!isSelf && (
                <Avatar className="h-9 w-9">
                  <AvatarImage src={msg.sender.avatar_url} alt={msg.sender.display_name} />
                  <AvatarFallback>{msg.sender.display_name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}

              <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                {!isSelf && (
                   <p className={`text-xs text-foreground/60 mb-1 ${isLeader ? 'font-semibold text-primary-dark' : ''}`}>
                    {msg.sender.display_name}
                  </p>
                )}
                
                {/* 領隊公告的特殊樣式 */}
                {isLeader ? (
                    <div className="bg-white border-l-4 border-morandi-blue p-4 rounded-lg shadow-soft max-w-xs md:max-w-md">
                        <div className="flex items-center mb-2">
                            <Megaphone className="h-5 w-5 text-morandi-blue mr-2"/>
                            <h3 className="font-semibold text-morandi-blue">領隊公告</h3>
                        </div>
                        <p className="text-sm text-foreground/90">{msg.content}</p>
                    </div>
                ) : (
                    <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-soft ${
                        isSelf
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white text-foreground rounded-bl-none'
                    }`}
                    >
                    <p className="text-sm">{msg.content}</p>
                    </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Message Input */}
      <footer className="p-4 border-t border-primary-light bg-white/80 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="在團隊聊天室發送訊息..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-white border-gray-300 focus-visible:ring-1 focus-visible:ring-primary"
            autoComplete="off"
          />
          <Button type="submit" className="bg-primary hover:bg-primary-dark" size="icon">
            <SendHorizonal className="h-5 w-5 text-white" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
