'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MobileNav from '@/components/MobileNav';
import { useAuthStore } from '@/stores/auth-store';
import { useProfileStore, getDisplayAvatar } from '@/stores/profile-store';

const recommendations = [
  {
    id: 1,
    location: '京都 · 嵐山',
    title: '隱世竹林別苑',
    price: '$280',
    priceLabel: '每晚',
    rating: 4.9,
    reviews: 128,
    duration: '5天4夜',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=1000&fit=crop',
  },
  {
    id: 2,
    location: '上海 · 外灘',
    title: '摩登江景豪庭',
    price: '$350',
    priceLabel: '每晚',
    rating: 4.8,
    reviews: 96,
    duration: '4天3夜',
    image: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800&h=1000&fit=crop',
  },
  {
    id: 3,
    location: '印尼 · 峇里島',
    title: '熱帶雨林別墅',
    price: '$190',
    priceLabel: '每晚',
    rating: 4.7,
    reviews: 210,
    duration: '6天5夜',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=1000&fit=crop',
  },
  {
    id: 4,
    location: '北海道 · 富良野',
    title: '薰衣草花田民宿',
    price: '$220',
    priceLabel: '每晚',
    rating: 4.8,
    reviews: 89,
    duration: '4天3夜',
    image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800&h=1000&fit=crop',
  },
];

function formatDate() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return '早安';
  if (hour < 18) return '午安';
  return '晚安';
}

export default function HomePage() {
  const { user, initialize, isInitialized } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const [dateString, setDateString] = useState('');
  const [greetingText, setGreetingText] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  // 取得用戶名稱和頭像
  const userName = profile?.display_name || profile?.full_name || user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '旅人';
  const avatarUrl = getDisplayAvatar(profile, user?.user_metadata);

  useEffect(() => {
    setDateString(formatDate());
    setGreetingText(getGreeting());
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  // 載入用戶 profile
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  // 顯示「威廉是不是很可愛」頁面
  if (showMessage) {
    return (
      <div className="h-screen relative flex flex-col items-center justify-center">
        {/* 底圖 */}
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop"
          alt="背景"
          fill
          className="object-cover"
        />
        {/* 遮罩 */}
        <div className="absolute inset-0 bg-black/30" />
        {/* 內容 */}
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-lg">威廉是不是很可愛</h1>
          <button
            onClick={() => setShowMessage(false)}
            className="px-6 py-3 bg-white/90 hover:bg-white text-[#5C5C5C] rounded-full transition font-medium"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden relative bg-[#F5F4F0] text-[#5C5C5C]">
      {/* 背景漸層 */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-[#E6DFDA] opacity-30 blur-[70px] rounded-full" />
      </div>

      {/* Header - absolute 定位，跟探索頁一致 */}
      <header className="absolute top-0 left-0 right-0 z-20 px-4 sm:px-6 pt-4 pb-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between px-5 py-3 bg-white/50 backdrop-blur-2xl rounded-full border border-white/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)]">
            {/* 左邊：頭像 + 日期問候 */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#D6CDC8] text-white font-bold text-lg flex items-center justify-center">
                {userName.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#949494] font-semibold">{dateString}</p>
                <h1 className="text-base font-bold text-[#5C5C5C]">{greetingText}，{userName}</h1>
              </div>
            </div>
            {/* 右邊：根據登入狀態顯示 */}
            {user ? (
              <Link href="/my" className="w-11 h-11 rounded-full bg-[#94A3B8] text-white font-bold flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="頭像" width={44} height={44} className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </Link>
            ) : (
              <Link href="/login" className="w-11 h-11 rounded-full bg-[#94A3B8] hover:bg-[#8291A6] text-white text-xs font-medium flex items-center justify-center transition">
                登入
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 主要內容區 */}
      <div className="max-w-3xl mx-auto h-full flex flex-col pt-24">
        {/* 本週推薦標題 */}
        <div className="flex-shrink-0 px-[30px] my-4 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8E2DD] text-[#A6988D] flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#5C5C5C]">本週推薦</h2>
              <p className="text-xs text-[#949494] mt-0.5">精選全球最令人嚮往的獨特體驗</p>
            </div>
          </div>
          <button
            onClick={() => setShowMessage(true)}
            className="flex items-center text-xs text-[#949494] hover:text-[#7A8A9E] transition mb-0.5"
          >
            查看全部
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 卡片輪播 - 手機版 + 平板版，填滿剩餘空間 */}
        <div className="flex-1 flex items-start overflow-x-auto px-4 sm:px-6 gap-5 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-0">
          {recommendations.map((item) => (
            <div key={item.id} className="snap-center shrink-0 w-[280px] sm:w-[320px] md:w-[360px] h-[85%] max-h-[620px] rounded-[2rem] overflow-hidden relative shadow-xl cursor-pointer hover:scale-[1.02] transition-transform">
              <Image src={item.image} alt={item.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(65,60,55,0.8)] via-[rgba(65,60,55,0.3)] to-transparent" />
              <div className="absolute top-6 right-6 px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-center">
                <div className="text-[10px] text-white/90">{item.priceLabel}</div>
                <div className="text-lg font-bold text-white">{item.price}</div>
              </div>
              <div className="absolute bottom-0 left-0 w-full p-6">
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 mb-3">
                  <svg className="w-3 h-3 text-white mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  </svg>
                  <span className="text-xs font-medium text-white">{item.location}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    {item.duration}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-[#FFE082]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-white font-medium">{item.rating}</span>
                    <span className="ml-1 text-xs text-white/60">({item.reviews})</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 底部導覽佔位空間 */}
        <div className="flex-shrink-0 h-4" />

        {/* 底部導覽 */}
        <MobileNav />
      </div>
    </div>
  );
}
