'use client';

import Image from 'next/image';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

const achievements = [
  { icon: 'hiking', label: '百岳挑戰', color: 'bg-[#A8BCA1]', rotate: 'rotate-3' },
  { icon: 'photo_camera', label: '攝影師', color: 'bg-[#94A3B8]', rotate: '-rotate-2' },
  { icon: 'restaurant', label: '美食家', color: 'bg-[#C5B6AF]', rotate: 'rotate-6' },
  { icon: 'flight_takeoff', label: '飛行常客', color: 'bg-[#D4C4A8]', rotate: '-rotate-3' },
];

const quickActions = [
  {
    title: '進行中訂單',
    subtitle: '2 個即將出發',
    icon: 'confirmation_number',
    color: 'text-[#94A3B8]',
    accent: 'bg-[#94A3B8]/10',
    href: '/orders',
  },
  {
    title: '歷史訂單',
    subtitle: '查看過往回憶',
    icon: 'history_edu',
    color: 'text-[#949494]',
    accent: 'bg-[#E8E2DD]',
    href: '/orders',
  },
];

const friends = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBvF2J-hlJIbdIC1Zhk3h66lPKdCASqxoUNDT5DR9he5w1MfhJDXI1O_frJyo2uYhLobQ0_u1nLH0eQeEifXxnEQb0cz5wn2MJRTHFXe0Pkfa3JepHynrlVFLiyd66xSfjKz5z8Jxk2DzcoYdfFA2cCeba_l5jqRdopIxaedRspIjNrtHf3-Nyhhetfd2kO4xkzRwcxejVimNu5QbVu4NZz99d1uv1N4LpbDeXDMwpo0GHzix50XR4ZAGUWfcon0Ci41_X8fWT8xn16',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBvF2J-hlJIbdIC1Zhk3h66lPKdCASqxoUNDT5DR9he5w1MfhJDXI1O_frJyo2uYhLobQ0_u1nLH0eQeEifXxnEQb0cz5wn2MJRTHFXe0Pkfa3JepHynrlVFLiyd66xSfjKz5z8Jxk2DzcoYdfFA2cCeba_l5jqRdopIxaedRspIjNrtHf3-Nyhhetfd2kO4xkzRwcxejVimNu5QbVu4NZz99d1uv1N4LpbDeXDMwpo0GHzix50XR4ZAGUWfcon0Ci41_X8fWT8xn16',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD5_eWkWytRxj_z3ImVOFNOGbw-3gTjLrh0gJUyGKU2a4p-6Qw9h1Xya8DMPdQmIxwaNeXwgbjRF0271JMx8c8VVhLbPt1sXs9O2X6Z0wm3EdnU3D19GIYooQrZr1uqMCA1l0i9tM-EbMy30MIkmPHUSGd_2FWG8X10WUtwAeJ581lKAdLchWnRl1aMuDSwCXQbIe8kYx0vIGYxhlLHY-8_d-wmc_Rpacqcuy3JoV4hOo0GtBeZ1mZT-_1i3OFfeWdrxu3Gxsbnwvjk',
];

// 桌面版導覽組件
function DesktopHeader() {
  return (
    <header className="flex items-center justify-between py-4 px-6 lg:px-8 bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] mb-6">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D6CDC8] text-white font-bold flex items-center justify-center">
            V
          </div>
          <span className="text-xl font-bold text-[#5C5C5C]">VENTURO</span>
        </Link>
        <nav className="flex items-center gap-8 ml-12">
          <Link href="/" className="text-[#949494] hover:text-[#5C5C5C] transition">首頁</Link>
          <Link href="/explore" className="text-[#949494] hover:text-[#5C5C5C] transition">探索</Link>
          <Link href="/orders" className="text-[#949494] hover:text-[#5C5C5C] transition">訂單</Link>
          <Link href="/wishlist" className="text-[#949494] hover:text-[#5C5C5C] transition">收藏</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-[#94A3B8]/10 rounded-full border border-[#94A3B8]/20">
          <div className="w-8 h-8 rounded-full bg-[#D6CDC8] text-white font-bold text-sm flex items-center justify-center">
            A
          </div>
          <span className="text-sm font-medium text-[#5C5C5C]">Alex Chen</span>
        </div>
        <Link href="/my/settings" className="p-2.5 rounded-full bg-white/60 border border-white/40 text-[#949494] hover:text-[#94A3B8] transition">
          <span className="material-icons-outlined text-xl">settings</span>
        </Link>
      </div>
    </header>
  );
}

export default function ProfilePage() {

  return (
    <div className="bg-[#F5F4F0] font-sans antialiased text-[#5C5C5C] transition-colors duration-300 min-h-screen flex flex-col overflow-hidden">
      {/* 背景光暈 - 統一首頁風格 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-[#E6DFDA] opacity-30 blur-[70px] rounded-full" />
        <div className="hidden lg:block absolute top-[20%] right-[15%] w-[400px] h-[400px] bg-[#D4C4B5] opacity-25 blur-[100px] rounded-full" />
      </div>

      {/* ========== 電腦版佈局 ========== */}
      <div className="hidden lg:flex flex-col min-h-screen px-6 lg:px-8 py-6 relative z-10">
        <DesktopHeader />

        <div className="flex-1 grid grid-cols-12 gap-6 lg:gap-8 min-h-0 overflow-hidden">
          {/* 左側 - 個人資料 */}
          <div className="col-span-5 lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#D8D0C9] [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* 個人資料卡片 */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full p-1 border-2 border-[#94A3B8]/30">
                    <div className="relative w-full h-full rounded-full overflow-hidden shadow-sm">
                      <Image
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5_eWkWytRxj_z3ImVOFNOGbw-3gTjLrh0gJUyGKU2a4p-6Qw9h1Xya8DMPdQmIxwaNeXwgbjRF0271JMx8c8VVhLbPt1sXs9O2X6Z0wm3EdnU3D19GIYooQrZr1uqMCA1l0i9tM-EbMy30MIkmPHUSGd_2FWG8X10WUtwAeJ581lKAdLchWnRl1aMuDSwCXQbIe8kYx0vIGYxhlLHY-8_d-wmc_Rpacqcuy3JoV4hOo0GtBeZ1mZT-_1i3OFfeWdrxu3Gxsbnwvjk"
                        alt="Profile"
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-[#94A3B8] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm border-2 border-white">
                    LV. 12
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[#5C5C5C] mb-2">Alex Chen</h2>
                <p className="text-sm text-[#949494] leading-relaxed mb-4">
                  尋找世界角落的風景，用鏡頭記錄每一個感動瞬間
                </p>
                <div className="flex justify-center gap-8">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-[#5C5C5C]">12</span>
                    <span className="text-xs text-[#949494] uppercase">國家</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-[#5C5C5C]">45</span>
                    <span className="text-xs text-[#949494] uppercase">旅程</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-[#5C5C5C]">128</span>
                    <span className="text-xs text-[#949494] uppercase">收藏</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 成就勳章 */}
            <div className="bg-[#E8E2DD]/60 rounded-3xl p-5 border border-white/40 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    "url('data:image/svg+xml,%3Csvg width=\\'6\\' height=\\'6\\' viewBox=\\'0 0 6 6\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23000000\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Cpath d=\\'M5 0h1L0 6V5zM6 5v1H5z\\'/%3E%3C/g%3E%3C/svg%3E')",
                }}
              />
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="font-bold text-[#5C5C5C] flex items-center gap-2">
                  <span className="material-icons-round text-[#94A3B8] text-lg">military_tech</span>
                  成就勳章
                </h3>
                <button className="text-xs text-[#94A3B8] font-medium flex items-center hover:underline">
                  查看全部 <span className="material-icons-round text-sm">chevron_right</span>
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3 relative z-10">
                {achievements.map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div
                      className={`w-14 h-14 rounded-full ${item.color} shadow-lg flex items-center justify-center transform group-hover:scale-105 transition-transform border-2 border-dashed border-white/30 ${item.rotate}`}
                    >
                      <span className="material-icons-round text-white text-2xl drop-shadow-md">{item.icon}</span>
                    </div>
                    <span className="text-[10px] font-medium text-[#5C5C5C]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 我的旅伴 */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-[#5C5C5C] text-sm flex items-center gap-1.5">
                  <span className="material-icons-round text-[#C5B6AF] text-base">favorite</span>
                  我的旅伴
                </h3>
                <span className="text-xs text-[#949494]">24 位好友</span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
                <button className="shrink-0 w-12 h-12 rounded-full border border-dashed border-[#D8D0C9] flex items-center justify-center text-[#949494] hover:border-[#94A3B8] hover:text-[#94A3B8] transition-colors" aria-label="新增好友">
                  <span className="material-icons-round">person_add</span>
                </button>
                {friends.map((friend, index) => (
                  <div key={`${friend}-${index}`} className="shrink-0 relative">
                    <Image
                      src={friend}
                      alt="Friend"
                      width={48}
                      height={48}
                      className={`w-12 h-12 rounded-full object-cover ring-2 ring-white ${index === friends.length - 1 ? 'grayscale opacity-70' : ''}`}
                    />
                    {index === 0 && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#A8BCA1] border-2 border-white rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右側 - 功能區 */}
          <div className="col-span-7 lg:col-span-8 flex flex-col gap-6 overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#D8D0C9] [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* 快速操作 */}
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-sm text-left hover:bg-white/80 transition-colors group relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-20 h-20 ${action.accent} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
                  <span className={`material-symbols-outlined ${action.color} text-4xl mb-3 group-hover:rotate-12 transition-transform duration-300`}>
                    {action.icon}
                  </span>
                  <div className="font-bold text-[#5C5C5C] text-lg">{action.title}</div>
                  <div className="text-sm text-[#949494] mt-1">{action.subtitle}</div>
                </Link>
              ))}
            </div>

            {/* 旅費管家 */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-6 relative overflow-hidden transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-[#949494] uppercase tracking-wider mb-2 flex items-center gap-1">旅費管家</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#5C5C5C]">$12,450</span>
                    <span className="text-sm text-[#949494] font-medium">/ $20,000 TWD</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <button
                      className="group flex items-center justify-center w-12 h-12 rounded-full bg-[#A8BCA1]/10 text-[#A8BCA1] hover:bg-[#A8BCA1] hover:text-white transition-all duration-300 shadow-sm"
                      title="多人分帳"
                    >
                      <span className="material-icons-round text-2xl">call_split</span>
                    </button>
                    <span className="text-xs text-[#A8BCA1] font-medium mt-1">分帳</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <button className="w-12 h-12 rounded-full bg-[#94A3B8] text-white shadow-lg shadow-[#94A3B8]/30 flex items-center justify-center hover:scale-110 transition-transform" title="新增消費">
                      <span className="material-icons-round text-2xl">add</span>
                    </button>
                    <span className="text-xs text-[#94A3B8] font-medium mt-1">記帳</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 mb-4">
                <div className="flex justify-between text-sm text-[#949494] mb-2">
                  <span>京都自由行</span>
                  <span>62%</span>
                </div>
                <div className="h-3 w-full bg-[#E8E2DD] rounded-full overflow-hidden">
                  <div className="h-full bg-[#94A3B8] rounded-full w-[62%]" />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#E8E2DD]">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#A8BCA1] rounded-full" />
                    <span className="text-sm font-bold text-[#5C5C5C]">快速分帳群組</span>
                  </div>
                  <button className="text-sm text-[#94A3B8] font-medium flex items-center hover:underline">
                    選擇好友 <span className="material-icons-round text-sm">arrow_forward_ios</span>
                  </button>
                </div>

                <div className="bg-white/40 rounded-xl p-3 flex items-center justify-between border border-white/30">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {friends.slice(0, 3).map((friend, i) => (
                        <Image
                          key={`desktop-friend-${i}`}
                          src={friend}
                          alt="Friend"
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-[#D8D0C9] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        +2
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-[#949494]">當前分配</span>
                      <span className="text-sm font-bold text-[#5C5C5C]">5 人均分</span>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-[#A8BCA1]/20 text-[#A8BCA1] hover:bg-[#A8BCA1] hover:text-white flex items-center justify-center transition-colors" aria-label="確認分帳群組">
                    <span className="material-icons-round text-lg">check</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 應用程式設定 */}
            <Link href="/my/settings" className="w-full bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#E8E2DD] flex items-center justify-center text-[#949494] group-hover:bg-[#94A3B8] group-hover:text-white transition-colors">
                  <span className="material-icons-round text-2xl">tune</span>
                </div>
                <span className="font-bold text-[#5C5C5C]">應用程式設定</span>
              </div>
              <span className="material-icons-round text-[#949494] text-2xl">chevron_right</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========== 手機版佈局 ========== */}
      <div className="lg:hidden relative z-10 flex flex-col flex-1">
        <header className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#5C5C5C]">我的</h1>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 bg-white/60 backdrop-blur-xl rounded-full border border-white/50 shadow-sm flex items-center justify-center text-[#949494] hover:text-[#5C5C5C] transition relative">
                <div className="absolute top-2 right-2 w-2 h-2 bg-[#E8C4C4] rounded-full" />
                <span className="material-icons-round text-xl">notifications</span>
              </button>
              <Link href="/my/settings" className="w-10 h-10 bg-white/60 backdrop-blur-xl rounded-full border border-white/50 shadow-sm flex items-center justify-center text-[#949494] hover:text-[#5C5C5C] transition">
                <span className="material-icons-outlined text-xl">settings</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full h-full overflow-y-auto hide-scrollbar pb-32">
          <div className="px-6 pt-4 pb-6 flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full p-1 border-2 border-[#94A3B8]/30">
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
              <div className="absolute -bottom-1 -right-1 bg-[#94A3B8] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white">
                LV. 12
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#5C5C5C] mb-1">Alex Chen</h2>
              <p className="text-sm text-[#949494] leading-relaxed line-clamp-2">
                尋找世界角落的風景，用鏡頭記錄每一個感動瞬間
              </p>
              <div className="flex gap-4 mt-3">
                <div className="flex flex-col">
                  <span className="text-xs text-[#949494] uppercase font-medium">足跡</span>
                  <span className="text-sm font-bold text-[#5C5C5C]">12 國</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#949494] uppercase font-medium">旅程</span>
                  <span className="text-sm font-bold text-[#5C5C5C]">45 次</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#949494] uppercase font-medium">收藏</span>
                  <span className="text-sm font-bold text-[#5C5C5C]">128</span>
                </div>
              </div>
            </div>
          </div>

          <section className="px-5 mb-6">
            <div className="bg-[#E8E2DD]/60 rounded-3xl p-5 border border-white/40 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    "url('data:image/svg+xml,%3Csvg width=\\'6\\' height=\\'6\\' viewBox=\\'0 0 6 6\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23000000\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Cpath d=\\'M5 0h1L0 6V5zM6 5v1H5z\\'/%3E%3C/g%3E%3C/svg%3E')",
                }}
              />
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="font-bold text-[#5C5C5C] flex items-center gap-2">
                  <span className="material-icons-round text-[#94A3B8] text-lg">military_tech</span>
                  成就勳章
                </h3>
                <button className="text-xs text-[#94A3B8] font-medium flex items-center hover:underline">
                  查看全部 <span className="material-icons-round text-sm">chevron_right</span>
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3 relative z-10">
                {achievements.map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div
                      className={`w-14 h-14 rounded-full ${item.color} shadow-lg flex items-center justify-center transform group-hover:scale-105 transition-transform border-2 border-dashed border-white/30 ${item.rotate}`}
                    >
                      <span className="material-icons-round text-white text-2xl drop-shadow-md">{item.icon}</span>
                    </div>
                    <span className="text-[10px] font-medium text-[#5C5C5C]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="px-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="bg-white/60 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-sm text-left hover:bg-white/80 transition-colors group relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-16 h-16 ${action.accent} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
                  <span className={`material-symbols-outlined ${action.color} text-3xl mb-2 group-hover:rotate-12 transition-transform duration-300`}>
                    {action.icon}
                  </span>
                  <div className="font-bold text-[#5C5C5C] text-sm">{action.title}</div>
                  <div className="text-[10px] text-[#949494] mt-1">{action.subtitle}</div>
                </Link>
              ))}
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-5 relative overflow-hidden transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-[#949494] uppercase tracking-wider mb-1 flex items-center gap-1">旅費管家</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[#5C5C5C]">$12,450</span>
                    <span className="text-xs text-[#949494] font-medium">/ $20,000 TWD</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <button
                      className="group flex items-center justify-center w-10 h-10 rounded-full bg-[#A8BCA1]/10 text-[#A8BCA1] hover:bg-[#A8BCA1] hover:text-white transition-all duration-300 shadow-sm"
                      title="多人分帳"
                    >
                      <span className="material-icons-round text-xl">call_split</span>
                    </button>
                    <span className="text-[9px] text-[#A8BCA1] font-medium mt-1">分帳</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <button className="w-10 h-10 rounded-full bg-[#94A3B8] text-white shadow-lg shadow-[#94A3B8]/30 flex items-center justify-center hover:scale-110 transition-transform" title="新增消費">
                      <span className="material-icons-round text-xl">add</span>
                    </button>
                    <span className="text-[9px] text-[#94A3B8] font-medium mt-1">記帳</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 mb-4">
                <div className="flex justify-between text-[10px] text-[#949494] mb-1.5">
                  <span>京都自由行</span>
                  <span>62%</span>
                </div>
                <div className="h-2 w-full bg-[#E8E2DD] rounded-full overflow-hidden">
                  <div className="h-full bg-[#94A3B8] rounded-full w-[62%]" />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#E8E2DD]">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#A8BCA1] rounded-full" />
                    <span className="text-xs font-bold text-[#5C5C5C]">快速分帳群組</span>
                  </div>
                  <button className="text-[10px] text-[#94A3B8] font-medium flex items-center hover:underline">
                    選擇好友 <span className="material-icons-round text-[10px]">arrow_forward_ios</span>
                  </button>
                </div>

                <div className="bg-white/40 rounded-xl p-2.5 flex items-center justify-between border border-white/30">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {friends.slice(0, 2).map((friend, i) => (
                        <Image
                          key={`mobile-friend-${i}`}
                          src={friend}
                          alt="Friend"
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-[#D8D0C9] text-white flex items-center justify-center text-[9px] font-bold shadow-sm">
                        +3
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-medium text-[#949494]">當前分配</span>
                      <span className="text-xs font-bold text-[#5C5C5C]">5 人均分</span>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-[#A8BCA1]/20 text-[#A8BCA1] hover:bg-[#A8BCA1] hover:text-white flex items-center justify-center transition-colors" aria-label="確認分帳群組">
                    <span className="material-icons-round text-base">check</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-[#5C5C5C] text-sm flex items-center gap-1.5">
                  <span className="material-icons-round text-[#C5B6AF] text-base">favorite</span>
                  我的旅伴
                </h3>
                <span className="text-xs text-[#949494]">24 位好友</span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
                <button className="shrink-0 w-12 h-12 rounded-full border border-dashed border-[#D8D0C9] flex items-center justify-center text-[#949494] hover:border-[#94A3B8] hover:text-[#94A3B8] transition-colors" aria-label="新增好友">
                  <span className="material-icons-round">person_add</span>
                </button>
                {friends.map((friend, index) => (
                  <div key={`mobile-friend-list-${index}`} className="shrink-0 relative">
                    <Image
                      src={friend}
                      alt="Friend"
                      width={48}
                      height={48}
                      className={`w-12 h-12 rounded-full object-cover ring-2 ring-white ${index === friends.length - 1 ? 'grayscale opacity-70' : ''}`}
                    />
                    {index === 0 && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#A8BCA1] border-2 border-white rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Link href="/my/settings" className="w-full bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8E2DD] flex items-center justify-center text-[#949494] group-hover:bg-[#94A3B8] group-hover:text-white transition-colors">
                  <span className="material-icons-round">tune</span>
                </div>
                <span className="font-bold text-[#5C5C5C] text-sm">應用程式設定</span>
              </div>
              <span className="material-icons-round text-[#949494] text-xl">chevron_right</span>
            </Link>
          </div>
        </main>

        <BottomNav />
      </div>

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
