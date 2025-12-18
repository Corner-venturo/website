'use client';

import Link from 'next/link';

const socialLinks = [
  { icon: 'language', label: '官方網站', href: '#' },
  { icon: 'mail', label: '聯絡我們', href: 'mailto:hello@venturo.app' },
];

const legalLinks = [
  { label: '服務條款', href: '#' },
  { label: '隱私權政策', href: '#' },
  { label: '使用者授權合約', href: '#' },
];

export default function AboutPage() {
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
          href="/my/settings"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm text-[#5C5C5C] hover:text-[#94A3B8] transition-colors"
        >
          <span className="material-icons-round text-xl">arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold text-[#5C5C5C]">關於我們</h1>
      </header>

      {/* About Content */}
      <main className="flex-1 px-6 pb-8 overflow-y-auto">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center py-8">
          <div className="w-20 h-20 rounded-2xl bg-[#D6CDC8] text-white font-bold text-3xl flex items-center justify-center shadow-lg mb-4">
            V
          </div>
          <h2 className="text-2xl font-bold text-[#5C5C5C] mb-1">VENTURO</h2>
          <p className="text-sm text-[#949494]">探索世界的每一個角落</p>
        </div>

        {/* Description */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-5 mb-6">
          <p className="text-sm text-[#5C5C5C] leading-relaxed">
            Venturo 是一個專為熱愛旅行的你打造的平台。我們相信每一次旅程都是一段珍貴的回憶，
            無論是獨自探險還是與好友同行，Venturo 都能幫助你輕鬆規劃、記錄和分享你的旅途故事。
          </p>
          <p className="text-sm text-[#5C5C5C] leading-relaxed mt-4">
            從揪團出遊、分帳記錄到行程管理，我們致力於讓每一次的旅行體驗都更加完美。
          </p>
        </div>

        {/* Social Links */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm overflow-hidden mb-6">
          {socialLinks.map((link, index) => (
            <a
              key={link.label}
              href={link.href}
              className={`flex items-center gap-4 p-4 hover:bg-white/40 transition-colors ${
                index !== socialLinks.length - 1 ? 'border-b border-[#E8E2DD]' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#94A3B8]/10 flex items-center justify-center text-[#94A3B8]">
                <span className="material-icons-round">{link.icon}</span>
              </div>
              <span className="font-medium text-[#5C5C5C] text-sm flex-1">{link.label}</span>
              <span className="material-icons-round text-[#C5B6AF]">open_in_new</span>
            </a>
          ))}
        </div>

        {/* Legal Links */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm overflow-hidden mb-6">
          {legalLinks.map((link, index) => (
            <a
              key={link.label}
              href={link.href}
              className={`flex items-center justify-between p-4 hover:bg-white/40 transition-colors ${
                index !== legalLinks.length - 1 ? 'border-b border-[#E8E2DD]' : ''
              }`}
            >
              <span className="font-medium text-[#5C5C5C] text-sm">{link.label}</span>
              <span className="material-icons-round text-[#C5B6AF]">chevron_right</span>
            </a>
          ))}
        </div>

        {/* Version & Copyright */}
        <div className="text-center text-xs text-[#949494] space-y-1">
          <p>版本 1.0.0 (Build 2024.12)</p>
          <p>&copy; 2024 Venturo. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
