'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import DesktopHeader from '@/components/DesktopHeader';
import MobileNav from '@/components/MobileNav';

// 動態載入地圖（避免 SSR 問題）
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#E8E4DC] flex items-center justify-center">
      <div className="text-[#949494]">載入地圖中...</div>
    </div>
  ),
});

// 類別定義
const categories = [
  { id: 'all', label: '全部', icon: 'M4 6h16M4 12h16M4 18h16' },
  { id: 'food', label: '美食', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' },
  { id: 'photo', label: '攝影', icon: 'M12 9a3 3 0 100 6 3 3 0 000-6zM17 6h-2l-1.5-2h-3L9 6H7c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z' },
  { id: 'outdoor', label: '戶外', icon: 'M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z' },
  { id: 'music', label: '音樂', icon: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z' },
  { id: 'coffee', label: '咖啡', icon: 'M2 21h18v-2H2M20 8h-2V5h2m0-2H4v10a4 4 0 004 4h6a4 4 0 004-4v-3h2a2 2 0 002-2V5a2 2 0 00-2-2z' },
];

// Mock 揪團資料 - 集中在台北車站附近（預設位置 25.033, 121.5654 的 2 公里內）
const mockTrips = [
  {
    id: '1',
    title: '週末咖啡探險',
    category: 'coffee',
    event_date: '2025-12-20',
    location: '台北車站',
    latitude: 25.035,
    longitude: 121.568,
    member_count: 3,
    max_members: 6,
    organizer_name: '小明',
    organizer_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    title: '城市攝影散步',
    category: 'photo',
    event_date: '2025-12-21',
    location: '中正紀念堂',
    latitude: 25.028,
    longitude: 121.562,
    member_count: 5,
    max_members: 8,
    organizer_name: '阿華',
    organizer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    title: '河濱慢跑團',
    category: 'outdoor',
    event_date: '2025-12-22',
    location: '大稻埕碼頭',
    latitude: 25.040,
    longitude: 121.560,
    member_count: 8,
    max_members: 12,
    organizer_name: '小美',
    organizer_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
  },
  {
    id: '4',
    title: '寧夏夜市美食',
    category: 'food',
    event_date: '2025-12-23',
    location: '寧夏夜市',
    latitude: 25.038,
    longitude: 121.570,
    member_count: 4,
    max_members: 10,
    organizer_name: '大胃王',
    organizer_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
  },
  {
    id: '5',
    title: 'LiveHouse 之夜',
    category: 'music',
    event_date: '2025-12-24',
    location: '西門町',
    latitude: 25.030,
    longitude: 121.555,
    member_count: 6,
    max_members: 8,
    organizer_name: '樂迷',
    organizer_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
  },
];

// 類別顏色
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'food': return 'bg-[#E8C4C4]';
    case 'photo': return 'bg-[#A5BCCD]';
    case 'outdoor': return 'bg-[#A8BFA6]';
    case 'music': return 'bg-[#C4B8E0]';
    case 'coffee': return 'bg-[#D4C4A8]';
    default: return 'bg-[#CFB9A5]';
  }
};

const getCategoryTextColor = (category: string) => {
  switch (category) {
    case 'food': return 'text-[#8B5A5A]';
    case 'photo': return 'text-[#4A6B8A]';
    case 'outdoor': return 'text-[#4A6B4A]';
    case 'music': return 'text-[#6B4A8A]';
    case 'coffee': return 'text-[#6B5A4A]';
    default: return 'text-[#8B7355]';
  }
};

// 計算兩點之間的距離（公里）
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTrip, setSelectedTrip] = useState<typeof mockTrips[0] | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([25.033, 121.5654]); // 預設台北

  // 取得用戶位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  // 篩選揪團 - 2公里內 + 類別
  const filteredTrips = mockTrips
    .filter((trip) => {
      const distance = getDistanceFromLatLonInKm(
        userLocation[0],
        userLocation[1],
        trip.latitude,
        trip.longitude
      );
      return distance <= 2; // 2 公里內
    })
    .filter((trip) => activeCategory === 'all' || trip.category === activeCategory);

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '明天';
    if (diffDays > 0 && diffDays <= 7) return `${diffDays} 天後`;

    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 預設選中第一個
  useEffect(() => {
    if (filteredTrips.length > 0 && !selectedTrip) {
      setSelectedTrip(filteredTrips[0]);
    }
  }, [filteredTrips, selectedTrip]);

  // 類別篩選器組件
  const CategoryFilter = ({ className = '' }: { className?: string }) => (
    <div className={`flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1 ${className}`}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => {
            setActiveCategory(cat.id);
            setSelectedTrip(null);
          }}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
            activeCategory === cat.id
              ? 'bg-[#94A3B8] text-white shadow-lg shadow-[#94A3B8]/30'
              : 'bg-white/60 backdrop-blur-xl text-[#5C5C5C] border border-white/50 hover:bg-white/80'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d={cat.icon} />
          </svg>
          {cat.label}
        </button>
      ))}
    </div>
  );

  // 揪團卡片列表組件
  const TripCardList = ({ className = '' }: { className?: string }) => (
    <div className={`flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-4 ${className}`}>
      {filteredTrips.length === 0 ? (
        <div className="snap-center shrink-0 w-[280px] p-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-10 h-10 text-[#B0B0B0] mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <p className="text-sm text-[#949494]">附近還沒有揪團</p>
            <button className="text-xs text-[#94A3B8] font-medium mt-2">
              成為第一個開團的人
            </button>
          </div>
        </div>
      ) : (
        filteredTrips.map((trip) => {
          const isSelected = selectedTrip?.id === trip.id;
          return (
            <div
              key={trip.id}
              onClick={() => setSelectedTrip(trip)}
              className={`snap-center shrink-0 w-[280px] p-3 backdrop-blur-xl rounded-2xl shadow-lg border flex gap-3 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-white/95 border-white/80 ring-2 ring-[#94A3B8]/50 shadow-xl'
                  : 'bg-white/80 border-white/50 opacity-80 scale-95'
              }`}
            >
              {/* 圖片 */}
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
                <Image src={trip.image} alt={trip.title} fill className="object-cover" />
                <div className="absolute top-1 right-1 bg-black/50 rounded-md px-1.5 py-0.5 text-[10px] text-white flex items-center gap-0.5">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                  {trip.member_count}/{trip.max_members}
                </div>
              </div>

              {/* 內容 */}
              <div className="flex flex-col justify-center flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${getCategoryColor(trip.category)}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${getCategoryTextColor(trip.category)}`}>
                    {formatDate(trip.event_date)}
                  </span>
                  <span className="text-[10px] text-[#949494] ml-auto truncate max-w-[80px]">
                    {trip.location}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#5C5C5C] truncate mb-1.5">
                  {trip.title}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden ring-2 ring-white">
                    <Image
                      src={trip.organizer_avatar}
                      alt={trip.organizer_name}
                      width={20}
                      height={20}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-[#949494]">{trip.organizer_name}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );


  return (
    <div className="bg-[#F5F4F0] min-h-screen">
      {/* ========== 手機版 + 平板版 (xl 以下) ========== */}
      <div className="xl:hidden h-screen max-h-screen overflow-hidden relative">
        {/* 地圖 - 全螢幕背景 */}
        <div className="absolute inset-0 z-0">
          <MapComponent
            trips={filteredTrips}
            selectedTrip={selectedTrip}
            onTripSelect={setSelectedTrip}
          />
        </div>

        <Link
          href="/explore/create"
          className="absolute right-6 bottom-28 z-20 bg-primary text-white shadow-[0_12px_30px_rgba(207,185,165,0.3)] rounded-full px-5 py-3 flex items-center gap-2 hover:bg-[var(--primary-dark)] active:scale-95 transition"
        >
          <span className="material-icons-round text-lg">add</span>
          <span className="text-sm font-bold">發起活動</span>
        </Link>

        {/* Header - 浮在地圖上 */}
        <header className="absolute top-0 left-0 right-0 z-20 px-5 pt-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            {/* 搜尋框 */}
            <div className="flex-1 mr-3 flex items-center gap-3 px-4 py-2.5 bg-white/60 backdrop-blur-xl rounded-full border border-white/50 shadow-sm">
              <svg className="w-5 h-5 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                className="flex-1 bg-transparent border-none text-sm placeholder-[#949494] text-[#5C5C5C] focus:outline-none"
                placeholder="搜尋附近的揪團..."
                type="text"
              />
            </div>
            {/* 按鈕 */}
            <div className="flex items-center gap-2">
              <Link
                href="/explore/create"
                className="hidden sm:flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-full text-sm font-bold shadow-[0_12px_30px_rgba(207,185,165,0.3)] hover:bg-[var(--primary-dark)] active:scale-95 transition"
              >
                <span className="material-icons-round text-sm">add</span>
                發起活動
              </Link>
              <button className="w-10 h-10 bg-white/60 backdrop-blur-xl rounded-full border border-white/50 shadow-sm flex items-center justify-center text-[#949494] hover:text-[#5C5C5C] transition relative">
                <div className="absolute top-2 right-2 w-2 h-2 bg-[#E8C4C4] rounded-full" />
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </button>
              <button className="w-10 h-10 bg-white/60 backdrop-blur-xl rounded-full border border-white/50 shadow-sm flex items-center justify-center text-[#949494] hover:text-[#5C5C5C] transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
            </div>
          </div>

          {/* 類別篩選 */}
          <CategoryFilter />
        </header>

        {/* 開團按鈕 - 浮在地圖上 */}
        <button className="absolute bottom-52 right-5 z-20 w-14 h-14 rounded-full bg-[#94A3B8] text-white shadow-xl shadow-[#94A3B8]/40 flex items-center justify-center hover:scale-110 transition-transform">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* 底部揪團卡片列表 - 浮在地圖上 */}
        <div className="absolute bottom-20 left-0 right-0 z-20">
          <TripCardList className="px-5 py-2" />
        </div>

        {/* 底部導覽 - 浮在地圖上 */}
        <MobileNav />
      </div>

      {/* ========== 電腦版 (xl 以上) ========== */}
      <div className="hidden xl:flex flex-col h-screen max-h-screen overflow-hidden">
        {/* 背景漸層 */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
          <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-[#E6DFDA] opacity-30 blur-[70px] rounded-full" />
          <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] bg-[#D4C4B5] opacity-25 blur-[100px] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 px-8 py-6">
          <DesktopHeader />
        </div>

        {/* 主要內容區 */}
        <div className="flex-1 px-8 pb-6 flex gap-6 min-h-0">
          {/* 左側 - 篩選 + 卡片列表 */}
          <div className="w-[400px] flex flex-col gap-4 min-h-0">
            {/* 搜尋框 */}
            <div className="flex items-center gap-3 px-5 py-3 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
              <svg className="w-5 h-5 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                className="flex-1 bg-transparent border-none text-sm placeholder-[#949494] text-[#5C5C5C] focus:outline-none"
                placeholder="搜尋附近的揪團..."
                type="text"
              />
            </div>

            {/* 類別篩選 */}
            <CategoryFilter />

            {/* 標題 + 發起活動 */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#5C5C5C]">附近揪團</h2>
              <Link
                href="/explore/create"
                className="flex items-center gap-2 bg-[#94A3B8] hover:bg-[#8291A6] text-white px-4 py-2 rounded-full text-sm font-bold transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" />
                </svg>
                發起活動
              </Link>
            </div>

            {/* 揪團卡片 - 垂直列表 */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] space-y-3 pr-2">
              {filteredTrips.length === 0 ? (
                <div className="p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-[#B0B0B0] mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                    <p className="text-[#949494]">附近還沒有揪團</p>
                    <p className="text-sm text-[#94A3B8] font-medium mt-2">成為第一個開團的人</p>
                  </div>
                </div>
              ) : (
                filteredTrips.map((trip) => {
                  const isSelected = selectedTrip?.id === trip.id;
                  return (
                    <div
                      key={trip.id}
                      onClick={() => setSelectedTrip(trip)}
                      className={`p-4 backdrop-blur-xl rounded-2xl shadow-lg border flex gap-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white/95 border-white/80 ring-2 ring-[#94A3B8]/50 shadow-xl'
                          : 'bg-white/80 border-white/50 hover:bg-white/90'
                      }`}
                    >
                      {/* 圖片 */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
                        <Image src={trip.image} alt={trip.title} fill className="object-cover" />
                        <div className="absolute top-1.5 right-1.5 bg-black/50 rounded-md px-2 py-0.5 text-[10px] text-white flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                          </svg>
                          {trip.member_count}/{trip.max_members}
                        </div>
                      </div>

                      {/* 內容 */}
                      <div className="flex flex-col justify-center flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`w-2 h-2 rounded-full ${getCategoryColor(trip.category)}`} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${getCategoryTextColor(trip.category)}`}>
                            {formatDate(trip.event_date)}
                          </span>
                          <span className="text-xs text-[#949494] ml-auto">
                            {trip.location}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-[#5C5C5C] mb-2">
                          {trip.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-white">
                            <Image
                              src={trip.organizer_avatar}
                              alt={trip.organizer_name}
                              width={24}
                              height={24}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-sm text-[#949494]">{trip.organizer_name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 右側 - 地圖 */}
          <div className="flex-1 rounded-2xl overflow-hidden shadow-xl border border-white/50">
            <MapComponent
              trips={filteredTrips}
              selectedTrip={selectedTrip}
              onTripSelect={setSelectedTrip}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
