'use client';

import { useState } from 'react';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';

const allAchievements = [
  { icon: 'hiking', label: '百岳挑戰', color: 'bg-[#A8BFA6]', rotate: 'rotate-3', level: 3, earned: true },
  { icon: 'photo_camera', label: '攝影大師', color: 'bg-[#A5BCCF]', rotate: '-rotate-2', level: 5, earned: true, featured: true },
  { icon: 'restaurant', label: '美食家', color: 'bg-[#CFA5A5]', rotate: 'rotate-6', earned: true },
  { icon: 'flight_takeoff', label: '飛行常客', color: 'bg-[#E0D6A8]', rotate: '-rotate-3', earned: true },
  { icon: 'map', label: '探險家', color: 'bg-[#CFBCA5]', rotate: 'rotate-1', earned: true },
  { icon: 'hotel', label: '試睡員', color: 'bg-[#B5A5CF]', rotate: '-rotate-1', earned: true },
  { icon: 'directions_boat', label: '海洋之子', color: 'bg-gray-200', earned: false },
  { icon: 'train', label: '鐵道迷', color: 'bg-gray-200', earned: false },
  { icon: 'scuba_diving', label: '深海潛將', color: 'bg-gray-200', earned: false },
  { icon: 'ac_unit', label: '雪地行者', color: 'bg-gray-200', earned: false },
  { icon: 'pedal_bike', label: '追風少年', color: 'bg-gray-200', earned: false },
  { icon: 'festival', label: '慶典狂熱', color: 'bg-gray-200', earned: false },
];

interface Achievement {
  icon: string;
  label: string;
  color: string;
  rotate?: string;
  level?: number;
  earned: boolean;
  featured?: boolean;
}

function AchievementModal({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-gray-500"
        >
          <span className="material-icons-round text-lg">close</span>
        </button>

        {/* Header */}
        <div className="h-28 bg-[#A5BCCF]/30 relative overflow-hidden flex justify-center items-end">
          <div className="absolute top-[-50%] left-[-20%] w-40 h-40 bg-white/20 rounded-full blur-2xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-32 h-32 bg-[#A5BCCF]/40 rounded-full blur-xl" />
          <div className={`w-24 h-24 mb-[-3rem] rounded-full ${achievement.color} shadow-[2px_4px_6px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(255,255,255,0.25)] flex items-center justify-center border-2 border-dashed border-white/50 border-4 border-white relative z-20`}>
            <span className="material-icons-round text-white text-4xl drop-shadow-md">{achievement.icon}</span>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 pb-8 px-6 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{achievement.label}</h3>
          <p className="text-xs text-[#A5BCCF] font-bold tracking-widest uppercase mb-4">Master Photographer</p>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            累積發布超過 50 張風景照片，並獲得 1000 次以上的按讚數。你的鏡頭記錄了世界的美好。
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 p-3 rounded-2xl">
              <span className="block text-xs text-gray-400 mb-1">獲得日期</span>
              <span className="block text-sm font-bold text-gray-700">2023.11.15</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl">
              <span className="block text-xs text-gray-400 mb-1">稀有度</span>
              <span className="block text-sm font-bold text-[#A5BCCF]">前 5%</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
            <div className="w-10 h-10 rounded-full bg-[#Cfb9a5]/20 flex items-center justify-center text-[#Cfb9a5]">
              <span className="material-icons-round">palette</span>
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-gray-800">解鎖獎勵</div>
              <div className="text-[10px] text-gray-500">專屬相片邊框 &amp; 濾鏡包</div>
            </div>
          </div>
        </div>

        <div className="p-4 pt-0">
          <button className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-opacity">
            分享成就
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AchievementGalleryPage() {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const earnedCount = allAchievements.filter(a => a.earned).length;

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden relative bg-[#F0EEE6] font-sans antialiased text-gray-900">
      {/* 背景光暈 */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[20%] w-96 h-96 bg-[#A5BCCF]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] -right-[10%] w-80 h-80 bg-[#Cfb9a5]/20 rounded-full blur-3xl" />
      </div>

      {/* Header - absolute 定位 */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 pt-4 pb-4 flex items-center justify-between bg-white/85 backdrop-blur-xl border-b border-white/30">
        <Link
          href="/my/achievements"
          className="p-2 -ml-2 rounded-full text-gray-600 hover:bg-black/5 transition-colors"
        >
          <span className="material-icons-round text-2xl">arrow_back_ios_new</span>
        </Link>
        <h1 className="text-lg font-bold text-gray-800 tracking-wide">成就圖鑑</h1>
        <button className="p-2 -mr-2 rounded-full text-gray-600 hover:bg-black/5 transition-colors">
          <span className="material-icons-round text-2xl">filter_list</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="h-full overflow-y-auto pt-16 pb-32">
        {/* 進度總覽 */}
        <div className="px-6 py-6 text-center">
          <div className="inline-flex items-center justify-center p-1 bg-white/40 rounded-full backdrop-blur-sm mb-4 border border-white/20">
            <div className="px-4 py-1.5 rounded-full bg-white shadow-sm">
              <span className="text-xs font-bold text-[#Cfb9a5]">LV. 12</span>
            </div>
            <span className="px-4 text-xs font-medium text-gray-500">數位旅人</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">已收集 {earnedCount} / {allAchievements.length}</h2>
          <div className="w-48 mx-auto h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#Cfb9a5] rounded-full"
              style={{ width: `${(earnedCount / allAchievements.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 勳章網格 */}
        <div className="px-4 pb-32">
          <div className="grid grid-cols-3 gap-y-8 gap-x-4">
            {allAchievements.map((achievement) => (
              <div
                key={achievement.label}
                className={`flex flex-col items-center gap-2 group ${!achievement.earned ? 'opacity-50 grayscale' : ''}`}
                onClick={() => achievement.earned && setSelectedAchievement(achievement)}
              >
                {achievement.earned ? (
                  <div
                    className={`relative w-20 h-20 rounded-full ${achievement.color} shadow-[2px_4px_6px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(255,255,255,0.25)] flex items-center justify-center transform group-hover:scale-105 transition-transform ${achievement.rotate || ''} cursor-pointer border-2 border-dashed border-white/50 ${achievement.featured ? 'ring-4 ring-[#Cfb9a5]/20 scale-110' : ''}`}
                  >
                    <span className="material-icons-round text-white text-3xl drop-shadow-md">{achievement.icon}</span>
                    {achievement.level && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-[10px] font-bold" style={{ color: achievement.color.includes('#') ? achievement.color.replace('bg-[', '').replace(']', '') : '#666' }}>
                          LV{achievement.level}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-20 h-20 rounded-full bg-gray-200 shadow-inner flex items-center justify-center border-2 border-dashed border-gray-300">
                    <span className="material-icons-round text-gray-400 text-3xl">{achievement.icon}</span>
                    <div className="absolute inset-0 bg-black/5 rounded-full flex items-center justify-center">
                      <span className="material-icons-round text-gray-500 text-xl">lock</span>
                    </div>
                  </div>
                )}
                <span className={`text-xs font-medium ${achievement.earned ? (achievement.featured ? 'font-bold text-[#Cfb9a5]' : 'text-gray-600') : 'text-gray-400'}`}>
                  {achievement.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal */}
      {selectedAchievement && (
        <AchievementModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}

      {/* 底部導航 */}
      <MobileNav />
    </div>
  );
}
