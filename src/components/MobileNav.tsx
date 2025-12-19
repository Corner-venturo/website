'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  icon: string;
  activeIcon: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/', icon: 'home', activeIcon: 'home', label: '首頁' },
  { href: '/explore', icon: 'explore', activeIcon: 'explore', label: '探索' },
  { href: '/ai-planner', icon: 'auto_awesome', activeIcon: 'auto_awesome', label: 'AI' },
  { href: '/orders', icon: 'confirmation_number', activeIcon: 'confirmation_number', label: '訂單' },
  { href: '/my', icon: 'person_outline', activeIcon: 'person', label: '我的' },
];

export default function MobileNav() {
  const pathname = usePathname();

  // 不顯示漸變遮罩的頁面（首頁、探索頁、AI頁、有自己底部按鈕的頁面）
  const hideGradientPages = ['/', '/explore', '/ai-planner', '/my/footprint/record'];
  const showGradient = !hideGradientPages.some(page => pathname === page || pathname.startsWith(page + '/'));

  return (
    <>
      {/* 漸變遮罩 */}
      {showGradient && (
        <div className="fixed bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#F0EEE6] from-30% via-[#F0EEE6]/90 via-50% to-transparent pointer-events-none z-40 xl:hidden" />
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 xl:hidden flex justify-center pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="bg-white/85 backdrop-blur-xl rounded-full px-6 py-3.5 flex items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-white/40">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors relative ${
                isActive
                  ? 'text-primary transform scale-110'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={item.label}
            >
              <span className="material-icons-round text-2xl">
                {isActive ? item.activeIcon : item.icon}
              </span>
              {isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-morandi-pink rounded-full border border-white" />
              )}
            </Link>
          );
        })}
      </div>
      </nav>
    </>
  );
}
