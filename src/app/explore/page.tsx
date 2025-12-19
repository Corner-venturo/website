'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import MobileNav from '@/components/MobileNav';
import { useAuthStore } from '@/stores/auth-store';
import { useGroupStore, Group } from '@/stores/group-store';
import TripCard, { DisplayTrip, getCategoryColor, getCategoryTextColor, formatDate } from './TripCard';
import EmptyState from './EmptyState';
import ConfirmModal from '@/components/ConfirmModal';
import { categories, mockTrips, getDistanceFromLatLonInKm, DEFAULT_LOCATION } from './constants';

// 動態載入地圖（避免 SSR 問題）
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#E8E4DC] flex items-center justify-center">
      <div className="text-[#949494]">載入地圖中...</div>
    </div>
  ),
});

function groupToDisplayTrip(group: Group): DisplayTrip {
  return {
    id: group.id,
    title: group.title,
    category: group.category,
    event_date: group.event_date,
    location: group.location_name || group.location_address || '未指定地點',
    latitude: group.latitude || DEFAULT_LOCATION[0],
    longitude: group.longitude || DEFAULT_LOCATION[1],
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
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_LOCATION);
  const [searchCenter, setSearchCenter] = useState<[number, number]>(DEFAULT_LOCATION);
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
  const CategoryButton = ({ cat, mobile = false }: { cat: typeof categories[number]; mobile?: boolean }) => (
    <button
      onClick={() => handleCategoryChange(cat.id)}
      className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
        activeCategory === cat.id
          ? 'bg-[#94A3B8] text-white shadow-lg shadow-[#94A3B8]/30'
          : mobile
          ? 'bg-white/60 backdrop-blur-xl text-[#5C5C5C] border border-white/50 hover:bg-white/80'
          : 'bg-white/60 text-[#5C5C5C] border border-white/50 hover:bg-white/80'
      }`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d={cat.icon} />
      </svg>
      {cat.label}
    </button>
  );

  // 手機版揪團卡片（簡化版）
  const MobileTripCard = ({ trip, isSelected }: { trip: DisplayTrip; isSelected: boolean }) => (
    <div
      onClick={() => setSelectedTrip(trip)}
      className={`snap-center shrink-0 w-[280px] p-3 backdrop-blur-xl rounded-2xl shadow-lg border flex gap-3 cursor-pointer transition-all ${
        isSelected
          ? 'bg-white/95 border-white/80 ring-2 ring-[#94A3B8]/50 shadow-xl'
          : 'bg-white/80 border-white/50 opacity-80 scale-95'
      }`}
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
        <Image src={trip.image} alt={trip.title} fill className="object-cover" />
        <div className="absolute top-1 right-1 bg-black/50 rounded-md px-1.5 py-0.5 text-[10px] text-white flex items-center gap-0.5">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
          {trip.member_count}/{trip.max_members}
        </div>
      </div>
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
        <h3 className="font-bold text-sm text-[#5C5C5C] truncate mb-1.5">{trip.title}</h3>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full overflow-hidden ring-2 ring-white">
            <Image src={trip.organizer_avatar} alt={trip.organizer_name} width={20} height={20} className="w-full h-full object-cover" />
          </div>
          <span className="text-xs text-[#949494]">{trip.organizer_name}</span>
        </div>
      </div>
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
                <div className="w-10 h-10 rounded-full bg-[#D6CDC8] text-white font-bold flex items-center justify-center">V</div>
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
                <input className="flex-1 bg-transparent border-none text-sm placeholder-[#949494] text-[#5C5C5C] focus:outline-none" placeholder="搜尋揪團..." type="text" />
              </div>
              <Link href="/my" className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-full border border-white/40 hover:bg-white/80 transition">
                <div className="w-8 h-8 rounded-full bg-[#D6CDC8] text-white font-bold text-sm flex items-center justify-center">旅</div>
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
              <input className="flex-1 bg-transparent border-none text-sm placeholder-[#949494] text-[#5C5C5C] focus:outline-none" placeholder="搜尋附近的揪團..." type="text" />
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
              <CategoryButton key={cat.id} cat={cat} mobile />
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
              filteredTrips.map((trip) => (
                <MobileTripCard key={trip.id} trip={trip} isSelected={selectedTrip?.id === trip.id} />
              ))
            )}
          </div>
        </div>

        <MobileNav />
      </div>

      {/* 刪除確認 Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeleteGroup(deleteConfirm)}
        title="確定要刪除這個揪團嗎？"
        description="刪除後將無法復原，所有成員也會收到通知。"
        confirmText="確定刪除"
        isLoading={isDeleting}
        variant="danger"
      />

      {/* Leaflet Popup z-index 修正 */}
      <style jsx global>{`
        .leaflet-popup-pane { z-index: 700 !important; }
        .leaflet-popup { z-index: 700 !important; }
        .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .leaflet-popup-tip { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
}
