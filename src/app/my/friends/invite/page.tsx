'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useProfileStore } from '@/stores/profile-store';
import { useFriendsStore } from '@/stores/friends-store';
import { useTripStore } from '@/stores/trip-store';
import { useInvitations } from '@/hooks/useInvitations';

function InvitePageContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get('tripId');

  const { user, initialize, isInitialized } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const { sendFriendRequest, searchUsers } = useFriendsStore();
  const { currentTrip, fetchTripById, addTripMember } = useTripStore();
  const { sendTripInvitation } = useInvitations();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; display_name: string | null; avatar_url: string | null; username?: string | null }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  // 行程邀請碼相關
  const [tripInviteCode, setTripInviteCode] = useState<string | null>(null);
  const [tripInviteLink, setTripInviteLink] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  // 如果有 tripId，載入行程資訊
  useEffect(() => {
    if (tripId) {
      fetchTripById(tripId);
    }
  }, [tripId, fetchTripById]);

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 搜尋用戶
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || !user?.id) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUsers(query, user.id);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 發送好友邀請（如果有 tripId，也加入行程）
  const handleSendRequest = async (friendId: string) => {
    if (!user?.id) return;

    // 發送好友邀請
    const result = await sendFriendRequest(user.id, friendId);

    // 如果有 tripId，將好友加入行程
    if (tripId) {
      const tripResult = await addTripMember(tripId, friendId, 'member');
      if (tripResult.success) {
        setSentRequests(prev => new Set(prev).add(friendId));
        showNotification('已邀請加入行程！');
      } else {
        showNotification(tripResult.error || '加入行程失敗');
      }
    } else if (result.success) {
      setSentRequests(prev => new Set(prev).add(friendId));
      showNotification('已發送邀請！');
    } else {
      showNotification(result.error || '發送失敗');
    }
  };

  // 分享邀請連結
  const handleShareLink = async () => {
    const username = profile?.username;
    const inviteUrl = username
      ? `${window.location.origin}/invite/${username}`
      : `${window.location.origin}/invite?ref=${user?.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Venturo 邀請',
          text: `來 Venturo 一起探索世界吧！`,
          url: inviteUrl,
        });
      } catch {
        // 用戶取消分享
      }
    } else {
      // 複製到剪貼簿
      await navigator.clipboard.writeText(inviteUrl);
      showNotification('已複製邀請連結！');
    }
  };

  // 產生邀請連結
  const getInviteUrl = () => {
    const username = profile?.username;
    if (username) {
      return `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${username}`;
    }
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/invite?ref=${user?.id || ''}`;
  };

  // 產生行程邀請碼
  const handleGenerateTripCode = async () => {
    if (!tripId) return;

    setIsGeneratingCode(true);
    const result = await sendTripInvitation({
      tripId,
      generateCode: true,
      message: `來加入「${currentTrip?.title || '我的行程'}」一起旅行吧！`,
    });

    if (result.success && result.data) {
      setTripInviteCode(result.data.invite_code);
      setTripInviteLink(result.inviteLink || `${window.location.origin}/invite/trip/${result.data.invite_code}`);
      showNotification('已產生邀請碼！');
    } else {
      showNotification(result.error || '產生邀請碼失敗');
    }
    setIsGeneratingCode(false);
  };

  // 分享行程邀請連結
  const handleShareTripLink = async () => {
    const link = tripInviteLink || `${window.location.origin}/invite/trip/${tripInviteCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentTrip?.title || '行程邀請'} - Venturo`,
          text: `來加入「${currentTrip?.title || '我的行程'}」一起旅行吧！`,
          url: link,
        });
      } catch {
        // 用戶取消分享
      }
    } else {
      await navigator.clipboard.writeText(link);
      showNotification('已複製邀請連結！');
    }
  };

  // 複製邀請碼
  const handleCopyCode = async () => {
    if (tripInviteCode) {
      await navigator.clipboard.writeText(tripInviteCode);
      showNotification('已複製邀請碼！');
    }
  };

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
          href={tripId ? `/orders/${tripId}` : '/my/friends'}
          className="w-10 h-10 bg-white/70 backdrop-blur-xl border border-white/60 rounded-full shadow-sm text-gray-600 hover:text-[#Cfb9a5] transition-colors flex items-center justify-center"
        >
          <span className="material-icons-round text-xl">close</span>
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-800 tracking-wide">
            {tripId ? '邀請旅伴' : '邀請夥伴'}
          </h1>
          {tripId && currentTrip && (
            <p className="text-xs text-gray-500">{currentTrip.title}</p>
          )}
        </div>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="h-full overflow-y-auto pt-16 pb-36 px-6">
        {/* 搜尋 APP 用戶 */}
        <section className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
            搜尋 APP 用戶
          </h3>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-white/50">
            <div className="relative">
              <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="輸入用戶名稱或 @username"
                className="w-full pl-10 pr-4 py-3 bg-[#F5F4F0] rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#cfb9a5]/50"
              />
            </div>

            {/* 搜尋結果 */}
            {isSearching ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-5 h-5 border-2 border-[#cfb9a5] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="mt-4 space-y-3">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-3 bg-[#F5F4F0] rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      {result.avatar_url ? (
                        <Image
                          src={result.avatar_url}
                          alt={result.display_name || ''}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#D6CDC8] flex items-center justify-center text-white font-bold">
                          {(result.display_name || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {result.display_name || '未命名用戶'}
                        </p>
                        {result.username && (
                          <p className="text-xs text-gray-400">@{result.username}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendRequest(result.id)}
                      disabled={sentRequests.has(result.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                        sentRequests.has(result.id)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#cfb9a5] text-white hover:bg-[#b09b88] active:scale-95'
                      }`}
                    >
                      {sentRequests.has(result.id) ? '已邀請' : '邀請'}
                    </button>
                  </div>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <p className="text-center text-sm text-gray-400 py-6">找不到符合的用戶</p>
            ) : null}
          </div>
        </section>

        {/* 行程邀請碼（只有 tripId 時顯示） */}
        {tripId && (
          <section className="mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
              行程邀請碼
            </h3>
            <div className="bg-white rounded-2xl shadow-sm border border-white/50 overflow-hidden">
              {tripInviteCode ? (
                // 已有邀請碼
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">邀請碼</p>
                      <p className="text-2xl font-bold text-[#cfb9a5] tracking-widest">{tripInviteCode}</p>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="w-10 h-10 rounded-full bg-[#cfb9a5]/10 flex items-center justify-center text-[#cfb9a5] active:scale-95 transition-transform"
                    >
                      <span className="material-icons-round">content_copy</span>
                    </button>
                  </div>

                  {/* QR Code */}
                  <div className="bg-[#F5F4F0] rounded-xl p-4 flex flex-col items-center mb-4">
                    <QRCodeSVG
                      value={tripInviteLink || `${window.location.origin}/invite/trip/${tripInviteCode}`}
                      size={140}
                      level="M"
                      includeMargin={false}
                      bgColor="#F5F4F0"
                      fgColor="#5C5C5C"
                    />
                    <p className="text-xs text-gray-400 mt-3">掃描加入 {currentTrip?.title}</p>
                  </div>

                  {/* 分享按鈕 */}
                  <button
                    onClick={handleShareTripLink}
                    className="w-full py-3 bg-[#cfb9a5] text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <span className="material-icons-round">share</span>
                    分享邀請連結
                  </button>
                </div>
              ) : (
                // 尚未產生邀請碼
                <button
                  onClick={handleGenerateTripCode}
                  disabled={isGeneratingCode}
                  className="w-full p-5 flex items-center gap-4 hover:bg-white/80 transition-colors active:scale-[0.98] disabled:opacity-60"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#cfb9a5] to-[#A5BCCF] flex items-center justify-center">
                    {isGeneratingCode ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-icons-round text-white">vpn_key</span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-800">產生邀請碼</p>
                    <p className="text-xs text-gray-400">讓任何人都能透過連結加入行程</p>
                  </div>
                  <span className="material-icons-round text-gray-300">arrow_forward</span>
                </button>
              )}
            </div>
          </section>
        )}

        {/* 其他邀請方式 */}
        <section className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
            其他邀請方式
          </h3>
          <div className="space-y-3">
            {/* 從手機聯絡人邀請 - 尚未開放 */}
            <button
              onClick={() => showNotification('此功能尚未開放')}
              className="w-full bg-white rounded-2xl p-4 shadow-sm border border-white/50 flex items-center gap-4 opacity-60"
            >
              <div className="w-12 h-12 rounded-xl bg-[#E8E2DD] flex items-center justify-center">
                <span className="material-icons-round text-[#949494]">contacts</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-800">從手機聯絡人邀請</p>
                <p className="text-xs text-gray-400">尚未開放</p>
              </div>
              <span className="material-icons-round text-gray-300">chevron_right</span>
            </button>

            {/* 分享邀請連結 */}
            <button
              onClick={handleShareLink}
              className="w-full bg-white rounded-2xl p-4 shadow-sm border border-white/50 flex items-center gap-4 hover:bg-white/80 transition-colors active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#cfb9a5]/20 flex items-center justify-center">
                <span className="material-icons-round text-[#cfb9a5]">share</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-800">分享邀請連結</p>
                <p className="text-xs text-gray-400">複製連結分享給朋友</p>
              </div>
              <span className="material-icons-round text-gray-300">chevron_right</span>
            </button>

            {/* 顯示 QR Code */}
            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm border border-white/50 flex items-center gap-4 hover:bg-white/80 transition-colors active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#A5BCCF]/20 flex items-center justify-center">
                <span className="material-icons-round text-[#A5BCCF]">qr_code_2</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-800">顯示 QR Code</p>
                <p className="text-xs text-gray-400">讓朋友掃描加入</p>
              </div>
              <span className={`material-icons-round text-gray-300 transition-transform ${showQRCode ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {/* QR Code 展開區 */}
            {showQRCode && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-white/50 flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100">
                  <QRCodeSVG
                    value={getInviteUrl()}
                    size={180}
                    level="M"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#5C5C5C"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">
                  掃描 QR Code 即可加入 Venturo
                </p>
                {profile?.username && (
                  <p className="text-sm text-[#cfb9a5] font-medium mt-2">
                    @{profile.username}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 你的用戶名 */}
        {profile?.username && (
          <section className="mb-6">
            <div className="bg-gradient-to-r from-[#cfb9a5]/10 to-[#A5BCCF]/10 rounded-2xl p-4 border border-white/50">
              <div className="flex items-center gap-3">
                <span className="material-icons-round text-[#cfb9a5]">alternate_email</span>
                <div>
                  <p className="text-xs text-gray-500">你的用戶名</p>
                  <p className="text-base font-bold text-gray-800">@{profile.username}</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 底部完成按鈕 */}
      <div className="fixed bottom-0 left-0 w-full p-6 pb-10 bg-gradient-to-t from-[#F0EEE6] via-[#F0EEE6] via-70% to-transparent z-40">
        <Link
          href={tripId ? `/orders/${tripId}` : '/my/friends'}
          className="w-full py-4 rounded-3xl bg-[#cfb9a5] hover:bg-[#b09b88] text-white font-bold text-lg shadow-lg shadow-[#cfb9a5]/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          完成
        </Link>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] bg-[#F0EEE6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#Cfb9a5]"></div>
      </div>
    }>
      <InvitePageContent />
    </Suspense>
  );
}
