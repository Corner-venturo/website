'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: 'home', activeIcon: 'home', label: '首頁' },
  { href: '/explore', icon: 'explore', activeIcon: 'explore', label: '探索' },
  { href: '/orders', icon: 'confirmation_number', activeIcon: 'confirmation_number', label: '訂單' },
  { href: '/wishlist', icon: 'auto_fix_high', activeIcon: 'auto_fix_high', label: '許願池' },
  { href: '/my', icon: 'person_outline', activeIcon: 'person', label: '我的' },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl rounded-full px-4 py-2 flex justify-around shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/60">
        {navItems.map((item) => {
          const active = isActive(item.href);

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
              <span className="material-icons-round text-2xl">
                {active ? item.activeIcon : item.icon}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
