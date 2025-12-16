'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  label: string;
}

const navItems: NavItem[] = [
  { href: '/', label: '首頁' },
  { href: '/explore', label: '探索' },
  { href: '/destinations', label: '目的地' },
  { href: '/articles', label: '旅遊靈感' },
];

export default function DesktopHeader() {
  const pathname = usePathname();
  const [dateString, setDateString] = useState('');
  const [greetingText, setGreetingText] = useState('');
  const [userName] = useState('旅人');

  useEffect(() => {
    setDateString(formatDate());
    setGreetingText(getGreeting());
  }, []);

  return (
    <header className="hidden xl:flex items-center justify-between py-4 px-8 bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D6CDC8] text-white font-bold flex items-center justify-center">
            V
          </div>
          <span className="text-xl font-bold text-[#5C5C5C]">VENTURO</span>
        </Link>
        <nav className="flex items-center gap-8 ml-12">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? 'text-[#94A3B8] font-medium border-b-2 border-[#94A3B8] pb-1'
                    : 'text-[#949494] hover:text-[#5C5C5C] transition'
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-full border border-white/40">
          <div className="w-8 h-8 rounded-full bg-[#D6CDC8] text-white font-bold text-sm flex items-center justify-center">
            {userName.charAt(0)}
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-[#949494]">{dateString}</p>
            <p className="text-sm font-medium text-[#5C5C5C]">{greetingText}，{userName}</p>
          </div>
        </div>
        <Link href="/login" className="bg-[#94A3B8] hover:bg-[#8291A6] text-white text-sm py-2.5 px-6 rounded-full transition font-medium">
          登入 / 註冊
        </Link>
      </div>
    </header>
  );
}
