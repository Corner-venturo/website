'use client';

import Image from 'next/image';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';

// 模擬行程資料
const trips = [
  {
    id: 1,
    title: '京都賞楓五日遊',
    date: '2024/11/25 - 11/29',
    status: 'upcoming',
    statusLabel: '即將出發',
    statusColor: 'bg-[#94A3B8]',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ',
    members: 4,
    totalSpent: 12450,
    myBalance: -2480,
  },
  {
    id: 2,
    title: '東京跨年之旅',
    date: '2024/12/30 - 2025/1/3',
    status: 'planning',
    statusLabel: '規劃中',
    statusColor: 'bg-[#A8BCA1]',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5_eWkWytRxj_z3ImVOFNOGbw-3gTjLrh0gJUyGKU2a4p-6Qw9h1Xya8DMPdQmIxwaNeXwgbjRF0271JMx8c8VVhLbPt1sXs9O2X6Z0wm3EdnU3D19GIYooQrZr1uqMCA1l0i9tM-EbMy30MIkmPHUSGd_2FWG8X10WUtwAeJ581lKAdLchWnRl1aMuDSwCXQbIe8kYx0vIGYxhlLHY-8_d-wmc_Rpacqcuy3JoV4hOo0GtBeZ1mZT-_1i3OFfeWdrxu3Gxsbnwvjk',
    members: 6,
    totalSpent: 3200,
    myBalance: 1600,
  },
  {
    id: 3,
    title: '沖繩夏日潛水',
    date: '2024/08/10 - 08/14',
    status: 'completed',
    statusLabel: '已結束',
    statusColor: 'bg-[#C5B6AF]',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvF2J-hlJIbdIC1Zhk3h66lPKdCASqxoUNDT5DR9he5w1MfhJDXI1O_frJyo2uYhLobQ0_u1nLH0eQeEifXxnEQb0cz5wn2MJRTHFXe0Pkfa3JepHynrlVFLiyd66xSfjKz5z8Jxk2DzcoYdfFA2cCeba_l5jqRdopIxaedRspIjNrtHf3-Nyhhetfd2kO4xkzRwcxejVimNu5QbVu4NZz99d1uv1N4LpbDeXDMwpo0GHzix50XR4ZAGUWfcon0Ci41_X8fWT8xn16',
    members: 3,
    totalSpent: 28900,
    myBalance: 0,
  },
];

export default function SplitPage() {
  // 計算總覽數據
  const totalOwed = trips.reduce((sum, t) => t.myBalance < 0 ? sum + Math.abs(t.myBalance) : sum, 0);
  const totalToReceive = trips.reduce((sum, t) => t.myBalance > 0 ? sum + t.myBalance : sum, 0);

  return (
    <div className="bg-[#F5F4F0] min-h-screen font-sans">
      {/* 背景 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
      </div>

      {/* 手機版 */}
      <div className="lg:hidden relative z-10 pb-32">
        {/* Header */}
        <header className="px-5 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-[#5C5C5C]">旅費分帳</h1>
          <p className="text-sm text-[#949494] mt-1">選擇旅程來記錄或查看分帳</p>
        </header>

        {/* 總覽卡片 */}
        <div className="px-5 mb-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-[#949494] mb-1">我要收</p>
                <p className="text-xl font-bold text-[#A8BCA1]">
                  {totalToReceive > 0 ? `$${totalToReceive.toLocaleString()}` : '-'}
                </p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="flex-1 text-right">
                <p className="text-xs text-[#949494] mb-1">我要付</p>
                <p className="text-xl font-bold text-[#E8A5A5]">
                  {totalOwed > 0 ? `$${totalOwed.toLocaleString()}` : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 行程列表 */}
        <div className="px-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#5C5C5C]">我的旅程</h2>
            <span className="text-xs text-[#949494]">{trips.length} 個旅程</span>
          </div>

          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/split/${trip.id}`}
              className="block bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex">
                {/* 圖片 */}
                <div className="relative w-24 h-24 shrink-0">
                  <Image
                    src={trip.image}
                    alt={trip.title}
                    fill
                    className="object-cover"
                  />
                  <div className={`absolute top-2 left-2 ${trip.statusColor} text-white text-[10px] font-medium px-2 py-0.5 rounded-full`}>
                    {trip.statusLabel}
                  </div>
                </div>

                {/* 內容 */}
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[#5C5C5C] text-sm line-clamp-1">{trip.title}</h3>
                    <p className="text-[11px] text-[#949494] mt-0.5">{trip.date}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-[#949494]">
                      <span className="material-icons-round text-sm">group</span>
                      {trip.members} 人
                    </div>
                    <div className="text-right">
                      {trip.myBalance !== 0 ? (
                        <p className={`text-sm font-bold ${trip.myBalance > 0 ? 'text-[#A8BCA1]' : 'text-[#E8A5A5]'}`}>
                          {trip.myBalance > 0 ? '+' : ''}{trip.myBalance.toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-[#949494]">已結清</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 箭頭 */}
                <div className="flex items-center pr-3">
                  <span className="material-icons-round text-[#C5B6AF]">chevron_right</span>
                </div>
              </div>
            </Link>
          ))}

          {/* 空狀態提示 */}
          {trips.length === 0 && (
            <div className="text-center py-12">
              <span className="material-icons-round text-5xl text-[#D8D0C9] mb-3">receipt_long</span>
              <p className="text-[#949494] text-sm">還沒有任何旅程</p>
              <p className="text-[#B0B0B0] text-xs mt-1">參加旅程後就能在這裡記帳囉！</p>
            </div>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
