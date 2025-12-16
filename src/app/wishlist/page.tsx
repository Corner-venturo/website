'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const timelineItems = [
  {
    time: '09:00',
    title: '嵐山竹林小徑',
    description: '清晨漫步 · 避開人潮',
    badges: ['景點', '1.5 hr'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ',
    status: 'completed',
  },
  {
    time: '11:30',
    title: '午餐選擇',
    description: '點擊下方卡片加入行程',
    badges: [],
    image: '',
    status: 'pending',
  },
  {
    time: '14:00',
    title: '茶道體驗',
    description: '建仁寺 · 深度文化',
    badges: ['體驗', '1 hr'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ',
    status: 'upcoming',
  },
];

const lunchOptions = [
  {
    title: '廣川鰻魚飯',
    price: '¥ 3,800',
    subtitle: '百年老店，關西風味炭烤鰻魚',
    tag: '米其林一星',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBvF2J-hlJIbdIC1Zhk3h66lPKdCASqxoUNDT5DR9he5w1MfhJDXI1O_frJyo2uYhLobQ0_u1nLH0eQeEifXxnEQb0cz5wn2MJRTHFXe0Pkfa3JepHynrlVFLiyd66xSfjKz5z8Jxk2DzcoYdfFA2cCeba_l5jqRdopIxaedRspIjNrtHf3-Nyhhetfd2kO4xkzRwcxejVimNu5QbVu4NZz99d1uv1N4LpbDeXDMwpo0GHzix50XR4ZAGUWfcon0Ci41_X8fWT8xn16',
  },
  {
    title: '松籟庵',
    price: '¥ 4,200',
    subtitle: '隱身嵐山深處，佐以桂川美景',
    tag: '絕景湯豆腐',
    highlight: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD5_eWkWytRxj_z3ImVOFNOGbw-3gTjLrh0gJUyGKU2a4p-6Qw9h1Xya8DMPdQmIxwaNeXwgbjRF0271JMx8c8VVhLbPt1sXs9O2X6Z0wm3EdnU3D19GIYooQrZr1uqMCA1l0i9tM-EbMy30MIkmPHUSGd_2FWG8X10WUtwAeJ581lKAdLchWnRl1aMuDSwCXQbIe8kYx0vIGYxhlLHY-8_d-wmc_Rpacqcuy3JoV4hOo0GtBeZ1mZT-_1i3OFfeWdrxu3Gxsbnwvjk',
  },
  {
    title: '嵐山吉村 · 手打蕎麥',
    price: '¥ 1,600',
    subtitle: '渡月橋畔，邊吃邊賞景',
    tag: '人氣街食',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD5_eWkWytRxj_z3ImVOFNOGbw-3gTjLrh0gJUyGKU2a4p-6Qw9h1Xya8DMPdQmIxwaNeXwgbjRF0271JMx8c8VVhLbPt1sXs9O2X6Z0wm3EdnU3D19GIYooQrZr1uqMCA1l0i9tM-EbMy30MIkmPHUSGd_2FWG8X10WUtwAeJ581lKAdLchWnRl1aMuDSwCXQbIe8kYx0vIGYxhlLHY-8_d-wmc_Rpacqcuy3JoV4hOo0GtBeZ1mZT-_1i3OFfeWdrxu3Gxsbnwvjk',
  },
];

export default function WishlistPage() {
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <main className="bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-white min-h-screen relative">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-5 dark:opacity-20">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQxdpG2RE5XLEWK6ikPUSOrtPRwSqlSU7iJ6pbjL8J7PW_cnbAoiwIYp6mTaBqkRK3mdYLRXVbNS2VRUP8uJgT-igXHym-u1wTQEMDlwCL3fHMRn2U4GMvmxMX-_aTrnY_-c3u_aoifLUZeMRnTDhVN8WeRyzwtSz7HYK2vgEvLpa7bVPuUZdY_bnLC15Ron7tOGB0esLisiM305SNNU1301EMQh4eugnCtB4j9ZK_jnZsZcxx5Put2e17rOhKmyhvmLCi84G_53Dk"
          alt="Background Texture"
          fill
          className="object-cover blur-3xl scale-110"
          priority
        />
      </div>

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col pb-32 overflow-x-hidden">
        <header className="sticky top-0 z-50 px-5 pt-6 pb-2 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md transition-all border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <span className="material-icons-round text-gray-600 dark:text-gray-300">arrow_back</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-wide">許願池</h1>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <span className="material-icons-outlined text-gray-600 dark:text-gray-300">save_alt</span>
              </button>
              <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <span className="material-icons-outlined text-gray-600 dark:text-gray-300">more_vert</span>
              </button>
            </div>
          </div>
        </header>

        <section className="px-5 pt-6 pb-2 sticky top-[72px] z-40">
          <div className="glass dark:glass-dark rounded-3xl p-4 shadow-lg ring-1 ring-white/40 dark:ring-white/10">
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-morandi-pink flex items-center justify-center shadow-md shrink-0">
                <span className="material-icons-round text-white text-xl">auto_awesome</span>
              </div>
              <div className="flex-1">
                <div className="bg-white/60 dark:bg-black/20 rounded-2xl rounded-tl-none p-3 text-sm text-gray-700 dark:text-gray-200 leading-relaxed backdrop-blur-sm mb-3">
                  已經為您安排好上午的
                  <span className="font-bold text-primary dark:text-primary-light">嵐山竹林</span>
                  漫步。午餐時間到了，想要體驗哪種氛圍呢？
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-medium shadow-sm flex items-center gap-1">
                    <span className="material-icons-round text-xs">restaurant</span>
                    當地特色
                  </button>
                  <button className="px-3 py-1.5 rounded-full bg-white dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 text-xs font-medium">
                    景觀餐廳
                  </button>
                  <button className="px-3 py-1.5 rounded-full bg-white dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 text-xs font-medium">
                    簡單輕食
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 px-5 py-6 flex flex-col gap-0 relative">
          <div className="absolute left-9 top-10 bottom-10 w-0.5 dashed-line -z-10" />

          {timelineItems.map((item, index) => (
            <div key={item.time} className={`flex gap-4 ${index === 0 ? 'mb-2' : 'mt-2 mb-2'} ${index === 1 ? '' : 'group'}`}>
              <div className={`flex flex-col items-center ${index === 1 ? 'pt-8' : 'pt-2'} gap-1 shrink-0 w-10`}>
                <span className="text-[10px] font-bold text-primary font-mono">{item.time}</span>
                {item.status === 'completed' && (
                  <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-background-light dark:ring-background-dark z-10" />
                )}
                {item.status === 'pending' && (
                  <div className="w-4 h-4 rounded-full border-2 border-primary bg-background-light dark:bg-background-dark z-10 animate-pulse" />
                )}
                {item.status === 'upcoming' && (
                  <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 ring-4 ring-background-light dark:ring-background-dark z-10" />
                )}
              </div>

              {item.status === 'pending' ? (
                <div className="flex-1 h-28 dashed-border rounded-2xl flex items-center justify-center relative bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
                  <div className="text-center">
                    <span className="material-icons-round text-primary text-2xl mb-1 animate-bounce">add_circle_outline</span>
                    <p className="text-xs font-medium text-primary">選擇午餐體驗</p>
                    <p className="text-[10px] text-primary/60">點擊下方卡片加入行程</p>
                  </div>
                </div>
              ) : (
                <div
                  className={`flex-1 bg-white dark:bg-card-dark rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-white/5 relative ${
                    item.status === 'completed' ? 'puzzle-connector-bottom opacity-80 scale-[0.98] origin-left' : 'puzzle-connector-top opacity-60 scale-[0.98] origin-left'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative">
                      <Image src={item.image} alt={item.title} fill className="object-cover grayscale" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="font-bold text-gray-800 dark:text-white text-sm">{item.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        {item.badges.map((badge) => (
                          <span key={badge} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-[10px] text-gray-500 dark:text-gray-400">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="mt-auto pt-4 bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark sticky bottom-0 pb-28 pl-5 z-30">
          <div className="flex items-center justify-between pr-5 mb-3">
            <h2 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-primary" />
              為您推薦：特色午餐
            </h2>
            <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">3 個選項</span>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pr-5 pb-2">
            {lunchOptions.map((option, index) => (
              <div key={option.title} className="snap-center shrink-0 w-[240px] relative group cursor-pointer">
                <div
                  className={`relative h-32 rounded-2xl overflow-hidden shadow-md ${
                    option.highlight ? 'ring-2 ring-primary ring-offset-2 ring-offset-background-light dark:ring-offset-background-dark' : ''
                  }`}
                >
                  <Image src={option.image} alt={option.title} fill className="object-cover" />
                  <div className={`absolute inset-0 ${option.highlight ? 'bg-black/10' : 'bg-black/20 group-hover:bg-black/0 transition-colors'}`} />
                  {option.highlight ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="px-3 py-1 bg-white/90 dark:bg-black/80 rounded-full text-xs font-bold text-primary shadow-lg transform scale-110">
                        點擊加入
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100 duration-300">
                      <span className="material-icons-round text-primary text-sm">add</span>
                    </div>
                  )}
                  <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] text-white font-medium shadow-sm ${
                    index === 0
                      ? 'bg-morandi-green/90 backdrop-blur-md'
                      : index === 1
                      ? 'bg-morandi-blue/90 backdrop-blur-md'
                      : 'bg-morandi-pink/90 backdrop-blur-md'
                  }`}>
                    {option.tag}
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm truncate pr-2">{option.title}</h3>
                    <span className="text-primary font-bold text-xs shrink-0">{option.price}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">{option.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="glass dark:glass-dark rounded-full px-7 py-3.5 flex items-center gap-9 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20">
          <Link href="/" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <span className="material-icons-round text-2xl">home</span>
          </Link>
          <Link href="/explore" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <span className="material-icons-round text-2xl">explore</span>
          </Link>
          <button className="text-primary relative transform scale-110">
            <span className="material-icons-round text-2xl">auto_fix_high</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-morandi-pink rounded-full border border-white dark:border-card-dark animate-pulse" />
          </button>
          <Link href="/profile" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <span className="material-icons-round text-2xl">person_outline</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
