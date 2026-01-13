'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import ConfirmModal from '@/components/ConfirmModal';

const settingsItems = [
  {
    icon: 'person',
    label: '個人資料',
    description: '編輯你的基本資訊',
    href: '/my/profile',
  },
  {
    icon: 'translate',
    label: '旅遊便利小卡',
    description: '飲食限制、過敏等多語言小卡',
    href: '/my/travel-cards',
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
  const router = useRouter();
  const { signOut, isLoading } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [showLearnFeature, setShowLearnFeature] = useState(false);

  // 點擊版本號 7 次顯示隱藏功能
  useEffect(() => {
    if (tapCount >= 7) {
      setShowLearnFeature(true);
    }
  }, [tapCount]);

  const handleVersionTap = () => {
    setTapCount((prev) => prev + 1);
    if (tapCount === 6) {
      // 即將解鎖時震動提示（如果支援）
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    setShowLogoutModal(false);
    router.push('/');
  };

  return (
    <div className="bg-[#F0EEE6] font-sans antialiased text-[#5C5C5C] min-h-screen flex flex-col">
      {/* 背景光暈 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
      </div>

      {/* Header */}
      <header className="px-5 pt-4 pb-4 flex items-center gap-4">
        <Link
          href="/my"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm text-[#5C5C5C] hover:text-[#94A3B8] transition-colors"
        >
          <span className="material-icons-round text-xl">arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold text-[#5C5C5C]">設定</h1>
      </header>

      {/* Settings List */}
      <main className="flex-1 px-5 pb-8">
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
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full mt-6 bg-[#CFA5A5]/10 backdrop-blur-xl rounded-2xl border border-[#CFA5A5]/20 shadow-sm p-4 flex items-center justify-center gap-2 text-[#CFA5A5] hover:bg-[#CFA5A5]/20 transition-all active:scale-[0.98]"
        >
          <span className="material-icons-round text-xl">logout</span>
          <span className="font-bold">登出帳號</span>
        </button>

        {/* Logout Confirm Modal */}
        <ConfirmModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
          title="確定要登出嗎？"
          description="登出後需要重新登入才能使用完整功能"
          confirmText="登出"
          cancelText="取消"
          isLoading={isLoading}
          variant="warning"
        />

        {/* Hidden Learn Feature */}
        {showLearnFeature && (
          <Link
            href="/learn"
            className="w-full mt-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-sm p-4 flex items-center gap-4 hover:from-purple-500/20 hover:to-indigo-500/20 transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white">
              <span className="material-icons-round">school</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-purple-700 text-sm">語言學習 (Beta)</div>
              <div className="text-xs text-purple-500">情境式日文學習系統</div>
            </div>
            <span className="material-icons-round text-purple-400">chevron_right</span>
          </Link>
        )}

        {/* Version Info */}
        <div
          className="mt-8 text-center text-xs text-[#949494] cursor-pointer select-none"
          onClick={handleVersionTap}
        >
          <p>VENTURO v1.0.0</p>
          {tapCount > 0 && tapCount < 7 && (
            <p className="text-[10px] mt-1 text-[#C5B6AF]">
              {7 - tapCount} 次後解鎖開發者功能
            </p>
          )}
          {showLearnFeature && (
            <p className="text-[10px] mt-1 text-purple-500">
              已解鎖開發者功能
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
