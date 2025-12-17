'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: 'home', label: '首頁' },
  { href: '/explore', icon: 'explore', label: '探索' },
  { href: '/wishlist', icon: 'favorite_border', label: '收藏' },
  { href: '/my', icon: 'person', label: '我的' },
];

interface BottomNavProps {
  onPersonClick?: () => void;
}

export default function BottomNav({ onPersonClick }: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white/80 backdrop-blur-xl rounded-full px-2 py-2 flex justify-around shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/60">
        {navItems.map((item) => {
          const active = isActive(item.href);

          // 如果是「我的」且有 onPersonClick，用 button
          if (item.href === '/my' && onPersonClick) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={onPersonClick}
                className={`flex-1 flex justify-center py-2 transition-colors ${
                  active
                    ? 'text-[#94A3B8]'
                    : 'text-[#B0B0B0] hover:text-[#8C8C8C]'
                }`}
                aria-label={item.label}
              >
                <span className="material-icons-round text-2xl">{item.icon}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex justify-center py-2 transition-colors ${
                active
                  ? 'text-[#94A3B8]'
                  : 'text-[#B0B0B0] hover:text-[#8C8C8C]'
              }`}
              aria-label={item.label}
            >
              <span className="material-icons-round text-2xl">{item.icon}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
