'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth-store';
import { useInvitations, TripInvitation } from '@/hooks/useInvitations';

export default function TripInviteCodePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();

  const { user, initialize, isInitialized } = useAuthStore();
  const { lookupTripInviteCode, joinTripByCode, isLoading } = useInvitations();

  const [invitation, setInvitation] = useState<TripInvitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinResult, setJoinResult] = useState<{
    success: boolean;
    message: string;
    tripId?: string;
  } | null>(null);

  // 初始化 auth
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  // 查詢邀請碼
  useEffect(() => {
    const fetchInvite = async () => {
      if (!code) return;

      const result = await lookupTripInviteCode(code);
      if (result.success && result.data) {
        setInvitation(result.data as TripInvitation);
      } else {
        setError(result.error || '找不到邀請碼');
      }
    };

    fetchInvite();
  }, [code, lookupTripInviteCode]);

  // 加入行程
  const handleJoin = async () => {
    if (!user) {
      // 導向登入頁，並記錄回來的網址
      router.push(`/login?redirect=/invite/trip/${code}`);
      return;
    }

    setIsJoining(true);
    const result = await joinTripByCode(code);
    setIsJoining(false);

    if (result.success) {
      setJoinResult({
        success: true,
        message: result.alreadyMember ? '你已經是這個行程的成員' : '成功加入行程！',
        tripId: result.tripId,
      });
    } else {
      setJoinResult({
        success: false,
        message: result.error || '加入失敗',
      });
    }
  };

  // 前往行程
  const goToTrip = () => {
    if (joinResult?.tripId) {
      router.push(`/orders/${joinResult.tripId}`);
    }
  };

  // 載入中
  if (isLoading && !invitation && !error) {
    return (
      <div className="min-h-[100dvh] bg-[#F0EEE6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#cfb9a5] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">查詢邀請中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="min-h-[100dvh] bg-[#F0EEE6] flex flex-col">
        {/* 背景 */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-96 h-96 bg-[#CFA5A5]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-[20%] -right-[10%] w-80 h-80 bg-[#A5BCCF]/20 rounded-full blur-3xl" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-full bg-[#CFA5A5]/20 flex items-center justify-center mb-6">
            <span className="material-icons-round text-4xl text-[#CFA5A5]">error_outline</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">邀請碼無效</h1>
          <p className="text-gray-500 text-center mb-8">{error}</p>
          <Link
            href="/"
            className="px-8 py-3 bg-[#cfb9a5] text-white font-bold rounded-full shadow-lg shadow-[#cfb9a5]/30 active:scale-95 transition-transform"
          >
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  // 加入成功
  if (joinResult?.success) {
    return (
      <div className="min-h-[100dvh] bg-[#F0EEE6] flex flex-col">
        {/* 背景 */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-96 h-96 bg-[#A8BFA6]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-[20%] -right-[10%] w-80 h-80 bg-[#cfb9a5]/20 rounded-full blur-3xl" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-24 h-24 rounded-full bg-[#A8BFA6]/20 flex items-center justify-center mb-6 animate-bounce">
            <span className="material-icons-round text-5xl text-[#A8BFA6]">celebration</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {joinResult.message}
          </h1>
          <p className="text-gray-500 text-center mb-8">
            {invitation?.trip?.title}
          </p>
          <button
            onClick={goToTrip}
            className="w-full max-w-xs py-4 bg-[#cfb9a5] text-white font-bold rounded-2xl shadow-lg shadow-[#cfb9a5]/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <span className="material-icons-round">arrow_forward</span>
            查看行程
          </button>
        </div>
      </div>
    );
  }

  // 加入失敗
  if (joinResult && !joinResult.success) {
    return (
      <div className="min-h-[100dvh] bg-[#F0EEE6] flex flex-col">
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-96 h-96 bg-[#CFA5A5]/20 rounded-full blur-3xl" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-full bg-[#CFA5A5]/20 flex items-center justify-center mb-6">
            <span className="material-icons-round text-4xl text-[#CFA5A5]">warning</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">加入失敗</h1>
          <p className="text-gray-500 text-center mb-8">{joinResult.message}</p>
          <button
            onClick={() => setJoinResult(null)}
            className="px-8 py-3 bg-gray-200 text-gray-700 font-bold rounded-full active:scale-95 transition-transform"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  // 顯示邀請資訊
  return (
    <div className="min-h-[100dvh] bg-[#F0EEE6] flex flex-col">
      {/* 背景 */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-96 h-96 bg-[#A5BCCF]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] -right-[10%] w-80 h-80 bg-[#cfb9a5]/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="px-6 pt-6 pb-4 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-[#cfb9a5] mb-1">
            <span className="material-icons-round text-xl">flight</span>
            <span className="text-sm font-medium">行程邀請</span>
          </div>
          <p className="text-xs text-gray-400">邀請碼：{code}</p>
        </div>
      </header>

      {/* 主要內容 */}
      <main className="flex-1 px-6 pb-32">
        {invitation && (
          <div className="space-y-6">
            {/* 行程卡片 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
              {/* 行程封面 */}
              <div className="relative h-48">
                {invitation.trip?.cover_image ? (
                  <Image
                    src={invitation.trip.cover_image}
                    alt={invitation.trip.title || ''}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#cfb9a5] to-[#A5BCCF] flex items-center justify-center">
                    <span className="material-icons-round text-6xl text-white/50">flight</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-xl font-bold text-white mb-1">
                    {invitation.trip?.title || '未命名行程'}
                  </h1>
                  {invitation.trip?.start_date && invitation.trip?.end_date && (
                    <p className="text-sm text-white/80 flex items-center gap-1">
                      <span className="material-icons-round text-sm">calendar_today</span>
                      {invitation.trip.start_date} ~ {invitation.trip.end_date}
                    </p>
                  )}
                </div>
              </div>

              {/* 邀請資訊 */}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#D6CDC8]">
                    {invitation.inviter?.avatar_url ? (
                      <Image
                        src={invitation.inviter.avatar_url}
                        alt=""
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {(invitation.inviter?.display_name || '?')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">邀請人</p>
                    <p className="font-bold text-gray-800">
                      {invitation.inviter?.display_name || '用戶'}
                    </p>
                  </div>
                </div>

                {invitation.message && (
                  <div className="bg-[#F5F4F0] rounded-2xl p-4 mb-4">
                    <p className="text-sm text-gray-600 italic">
                      &ldquo;{invitation.message}&rdquo;
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="material-icons-round text-lg text-[#A5BCCF]">schedule</span>
                  <span>
                    邀請有效期至 {new Date(invitation.expires_at).toLocaleDateString('zh-TW', {
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* 未登入提示 */}
            {!user && (
              <div className="bg-[#E0D6A8]/20 rounded-2xl p-4 flex items-start gap-3">
                <span className="material-icons-round text-[#E0D6A8]">info</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">需要登入</p>
                  <p className="text-xs text-gray-500">點擊下方按鈕登入後即可加入行程</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 底部按鈕 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-[#F0EEE6] via-[#F0EEE6] via-70% to-transparent">
        <button
          onClick={handleJoin}
          disabled={isJoining}
          className="w-full py-4 bg-[#cfb9a5] hover:bg-[#b09b88] disabled:bg-gray-300 text-white font-bold text-lg rounded-2xl shadow-lg shadow-[#cfb9a5]/30 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          {isJoining ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              加入中...
            </>
          ) : user ? (
            <>
              <span className="material-icons-round">group_add</span>
              加入行程
            </>
          ) : (
            <>
              <span className="material-icons-round">login</span>
              登入並加入
            </>
          )}
        </button>
      </div>
    </div>
  );
}
