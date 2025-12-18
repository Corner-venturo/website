'use client';

import Link from 'next/link';
import MobileNav from '@/components/MobileNav';

const earnedAchievements = [
  { icon: 'hiking', label: '百岳挑戰', color: 'bg-[#A8BFA6]', rotate: 'rotate-3', level: 3, date: '2023.10.12' },
  { icon: 'photo_camera', label: '攝影大師', color: 'bg-[#A5BCCF]', rotate: '-rotate-2', level: 5, date: '2023.09.28' },
  { icon: 'restaurant', label: '在地美食家', color: 'bg-[#CFA5A5]', rotate: 'rotate-6', date: '2023.08.15' },
  { icon: 'flight_takeoff', label: '飛行常客', color: 'bg-[#E0D6A8]', rotate: '-rotate-3', level: 2, date: '2023.07.02' },
  { icon: 'group', label: '社交達人', color: 'bg-[#Cfb9a5]', rotate: 'rotate-1', date: '2023.06.20' },
  { icon: 'location_city', label: '城市漫遊', color: 'bg-[#D1D1D6]', rotate: '-rotate-2', date: '2023.05.11' },
];

const inProgressAchievements = [
  { icon: 'scuba_diving', label: '深海探險', progress: 40, progressText: '2 / 5 次潛水' },
  { icon: 'camping', label: '野外露營', progress: 20, progressText: '1 / 5 晚', useSymbol: true },
  { icon: 'history_edu', label: '文化學者', progress: 80, progressText: '4 / 5 個古蹟' },
  { icon: 'ac_unit', label: '極地征服', progress: 10, progressText: '0 / 1 次極地' },
  { icon: 'train', label: '鐵道迷', progress: 65, progressText: '650 / 1000 km' },
];

export default function AchievementsPage() {
  return (
    <div className="bg-[#F0EEE6] font-sans antialiased text-gray-900 min-h-screen flex flex-col overflow-hidden">
      {/* 背景光暈 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-96 h-96 bg-[#A5BCCF]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] -right-[10%] w-80 h-80 bg-[#Cfb9a5]/20 rounded-full blur-3xl" />
        <div className="absolute top-[30%] left-[40%] w-64 h-64 bg-[#CFA5A5]/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 pt-12 pb-2 flex items-center justify-between">
        <Link
          href="/my"
          className="bg-white/70 backdrop-blur-xl border border-white/60 p-2.5 rounded-full shadow-sm text-gray-600 hover:text-[#Cfb9a5] transition-colors"
        >
          <span className="material-icons-round text-xl">arrow_back</span>
        </Link>
        <h1 className="text-lg font-bold text-gray-800 tracking-wide">成就勳章</h1>
        <Link
          href="/my/achievements/settings"
          className="bg-white/70 backdrop-blur-xl border border-white/60 p-2.5 rounded-full shadow-sm text-gray-600 hover:text-[#Cfb9a5] transition-colors"
        >
          <span className="material-icons-round text-xl">settings</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full h-full overflow-y-auto pb-32">
        {/* 總覽卡片 */}
        <div className="px-6 mt-4">
          <div className="bg-white/50 backdrop-blur-xl border border-white/40 p-6 rounded-3xl flex items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-icons-round text-6xl">emoji_events</span>
            </div>
            {/* 進度圓環 */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-gray-200"
                  cx="40"
                  cy="40"
                  fill="transparent"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <circle
                  className="text-[#Cfb9a5]"
                  cx="40"
                  cy="40"
                  fill="transparent"
                  r="36"
                  stroke="currentColor"
                  strokeDasharray="226"
                  strokeDashoffset="140"
                  strokeLinecap="round"
                  strokeWidth="6"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-gray-400 font-medium">進度</span>
                <span className="text-lg font-bold text-gray-800">38%</span>
              </div>
            </div>
            <div className="flex-1 relative z-10">
              <h2 className="text-xl font-bold text-gray-800 mb-1">數位遊牧者</h2>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#A5BCCF] text-white">LV. 12</span>
                <span className="text-xs text-gray-500">尚有 8 個挑戰進行中</span>
              </div>
              <p className="text-xs text-gray-400 leading-tight">持續探索世界，解鎖更多專屬徽章！</p>
            </div>
          </div>
        </div>

        {/* Tab 切換 */}
        <div className="sticky top-0 z-40 bg-[#F0EEE6]/95 backdrop-blur-sm px-6 py-4 mt-2">
          <div className="flex p-1.5 bg-white rounded-2xl shadow-inner">
            <button className="flex-1 py-2 rounded-xl text-sm font-bold bg-[#Cfb9a5] text-white shadow-sm transition-all duration-300">
              全部
            </button>
            <button className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
              已獲得
            </button>
            <button className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
              未獲得
            </button>
          </div>
        </div>

        <div className="px-6 pb-20">
          {/* 最新獲得 */}
          <div className="flex items-center gap-2 mb-4 mt-2">
            <span className="w-1 h-4 bg-[#A8BFA6] rounded-full" />
            <h3 className="text-sm font-bold text-gray-700">最新獲得</h3>
            <Link href="/my/achievements/gallery" className="ml-auto text-xs text-[#94A3B8] font-medium flex items-center hover:underline">
              查看全部 <span className="material-icons-round text-sm">chevron_right</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-y-8 gap-x-4 mb-8">
            {earnedAchievements.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div
                  className={`relative w-20 h-20 rounded-full ${item.color} shadow-[2px_4px_6px_rgba(0,0,0,0.15),inset_0_0_0_2px_rgba(255,255,255,0.2)] flex items-center justify-center transform group-hover:scale-105 transition-transform border-2 border-dashed border-white/30 ${item.rotate}`}
                >
                  <span className="material-icons-round text-white text-3xl drop-shadow-md">{item.icon}</span>
                  {item.level && (
                    <div className="absolute -bottom-1 bg-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm border" style={{ color: item.color.replace('bg-[', '').replace(']', ''), borderColor: `${item.color.replace('bg-[', '').replace(']', '')}30` }}>
                      Lv.{item.level}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-gray-700">{item.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{item.date}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 挑戰進行中 */}
          <div className="flex items-center gap-2 mb-4 mt-6">
            <span className="w-1 h-4 bg-gray-300 rounded-full" />
            <h3 className="text-sm font-bold text-gray-500">挑戰進行中</h3>
            <Link href="/my/achievements/journey" className="ml-auto text-xs text-[#94A3B8] font-medium flex items-center hover:underline">
              成就旅途 <span className="material-icons-round text-sm">chevron_right</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-y-8 gap-x-4">
            {inProgressAchievements.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2 group opacity-60">
                <div className="relative w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border border-white/20">
                  {item.useSymbol ? (
                    <span className="material-symbols-outlined text-gray-400 text-3xl">{item.icon}</span>
                  ) : (
                    <span className="material-icons-round text-gray-400 text-3xl">{item.icon}</span>
                  )}
                </div>
                <div className="text-center w-full px-2">
                  <div className="text-xs font-bold text-gray-500 mb-1">{item.label}</div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#A5BCCF]"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-gray-400 mt-1">{item.progressText}</div>
                </div>
              </div>
            ))}

            {/* 神秘成就 */}
            <div className="flex flex-col items-center gap-2 group opacity-40">
              <div className="relative w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border border-white/10">
                <span className="material-icons-round text-gray-300 text-3xl">lock</span>
              </div>
              <div className="text-center w-full px-2">
                <div className="text-xs font-bold text-gray-400 mb-1">神秘成就</div>
                <div className="text-[9px] text-gray-300 mt-1">???</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 底部導航 */}
      <MobileNav />

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
