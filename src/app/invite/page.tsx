'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth-store';
import { useFriendsStore } from '@/stores/friends-store';
import { getSupabaseClient } from '@/lib/supabase';

interface InviterProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

function InvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = searchParams.get('ref');

  const { user, initialize, isInitialized } = useAuthStore();
  const { sendFriendRequest } = useFriendsStore();

  const [inviter, setInviter] = useState<InviterProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  // 根據 ref 查詢邀請者的 profile
  useEffect(() => {
    const fetchInviter = async () => {
      if (!ref) {
        setError('無效的邀請連結');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const supabase = getSupabaseClient();

      try {
        // ref 是 user ID 的前 8 個字元，使用 filter 查詢 (需要將 UUID 轉為 text)
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, username, display_name, full_name, avatar_url, bio')
          .filter('id::text', 'ilike', `${ref}%`)
          .maybeSingle();

        if (fetchError) {
          console.error('Fetch error:', fetchError);
          throw fetchError;
        }

        if (!data) {
          setError('找不到此用戶');
        } else {
          setInviter(data);
        }
      } catch (err) {
        console.error('Invite page error:', err);
        setError('載入失敗，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInviter();
  }, [ref]);

  // 發送好友邀請
  const handleAddFriend = async () => {
    if (!user?.id || !inviter?.id) return;

    // 不能加自己
    if (user.id === inviter.id) {
      setRequestError('這是你自己的邀請連結');
      setRequestStatus('error');
      return;
    }

    setRequestStatus('sending');
    setRequestError(null);

    const result = await sendFriendRequest(user.id, inviter.id);

    if (result.success) {
      setRequestStatus('sent');
    } else {
      setRequestError(result.error || '發送失敗');
      setRequestStatus('error');
    }
  };

  // 前往登入
  const handleLogin = () => {
    // 將當前頁面存入 localStorage，登入後可以跳轉回來
    localStorage.setItem('redirect_after_login', `/invite?ref=${ref}`);
    router.push('/login');
  };

  const displayName = inviter?.display_name || inviter?.full_name || inviter?.username || '用戶';

  return (
    <div className="min-h-[100dvh] relative bg-[#F0EEE6] font-sans antialiased text-[#5C5C5C]">
      {/* 背景 */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-96 h-96 bg-[#A5BCCF]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] -right-[10%] w-80 h-80 bg-[#Cfb9a5]/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="px-6 pt-4 pb-4 flex items-center justify-between">
        <Link
          href="/"
          className="w-10 h-10 bg-white/70 backdrop-blur-xl border border-white/60 rounded-full shadow-sm text-gray-600 hover:text-[#Cfb9a5] transition-colors flex items-center justify-center"
        >
          <span className="material-icons-round text-xl">close</span>
        </Link>
        <h1 className="text-lg font-bold text-gray-800 tracking-wide absolute left-1/2 -translate-x-1/2">
          好友邀請
        </h1>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="px-6 pt-8 pb-32">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#cfb9a5] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#949494] mt-4">載入中...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="material-icons-round text-5xl text-[#D6CDC8] mb-4">
              person_off
            </span>
            <p className="text-[#949494] text-base mb-2">{error}</p>
            <Link
              href="/"
              className="mt-4 px-6 py-2.5 rounded-full bg-[#cfb9a5] text-white text-sm font-medium hover:bg-[#b09b88] transition-colors"
            >
              返回首頁
            </Link>
          </div>
        ) : inviter ? (
          <div className="flex flex-col items-center">
            {/* 邀請者頭像 */}
            <div className="relative mb-6">
              {inviter.avatar_url ? (
                <Image
                  src={inviter.avatar_url}
                  alt={displayName}
                  width={120}
                  height={120}
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-[#D6CDC8] flex items-center justify-center text-white font-bold text-4xl ring-4 ring-white shadow-lg">
                  {displayName[0].toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-[#cfb9a5] text-white w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-md">
                <span className="material-icons-round text-xl">waving_hand</span>
              </div>
            </div>

            {/* 邀請者名稱 */}
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{displayName}</h2>
            {inviter.username && (
              <p className="text-sm text-[#cfb9a5] font-medium mb-3">@{inviter.username}</p>
            )}

            {/* 邀請訊息 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 w-full max-w-sm mb-8 text-center border border-white/60 shadow-sm">
              <p className="text-gray-600">
                <span className="font-bold text-gray-800">{displayName}</span> 邀請你一起使用 Venturo
              </p>
              <p className="text-sm text-[#949494] mt-2">成為旅伴，一起探索世界！</p>
            </div>

            {/* Bio */}
            {inviter.bio && (
              <div className="bg-[#E8E2DD]/50 rounded-xl p-4 w-full max-w-sm mb-8 text-center">
                <p className="text-sm text-gray-600 italic">&ldquo;{inviter.bio}&rdquo;</p>
              </div>
            )}

            {/* 操作按鈕 */}
            {user ? (
              // 已登入
              <div className="w-full max-w-sm">
                {requestStatus === 'sent' ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#A8BFA6]/20 flex items-center justify-center">
                      <span className="material-icons-round text-3xl text-[#A8BFA6]">check_circle</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 mb-2">已發送邀請！</p>
                    <p className="text-sm text-[#949494] mb-6">等待 {displayName} 確認</p>
                    <Link
                      href="/my/friends"
                      className="inline-block px-6 py-3 rounded-full bg-[#cfb9a5] text-white font-medium hover:bg-[#b09b88] transition-colors"
                    >
                      查看好友列表
                    </Link>
                  </div>
                ) : requestStatus === 'error' ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#CFA5A5]/20 flex items-center justify-center">
                      <span className="material-icons-round text-3xl text-[#CFA5A5]">info</span>
                    </div>
                    <p className="text-base text-gray-700 mb-4">{requestError}</p>
                    <Link
                      href="/my/friends"
                      className="inline-block px-6 py-3 rounded-full bg-[#cfb9a5] text-white font-medium hover:bg-[#b09b88] transition-colors"
                    >
                      查看好友列表
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleAddFriend}
                    disabled={requestStatus === 'sending'}
                    className="w-full py-4 rounded-3xl bg-[#cfb9a5] hover:bg-[#b09b88] text-white font-bold text-lg shadow-lg shadow-[#cfb9a5]/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {requestStatus === 'sending' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        發送中...
                      </>
                    ) : (
                      <>
                        <span className="material-icons-round">person_add</span>
                        加為好友
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              // 未登入
              <div className="w-full max-w-sm space-y-3">
                <button
                  onClick={handleLogin}
                  className="w-full py-4 rounded-3xl bg-[#cfb9a5] hover:bg-[#b09b88] text-white font-bold text-lg shadow-lg shadow-[#cfb9a5]/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span className="material-icons-round">login</span>
                  登入並加為好友
                </button>
                <Link
                  href="/"
                  className="w-full py-3 rounded-3xl bg-white/70 backdrop-blur-sm border border-white/60 text-gray-600 font-medium flex items-center justify-center hover:bg-white/90 transition-colors"
                >
                  先逛逛
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] bg-[#F0EEE6] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#cfb9a5] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <InvitePageContent />
    </Suspense>
  );
}
