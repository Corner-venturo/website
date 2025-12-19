'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth-store';
import { useFriendsStore } from '@/stores/friends-store';

interface TravelBuddiesProps {
  isLoggedIn: boolean;
}

// 展示用假資料
const demoFriends = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop',
];

export default function TravelBuddies({ isLoggedIn }: TravelBuddiesProps) {
  const { user } = useAuthStore();
  const { friends, pendingReceived, fetchFriends } = useFriendsStore();

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      fetchFriends(user.id);
    }
  }, [isLoggedIn, user?.id, fetchFriends]);

  const friendCount = isLoggedIn ? friends.length : demoFriends.length;
  const pendingCount = isLoggedIn ? pendingReceived.length : 0;

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-[#5C5C5C] text-sm flex items-center gap-1.5">
          <span className="material-icons-round text-[#C5B6AF] text-base">favorite</span>
          我的旅伴
          {pendingCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#CFA5A5] text-white text-[10px] font-bold flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </h3>
        <Link href="/my/friends" className="text-xs text-[#949494] hover:text-[#cfb9a5] flex items-center">
          {friendCount} 位好友
          <span className="material-icons-round text-sm ml-0.5">chevron_right</span>
        </Link>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
        <Link
          href="/my/friends"
          className="shrink-0 w-12 h-12 rounded-full border border-dashed border-[#D8D0C9] flex items-center justify-center text-[#949494] hover:border-[#94A3B8] hover:text-[#94A3B8] transition-colors"
          aria-label="新增好友"
        >
          <span className="material-icons-round">person_add</span>
        </Link>

        {isLoggedIn ? (
          friends.length > 0 ? (
            friends.slice(0, 6).map((friend, index) => (
              <Link key={friend.id} href="/my/friends" className="shrink-0 relative">
                {friend.profile?.avatar_url ? (
                  <Image
                    src={friend.profile.avatar_url}
                    alt={friend.profile.display_name || ''}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#D6CDC8] ring-2 ring-white flex items-center justify-center text-white font-bold">
                    {(friend.profile?.display_name || '?')[0].toUpperCase()}
                  </div>
                )}
                {index === 0 && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#A8BCA1] border-2 border-white rounded-full" />
                )}
              </Link>
            ))
          ) : (
            <span className="text-sm text-[#949494]">還沒有旅伴，快來邀請好友吧！</span>
          )
        ) : (
          // 展示模式顯示假資料
          demoFriends.map((friend, index) => (
            <div key={`demo-friend-${index}`} className="shrink-0 relative">
              <Image
                src={friend}
                alt="Friend"
                width={48}
                height={48}
                className={`w-12 h-12 rounded-full object-cover ring-2 ring-white ${
                  index === demoFriends.length - 1 ? 'grayscale opacity-70' : ''
                }`}
              />
              {index === 0 && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#A8BCA1] border-2 border-white rounded-full" />
              )}
            </div>
          ))
        )}

        {/* 顯示更多按鈕 */}
        {((isLoggedIn && friends.length > 6) || (!isLoggedIn && demoFriends.length > 4)) && (
          <Link
            href="/my/friends"
            className="shrink-0 w-12 h-12 rounded-full bg-[#F5F4F0] flex items-center justify-center text-[#949494] hover:bg-[#E8E2DD] transition-colors"
          >
            <span className="text-xs font-bold">+{isLoggedIn ? friends.length - 6 : '...'}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
