'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useProfileStore, getDisplayAvatar } from '@/stores/profile-store';
import MobileNav from '@/components/MobileNav';

const achievements = [
  { icon: 'hiking', label: '百岳挑戰', color: 'bg-morandi-green', rotate: 'rotate-3' },
  { icon: 'photo_camera', label: '攝影師', color: 'bg-morandi-blue', rotate: '-rotate-2' },
  { icon: 'restaurant', label: '美食家', color: 'bg-morandi-pink', rotate: 'rotate-6' },
  { icon: 'flight_takeoff', label: '飛行常客', color: 'bg-morandi-yellow', rotate: '-rotate-3' },
];

const quickActions = [
  {
    title: '進行中訂單',
    subtitle: '查看即將出發的行程',
    icon: 'confirmation_number',
    color: 'text-[#94A3B8]',
    accent: 'bg-[#94A3B8]/10',
    href: '/orders',
  },
  {
    title: '機票資訊',
    subtitle: '查看機票預訂',
    icon: 'flight',
    color: 'text-[#7A8A9E]',
    accent: 'bg-[#7A8A9E]/10',
    href: '/flight',
  },
  {
    title: '住宿資訊',
    subtitle: '查看住宿預訂',
    icon: 'hotel',
    color: 'text-[#A6988D]',
    accent: 'bg-[#A6988D]/10',
    href: '/stay',
  },
  {
    title: '收藏清單',
    subtitle: '我的最愛',
    icon: 'favorite',
    color: 'text-[#C4A99A]',
    accent: 'bg-[#C4A99A]/10',
    href: '/wishlist',
  },
];

const friends = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBvF2J-hlJIbdIC1Zhk3h66lPKdCASqxoUNDT5DR9he5w1MfhJDXI1O_frJyo2uYhLobQ0_u1nLH0eQeEifXxnEQb0cz5wn2MJRTHFXe0Pkfa3JepHynrlVFLiyd66xSfjKz5z8Jxk2DzcoYdfFA2cCeba_l5jqRdopIxaedRspIjNrtHf3-Nyhhetfd2kO4xkzRwcxejVimNu5QbVu4NZz99d1uv1N4LpbDeXDMwpo0GHzix50XR4ZAGUWfcon0Ci41_X8fWT8xn16',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBvF2J-hlJIbdIC1Zhk3h66lPKdCASqxoUNDT5DR9he5w1MfhJDXI1O_frJyo2uYhLobQ0_u1nLH0eQeEifXxnEQb0cz5wn2MJRTHFXe0Pkfa3JepHynrlVFLiyd66xSfjKz5z8Jxk2DzcoYdfFA2cCeba_l5jqRdopIxaedRspIjNrtHf3-Nyhhetfd2kO4xkzRwcxejVimNu5QbVu4NZz99d1uv1N4LpbDeXDMwpo0GHzix50XR4ZAGUWfcon0Ci41_X8fWT8xn16',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD5_eWkWytRxj_z3ImVOFNOGbw-3gTjLrh0gJUyGKU2a4p-6Qw9h1Xya8DMPdQmIxwaNeXwgbjRF0271JMx8c8VVhLbPt1sXs9O2X6Z0wm3EdnU3D19GIYooQrZr1uqMCA1l0i9tM-EbMy30MIkmPHUSGd_2FWG8X10WUtwAeJ581lKAdLchWnRl1aMuDSwCXQbIe8kYx0vIGYxhlLHY-8_d-wmc_Rpacqcuy3JoV4hOo0GtBeZ1mZT-_1i3OFfeWdrxu3Gxsbnwvjk',
];

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();

  // 取得顯示資料
  const displayName = profile?.display_name || user?.user_metadata?.name || '旅人';
  const fullName = profile?.full_name || displayName;
  const bio = profile?.bio || '還沒有自我介紹';
  const avatarUrl = getDisplayAvatar(profile, user?.user_metadata as Record<string, string> | undefined);
  const location = profile?.location || '';

  // 載入 profile
  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  // 未登入導向登入頁
  useEffect(() => {
    if (!user) {
      // 等一下再檢查，避免初始化時誤判
      const timer = setTimeout(() => {
        if (!user) {
          router.push('/login');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  return (
    <div className="bg-[#F5F4F0] font-sans antialiased text-gray-900 min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#F5F4F0]" />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#C8D6D3]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-[#D8D0C9]/30 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[20%] w-64 h-64 bg-[#E6DFDA]/30 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 px-6 pt-12 pb-2 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-[#5C5C5C] tracking-tight">個人中心</h1>
          <p className="text-xs text-[#949494] font-medium tracking-wider uppercase">My Profile</p>
        </div>
        <Link
          href="/my/settings"
          className="w-11 h-11 rounded-full bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm text-[#5C5C5C] hover:bg-white/80 transition-colors flex items-center justify-center"
          aria-label="設定"
        >
          <span className="material-icons-outlined text-xl">settings</span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 w-full h-full overflow-y-auto hide-scrollbar pb-32">
        <div className="px-6 pt-4 pb-6 flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full p-1 border-2 border-[#94A3B8]/30">
              <div className="relative w-full h-full rounded-full overflow-hidden shadow-sm bg-[#D6CDC8]">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                    {displayName.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#5C5C5C] mb-1">{displayName}</h2>
            {location && (
              <p className="text-xs text-[#949494] flex items-center gap-1 mb-1">
                <span className="material-icons-outlined text-sm">location_on</span>
                {location}
              </p>
            )}
            <p className="text-sm text-[#949494] leading-relaxed line-clamp-2">
              {bio}
            </p>
          </div>
        </div>

        <section className="px-5 mb-6">
          <div className="bg-[#DFD7CD]/40 rounded-3xl p-5 border border-white/40 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "url('data:image/svg+xml,%3Csvg width=\\'6\\' height=\\'6\\' viewBox=\\'0 0 6 6\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'#000000\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Cpath d=\\'M5 0h1L0 6V5zM6 5v1H5z\\'/%3E%3C/g%3E%3C/svg%3E')",
              }}
            />
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
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
                  <span className="text-[10px] font-medium text-gray-600">{item.label}</span>
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
                className="glass-card p-4 rounded-2xl shadow-sm text-left hover:bg-white/60 transition-colors group relative overflow-hidden block"
              >
                <div className={`absolute top-0 right-0 w-16 h-16 ${action.accent} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
                <span className={`material-symbols-outlined ${action.color} text-3xl mb-2 group-hover:rotate-12 transition-transform duration-300`}>
                  {action.icon}
                </span>
                <div className="font-bold text-gray-800 text-sm">{action.title}</div>
                <div className="text-[10px] text-gray-500 mt-1">{action.subtitle}</div>
              </Link>
            ))}
          </div>

          <div className="glass-card rounded-2xl shadow-sm p-5 relative overflow-hidden transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">旅費管家</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-800">$12,450</span>
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
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[62%]" />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-morandi-green rounded-full" />
                  <span className="text-xs font-bold text-gray-600">快速分帳群組</span>
                </div>
                <button className="text-[10px] text-primary font-medium flex items-center hover:underline">
                  選擇好友 <span className="material-icons-round text-[10px]">arrow_forward_ios</span>
                </button>
              </div>

              <div className="bg-white/40 rounded-xl p-2.5 flex items-center justify-between border border-white/30">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {friends.slice(0, 2).map((friend) => (
                      <Image
                        key={friend}
                        src={friend}
                        alt="Friend"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
                      />
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-morandi-gray text-white flex items-center justify-center text-[9px] font-bold shadow-sm">
                      +3
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-medium text-gray-400">當前分配</span>
                    <span className="text-xs font-bold text-gray-800">5 人均分</span>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-morandi-green/20 text-morandi-green hover:bg-morandi-green hover:text-white flex items-center justify-center transition-colors" aria-label="確認分帳群組">
                  <span className="material-icons-round text-base">check</span>
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                <span className="material-icons-round text-morandi-pink text-base">favorite</span>
                我的旅伴
              </h3>
              <span className="text-xs text-gray-400">24 位好友</span>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
              <button className="shrink-0 w-12 h-12 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors" aria-label="新增好友">
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
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button className="w-full glass-card rounded-2xl shadow-sm p-4 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-icons-round">tune</span>
              </div>
              <span className="font-bold text-gray-800 text-sm">應用程式設定</span>
            </div>
            <span className="material-icons-round text-gray-400 text-xl">chevron_right</span>
          </button>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
