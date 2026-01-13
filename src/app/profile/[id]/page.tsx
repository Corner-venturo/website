'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'

// Mock user data
const mockUsers: Record<string, {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  isPro: boolean
  worksCount: number
  followersCount: number
  footprintsCount: number
  posts: { id: string; image: string; title: string; likes: string }[]
  collections: { id: string; image: string; title: string; likes: string }[]
}> = {
  user1: {
    id: 'user1',
    name: 'Ariel Chen',
    username: 'Ariel_Travels',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    bio: '生活在他方，探索不曾停歇。熱愛京都與北歐的自由旅人。',
    isPro: true,
    worksCount: 128,
    followersCount: 2400,
    footprintsCount: 850,
    posts: [
      { id: '1', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=500&fit=crop', title: '京都清晨：一個人的清水寺散策', likes: '1.2k' },
      { id: '5', image: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400&h=300&fit=crop', title: '北歐風情畫：哥本哈根的彩色街道', likes: '856' },
      { id: '6', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop', title: '山林裡的靈魂休憩：不鏽鋼杯的溫度', likes: '542' },
      { id: '7', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=500&fit=crop', title: '巷弄裡的咖啡香：東京古物咖啡店', likes: '2.1k' },
      { id: '8', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=350&fit=crop', title: '祇園的午後時光', likes: '1.5k' },
      { id: '9', image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=450&fit=crop', title: '富士山下的寧靜', likes: '3.2k' },
    ],
    collections: [
      { id: 'c1', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=400&fit=crop', title: '巴黎散步地圖', likes: '456' },
      { id: 'c2', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=500&fit=crop', title: '歐洲咖啡廳收藏', likes: '328' },
    ],
  },
  user2: {
    id: 'user2',
    name: 'Kevin Lin',
    username: 'Camp_Vibe',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    bio: '戶外愛好者 | 露營達人\n帶你發現台灣最美的秘境營地',
    isPro: false,
    worksCount: 86,
    followersCount: 8900,
    footprintsCount: 320,
    posts: [
      { id: '2', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop', title: '森之谷：與靈魂對話的初夏露營', likes: '856' },
      { id: '10', image: 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=400&h=500&fit=crop', title: '星空下的營火夜', likes: '1.0k' },
      { id: '11', image: 'https://images.unsplash.com/photo-1533873984035-25970ab07461?w=400&h=350&fit=crop', title: '晨霧中的帳篷', likes: '567' },
    ],
    collections: [],
  },
  user3: {
    id: 'user3',
    name: 'Coffee Soul',
    username: 'Coffee_Soul',
    avatar: '',
    bio: '咖啡愛好者 | 尋找城市中的咖啡香',
    isPro: false,
    worksCount: 45,
    followersCount: 5600,
    footprintsCount: 180,
    posts: [
      { id: '3', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop', title: '巷弄裡的琥珀色時光', likes: '2.4k' },
      { id: '13', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=500&fit=crop', title: '手沖的藝術', likes: '1.2k' },
    ],
    collections: [],
  },
  user4: {
    id: 'user4',
    name: 'Luna Wang',
    username: 'Wanderlust_L',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    bio: '時尚旅人 | 歐洲生活紀錄\n目前旅居巴黎，分享法式日常',
    isPro: true,
    worksCount: 203,
    followersCount: 28500,
    footprintsCount: 1200,
    posts: [
      { id: '4', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=500&fit=crop', title: '巴黎街頭的隨性美學', likes: '3.1k' },
      { id: '15', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=400&fit=crop', title: '塞納河畔的午後', likes: '2.4k' },
      { id: '16', image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=400&h=450&fit=crop', title: '蒙馬特的日落', likes: '2.0k' },
    ],
    collections: [],
  },
}

type TabType = 'posts' | 'collections'
type ViewType = 'grid' | 'list'

export default function TravelerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [activeTab, setActiveTab] = useState<TabType>('posts')
  const [viewType, setViewType] = useState<ViewType>('grid')
  const [isFollowing, setIsFollowing] = useState(false)

  // Find the user
  const user = mockUsers[userId] || mockUsers['user1']

  const formatNumber = (num: number) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString()
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/profile/${userId}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.username} 的旅人誌`,
          text: user.bio,
          url: shareUrl,
        })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
    }
  }

  const currentItems = activeTab === 'posts' ? user.posts : user.collections

  return (
    <div className="font-display text-charcoal antialiased bg-bone-white min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-bone-white border-b border-[var(--divider)]">
        <div className="pt-12 pb-3 px-4 max-w-md mx-auto">
          <div className="flex justify-between items-center relative">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-start text-charcoal"
            >
              <span className="material-symbols-outlined text-[24px] font-light">arrow_back</span>
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 text-center">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-ocean-teal leading-none mb-0.5">
                Venturo
              </p>
              <h1 className="text-[15px] font-medium tracking-[0.1em] text-charcoal">旅人誌</h1>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center justify-end text-charcoal"
            >
              <span className="material-symbols-outlined text-[24px] font-light">share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-5 pt-[90px] pb-24 max-w-md mx-auto w-full">
        {/* Profile Section */}
        <section className="mb-8 flex gap-6">
          {/* Left: Avatar & Info */}
          <div className="flex-1">
            <div className="relative w-20 h-20 mb-4">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[var(--divider)] flex items-center justify-center shadow-sm">
                  <span className="text-2xl text-charcoal/40 font-bold">{user.name[0]}</span>
                </div>
              )}
              {user.isPro && (
                <div className="absolute -bottom-1 -right-1 bg-sand-earth text-bone-white text-[9px] px-1.5 py-0.5 rounded-full font-bold border-2 border-bone-white uppercase">
                  Pro
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold mb-2 tracking-tight">{user.username}</h2>
            <p className="text-[12px] text-charcoal/50 leading-relaxed whitespace-pre-line">{user.bio}</p>
          </div>

          {/* Right: Stats & Actions */}
          <div className="flex flex-col justify-center items-end gap-5">
            {/* Stats */}
            <div className="flex gap-6 pr-1">
              <div className="text-center">
                <p className="text-[15px] font-bold">{user.worksCount}</p>
                <p className="text-[10px] text-charcoal/50 font-medium">作品</p>
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold">{formatNumber(user.followersCount)}</p>
                <p className="text-[10px] text-charcoal/50 font-medium">關注者</p>
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold">{user.footprintsCount}</p>
                <p className="text-[10px] text-charcoal/50 font-medium">足跡</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-5 py-2 rounded-full text-[12px] font-bold shadow-sm active:scale-95 transition-transform ${
                  isFollowing
                    ? 'bg-[var(--divider-light)] text-charcoal'
                    : 'bg-ocean-teal text-bone-white'
                }`}
              >
                {isFollowing ? '已關注' : '關注'}
              </button>
              <button className="w-9 h-9 border border-[var(--divider)] rounded-full flex items-center justify-center text-sand-earth active:scale-95 transition-transform bg-white/50">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              </button>
              <button className="w-9 h-9 border border-[var(--divider)] rounded-full flex items-center justify-center text-charcoal active:scale-95 transition-transform bg-white/50">
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </button>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="mt-4">
          {/* Tab Header */}
          <div className="flex justify-between items-center mb-5 sticky top-[90px] z-20 bg-bone-white py-2">
            <div className="flex gap-6 items-center">
              <button
                onClick={() => setActiveTab('posts')}
                className={`text-[13px] tracking-widest pb-1 ${
                  activeTab === 'posts'
                    ? 'font-bold text-ocean-teal border-b-2 border-ocean-teal'
                    : 'font-medium text-charcoal/50'
                }`}
              >
                旅人誌
              </button>
              <button
                onClick={() => setActiveTab('collections')}
                className={`text-[13px] tracking-widest pb-1 ${
                  activeTab === 'collections'
                    ? 'font-bold text-ocean-teal border-b-2 border-ocean-teal'
                    : 'font-medium text-charcoal/50'
                }`}
              >
                收藏夾
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewType('grid')}
                className={`material-symbols-outlined text-[18px] ${
                  viewType === 'grid' ? 'text-ocean-teal' : 'text-charcoal/30'
                }`}
              >
                grid_view
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`material-symbols-outlined text-[18px] ${
                  viewType === 'list' ? 'text-ocean-teal' : 'text-charcoal/30'
                }`}
              >
                list
              </button>
            </div>
          </div>

          {/* Content Grid - Masonry Style */}
          {currentItems.length > 0 ? (
            <div className="columns-2 gap-3">
              {currentItems.map((item) => (
                <Link
                  href={`/explore/${item.id}`}
                  key={item.id}
                  className="break-inside-avoid mb-3 block"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[var(--divider)]/50">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={200}
                      height={250}
                      className="w-full object-cover"
                    />
                    <div className="p-3">
                      <h4 className="text-[12px] font-bold leading-relaxed mb-2 line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-charcoal/50">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] text-[#FF3B30]">favorite</span>
                          {item.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-charcoal/40">
              <span className="material-symbols-outlined text-[48px] mb-2">
                {activeTab === 'posts' ? 'photo_library' : 'bookmark'}
              </span>
              <p className="text-[14px]">
                {activeTab === 'posts' ? '尚無作品' : '尚無收藏'}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Bottom Navigation */}
      <MobileNav />
    </div>
  )
}
