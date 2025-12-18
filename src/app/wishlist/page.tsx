'use client';

import Image from 'next/image';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';

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

function DesktopHeader() {
  return (
    <header className="flex-shrink-0 flex items-center justify-between py-4 px-8 bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] mb-6">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D6CDC8] text-white font-bold flex items-center justify-center">V</div>
          <span className="text-xl font-bold text-[#5C5C5C]">VENTURO</span>
        </Link>
        <nav className="flex items-center gap-8 ml-12">
          <Link href="/" className="text-[#949494] hover:text-[#5C5C5C] transition">首頁</Link>
          <Link href="/explore" className="text-[#949494] hover:text-[#5C5C5C] transition">探索</Link>
          <Link href="/orders" className="text-[#949494] hover:text-[#5C5C5C] transition">訂單</Link>
          <Link href="/wishlist" className="text-[#94A3B8] font-medium border-b-2 border-[#94A3B8] pb-1">收藏</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
          <span className="material-icons-round text-[#949494]">notifications_none</span>
        </button>
        <Link href="/my" className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-full border border-white/40 hover:bg-white/80 transition">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E8DED5] to-[#C9B8A8] flex items-center justify-center">
            <span className="text-white text-sm font-medium">W</span>
          </div>
          <span className="text-sm font-medium text-[#5C5C5C]">William</span>
        </Link>
      </div>
    </header>
  );
}

function TimelineItem({ item, index }: { item: typeof timelineItems[0]; index: number }) {
  return (
    <div className={`flex gap-4 ${index === 0 ? 'mb-2' : 'mt-2 mb-2'} ${index === 1 ? '' : 'group'}`}>
      <div className={`flex flex-col items-center ${index === 1 ? 'pt-8' : 'pt-2'} gap-1 shrink-0 w-10`}>
        <span className="text-[10px] font-bold text-primary font-mono">{item.time}</span>
        {item.status === 'completed' && (
          <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-background-light z-10" />
        )}
        {item.status === 'pending' && (
          <div className="w-4 h-4 rounded-full border-2 border-primary bg-background-light z-10 animate-pulse" />
        )}
        {item.status === 'upcoming' && (
          <div className="w-3 h-3 rounded-full bg-gray-300 ring-4 ring-background-light z-10" />
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
          className={`flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 relative ${
            item.status === 'completed' ? 'puzzle-connector-bottom opacity-80 scale-[0.98] origin-left' : 'puzzle-connector-top opacity-60 scale-[0.98] origin-left'
          }`}
        >
          <div className="flex gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative">
              <Image src={item.image} alt={item.title} fill className="object-cover grayscale" />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="font-bold text-gray-800 text-sm">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              <div className="flex items-center gap-1 mt-1.5">
                {item.badges.map((badge) => (
                  <span key={badge} className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-500">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LunchCard({ option, index }: { option: typeof lunchOptions[0]; index: number }) {
  return (
    <div className="relative group cursor-pointer">
      <div
        className={`relative h-32 rounded-2xl overflow-hidden shadow-md ${
          option.highlight ? 'ring-2 ring-primary ring-offset-2 ring-offset-background-light' : ''
        }`}
      >
        <Image src={option.image} alt={option.title} fill className="object-cover" />
        <div className={`absolute inset-0 ${option.highlight ? 'bg-black/10' : 'bg-black/20 group-hover:bg-black/0 transition-colors'}`} />
        {option.highlight ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="px-3 py-1 bg-white/90 rounded-full text-xs font-bold text-primary shadow-lg transform scale-110">
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
          <h3 className="font-bold text-gray-800 text-sm truncate pr-2">{option.title}</h3>
          <span className="text-primary font-bold text-xs shrink-0">{option.price}</span>
        </div>
        <p className="text-[10px] text-gray-500 line-clamp-1">{option.subtitle}</p>
      </div>
    </div>
  );
}

export default function WishlistPage() {

  return (
    <main className="bg-background-light font-sans text-gray-900 min-h-screen relative">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-5">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQxdpG2RE5XLEWK6ikPUSOrtPRwSqlSU7iJ6pbjL8J7PW_cnbAoiwIYp6mTaBqkRK3mdYLRXVbNS2VRUP8uJgT-igXHym-u1wTQEMDlwCL3fHMRn2U4GMvmxMX-_aTrnY_-c3u_aoifLUZeMRnTDhVN8WeRyzwtSz7HYK2vgEvLpa7bVPuUZdY_bnLC15Ron7tOGB0esLisiM305SNNU1301EMQh4eugnCtB4j9ZK_jnZsZcxx5Put2e17rOhKmyhvmLCi84G_53Dk"
          alt="Background Texture"
          fill
          className="object-cover blur-3xl scale-110"
          priority
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden xl:flex relative z-10 min-h-screen flex-col p-6">
        <DesktopHeader />

        <div className="flex-1 grid grid-cols-12 gap-6">
          {/* AI Assistant Panel */}
          <div className="col-span-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-morandi-pink flex items-center justify-center shadow-md">
                  <span className="material-icons-round text-white text-2xl">auto_awesome</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">AI 旅遊助手</h2>
                  <p className="text-xs text-gray-500">正在為您規劃行程</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  已經為您安排好上午的
                  <span className="font-bold text-primary">嵐山竹林</span>
                  漫步。午餐時間到了，想要體驗哪種氛圍呢？
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <button className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium shadow-sm flex items-center gap-2 hover:bg-primary/90 transition">
                  <span className="material-icons-round text-sm">restaurant</span>
                  當地特色
                </button>
                <button className="px-4 py-2 rounded-full bg-white text-gray-600 border border-gray-200 text-sm font-medium hover:bg-gray-50 transition">
                  景觀餐廳
                </button>
                <button className="px-4 py-2 rounded-full bg-white text-gray-600 border border-gray-200 text-sm font-medium hover:bg-gray-50 transition">
                  簡單輕食
                </button>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-primary" />
                  為您推薦：特色午餐
                </h3>
                <div className="space-y-4">
                  {lunchOptions.map((option, index) => (
                    <LunchCard key={option.title} option={option} index={index} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Panel */}
          <div className="col-span-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-800">許願池</h1>
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">京都一日遊</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
                    <span className="material-icons-outlined text-gray-600">save_alt</span>
                  </button>
                  <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
                    <span className="material-icons-outlined text-gray-600">share</span>
                  </button>
                  <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
                    <span className="material-icons-outlined text-gray-600">more_vert</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-10 bottom-10 w-0.5 dashed-line -z-10" />
                {timelineItems.map((item, index) => (
                  <TimelineItem key={item.time} item={item} index={index} />
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="material-icons-round text-lg text-primary">schedule</span>
                      預計行程時間：6 小時
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="material-icons-round text-lg text-morandi-green">place</span>
                      3 個景點
                    </div>
                  </div>
                  <button className="px-6 py-3 rounded-xl bg-primary text-white font-medium flex items-center gap-2 hover:bg-primary/90 transition shadow-lg shadow-primary/20">
                    <span className="material-icons-round text-lg">check_circle</span>
                    確認行程
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="xl:hidden relative z-10 max-w-md mx-auto min-h-screen flex flex-col pb-32 overflow-x-hidden">
        <header className="sticky top-0 z-50 px-5 pt-6 pb-2 bg-background-light/95 backdrop-blur-md transition-all border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors">
                <span className="material-icons-round text-gray-600">arrow_back</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-800 tracking-wide">許願池</h1>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
                <span className="material-icons-outlined text-gray-600">save_alt</span>
              </button>
              <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
                <span className="material-icons-outlined text-gray-600">more_vert</span>
              </button>
            </div>
          </div>
        </header>

        <section className="px-5 pt-6 pb-2 sticky top-[72px] z-40">
          <div className="glass rounded-3xl p-4 shadow-lg ring-1 ring-white/40">
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-morandi-pink flex items-center justify-center shadow-md shrink-0">
                <span className="material-icons-round text-white text-xl">auto_awesome</span>
              </div>
              <div className="flex-1">
                <div className="bg-white/60 rounded-2xl rounded-tl-none p-3 text-sm text-gray-700 leading-relaxed backdrop-blur-sm mb-3">
                  已經為您安排好上午的
                  <span className="font-bold text-primary">嵐山竹林</span>
                  漫步。午餐時間到了，想要體驗哪種氛圍呢？
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-medium shadow-sm flex items-center gap-1">
                    <span className="material-icons-round text-xs">restaurant</span>
                    當地特色
                  </button>
                  <button className="px-3 py-1.5 rounded-full bg-white text-gray-600 border border-gray-200 text-xs font-medium">
                    景觀餐廳
                  </button>
                  <button className="px-3 py-1.5 rounded-full bg-white text-gray-600 border border-gray-200 text-xs font-medium">
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
            <TimelineItem key={item.time} item={item} index={index} />
          ))}
        </section>

        <section className="mt-auto pt-4 bg-gradient-to-t from-background-light via-background-light to-transparent sticky bottom-0 pb-28 pl-5 z-30">
          <div className="flex items-center justify-between pr-5 mb-3">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-primary" />
              為您推薦：特色午餐
            </h2>
            <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">3 個選項</span>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pr-5 pb-2">
            {lunchOptions.map((option, index) => (
              <div key={option.title} className="snap-center shrink-0 w-[240px]">
                <LunchCard option={option} index={index} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="xl:hidden">
        <MobileNav />
      </div>
    </main>
  );
}
