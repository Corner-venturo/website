import Image from 'next/image';
import Link from 'next/link';

type Achievement = {
  icon: string;
  title: string;
  status: string;
  colorClasses: {
    chip: string;
    text: string;
    progress: string;
  };
  progress: number;
};

type QuickCard = {
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
  colorClasses: {
    chip: string;
    text: string;
  };
  href: string;
};

const achievements: Achievement[] = [
  {
    icon: 'hiking',
    title: '百岳挑戰',
    status: '已解鎖',
    colorClasses: {
      chip: 'bg-morandi-green/20',
      text: 'text-morandi-green',
      progress: 'bg-morandi-green',
    },
    progress: 100,
  },
  {
    icon: 'photo_camera',
    title: '攝影大師',
    status: '已解鎖',
    colorClasses: {
      chip: 'bg-morandi-blue/20',
      text: 'text-morandi-blue',
      progress: 'bg-morandi-blue',
    },
    progress: 100,
  },
  {
    icon: 'flight_takeoff',
    title: '飛行常客',
    status: '進度 80%',
    colorClasses: {
      chip: 'bg-morandi-yellow/30',
      text: 'text-yellow-600',
      progress: 'bg-morandi-yellow',
    },
    progress: 80,
  },
];

const quickCards: QuickCard[] = [
  {
    title: '我的行程',
    subtitle: '即將出發',
    icon: 'airplane_ticket',
    badge: '2',
    colorClasses: {
      chip: 'bg-morandi-pink/10',
      text: 'text-morandi-pink',
    },
    href: '#',
  },
  {
    title: '歷史訂單',
    subtitle: '回顧足跡',
    icon: 'history',
    colorClasses: {
      chip: 'bg-morandi-gray/20',
      text: 'text-gray-500',
    },
    href: '#',
  },
];

const friendAvatars = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBvF2J-hlJIbdIC1Zhk3h66lPKdCASqxoUNDT5DR9he5w1MfhJDXI1O_frJyo2uYhLobQ0_u1nLH0eQeEifXxnEQb0cz5wn2MJRTHFXe0Pkfa3JepHynrlVFLiyd66xSfjKz5z8Jxk2DzcoYdfFA2cCeba_l5jqRdopIxaedRspIjNrtHf3-Nyhhetfd2kO4xkzRwcxejVimNu5QbVu4NZz99d1uv1N4LpbDeXDMwpo0GHzix50XR4ZAGUWfcon0Ci41_X8fWT8xn16',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ',
];

export default function ProfilePage() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-gray-800 dark:text-gray-100 min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 subtle-pattern opacity-40 dark:opacity-10" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-morandi-blue/20 dark:bg-morandi-blue/10 rounded-full blur-[100px]" />
        <div className="absolute top-[30%] -left-20 w-[400px] h-[400px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-morandi-green/10 dark:bg-morandi-green/5 rounded-full blur-[100px]" />
      </div>

      <header className="relative z-50 px-6 pt-14 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-8 bg-primary rounded-full" />
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">個人中心</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center hover:bg-white transition-colors">
          <span className="material-icons-outlined text-gray-600 dark:text-gray-300">settings</span>
        </button>
      </header>

      <main className="relative z-10 flex-1 w-full overflow-y-auto hide-scrollbar pb-32">
        <section className="flex flex-col items-center pt-6 pb-8 px-6 text-center">
          <div className="relative mb-4 group cursor-pointer">
            <div className="absolute inset-0 bg-primary/20 dark:bg-primary/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative w-28 h-28 rounded-full p-1.5 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-white/50 dark:border-white/10">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5_eWkWytRxj_z3ImVOFNOGbw-3gTjLrh0gJUyGKU2a4p-6Qw9h1Xya8DMPdQmIxwaNeXwgbjRF0271JMx8c8VVhLbPt1sXs9O2X6Z0wm3EdnU3D19GIYooQrZr1uqMCA1l0i9tM-EbMy30MIkmPHUSGd_2FWG8X10WUtwAeJ581lKAdLchWnRl1aMuDSwCXQbIe8kYx0vIGYxhlLHY-8_d-wmc_Rpacqcuy3JoV4hOo0GtBeZ1mZT-_1i3OFfeWdrxu3Gxsbnwvjk"
                alt="Profile"
                fill
                className="rounded-full object-cover shadow-sm"
                sizes="112px"
              />
            </div>
            <div className="absolute bottom-1 right-1 bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg border border-white dark:border-gray-800 flex items-center gap-1">
              <span className="material-icons-round text-[10px] text-yellow-400">star</span> LV.12
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Alex Chen</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[280px] leading-relaxed">捕捉光影的旅人，迷戀京都的四季 📸</p>
          <div className="flex items-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">12</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mt-0.5">Countries</div>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-white/10" />
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">45</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mt-0.5">Trips</div>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-white/10" />
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">1.2k</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mt-0.5">Photos</div>
            </div>
          </div>
        </section>

        <div className="px-5 space-y-5">
          <section>
            <div className="flex items-center justify-between px-1 mb-3">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">成就里程碑</h3>
              <button className="text-xs text-primary hover:text-primary-dark transition-colors">查看全部</button>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-5 px-5 snap-x">
              {achievements.map((item) => (
                <div
                  key={item.title}
                  className="snap-start shrink-0 w-32 h-40 glass-panel rounded-2xl p-4 flex flex-col justify-between group cursor-pointer relative overflow-hidden transition-transform hover:-translate-y-1"
                >
                  <div className={`absolute -right-4 -top-4 w-16 h-16 ${item.colorClasses.chip} rounded-full blur-xl`} />
                  <div className={`w-10 h-10 rounded-xl ${item.colorClasses.chip} flex items-center justify-center ${item.colorClasses.text}`}>
                    <span className="material-icons-round text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">{item.status}</div>
                    <div className="font-bold text-gray-800 dark:text-gray-100 text-sm">{item.title}</div>
                  </div>
                  <div className="h-1 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mt-1">
                    <div className={`${item.colorClasses.progress}`} style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              ))}
              <div className="snap-start shrink-0 w-32 h-40 bg-white/30 dark:bg-white/5 border border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-4 flex flex-col items-center justify-center text-gray-400 gap-2">
                <span className="material-icons-round text-2xl opacity-50">lock</span>
                <span className="text-xs">探索更多</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            {quickCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="glass-panel p-4 rounded-2xl text-left hover:bg-white/80 dark:hover:bg-card-dark transition-colors group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 ${card.colorClasses.chip} rounded-lg ${card.colorClasses.text} group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined text-xl">{card.icon}</span>
                  </div>
                  {card.badge && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-500 px-2 py-0.5 rounded-full dark:bg-red-500/20">
                      {card.badge}
                    </span>
                  )}
                </div>
                <div className="font-bold text-gray-800 dark:text-gray-100 text-sm">{card.title}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{card.subtitle}</div>
              </Link>
            ))}
          </div>

          <div className="glass-panel rounded-3xl p-5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute left-0 top-0 w-1 h-full bg-primary" />
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800 dark:text-gray-100">旅費預算</h3>
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-gray-500">TWD</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-gray-800 dark:text-white">$12,450</span>
                <span className="text-xs text-gray-400">/ $20k</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Link
                  href="/split"
                  className="text-[10px] font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors"
                >
                  + 記一筆
                </Link>
                <button className="text-[10px] font-medium text-gray-400 hover:text-gray-600 transition-colors">查看報表</button>
              </div>
            </div>
            <div className="relative w-16 h-16 shrink-0">
              <div
                className="w-full h-full rounded-full flex items-center justify-center transform -rotate-90"
                style={{ background: 'conic-gradient(var(--tw-colors-primary) 62%, #E5E7EB 62% 100%)' }}
              >
                <div className="w-12 h-12 bg-white dark:bg-[#252525] rounded-full flex items-center justify-center shadow-inner">
                  <span className="text-[10px] font-bold text-primary">62%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">旅行夥伴</h3>
              <span className="text-xs text-gray-400">24 位好友</span>
            </div>
            <div className="flex items-center">
              <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 border border-dashed border-gray-300 dark:border-gray-500 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors z-10 mr-3">
                <span className="material-icons-round text-lg">add</span>
              </button>
              <div className="flex -space-x-3 overflow-hidden p-1">
                {friendAvatars.map((src, index) => (
                  <div key={src} className="relative w-10 h-10 rounded-full ring-2 ring-white dark:ring-[#1E1E1E] overflow-hidden">
                    <Image src={src} alt={`Friend ${index + 1}`} fill className="object-cover" sizes="40px" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 ring-2 ring-white dark:ring-[#1E1E1E] flex items-center justify-center text-xs text-gray-500 font-medium">
                  +20
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-panel bg-white/80 dark:bg-[#1E1E1E]/90 rounded-full px-2 py-2 flex items-center shadow-soft border border-white/40 dark:border-white/5">
          <div className="flex items-center gap-1">
            <Link className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" href="/">
              <span className="material-icons-round text-2xl">home</span>
            </Link>
            <Link className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" href="/explore">
              <span className="material-icons-round text-2xl">explore</span>
            </Link>
            <Link className="mx-2 w-12 h-12 rounded-full bg-primary text-white shadow-lg shadow-primary/40 flex items-center justify-center transform hover:scale-105 transition-transform" href="/explore/create">
              <span className="material-icons-round text-2xl">add</span>
            </Link>
            <Link className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" href="/wishlist">
              <span className="material-icons-round text-2xl">favorite_border</span>
            </Link>
            <button className="w-12 h-12 rounded-full flex items-center justify-center text-primary bg-primary/10 relative" type="button">
              <span className="material-icons-round text-2xl">person</span>
              <span className="absolute top-3 right-3 w-2 h-2 bg-morandi-pink rounded-full ring-1 ring-white dark:ring-[#1E1E1E]" />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

