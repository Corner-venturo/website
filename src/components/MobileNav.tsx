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
  { href: '/wishlist', icon: 'auto_fix_high', activeIcon: 'auto_fix_high', label: '許願池' },
  { href: '/my', icon: 'person_outline', activeIcon: 'person', label: '我的' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 xl:hidden">
      <div className="bg-white/85 backdrop-blur-xl rounded-full px-8 py-3.5 flex items-center gap-9 shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-white/40">
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
  );
}
