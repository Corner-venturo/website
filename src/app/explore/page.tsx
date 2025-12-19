'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import MobileNav from '@/components/MobileNav';
import { useAuthStore } from '@/stores/auth-store';
import { useGroupStore, Group } from '@/stores/group-store';
import TripCard, { DisplayTrip, getCategoryColor, getCategoryTextColor, formatDate } from './TripCard';

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
  { id: 'all', label: '全部', icon: 'M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z' },
  { id: 'food', label: '美食', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' },
  { id: 'photo', label: '攝影', icon: 'M12 9a3 3 0 100 6 3 3 0 000-6zM17 6h-2l-1.5-2h-3L9 6H7c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z' },
  { id: 'outdoor', label: '戶外', icon: 'M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z' },
  { id: 'music', label: '音樂', icon: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z' },
  { id: 'coffee', label: '咖啡', icon: 'M2 21h18v-2H2M20 8h-2V5h2m0-2H4v10a4 4 0 004 4h6a4 4 0 004-4v-3h2a2 2 0 002-2V5a2 2 0 00-2-2z' },
];

// Mock 揪團資料 - 集中在台北車站附近（預設位置 25.033, 121.5654 的 2 公里內）
const mockTrips: DisplayTrip[] = [
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

function groupToDisplayTrip(group: Group): DisplayTrip {
  return {
    id: group.id,
    title: group.title,
    category: group.category,
    event_date: group.event_date,
    location: group.location_name || group.location_address || '未指定地點',
    latitude: group.latitude || 25.033,
    longitude: group.longitude || 121.5654,
    member_count: group.current_members,
    max_members: group.max_members,
    organizer_name: group.creator?.display_name || '主辦人',
    organizer_avatar: group.creator?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    image: group.cover_image || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop',
    isMyGroup: false,
  };
}

export default function ExplorePage() {
  const { user, initialize, isInitialized } = useAuthStore();
  const { groups, myGroups, fetchGroups, fetchMyGroups, deleteGroup, updateGroup } = useGroupStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTrip, setSelectedTrip] = useState<DisplayTrip | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([25.033, 121.5654]);
  const [searchCenter, setSearchCenter] = useState<[number, number]>([25.033, 121.5654]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLoggedIn = !!user;

  // 初始化 auth
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  // 載入揪團資料（登入後）
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchGroups({ category: activeCategory === 'all' ? undefined : activeCategory });
      fetchMyGroups(user.id);
    }
  }, [isLoggedIn, user, activeCategory, fetchGroups, fetchMyGroups]);

  // 取得用戶位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          setSearchCenter(loc);
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  const handleBackToMyLocation = useCallback(() => {
    setSearchCenter(userLocation);
  }, [userLocation]);

  const handleCenterChange = useCallback((center: [number, number]) => {
    setSearchCenter(center);
  }, []);

  // 篩選揪團
  const filteredTrips = useMemo(() => {
    if (isLoggedIn) {
      const myGroupsDisplay = myGroups.map(g => ({
        ...groupToDisplayTrip(g),
        isMyGroup: true,
      }));

      const myGroupIds = new Set(myGroups.map(g => g.id));
      const otherGroupsDisplay = groups
        .filter(g => !myGroupIds.has(g.id))
        .map(groupToDisplayTrip);

      const allGroups = [...myGroupsDisplay, ...otherGroupsDisplay];

      return allGroups
        .filter((trip) => {
          if (trip.isMyGroup) return true;
          const distance = getDistanceFromLatLonInKm(
            searchCenter[0],
            searchCenter[1],
            trip.latitude,
            trip.longitude
          );
          return distance <= 10;
        })
        .filter((trip) => activeCategory === 'all' || trip.category === activeCategory);
    }

    return mockTrips
      .filter((trip) => {
        const distance = getDistanceFromLatLonInKm(
          searchCenter[0],
          searchCenter[1],
          trip.latitude,
          trip.longitude
        );
        return distance <= 2;
      })
      .filter((trip) => activeCategory === 'all' || trip.category === activeCategory);
  }, [searchCenter, activeCategory, isLoggedIn, groups, myGroups]);

  // 預設選中第一個
  useEffect(() => {
    if (filteredTrips.length > 0 && !selectedTrip) {
      setSelectedTrip(filteredTrips[0]);
    }
  }, [filteredTrips, selectedTrip]);

  const handleDeleteGroup = async (groupId: string) => {
    setIsDeleting(true);
    const result = await deleteGroup(groupId);
    setIsDeleting(false);
    setDeleteConfirm(null);
    if (result.success) {
      setSelectedTrip(null);
      if (user) {
        fetchMyGroups(user.id);
        fetchGroups();
      }
    }
  };

  const handleCloseGroup = async (groupId: string) => {
    const result = await updateGroup(groupId, { status: 'completed' });
    if (result.success && user) {
      fetchMyGroups(user.id);
      fetchGroups();
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSelectedTrip(null);
  };

  // 類別篩選按鈕
  const CategoryButton = ({ cat }: { cat: typeof categories[0] }) => (
    <button
      onClick={() => handleCategoryChange(cat.id)}
      className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
        activeCategory === cat.id
          ? 'bg-[#94A3B8] text-white shadow-lg shadow-[#94A3B8]/30'
          : 'bg-white/60 text-[#5C5C5C] border border-white/50 hover:bg-white/80'
      }`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d={cat.icon} />
      </svg>
      {cat.label}
    </button>
  );

  // 空狀態組件
  const EmptyState = ({ compact = false }: { compact?: boolean }) => (
    <div className={`${compact ? 'p-4' : 'p-6'} bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 text-center`}>
      <svg className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} text-[#B0B0B0] mx-auto ${compact ? 'mb-2' : 'mb-3'}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
      <p className={`${compact ? 'text-sm' : ''} text-[#949494] ${compact ? 'mb-0' : 'mb-2'}`}>附近還沒有揪團</p>
      {compact ? (
        <button className="text-xs text-[#94A3B8] font-medium mt-2">成為第一個開團的人</button>
      ) : (
        <Link href="/explore/create" className="text-sm text-[#94A3B8] font-medium hover:underline">
          成為第一個開團的人 →
        </Link>
      )}
    </div>
  );

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden relative">
      {/* 地圖 - 全螢幕背景 */}
      <div className="absolute inset-0 z-0">
        <MapComponent
          trips={filteredTrips}
          selectedTrip={selectedTrip}
          onTripSelect={setSelectedTrip}
          searchCenter={searchCenter}
          onCenterChange={handleCenterChange}
        />
      </div>

      {/* ========== 電腦版佈局 ========== */}
      <div className="hidden xl:block absolute inset-0 z-20">
        {/* 電腦版 Header */}
        <header className="absolute top-6 left-6 right-6 z-30">
          <div className="flex items-center justify-between py-4 px-8 bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D6CDC8] text-white font-bold flex items-center justify-center">
                  V
                </div>
                <span className="text-xl font-bold text-[#5C5C5C]">VENTURO</span>
              </Link>
              <nav className="flex items-center gap-8 ml-12">
                <Link href="/" className="text-[#949494] hover:text-[#5C5C5C] transition">首頁</Link>
                <Link href="/explore" className="text-[#94A3B8] font-medium border-b-2 border-[#94A3B8] pb-1">探索</Link>
                <Link href="/orders" className="text-[#949494] hover:text-[#5C5C5C] transition">訂單</Link>
                <Link href="/wishlist" className="text-[#949494] hover:text-[#5C5C5C] transition">收藏</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-full border border-white/40 w-64">
                <svg className="w-5 h-5 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  className="flex-1 bg-transparent border-none text-sm placeholder-[#949494] text-[#5C5C5C] focus:outline-none"
                  placeholder="搜尋揪團..."
                  type="text"
                />
              </div>
              <Link href="/my" className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-full border border-white/40 hover:bg-white/80 transition">
                <div className="w-8 h-8 rounded-full bg-[#D6CDC8] text-white font-bold text-sm flex items-center justify-center">
                  旅
                </div>
                <span className="text-sm font-medium text-[#5C5C5C]">我的</span>
              </Link>
            </div>
          </div>
        </header>

        {/* 電腦版 - 回到目前位置按鈕 */}
        <button
          onClick={handleBackToMyLocation}
          className="absolute right-6 bottom-6 z-30 w-12 h-12 bg-white/90 backdrop-blur-xl text-[#5C5C5C] shadow-lg rounded-full flex items-center justify-center hover:bg-white active:scale-95 transition border border-white/50"
          title="回到目前位置"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
          </svg>
        </button>

        {/* 電腦版側邊欄 - 揪團列表 */}
        <div className="absolute left-6 top-32 bottom-6 w-[360px] z-20 flex flex-col gap-4">
          {/* 類別篩選 */}
          <div className="flex flex-wrap gap-2 p-4 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg">
            {categories.map((cat) => (
              <CategoryButton key={cat.id} cat={cat} />
            ))}
          </div>

          {/* 揪團卡片列表 */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            {filteredTrips.length === 0 ? (
              <EmptyState />
            ) : (
              filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  isSelected={selectedTrip?.id === trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  onClose={handleCloseGroup}
                  onDelete={(id) => setDeleteConfirm(id)}
                />
              ))
            )}
          </div>

          {/* 發起活動按鈕 */}
          <Link
            href="/explore/create"
            className="flex items-center justify-center gap-2 py-4 bg-[#94A3B8] text-white rounded-2xl shadow-lg shadow-[#94A3B8]/30 hover:bg-[#8291A6] transition font-medium"
          >
            <span className="material-icons-round">add</span>
            發起揪團
          </Link>
        </div>
      </div>

      {/* ========== 手機版佈局 ========== */}
      <div className="xl:hidden">
        {/* 右側浮動按鈕組 */}
        <div className="fixed right-5 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
          <button
            onClick={handleBackToMyLocation}
            className="w-14 h-14 bg-white/90 backdrop-blur-xl text-[#5C5C5C] shadow-lg rounded-full flex items-center justify-center hover:bg-white active:scale-95 transition border border-white/50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
            </svg>
          </button>
          <Link
            href="/explore/create"
            className="w-14 h-14 bg-[#94A3B8] text-white shadow-[0_8px_24px_rgba(148,163,184,0.4)] rounded-full flex items-center justify-center hover:bg-[#8291A6] active:scale-95 transition"
          >
            <span className="material-icons-round text-2xl">add</span>
          </Link>
        </div>

        {/* Header - 浮在地圖上 */}
        <header className="absolute top-0 left-0 right-0 z-20 px-5 pt-4 pb-3">
          <div className="flex items-center justify-between mb-4">
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
            <div className="flex items-center gap-2">
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
          <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
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
        </header>

        {/* 底部揪團卡片列表 - 浮在地圖上 */}
        <div className="absolute bottom-20 left-0 right-0 z-20">
          <div className={`flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-4 px-5 py-2 ${filteredTrips.length === 0 ? 'justify-center' : ''}`}>
            {filteredTrips.length === 0 ? (
              <div className="snap-center shrink-0 w-[280px]">
                <EmptyState compact />
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
        </div>

        <MobileNav />
      </div>

      {/* 刪除確認 Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#5C5C5C] mb-2">確定要刪除這個揪團嗎？</h3>
              <p className="text-sm text-[#949494] mb-6">刪除後將無法復原，所有成員也會收到通知。</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-[#5C5C5C] rounded-xl font-medium hover:bg-gray-200 transition"
                  disabled={isDeleting}
                >
                  取消
                </button>
                <button
                  onClick={() => handleDeleteGroup(deleteConfirm)}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? '刪除中...' : '確定刪除'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaflet Popup z-index 修正 */}
      <style jsx global>{`
        .leaflet-popup-pane {
          z-index: 700 !important;
        }
        .leaflet-popup {
          z-index: 700 !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .leaflet-popup-tip {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
