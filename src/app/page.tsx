'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth-store';
import { useProfileStore, getDisplayAvatar } from '@/stores/profile-store';
import { getSupabaseClient } from '@/lib/supabase';

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
  const router = useRouter();
  const { user, initialize } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const [dateString, setDateString] = useState('');
  const [greetingText, setGreetingText] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [showPersonalMenu, setShowPersonalMenu] = useState(false);

  // 取得顯示名稱
  const displayName = profile?.display_name || user?.user_metadata?.name || '旅人';
  const avatarUrl = getDisplayAvatar(profile, user?.user_metadata as Record<string, string> | undefined);

  // 初始化 Auth
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 載入 profile
  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  // 檢查已登入用戶是否完成個人資料
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;

      const supabase = getSupabaseClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_profile_complete')
        .eq('id', user.id)
        .maybeSingle();

      // 如果未完成個人資料，導向 onboarding
      if (!profile?.is_profile_complete) {
        router.push('/onboarding');
      }
    };

    checkProfile();
  }, [user, router]);

  useEffect(() => {
    setDateString(formatDate());
    setGreetingText(getGreeting());
  }, []);

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
    <div className="bg-[#F5F4F0] text-[#5C5C5C] min-h-screen relative overflow-hidden">
      {/* 背景漸層 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-[#E6DFDA] opacity-30 blur-[70px] rounded-full" />
        {/* 電腦版額外光暈 */}
        <div className="hidden lg:block absolute top-[20%] right-[15%] w-[400px] h-[400px] bg-[#D4C4B5] opacity-25 blur-[100px] rounded-full" />
      </div>

      {/* 手機版 + 平板版佈局 - 固定視窗不滾動 */}
      <div className="xl:hidden max-w-3xl mx-auto h-screen max-h-screen overflow-hidden flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 pt-3 pb-3 px-4 sm:px-6">
          <div className="flex items-center justify-between px-5 py-3 bg-white/50 backdrop-blur-2xl rounded-full border border-white/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)]">
            {/* 左邊：頭像 + 日期問候 */}
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-full object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#D6CDC8] text-white font-bold text-lg flex items-center justify-center">
                  {displayName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#949494] font-semibold">{dateString}</p>
                <h1 className="text-base font-bold text-[#5C5C5C]">{greetingText}，{displayName}</h1>
              </div>
            </div>
            {/* 右邊：未登入顯示登入按鈕，已登入顯示選單按鈕 */}
            {user ? (
              <button
                onClick={() => setShowPersonalMenu(!showPersonalMenu)}
                className="w-11 h-11 rounded-full bg-[#E8E2DD] hover:bg-[#DED6CF] text-[#5C5C5C] flex items-center justify-center transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            ) : (
              <Link href="/login" className="w-11 h-11 rounded-full bg-[#94A3B8] hover:bg-[#8291A6] text-white text-xs font-medium flex items-center justify-center transition">
                登入
              </Link>
            )}
          </div>
        </header>

        {/* 本週推薦標題 */}
        <div className="flex-shrink-0 px-[30px] mt-4 mb-4 flex items-end justify-between">
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
        <div className="flex-1 flex items-center overflow-x-auto px-4 sm:px-6 gap-5 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-0">
          {recommendations.map((item) => (
            <div key={item.id} className="snap-center shrink-0 w-[280px] sm:w-[320px] md:w-[360px] h-[85%] max-h-[520px] rounded-[2rem] overflow-hidden relative shadow-xl cursor-pointer hover:scale-[1.02] transition-transform">
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

        {/* 底部導覽 - 手機版 */}
        <nav className="flex-shrink-0 mx-4 sm:mx-6 mb-4 bg-white/80 backdrop-blur-xl rounded-full px-2 py-2 flex justify-around shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/60">
            <Link
              href="/"
              className="flex-1 flex justify-center py-2 text-[#94A3B8]"
              onClick={() => setShowPersonalMenu(false)}
            >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </Link>
          <Link
            href="/explore"
            className="flex-1 flex justify-center py-2 text-[#B0B0B0] hover:text-[#8C8C8C] transition"
            onClick={() => setShowPersonalMenu(false)}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z" />
            </svg>
          </Link>
          <Link
            href="/wishlist"
            className="flex-1 flex justify-center py-2 text-[#B0B0B0] hover:text-[#8C8C8C] transition"
            onClick={() => setShowPersonalMenu(false)}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </Link>
          <button
            type="button"
            className="flex-1 flex justify-center py-2 text-[#B0B0B0] hover:text-[#8C8C8C] transition"
            onClick={() => setShowPersonalMenu((prev) => !prev)}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>
        </nav>

        {/* 個人功能選單 */}
        {showPersonalMenu && (
          <div className="fixed inset-0 z-40 flex items-end justify-end pb-28 pr-6" onClick={() => setShowPersonalMenu(false)}>
            <div className="absolute inset-0 bg-black/20" />
            <div
              className="relative pointer-events-auto bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-[2rem] p-3 w-[190px] origin-bottom-right flex flex-col gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href="#"
                className="group flex items-center gap-3 w-full p-2.5 rounded-[1.2rem] hover:bg-[#F5F4F0] transition-all active:scale-95"
              >
                <div className="w-9 h-9 rounded-full bg-[#F2EBE9] flex items-center justify-center text-[#C5B6AF] group-hover:scale-110 transition-transform">
                  <span className="material-icons-round text-[18px]">verified_user</span>
                </div>
                <span className="text-[13px] font-bold text-[#5C5C5C] tracking-wide">旅人護照</span>
              </Link>
              <Link
                href="#"
                className="group flex items-center gap-3 w-full p-2.5 rounded-[1.2rem] hover:bg-[#F5F4F0] transition-all active:scale-95"
              >
                <div className="w-9 h-9 rounded-full bg-[#EDF2EC] flex items-center justify-center text-[#A8BCA1] group-hover:scale-110 transition-transform">
                  <span className="material-icons-round text-[18px]">airplane_ticket</span>
                </div>
                <span className="text-[13px] font-bold text-[#5C5C5C] tracking-wide">我的訂單</span>
              </Link>
              <Link
                href="/split"
                className="group flex items-center gap-3 w-full p-2.5 rounded-[1.2rem] hover:bg-[#F5F4F0] transition-all active:scale-95"
                onClick={() => setShowPersonalMenu(false)}
              >
                <div className="w-9 h-9 rounded-full bg-[#E6EBF2] flex items-center justify-center text-[#94A3B8] group-hover:scale-110 transition-transform">
                  <span className="material-icons-round text-[18px]">pie_chart</span>
                </div>
                <span className="text-[13px] font-bold text-[#5C5C5C] tracking-wide">分帳</span>
              </Link>
              <Link
                href="#"
                className="group flex items-center gap-3 w-full p-2.5 rounded-[1.2rem] hover:bg-[#F5F4F0] transition-all active:scale-95"
              >
                <div className="w-9 h-9 rounded-full bg-[#F0EBE6] flex items-center justify-center text-[#BAACA5] group-hover:scale-110 transition-transform">
                  <span className="material-icons-round text-[18px]">groups</span>
                </div>
                <span className="text-[13px] font-bold text-[#5C5C5C] tracking-wide">朋友</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 電腦版佈局 - 固定視窗不滾動 (1280px 以上) */}
      <div className="hidden xl:flex flex-col h-screen max-h-screen overflow-hidden px-8 py-6">
        {/* 電腦版 Header */}
        <header className="flex-shrink-0 flex items-center justify-between py-4 px-8 bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] mb-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D6CDC8] text-white font-bold flex items-center justify-center">
                V
              </div>
              <span className="text-xl font-bold text-[#5C5C5C]">VENTURO</span>
            </div>
            <nav className="flex items-center gap-8 ml-12">
              <Link href="/" className="text-[#94A3B8] font-medium border-b-2 border-[#94A3B8] pb-1">首頁</Link>
              <Link href="/explore" className="text-[#949494] hover:text-[#5C5C5C] transition">探索</Link>
              <Link href="/destinations" className="text-[#949494] hover:text-[#5C5C5C] transition">目的地</Link>
              <Link href="/articles" className="text-[#949494] hover:text-[#5C5C5C] transition">旅遊靈感</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-full border border-white/40">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#D6CDC8] text-white font-bold text-sm flex items-center justify-center">
                  {displayName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[#949494]">{dateString}</p>
                <p className="text-sm font-medium text-[#5C5C5C]">{greetingText}，{displayName}</p>
              </div>
            </div>
            {user ? (
              <button
                onClick={() => setShowPersonalMenu(!showPersonalMenu)}
                className="bg-[#E8E2DD] hover:bg-[#DED6CF] text-[#5C5C5C] text-sm py-2.5 px-6 rounded-full transition font-medium"
              >
                個人選單
              </button>
            ) : (
              <Link href="/login" className="bg-[#94A3B8] hover:bg-[#8291A6] text-white text-sm py-2.5 px-6 rounded-full transition font-medium">
                登入 / 註冊
              </Link>
            )}
          </div>
        </header>

        {/* 主要內容區 - 填滿剩餘空間 */}
        <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
          {/* 左側 - 大標題 + 搜尋 */}
          <div className="col-span-4 flex flex-col justify-center pr-8">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8E2DD] rounded-full mb-6">
                <svg className="w-4 h-4 text-[#A6988D]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-medium text-[#A6988D]">本週精選推薦</span>
              </div>
              <h1 className="text-5xl font-bold text-[#5C5C5C] leading-tight mb-4">
                探索世界<br />
                <span className="text-[#94A3B8]">獨特體驗</span>
              </h1>
              <p className="text-[#949494] text-lg leading-relaxed">
                精選全球最令人嚮往的旅遊目的地，讓每一次出發都成為難忘的回憶。
              </p>
            </div>

            {/* 搜尋框 */}
            <div className="relative">
              <input
                type="text"
                placeholder="搜尋目的地、體驗..."
                className="w-full px-6 py-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 text-[#5C5C5C] placeholder-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#94A3B8]/30 transition"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#94A3B8] rounded-xl flex items-center justify-center text-white hover:bg-[#8291A6] transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
            </div>

            {/* 快速標籤 */}
            <div className="flex flex-wrap gap-2 mt-6">
              {['日本', '海島', '歐洲', '自然', '美食'].map((tag) => (
                <button key={tag} className="px-4 py-2 bg-white/50 hover:bg-white/70 rounded-full text-sm text-[#5C5C5C] border border-white/40 transition">
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 右側 - 卡片網格 */}
          <div className="col-span-8 flex flex-col min-h-0">
            <div className="flex-shrink-0 flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#5C5C5C]">熱門推薦</h2>
              <Link href="/destinations" className="flex items-center text-sm text-[#94A3B8] hover:text-[#7A8A9E] font-medium transition">
                查看全部
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 卡片網格 - 電腦版，固定視窗佈局 */}
            <div className="flex-1 flex gap-4 min-h-0">
              {/* 左邊大卡片 */}
              <div className="flex-[2] rounded-2xl overflow-hidden relative cursor-pointer hover:scale-[1.01] transition-transform shadow-xl">
                <Image src={recommendations[0].image} alt={recommendations[0].title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(65,60,55,0.85)] via-[rgba(65,60,55,0.3)] to-transparent" />
                <div className="absolute top-5 right-5 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-center">
                  <div className="text-[10px] text-white/90">{recommendations[0].priceLabel}</div>
                  <div className="text-lg font-bold text-white">{recommendations[0].price}</div>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 mb-3">
                    <svg className="w-3 h-3 text-white mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    </svg>
                    <span className="text-xs font-medium text-white">{recommendations[0].location}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">{recommendations[0].title}</h3>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      {recommendations[0].duration}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-[#FFE082]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-white font-medium">{recommendations[0].rating}</span>
                      <span className="ml-1 text-xs text-white/60">({recommendations[0].reviews})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右邊兩張小卡片 */}
              <div className="flex-1 flex flex-col gap-4 min-h-0">
                {recommendations.slice(1, 3).map((item) => (
                  <div key={item.id} className="flex-1 rounded-2xl overflow-hidden relative cursor-pointer hover:scale-[1.02] transition-transform shadow-xl min-h-0">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(65,60,55,0.85)] via-[rgba(65,60,55,0.3)] to-transparent" />
                    <div className="absolute top-4 right-4 px-3 py-2 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-center">
                      <div className="text-[9px] text-white/90">{item.priceLabel}</div>
                      <div className="text-base font-bold text-white">{item.price}</div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-4">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 mb-2">
                        <svg className="w-2.5 h-2.5 text-white mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        </svg>
                        <span className="text-[11px] font-medium text-white">{item.location}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                      <div className="flex items-center gap-3 text-white/80 text-xs">
                        <div className="flex items-center">
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                          {item.duration}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-3.5 h-3.5 mr-1 text-[#FFE082]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span className="text-white font-medium">{item.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
