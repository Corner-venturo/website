'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const achievements = [
  { icon: 'hiking', label: '百岳挑戰', color: 'bg-morandi-green', rotate: 'rotate-3' },
  { icon: 'photo_camera', label: '攝影師', color: 'bg-morandi-blue', rotate: '-rotate-2' },
  { icon: 'restaurant', label: '美食家', color: 'bg-morandi-pink', rotate: 'rotate-6' },
  { icon: 'flight_takeoff', label: '飛行常客', color: 'bg-morandi-yellow', rotate: '-rotate-3' },
];

const quickActions = [
  {
    title: '進行中訂單',
    subtitle: '2 個即將出發',
    icon: 'confirmation_number',
    color: 'text-morandi-blue',
    accent: 'bg-morandi-blue/10',
  },
  {
    title: '歷史訂單',
    subtitle: '查看過往回憶',
    icon: 'history_edu',
    color: 'text-gray-400',
    accent: 'bg-morandi-gray/10',
  },
];

const friends = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBvF2J-hlJIbdIC1Zhk3h66lPKdCASqxoUNDT5DR9he5w1MfhJDXI1O_frJyo2uYhLobQ0_u1nLH0eQeEifXxnEQb0cz5wn2MJRTHFXe0Pkfa3JepHynrlVFLiyd66xSfjKz5z8Jxk2DzcoYdfFA2cCeba_l5jqRdopIxaedRspIjNrtHf3-Nyhhetfd2kO4xkzRwcxejVimNu5QbVu4NZz99d1uv1N4LpbDeXDMwpo0GHzix50XR4ZAGUWfcon0Ci41_X8fWT8xn16',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBvF2J-hlJIbdIC1Zhk3h66lPKdCASqxoUNDT5DR9he5w1MfhJDXI1O_frJyo2uYhLobQ0_u1nLH0eQeEifXxnEQb0cz5wn2MJRTHFXe0Pkfa3JepHynrlVFLiyd66xSfjKz5z8Jxk2DzcoYdfFA2cCeba_l5jqRdopIxaedRspIjNrtHf3-Nyhhetfd2kO4xkzRwcxejVimNu5QbVu4NZz99d1uv1N4LpbDeXDMwpo0GHzix50XR4ZAGUWfcon0Ci41_X8fWT8xn16',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD5_eWkWytRxj_z3ImVOFNOGbw-3gTjLrh0gJUyGKU2a4p-6Qw9h1Xya8DMPdQmIxwaNeXwgbjRF0271JMx8c8VVhLbPt1sXs9O2X6Z0wm3EdnU3D19GIYooQrZr1uqMCA1l0i9tM-EbMy30MIkmPHUSGd_2FWG8X10WUtwAeJ581lKAdLchWnRl1aMuDSwCXQbIe8kYx0vIGYxhlLHY-8_d-wmc_Rpacqcuy3JoV4hOo0GtBeZ1mZT-_1i3OFfeWdrxu3Gxsbnwvjk',
];

export default function ProfilePage() {
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="bg-[#F0EEE6] dark:bg-[#1a1a1a] font-sans antialiased text-gray-900 dark:text-white transition-colors duration-300 min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#EFEFE8] dark:bg-[#232323] texture-bg" />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-morandi-blue/20 dark:bg-morandi-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[20%] w-64 h-64 bg-morandi-pink/15 dark:bg-morandi-pink/5 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 px-6 pt-12 pb-2 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">數位旅人</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wider uppercase">Traveler&apos;s Notebook</p>
        </div>
        <button className="glass dark:glass-dark p-2.5 rounded-full shadow-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors" aria-label="設定">
          <span className="material-icons-outlined text-xl">settings</span>
        </button>
      </header>

      <main className="relative z-10 flex-1 w-full h-full overflow-y-auto hide-scrollbar pb-32">
        <div className="px-6 pt-4 pb-6 flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full p-1 border-2 border-primary/30 dark:border-primary/20">
              <div className="relative w-full h-full rounded-full overflow-hidden shadow-sm">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5_eWkWytRxj_z3ImVOFNOGbw-3gTjLrh0gJUyGKU2a4p-6Qw9h1Xya8DMPdQmIxwaNeXwgbjRF0271JMx8c8VVhLbPt1sXs9O2X6Z0wm3EdnU3D19GIYooQrZr1uqMCA1l0i9tM-EbMy30MIkmPHUSGd_2FWG8X10WUtwAeJ581lKAdLchWnRl1aMuDSwCXQbIe8kYx0vIGYxhlLHY-8_d-wmc_Rpacqcuy3JoV4hOo0GtBeZ1mZT-_1i3OFfeWdrxu3Gxsbnwvjk"
                  alt="Profile"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-morandi-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white dark:border-card-dark">
              LV. 12
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Alex Chen</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
              尋找世界角落的風景，用鏡頭記錄每一個感動瞬間 📸
            </p>
            <div className="flex gap-4 mt-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-medium">足跡</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">12 國</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-medium">旅程</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">45 次</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-medium">收藏</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">128</span>
              </div>
            </div>
          </div>
        </div>

        <section className="px-5 mb-6">
          <div className="bg-[#DFD7CD]/40 dark:bg-white/5 rounded-3xl p-5 border border-white/40 dark:border-white/5 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "url('data:image/svg+xml,%3Csvg width=\\'6\\' height=\\'6\\' viewBox=\\'0 0 6 6\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'#000000\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Cpath d=\\'M5 0h1L0 6V5zM6 5v1H5z\\'/%3E%3C/g%3E%3C/svg%3E')",
              }}
            />
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <span className="material-icons-round text-primary text-lg">military_tech</span>
                成就勳章
              </h3>
              <button className="text-xs text-primary font-medium flex items-center hover:text-primary-dark">
                查看全部 <span className="material-icons-round text-sm">chevron_right</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 relative z-10">
              {achievements.map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1 group cursor-pointer">
                  <div
                    className={`w-14 h-14 rounded-full ${item.color} shadow-patch flex items-center justify-center transform group-hover:scale-105 transition-transform border-2 border-dashed border-white/30 ${item.rotate}`}
                  >
                    <span className="material-icons-round text-white text-2xl drop-shadow-md">{item.icon}</span>
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="px-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.title}
                className="glass-card dark:glass-dark p-4 rounded-2xl shadow-sm text-left hover:bg-white/60 dark:hover:bg-card-dark/60 transition-colors group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-16 h-16 ${action.accent} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
                <span className={`material-symbols-outlined ${action.color} text-3xl mb-2 group-hover:rotate-12 transition-transform duration-300`}>
                  {action.icon}
                </span>
                <div className="font-bold text-gray-800 dark:text-gray-100 text-sm">{action.title}</div>
                <div className="text-[10px] text-gray-500 mt-1">{action.subtitle}</div>
              </button>
            ))}
          </div>

          <div className="glass-card dark:glass-dark rounded-2xl shadow-sm p-5 relative overflow-hidden transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">旅費管家</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">$12,450</span>
                  <span className="text-xs text-gray-500 font-medium">/ $20,000 TWD</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <button
                    className="group flex items-center justify-center w-10 h-10 rounded-full bg-morandi-green/10 text-morandi-green hover:bg-morandi-green hover:text-white transition-all duration-300 shadow-sm"
                    title="多人分帳"
                  >
                    <span className="material-icons-round text-xl">call_split</span>
                  </button>
                  <span className="text-[9px] text-morandi-green font-medium mt-1">分帳</span>
                </div>
                <div className="flex flex-col items-center">
                  <button className="w-10 h-10 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform" title="新增消費">
                    <span className="material-icons-round text-xl">add</span>
                  </button>
                  <span className="text-[9px] text-primary font-medium mt-1">記帳</span>
                </div>
              </div>
            </div>

            <div className="mt-2 mb-4">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1.5">
                <span>京都自由行</span>
                <span>62%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[62%]" />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-morandi-green rounded-full" />
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">快速分帳群組</span>
                </div>
                <button className="text-[10px] text-primary font-medium flex items-center hover:underline">
                  選擇好友 <span className="material-icons-round text-[10px]">arrow_forward_ios</span>
                </button>
              </div>

              <div className="bg-white/40 dark:bg-black/20 rounded-xl p-2.5 flex items-center justify-between border border-white/30 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {friends.slice(0, 2).map((friend) => (
                      <Image
                        key={friend}
                        src={friend}
                        alt="Friend"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-card-dark object-cover"
                      />
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-card-dark bg-morandi-gray text-white flex items-center justify-center text-[9px] font-bold shadow-sm">
                      +3
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-medium text-gray-400">當前分配</span>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">5 人均分</span>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-morandi-green/20 text-morandi-green hover:bg-morandi-green hover:text-white flex items-center justify-center transition-colors" aria-label="確認分帳群組">
                  <span className="material-icons-round text-base">check</span>
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card dark:glass-dark rounded-2xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1.5">
                <span className="material-icons-round text-morandi-pink text-base">favorite</span>
                我的旅伴
              </h3>
              <span className="text-xs text-gray-400">24 位好友</span>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
              <button className="shrink-0 w-12 h-12 rounded-full border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors" aria-label="新增好友">
                <span className="material-icons-round">person_add</span>
              </button>
              {friends.map((friend, index) => (
                <div key={`${friend}-${index}`} className="shrink-0 relative">
                  <Image
                    src={friend}
                    alt="Friend"
                    width={48}
                    height={48}
                    className={`w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-card-dark ${index === friends.length - 1 ? 'grayscale opacity-70' : ''}`}
                  />
                  {index === 0 && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-card-dark rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button className="w-full glass-card dark:glass-dark rounded-2xl shadow-sm p-4 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-300 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-icons-round">tune</span>
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">應用程式設定</span>
            </div>
            <span className="material-icons-round text-gray-400 text-xl">chevron_right</span>
          </button>
        </div>
      </main>

      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="glass dark:glass-dark rounded-full px-7 py-3.5 flex items-center gap-9 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20">
          <Link href="/" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="首頁">
            <span className="material-icons-round text-2xl">home</span>
          </Link>
          <Link href="/explore" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="探索">
            <span className="material-icons-round text-2xl">explore</span>
          </Link>
          <Link href="/wishlist" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="收藏">
            <span className="material-icons-round text-2xl">favorite_border</span>
          </Link>
          <Link href="/my" className="text-primary relative transform scale-110" aria-label="我的">
            <span className="material-icons-round text-2xl">person</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-morandi-pink rounded-full border border-white dark:border-card-dark" />
          </Link>
        </div>
      </nav>
    </div>
  );
}
