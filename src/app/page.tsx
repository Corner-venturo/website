'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import MobileNav from '@/components/MobileNav'
import { useAuthStore } from '@/stores/auth-store'

const categories = ['推薦', '附近', '奢華露營', '私藏秘境', '底片攝影']

// 每個分類的假資料
const postsByCategory: Record<string, typeof posts> = {
  '推薦': [
    {
      id: 1,
      title: '京都晨間：尋找城市最深處的寧靜',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=800&fit=crop',
      author: 'Ariel_Travels',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      likes: '1.2k',
      aspectRatio: '3/4',
    },
    {
      id: 2,
      title: '森之谷：與靈魂對話的初夏露營',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=600&fit=crop',
      author: 'Camp_Vibe',
      avatar: '',
      likes: '856',
      aspectRatio: '1/1',
    },
    {
      id: 3,
      title: '巷弄裡的琥珀色時光',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=600&fit=crop',
      author: 'Coffee_Soul',
      avatar: '',
      likes: '2.4k',
      aspectRatio: '1/1',
    },
    {
      id: 4,
      title: '巴黎街頭的隨性美學：不經意的時尚角落',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=800&fit=crop',
      author: 'Wanderlust_L',
      avatar: '',
      likes: '3.1k',
      aspectRatio: '3/4',
    },
  ],
  '附近': [
    {
      id: 10,
      title: '台北老城區：迪化街的百年風華',
      image: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=600&h=800&fit=crop',
      author: 'Taipei_Local',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      likes: '892',
      aspectRatio: '3/4',
    },
    {
      id: 11,
      title: '九份山城：霧中漫步的詩意',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
      author: 'Mountain_View',
      avatar: '',
      likes: '1.5k',
      aspectRatio: '1/1',
    },
    {
      id: 12,
      title: '淡水河畔的黃昏時刻',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
      author: 'Sunset_Chaser',
      avatar: '',
      likes: '2.1k',
      aspectRatio: '1/1',
    },
    {
      id: 13,
      title: '北投溫泉：在地人的療癒秘境',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=800&fit=crop',
      author: 'Hot_Spring',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      likes: '756',
      aspectRatio: '3/4',
    },
  ],
  '奢華露營': [
    {
      id: 20,
      title: '星空下的帳篷：苗栗豪華野營體驗',
      image: 'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=600&h=800&fit=crop',
      author: 'Glamping_TW',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      likes: '3.2k',
      aspectRatio: '3/4',
    },
    {
      id: 21,
      title: '森林中的白色穹頂：宜蘭秘境',
      image: 'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?w=600&h=600&fit=crop',
      author: 'Dome_Life',
      avatar: '',
      likes: '2.8k',
      aspectRatio: '1/1',
    },
    {
      id: 22,
      title: '湖畔露營：日月潭的奢華之夜',
      image: 'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=600&h=600&fit=crop',
      author: 'Lake_Camp',
      avatar: '',
      likes: '1.9k',
      aspectRatio: '1/1',
    },
    {
      id: 23,
      title: '雲端上的帳篷：阿里山日出體驗',
      image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&h=800&fit=crop',
      author: 'Cloud_Nine',
      avatar: '',
      likes: '4.1k',
      aspectRatio: '3/4',
    },
  ],
  '私藏秘境': [
    {
      id: 30,
      title: '忘憂森林：被遺忘的仙境',
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=800&fit=crop',
      author: 'Secret_Explorer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      likes: '5.6k',
      aspectRatio: '3/4',
    },
    {
      id: 31,
      title: '花蓮秘境瀑布：只有在地人知道',
      image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600&h=600&fit=crop',
      author: 'Waterfall_Hunter',
      avatar: '',
      likes: '3.4k',
      aspectRatio: '1/1',
    },
    {
      id: 32,
      title: '台東無人海灘：藍色的寧靜',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop',
      author: 'Beach_Secret',
      avatar: '',
      likes: '2.7k',
      aspectRatio: '1/1',
    },
    {
      id: 33,
      title: '綠島藍洞：潛入另一個世界',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=800&fit=crop',
      author: 'Dive_Deep',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      likes: '4.8k',
      aspectRatio: '3/4',
    },
  ],
  '底片攝影': [
    {
      id: 40,
      title: '用底片記錄東京：膠卷裡的復古浪漫',
      image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&h=800&fit=crop',
      author: 'Film_Tokyo',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop',
      likes: '6.2k',
      aspectRatio: '3/4',
    },
    {
      id: 41,
      title: '底片色調：台南老街的時光記憶',
      image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600&h=600&fit=crop',
      author: 'Analog_Life',
      avatar: '',
      likes: '3.9k',
      aspectRatio: '1/1',
    },
    {
      id: 42,
      title: '35mm 鏡頭下的首爾街頭',
      image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&h=600&fit=crop',
      author: 'Seoul_Film',
      avatar: '',
      likes: '2.3k',
      aspectRatio: '1/1',
    },
    {
      id: 43,
      title: '香港霓虹：底片的絢爛夜色',
      image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=600&h=800&fit=crop',
      author: 'Neon_Dreams',
      avatar: '',
      likes: '5.1k',
      aspectRatio: '3/4',
    },
  ],
}

const posts = postsByCategory['推薦']

export default function HomePage() {
  const { initialize, isInitialized } = useAuthStore()
  const [activeCategory, setActiveCategory] = useState('推薦')
  const [prevCategory, setPrevCategory] = useState('推薦')
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left')

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  // 切換分類
  const handleCategoryChange = (newCategory: string) => {
    if (newCategory === activeCategory || isAnimating) return

    const currentIndex = categories.indexOf(activeCategory)
    const newIndex = categories.indexOf(newCategory)

    // 判斷滑動方向
    setSlideDirection(newIndex > currentIndex ? 'left' : 'right')
    setPrevCategory(activeCategory)
    setIsAnimating(true)
    setActiveCategory(newCategory)

    // 動畫結束後重置狀態
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }

  // 當前分類的貼文
  const currentPosts = postsByCategory[activeCategory] || posts
  const leftPosts = currentPosts.filter((_, i) => i % 2 === 0)
  const rightPosts = currentPosts.filter((_, i) => i % 2 === 1)

  return (
    <div className="font-display text-charcoal antialiased bg-bone-white h-screen overflow-hidden">
      <div className="relative h-full w-full flex flex-col overflow-y-auto">
        {/* Header + Category Tabs Container */}
        <div className="sticky top-0 z-50 bg-bone-white">
          {/* Header */}
          <header className="pt-12 pb-3 px-4 border-b border-[var(--divider)]">
            <div className="flex justify-between items-center max-w-md mx-auto relative">
              <button className="flex items-center justify-start text-charcoal">
                <span className="material-symbols-outlined text-[24px] font-light">menu</span>
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 text-center">
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-ocean-teal leading-none mb-0.5">
                  Venturo
                </p>
                <h1 className="text-[15px] font-medium tracking-[0.1em] text-charcoal">探索生活</h1>
              </div>
              <Link href="/explore/search" className="flex items-center justify-end text-charcoal">
                <span className="material-symbols-outlined text-[24px] font-light">search</span>
              </Link>
            </div>
          </header>

          {/* Category Tabs */}
          <div className="border-b border-[var(--divider)]">
            <div className="px-4 py-3 flex items-center gap-6 overflow-x-auto no-scrollbar max-w-md mx-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`text-[14px] shrink-0 relative transition-all duration-200 ${
                    activeCategory === cat
                      ? "font-bold text-ocean-teal after:content-[''] after:absolute after:bottom-[-12px] after:left-0 after:right-0 after:h-[2px] after:bg-ocean-teal"
                      : 'font-normal text-charcoal/50 hover:text-charcoal/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Masonry Grid with Animation */}
        <main className="relative z-10 flex-1 px-3 py-4 pb-24 max-w-md mx-auto w-full overflow-hidden">
          <div
            className={`grid grid-cols-2 gap-3 transition-all duration-300 ease-out ${
              isAnimating
                ? slideDirection === 'left'
                  ? 'opacity-0 translate-x-[-20px]'
                  : 'opacity-0 translate-x-[20px]'
                : 'opacity-100 translate-x-0'
            }`}
          >
            {/* Left Column */}
            <div className="flex flex-col gap-3">
              {leftPosts.map(post => (
                <Link href={`/explore/${post.id}`} key={post.id} className="bg-white overflow-hidden rounded border border-[var(--divider)] transition-transform duration-200 active:scale-[0.98]">
                  <div className={`aspect-[${post.aspectRatio}] overflow-hidden`}>
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={300}
                      height={post.aspectRatio === '3/4' ? 400 : 300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2.5 bg-white">
                    <h3 className="text-[13px] font-medium leading-normal line-clamp-2 mb-2 text-charcoal">
                      {post.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {post.avatar ? (
                          <Image
                            src={post.avatar}
                            alt={post.author}
                            width={16}
                            height={16}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-[var(--divider-light)]" />
                        )}
                        <span className="text-[10px] text-charcoal/50">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-sand-earth">
                        <span className="material-symbols-outlined text-[12px]">favorite</span>
                        <span className="text-[10px]">{post.likes}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-3">
              {rightPosts.map(post => (
                <Link href={`/explore/${post.id}`} key={post.id} className="bg-white overflow-hidden rounded border border-[var(--divider)] transition-transform duration-200 active:scale-[0.98]">
                  <div className={`aspect-[${post.aspectRatio}] overflow-hidden`}>
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={300}
                      height={post.aspectRatio === '3/4' ? 400 : 300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2.5 bg-white">
                    <h3 className="text-[13px] font-medium leading-normal line-clamp-2 mb-2 text-charcoal">
                      {post.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {post.avatar ? (
                          <Image
                            src={post.avatar}
                            alt={post.author}
                            width={16}
                            height={16}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-[var(--divider-light)]" />
                        )}
                        <span className="text-[10px] text-charcoal/50">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-sand-earth">
                        <span className="material-symbols-outlined text-[12px]">favorite</span>
                        <span className="text-[10px]">{post.likes}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <MobileNav />
      </div>
    </div>
  )
}
