'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  icon: string
  activeIcon: string
  label: string
}

const navItems: NavItem[] = [
  { href: '/', icon: 'home', activeIcon: 'home', label: '首頁' },
  { href: '/explore', icon: 'explore', activeIcon: 'explore', label: '發現' },
  { href: '/my/chat', icon: 'chat_bubble', activeIcon: 'chat_bubble', label: '訊息' },
  { href: '/my', icon: 'person', activeIcon: 'person', label: '我的' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0]">
      <div className="max-w-md mx-auto h-[72px] flex items-center justify-around px-2">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 ${
            pathname === '/' ? 'text-primary' : 'text-[#64748B]'
          }`}
        >
          <span className={`material-symbols-outlined text-[24px] ${pathname === '/' ? 'font-medium' : 'font-light'}`}>
            home
          </span>
          <span className={`text-[10px] ${pathname === '/' ? 'font-bold' : 'font-medium'}`}>首頁</span>
        </Link>

        {/* Explore */}
        <Link
          href="/explore"
          className={`flex flex-col items-center gap-1 ${
            pathname.startsWith('/explore') ? 'text-primary' : 'text-[#64748B]'
          }`}
        >
          <span className={`material-symbols-outlined text-[24px] ${pathname.startsWith('/explore') ? 'font-medium' : 'font-light'}`}>
            explore
          </span>
          <span className={`text-[10px] ${pathname.startsWith('/explore') ? 'font-bold' : 'font-medium'}`}>發現</span>
        </Link>

        {/* Add Button */}
        <Link href="/explore/create" className="flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined !text-[24px]">add</span>
          </div>
        </Link>

        {/* Messages */}
        <Link
          href="/my/chat"
          className={`flex flex-col items-center gap-1 ${
            pathname.startsWith('/my/chat') ? 'text-primary' : 'text-[#64748B]'
          }`}
        >
          <span className={`material-symbols-outlined text-[24px] ${pathname.startsWith('/my/chat') ? 'font-medium' : 'font-light'}`}>
            chat_bubble
          </span>
          <span className={`text-[10px] ${pathname.startsWith('/my/chat') ? 'font-bold' : 'font-medium'}`}>訊息</span>
        </Link>

        {/* Profile */}
        <Link
          href="/my"
          className={`flex flex-col items-center gap-1 ${
            pathname === '/my' || (pathname.startsWith('/my') && !pathname.startsWith('/my/chat')) ? 'text-primary' : 'text-[#64748B]'
          }`}
        >
          <span className={`material-symbols-outlined text-[24px] ${pathname === '/my' || (pathname.startsWith('/my') && !pathname.startsWith('/my/chat')) ? 'font-medium' : 'font-light'}`}>
            person
          </span>
          <span className={`text-[10px] ${pathname === '/my' || (pathname.startsWith('/my') && !pathname.startsWith('/my/chat')) ? 'font-bold' : 'font-medium'}`}>我的</span>
        </Link>
      </div>
    </nav>
  )
}
