'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

// 動態載入地圖組件
const MapComponent = dynamic(() => import('../MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#E8E4DC] flex items-center justify-center">
      <div className="text-[#949494]">載入地圖中...</div>
    </div>
  ),
})

// 假資料 - 揪團列表
const mockGroups = [
  {
    id: '1',
    title: '嵐山秘境露營',
    category: 'outdoor',
    categoryLabel: '秘境探索',
    event_date: '2024-06-15',
    location: '嵐山秘境露營區',
    latitude: 25.0330,
    longitude: 121.5654,
    member_count: 2,
    max_members: 4,
    organizer_name: 'Jasmine',
    organizer_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop',
  },
  {
    id: '2',
    title: '週末咖啡漫步',
    category: 'coffee',
    categoryLabel: '美食之旅',
    event_date: '2024-06-18',
    location: '大安區巷弄咖啡',
    latitude: 25.0280,
    longitude: 121.5430,
    member_count: 3,
    max_members: 6,
    organizer_name: 'Kevin',
    organizer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
  },
  {
    id: '3',
    title: '陽明山夜景攝影',
    category: 'photo',
    categoryLabel: '攝影創作',
    event_date: '2024-06-20',
    location: '陽明山觀景台',
    latitude: 25.0500,
    longitude: 121.5500,
    member_count: 1,
    max_members: 5,
    organizer_name: 'Mia',
    organizer_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=400&fit=crop',
  },
]

interface Group {
  id: string
  title: string
  category: string
  categoryLabel: string
  event_date: string
  location: string
  latitude: number
  longitude: number
  member_count: number
  max_members: number
  organizer_name: string
  organizer_avatar: string
  image: string
}

export default function ExploreMapPage() {
  const pathname = usePathname()
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(mockGroups[0])
  const [searchCenter, setSearchCenter] = useState<[number, number]>([25.0330, 121.5654])
  const [searchQuery, setSearchQuery] = useState('')

  // 轉換資料格式以符合 MapComponent
  const tripsForMap = useMemo(() => {
    return mockGroups.map(g => ({
      id: g.id,
      title: g.title,
      category: g.category,
      event_date: g.event_date,
      location: g.location,
      latitude: g.latitude,
      longitude: g.longitude,
      member_count: g.member_count,
      max_members: g.max_members,
      organizer_name: g.organizer_name,
      organizer_avatar: g.organizer_avatar,
      image: g.image,
    }))
  }, [])

  const handleTripSelect = useCallback((trip: typeof tripsForMap[0]) => {
    const group = mockGroups.find(g => g.id === trip.id)
    if (group) {
      setSelectedGroup(group)
    }
  }, [])

  const handleCenterChange = useCallback((center: [number, number]) => {
    setSearchCenter(center)
  }, [])

  return (
    <div className="font-display text-charcoal antialiased bg-bone-white overflow-hidden">
      <div className="relative h-screen w-full flex flex-col">
        {/* 背景光暈 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-ocean-teal/5 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-10 w-80 h-80 bg-sand-earth/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-ocean-teal/5 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 pt-14 px-5 pointer-events-none">
          <div className="max-w-md mx-auto space-y-3 pointer-events-auto">
            <div className="flex justify-between items-center px-1">
              <h1 className="text-[22px] font-bold tracking-tight text-charcoal">揪團探索地圖</h1>
              <button className="w-10 h-10 flex items-center justify-center bg-bone-white/90 backdrop-blur-md rounded-full border border-[var(--divider)] shadow-sm">
                <span className="material-symbols-outlined text-[20px] font-light">tune</span>
              </button>
            </div>
            <div className="relative flex items-center bg-bone-white/95 backdrop-blur-md rounded-2xl border border-[var(--divider)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-4 py-3.5">
              <span className="material-symbols-outlined text-[20px] text-charcoal/40">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] ml-2 placeholder:text-charcoal/40 text-charcoal"
                placeholder="搜尋目的地、活動或揪團..."
              />
            </div>
          </div>
        </header>

        {/* Map Container */}
        <div className="absolute inset-0 z-0">
          <MapComponent
            trips={tripsForMap}
            selectedTrip={selectedGroup ? {
              ...selectedGroup,
              id: selectedGroup.id,
              title: selectedGroup.title,
              category: selectedGroup.category,
              event_date: selectedGroup.event_date,
              location: selectedGroup.location,
              latitude: selectedGroup.latitude,
              longitude: selectedGroup.longitude,
              member_count: selectedGroup.member_count,
              max_members: selectedGroup.max_members,
              organizer_name: selectedGroup.organizer_name,
              organizer_avatar: selectedGroup.organizer_avatar,
              image: selectedGroup.image,
            } : null}
            onTripSelect={handleTripSelect}
            searchCenter={searchCenter}
            onCenterChange={handleCenterChange}
          />
        </div>

        {/* Bottom Content Area */}
        <div className="relative z-10 mt-auto flex flex-col pointer-events-none">
          {/* Create Group Button */}
          <div className="flex justify-end px-5 mb-4 max-w-md mx-auto w-full pointer-events-auto">
            <Link
              href="/explore/create"
              className="bg-ocean-teal text-bone-white pl-4 pr-6 py-4 rounded-full shadow-[0_12px_30px_rgba(74,107,106,0.35)] flex items-center gap-2 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined !text-[22px]">add</span>
              <span className="text-[15px] font-bold tracking-wide">發起揪團</span>
            </Link>
          </div>

          {/* Selected Group Card */}
          {selectedGroup && (
            <div className="px-5 mb-5 max-w-md mx-auto w-full pointer-events-auto">
              <Link
                href={`/explore/${selectedGroup.id}`}
                className="bg-bone-white/95 backdrop-blur-md rounded-[32px] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[var(--divider)] flex gap-4 overflow-hidden group block"
              >
                <div className="w-28 h-28 rounded-[22px] overflow-hidden flex-shrink-0">
                  <Image
                    src={selectedGroup.image}
                    alt={selectedGroup.title}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center flex-1 py-1 pr-2">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-sand-earth/10 text-sand-earth text-[10px] font-bold uppercase tracking-wider">
                      {selectedGroup.categoryLabel}
                    </span>
                    <div className="flex items-center text-charcoal/40 gap-1">
                      <span className="material-symbols-outlined text-[12px]">group</span>
                      <span className="text-[11px] font-medium tracking-tight">
                        {selectedGroup.member_count}/{selectedGroup.max_members} 人
                      </span>
                    </div>
                  </div>
                  <h3 className="text-[17px] font-bold text-charcoal leading-snug mb-1">
                    {selectedGroup.title}
                  </h3>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full overflow-hidden">
                        <Image
                          src={selectedGroup.organizer_avatar}
                          alt={selectedGroup.organizer_name}
                          width={20}
                          height={20}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[12px] text-charcoal/50 font-medium">
                        發起人：{selectedGroup.organizer_name}
                      </span>
                    </div>
                    <div className="flex items-center text-ocean-teal/60 group-hover:text-ocean-teal group-active:translate-x-1 transition-all">
                      <span className="text-[12px] font-bold mr-0.5">查看詳情</span>
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Floating Bottom Navigation */}
          <div className="px-5 pb-8 max-w-md mx-auto w-full pointer-events-auto">
            <nav className="bg-bone-white/95 backdrop-blur-md border border-[var(--divider)] rounded-[30px] h-[76px] flex items-center justify-around px-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]">
              <Link
                href="/"
                className={`flex flex-col items-center justify-center gap-1 w-16 ${
                  pathname === '/' ? 'text-ocean-teal' : 'text-charcoal/40'
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${pathname === '/' ? 'font-medium' : 'font-light'}`}>
                  home
                </span>
                <span className={`text-[10px] ${pathname === '/' ? 'font-bold' : 'font-medium'}`}>首頁</span>
              </Link>
              <Link
                href="/explore/map"
                className={`flex flex-col items-center justify-center gap-1 w-16 ${
                  pathname.startsWith('/explore') ? 'text-ocean-teal' : 'text-charcoal/40'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[24px] ${pathname.startsWith('/explore') ? 'font-medium' : 'font-light'}`}
                  style={pathname.startsWith('/explore') ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  explore
                </span>
                <span className={`text-[10px] ${pathname.startsWith('/explore') ? 'font-bold' : 'font-medium'}`}>探索</span>
              </Link>
              <Link
                href="/my/chat"
                className={`flex flex-col items-center justify-center gap-1 w-16 ${
                  pathname.startsWith('/my/chat') ? 'text-ocean-teal' : 'text-charcoal/40'
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${pathname.startsWith('/my/chat') ? 'font-medium' : 'font-light'}`}>
                  chat_bubble
                </span>
                <span className={`text-[10px] ${pathname.startsWith('/my/chat') ? 'font-bold' : 'font-medium'}`}>訊息</span>
              </Link>
              <Link
                href="/my"
                className={`flex flex-col items-center justify-center gap-1 w-16 ${
                  pathname === '/my' || (pathname.startsWith('/my') && !pathname.startsWith('/my/chat')) ? 'text-ocean-teal' : 'text-charcoal/40'
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${pathname === '/my' || (pathname.startsWith('/my') && !pathname.startsWith('/my/chat')) ? 'font-medium' : 'font-light'}`}>
                  person
                </span>
                <span className={`text-[10px] ${pathname === '/my' || (pathname.startsWith('/my') && !pathname.startsWith('/my/chat')) ? 'font-bold' : 'font-medium'}`}>我的</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
