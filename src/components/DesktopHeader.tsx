'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useProfileStore, getDisplayAvatar } from '@/stores/profile-store';

function formatDate() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return '早安';
  if (hour < 18) return '午安';
  return '晚安';
}

interface NavItem {
  href: string;
  icon: string;
  activeIcon: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/', icon: 'home', activeIcon: 'home', label: '首頁' },
  { href: '/explore', icon: 'explore', activeIcon: 'explore', label: '探索' },
  { href: '/orders', icon: 'confirmation_number', activeIcon: 'confirmation_number', label: '訂單' },
  { href: '/wishlist', icon: 'auto_fix_high', activeIcon: 'auto_fix_high', label: '許願池' },
  { href: '/my', icon: 'person_outline', activeIcon: 'person', label: '我的' },
];

export default function DesktopHeader() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const [dateString, setDateString] = useState('');
  const [greetingText, setGreetingText] = useState('');

  // 取得顯示名稱和頭像
  const displayName = profile?.display_name || user?.user_metadata?.name || '旅人';
  const avatarUrl = getDisplayAvatar(profile, user?.user_metadata as Record<string, string> | undefined);

  useEffect(() => {
    setDateString(formatDate());
    setGreetingText(getGreeting());
  }, []);

  // 載入 profile
  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  return (
    <header className="hidden xl:flex items-center justify-between py-4 px-8 bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D6CDC8] text-white font-bold flex items-center justify-center">
            V
          </div>
          <span className="text-xl font-bold text-[#5C5C5C]">VENTURO</span>
        </Link>
        <nav className="flex items-center gap-2 ml-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  isActive
                    ? 'bg-[#94A3B8]/15 text-[#94A3B8] font-medium'
                    : 'text-[#949494] hover:bg-white/60 hover:text-[#5C5C5C]'
                }`}
              >
                <span className="material-icons-round text-xl">
                  {isActive ? item.activeIcon : item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-full border border-white/40">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#D6CDC8] text-white font-bold text-sm flex items-center justify-center">
              {displayName.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-[9px] uppercase tracking-wider text-[#949494]">{dateString}</p>
            <p className="text-sm font-medium text-[#5C5C5C]">{greetingText}，{displayName}</p>
          </div>
        </div>
        {user ? (
          <Link href="/my" className="bg-[#E8E2DD] hover:bg-[#DED6CF] text-[#5C5C5C] text-sm py-2.5 px-6 rounded-full transition font-medium">
            個人中心
          </Link>
        ) : (
          <Link href="/login" className="bg-[#94A3B8] hover:bg-[#8291A6] text-white text-sm py-2.5 px-6 rounded-full transition font-medium">
            登入 / 註冊
          </Link>
        )}
      </div>
    </header>
  );
}
