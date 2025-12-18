'use client';

import { useEffect, useState } from 'react';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string; // gradient or solid color
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// 預設徽章定義
export const BADGES: Record<string, Badge> = {
  group_newbie: {
    id: 'group_newbie',
    name: '揪團小白',
    description: '成功發起第一次揪團',
    icon: 'diversity_3',
    color: 'from-[#A8BFA6] to-[#7A9A78]',
    rarity: 'common',
  },
  group_pro: {
    id: 'group_pro',
    name: '揪團達人',
    description: '成功完成 5 次揪團',
    icon: 'emoji_events',
    color: 'from-[#A5BCCD] to-[#6B8FAD]',
    rarity: 'rare',
  },
  popular_host: {
    id: 'popular_host',
    name: '人氣王',
    description: '揪團滿員達 3 次',
    icon: 'star',
    color: 'from-[#E0D6A8] to-[#C4B87A]',
    rarity: 'rare',
  },
  group_master: {
    id: 'group_master',
    name: '揪團大師',
    description: '成功完成 20 次揪團',
    icon: 'diamond',
    color: 'from-[#C4B8E0] to-[#9B8BC4]',
    rarity: 'epic',
  },
  founding_member: {
    id: 'founding_member',
    name: '創始會員',
    description: '早期加入的珍貴夥伴',
    icon: 'workspace_premium',
    color: 'from-[#FFD700] to-[#FFA500]',
    rarity: 'legendary',
  },
};

const rarityConfig = {
  common: { label: '普通', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
  rare: { label: '稀有', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
  epic: { label: '史詩', bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
  legendary: { label: '傳說', bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
};

interface BadgeNotificationProps {
  badge: Badge;
  isOpen: boolean;
  onClose: () => void;
}

export default function BadgeNotification({ badge, isOpen, onClose }: BadgeNotificationProps) {
  const [showContent, setShowContent] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const rarity = rarityConfig[badge.rarity];

  useEffect(() => {
    if (isOpen) {
      // 動畫序列
      setTimeout(() => setShowContent(true), 100);
      setTimeout(() => setShowBadge(true), 400);
    } else {
      setShowContent(false);
      setShowBadge(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 內容 */}
      <div
        className={`relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 ${
          showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        {/* 頂部光效 */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#F5F4F0] to-transparent" />

        {/* 裝飾粒子 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-float"
              style={{
                left: `${10 + (i * 8)}%`,
                top: `${20 + (i % 3) * 15}%`,
                backgroundColor: i % 2 === 0 ? '#FFD700' : '#FFA500',
                opacity: 0.6,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${2 + (i % 3)}s`,
              }}
            />
          ))}
        </div>

        {/* 主要內容 */}
        <div className="relative pt-8 pb-6 px-6 text-center">
          {/* 標題 */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-xs font-bold mb-2">
              🎉 恭喜獲得新徽章！
            </span>
          </div>

          {/* 徽章 */}
          <div
            className={`relative mx-auto mb-6 transition-all duration-700 ${
              showBadge ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
          >
            {/* 光環效果 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${badge.color} opacity-20 animate-pulse`} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-28 h-28 rounded-full bg-gradient-to-r ${badge.color} opacity-30 animate-ping`} style={{ animationDuration: '2s' }} />
            </div>

            {/* 徽章本體 */}
            <div className={`relative w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${badge.color} shadow-lg flex items-center justify-center`}>
              <span className="material-icons-round text-white text-5xl drop-shadow-lg">
                {badge.icon}
              </span>
            </div>
          </div>

          {/* 徽章名稱 */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{badge.name}</h2>

          {/* 稀有度 */}
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${rarity.bgColor} ${rarity.textColor} mb-3`}>
            {rarity.label}
          </span>

          {/* 描述 */}
          <p className="text-gray-500 text-sm mb-6">{badge.description}</p>

          {/* 按鈕 */}
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#Cfb9a5] to-[#b09b88] text-white font-bold shadow-lg shadow-[#Cfb9a5]/30 hover:shadow-xl transition-shadow active:scale-95"
          >
            太棒了！
          </button>
        </div>
      </div>

      {/* 動畫樣式 */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
