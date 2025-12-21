// 檔案: venturo-online/src/features/messaging/components/DirectMessageChat.tsx
// 目的: 提供一個功能齊全、風格一致的「一對一私訊」UI 元件骨架。

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client'; // 假設您的 Supabase client 在此路徑
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';

// 模擬的訊息類型
interface Message {
  id: number;
  sender_id: string;
  content: string;
  created_at: string;
}

// 模擬的當前使用者和好友資料
const MOCK_CURRENT_USER_ID = 'user-self-001';
const MOCK_FRIEND = {
  id: 'user-friend-002',
  display_name: '黃亞萍',
  avatar_url: 'https://i.pravatar.cc/150?u=friend2'
};

const MOCK_MESSAGES: Message[] = [
    { id: 1, sender_id: 'user-friend-002', content: '嗨，我們晚餐要約哪裡？', created_at: '2025-12-25T10:00:00Z' },
    { id: 2, sender_id: 'user-self-001', content: '都可以啊，看你想吃什麼', created_at: '2025-12-25T10:01:00Z' },
    { id: 3, sender_id: 'user-friend-002', content: '那去吃上次說的那家拉麵如何？🍜', created_at: '2025-12-25T10:02:00Z' },
    { id: 4, sender_id: 'user-self-001', content: '好啊！沒問題！', created_at: '2025-12-25T10:03:00Z' },
];


export function DirectMessageChat() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // TODO: Sprint 2 - 串接 Supabase Realtime
  // useEffect(() => {
  //   const channel = supabase.channel('direct-messages-conversation-id')
  //     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, payload => {
  //       setMessages(currentMessages => [...currentMessages, payload.new as Message]);
  //     })
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, []);

  useEffect(() => {
    // 讓訊息列表自動滾動到底部
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const messageContent = newMessage;
    setNewMessage('');

    // TODO: Sprint 2 - 呼叫後端 API 將訊息存入資料庫
    // try {
    //   const { data, error } = await supabase
    //     .from('direct_messages')
    //     .insert([{ 
    //        conversation_id: 'current_conversation_id', 
    //        sender_id: MOCK_CURRENT_USER_ID, 
    //        content: messageContent 
    //      }]);
    //   if (error) throw error;
    // } catch (error) {
    //   console.error("Error sending message:", error);
    //   // 在這裡可以加入錯誤處理，例如將訊息狀態標為"發送失敗"
    // }
    
    // 為了展示，直接在前端新增訊息
    const tempMessage: Message = {
        id: Date.now(),
        sender_id: MOCK_CURRENT_USER_ID,
        content: messageContent,
        created_at: new Date().toISOString(),
    };
    setMessages(currentMessages => [...currentMessages, tempMessage]);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-primary-light">
        <Avatar className="h-10 w-10">
          <AvatarImage src={MOCK_FRIEND.avatar_url} alt={MOCK_FRIEND.display_name} />
          <AvatarFallback>{MOCK_FRIEND.display_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="ml-4">
          <h2 className="font-semibold text-lg text-foreground">{MOCK_FRIEND.display_name}</h2>
          <p className="text-sm text-morandi-green">在線</p>
        </div>
      </header>

      {/* Message List */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 texture-bg">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-3 ${msg.sender_id === MOCK_CURRENT_USER_ID ? 'justify-end' : 'justify-start'}`}
          >
            {/* 對方頭像 */}
            {msg.sender_id !== MOCK_CURRENT_USER_ID && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={MOCK_FRIEND.avatar_url} alt={MOCK_FRIEND.display_name} />
                <AvatarFallback>{MOCK_FRIEND.display_name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}

            {/* 訊息泡泡 */}
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-soft ${
                msg.sender_id === MOCK_CURRENT_USER_ID
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-white text-foreground rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
            
             {/* 自己的頭像 */}
            {msg.sender_id === MOCK_CURRENT_USER_ID && (
              <Avatar className="h-8 w-8">
                  {/* 可以在此處放置自己的頭像 */}
                  <AvatarFallback>我</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Message Input */}
      <footer className="p-4 border-t border-primary-light bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="輸入訊息..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-primary-light border-0 focus-visible:ring-1 focus-visible:ring-primary"
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
