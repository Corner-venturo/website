'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MobileNav from '@/components/MobileNav';
import { useAuthStore } from '@/stores/auth-store';
import { useFriendsStore, Friend } from '@/stores/friends-store';

export default function FriendsPage() {
  const { user, initialize, isInitialized } = useAuthStore();
  const {
    friends,
    pendingReceived,
    isLoading,
    fetchFriends,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
  } = useFriendsStore();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  useEffect(() => {
    if (user?.id) {
      fetchFriends(user.id);
    }
  }, [user?.id, fetchFriends]);

  const handleAccept = async (request: Friend) => {
    const result = await acceptFriendRequest(request.id);
    if (result.success) {
      showNotification('已接受好友邀請！');
    } else {
      showNotification(result.error || '操作失敗');
    }
  };

  const handleReject = async (request: Friend) => {
    const result = await rejectFriendRequest(request.id);
    if (result.success) {
      showNotification('已忽略邀請');
    } else {
      showNotification(result.error || '操作失敗');
    }
  };

  const handleRemoveFriend = async (friendship: Friend) => {
    if (confirm(`確定要移除 ${friendship.profile?.display_name || '這位好友'} 嗎？`)) {
      const result = await removeFriend(friendship.id);
      if (result.success) {
        showNotification('已移除好友');
      } else {
        showNotification(result.error || '操作失敗');
      }
    }
  };


  const handleChat = () => {
    showNotification('聊天功能尚未開放');
  };

  // 莫蘭迪色系
  const colors = ['morandi-blue', 'morandi-pink', 'morandi-green', 'morandi-yellow'];
  const getColor = (index: number) => colors[index % colors.length];

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden relative bg-[#F0EEE6] font-sans antialiased text-[#5C5C5C]">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-black/80 text-white text-sm rounded-full backdrop-blur-sm">
          {toastMessage}
        </div>
      )}

      {/* 背景 */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-96 h-96 bg-[#A5BCCF]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] -right-[10%] w-80 h-80 bg-[#Cfb9a5]/20 rounded-full blur-3xl" />
      </div>

      {/* Header - absolute 定位 */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 pt-4 pb-4 flex items-center justify-between">
        <Link
          href="/my"
          className="w-10 h-10 bg-white/70 backdrop-blur-xl border border-white/60 rounded-full shadow-sm text-gray-600 hover:text-[#Cfb9a5] transition-colors flex items-center justify-center"
        >
          <span className="material-icons-round text-xl">arrow_back</span>
        </Link>
        <h1 className="text-lg font-bold text-gray-800 tracking-wide absolute left-1/2 -translate-x-1/2">
          旅行夥伴
        </h1>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="h-full overflow-y-auto pb-36 px-6 pt-16">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#cfb9a5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* 待確認邀請 */}
            {pendingReceived.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    待確認邀請
                  </h3>
                  <span className="w-5 h-5 rounded-full bg-[#CFA5A5] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {pendingReceived.length}
                  </span>
                </div>

                {pendingReceived.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-3xl p-5 shadow-sm border border-white/50 mb-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {request.profile?.avatar_url ? (
                          <Image
                            src={request.profile.avatar_url}
                            alt={request.profile.display_name || ''}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#D6CDC8] flex items-center justify-center text-white font-bold">
                            {(request.profile?.display_name || '?')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-[#E0D6A8] text-white w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="material-icons-round text-[10px]">waving_hand</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-gray-800 truncate">
                          {request.profile?.display_name || request.profile?.full_name || '未知用戶'}
                        </h4>
                        <p className="text-xs text-[#949494] truncate">
                          想成為你的旅伴
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleAccept(request)}
                        className="flex-1 py-2.5 rounded-2xl bg-[#cfb9a5] text-white text-sm font-bold shadow-sm hover:bg-[#b09b88] transition-colors active:scale-95"
                      >
                        接受
                      </button>
                      <button
                        onClick={() => handleReject(request)}
                        className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-500 text-sm font-bold hover:bg-gray-200 transition-colors active:scale-95"
                      >
                        忽略
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* 旅伴列表 */}
            <section className="mb-6">
              {friends.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {friends.map((friend, index) => (
                    <div
                      key={friend.id}
                      className="bg-white rounded-3xl p-4 shadow-sm flex items-center justify-between border border-white/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-br from-[var(--${getColor(index)})]/30 to-transparent shadow-sm`}>
                          {friend.profile?.avatar_url ? (
                            <Image
                              src={friend.profile.avatar_url}
                              alt={friend.profile.display_name || ''}
                              width={56}
                              height={56}
                              className="w-full h-full rounded-[14px] object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-[14px] bg-[#D6CDC8] flex items-center justify-center text-white font-bold text-xl">
                              {(friend.profile?.display_name || '?')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-gray-800 mb-0.5">
                            {friend.profile?.display_name || friend.profile?.full_name || '未知用戶'}
                          </h4>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#A8BFA6]" />
                            <p className="text-xs text-[#949494]">
                              {friend.profile?.location || '探索世界中'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleChat}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-[#cfb9a5] hover:bg-[#cfb9a5]/10 transition-all"
                        >
                          <span className="material-icons-round">chat_bubble</span>
                        </button>
                        <button
                          onClick={() => handleRemoveFriend(friend)}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
                        >
                          <span className="material-icons-round text-xl">person_remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="material-icons-round text-5xl text-[#D6CDC8] mb-3 block">
                    group_off
                  </span>
                  <p className="text-[#949494] text-sm mb-1">還沒有旅伴</p>
                  <p className="text-[#B0B0B0] text-xs">快邀請好友一起探索世界吧！</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* 底部邀請按鈕 */}
      <div className="fixed bottom-24 left-0 w-full p-6 pb-8 bg-gradient-to-t from-[#F0EEE6] via-[#F0EEE6] via-70% to-transparent z-40">
        <Link
          href="/my/friends/invite"
          className="w-full py-4 rounded-3xl bg-[#cfb9a5] hover:bg-[#b09b88] text-white font-bold text-lg shadow-lg shadow-[#cfb9a5]/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <span className="material-icons-round">person_add</span>
          邀請更多旅伴
        </Link>
      </div>

      {/* 底部導航 */}
      <MobileNav />
    </div>
  );
}
