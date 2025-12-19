'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import MobileNav from '@/components/MobileNav';
import { useAuthStore } from '@/stores/auth-store';
import { useGroupStore, Group } from '@/stores/group-store';
import TripCard, { DisplayTrip } from './TripCard';
import EmptyState from './EmptyState';
import CategoryFilters from './CategoryFilters';
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
  const { groups, myGroups, fetchGroups, fetchMyGroups } = useGroupStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTrip, setSelectedTrip] = useState<DisplayTrip | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_LOCATION);
  const [searchCenter, setSearchCenter] = useState<[number, number]>(DEFAULT_LOCATION);

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
          return distance <= 2;
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

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSelectedTrip(null);
  };

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

      {/* ========== 手機版佈局 ========== */}
      <div>
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
          <CategoryFilters
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </header>

        {/* 底部揪團卡片列表 - 浮在地圖上 */}
        <div className="absolute bottom-20 left-0 right-0 z-20">
          <div className={`flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-4 px-5 py-2 ${filteredTrips.length <= 1 ? 'justify-center' : ''}`}>
            {filteredTrips.length === 0 ? (
              <div className="snap-center shrink-0 w-[280px]">
                <EmptyState compact />
              </div>
            ) : (
              filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  isSelected={selectedTrip?.id === trip.id}
                  onClick={() => setSelectedTrip(trip)}
                />
              ))
            )}
          </div>
        </div>

        <MobileNav />
      </div>

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
