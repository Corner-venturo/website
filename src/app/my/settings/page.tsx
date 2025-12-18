'use client';

import Link from 'next/link';

const settingsItems = [
  {
    icon: 'person',
    label: '個人資料',
    description: '編輯你的基本資訊',
    href: '/my/profile',
  },
  {
    icon: 'lock',
    label: '修改密碼',
    description: '更新你的登入密碼',
    href: '/my/password',
  },
  {
    icon: 'notifications',
    label: '通知設定',
    description: '管理推播與提醒',
    href: '/my/notifications',
  },
  {
    icon: 'info',
    label: '關於我們',
    description: '了解 Venturo',
    href: '/my/about',
  },
];

export default function SettingsPage() {
  return (
    <div className="bg-[#F5F4F0] font-sans antialiased text-[#5C5C5C] min-h-screen flex flex-col">
      {/* 背景光暈 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
      </div>

      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center gap-4">
        <Link
          href="/my"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm text-[#5C5C5C] hover:text-[#94A3B8] transition-colors"
        >
          <span className="material-icons-round text-xl">arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold text-[#5C5C5C]">設定</h1>
      </header>

      {/* Settings List */}
      <main className="flex-1 px-6 pb-8">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
          {settingsItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-4 p-4 hover:bg-white/40 transition-colors ${
                index !== settingsItems.length - 1 ? 'border-b border-[#E8E2DD]' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#E8E2DD] flex items-center justify-center text-[#949494]">
                <span className="material-icons-round">{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#5C5C5C] text-sm">{item.label}</div>
                <div className="text-xs text-[#949494]">{item.description}</div>
              </div>
              <span className="material-icons-round text-[#C5B6AF]">chevron_right</span>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <button className="w-full mt-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4 flex items-center justify-center gap-2 text-[#C5B6AF] hover:text-[#94A3B8] transition-colors">
          <span className="material-icons-round">logout</span>
          <span className="font-bold text-sm">登出帳號</span>
        </button>

        {/* Version Info */}
        <div className="mt-8 text-center text-xs text-[#949494]">
          <p>VENTURO v1.0.0</p>
        </div>
      </main>
    </div>
  );
}
