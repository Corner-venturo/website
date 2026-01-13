'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import MobileNav from '@/components/MobileNav'
import { useAuthStore } from '@/stores/auth-store'

const categories = ['推薦', '附近', '奢華露營', '私藏秘境', '底片攝影']

const posts = [
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
]

export default function HomePage() {
  const { initialize, isInitialized } = useAuthStore()
  const [activeCategory, setActiveCategory] = useState('推薦')

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  // Split posts into two columns for masonry effect
  const leftPosts = posts.filter((_, i) => i % 2 === 0)
  const rightPosts = posts.filter((_, i) => i % 2 === 1)

  return (
    <div className="font-display text-primary antialiased bg-[#F4F5F7]">
      <div className="relative min-h-screen w-full flex flex-col">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#F4F5F7] border-b border-[#E2E8F0] pt-12 pb-3 px-4">
          <div className="flex justify-between items-center max-w-md mx-auto relative">
            <button className="flex items-center justify-start text-primary">
              <span className="material-symbols-outlined text-[24px] font-light">menu</span>
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 text-center">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary leading-none mb-0.5">
                Venturo
              </p>
              <h1 className="text-[15px] font-medium tracking-[0.1em] text-primary">探索生活</h1>
            </div>
            <Link href="/explore/search" className="flex items-center justify-end text-primary">
              <span className="material-symbols-outlined text-[24px] font-light">search</span>
            </Link>
          </div>
        </header>

        {/* Category Tabs */}
        <div className="mt-[105px] sticky top-[105px] z-40 bg-[#F4F5F7] border-b border-[#E2E8F0]">
          <div className="px-4 py-3 flex items-center gap-6 overflow-x-auto no-scrollbar max-w-md mx-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[14px] shrink-0 relative ${
                  activeCategory === cat
                    ? "font-bold text-primary after:content-[''] after:absolute after:bottom-[-12px] after:left-0 after:right-0 after:h-[2px] after:bg-primary"
                    : 'font-normal text-[#64748B]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Masonry Grid */}
        <main className="relative z-10 flex-1 px-3 py-4 pb-24 max-w-md mx-auto w-full">
          <div className="grid grid-cols-2 gap-3">
            {/* Left Column */}
            <div className="flex flex-col gap-3">
              {leftPosts.map(post => (
                <Link href={`/explore/${post.id}`} key={post.id} className="bg-white overflow-hidden rounded-[4px]">
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
                    <h3 className="text-[13px] font-medium leading-normal line-clamp-2 mb-2 text-primary">
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
                          <div className="w-4 h-4 rounded-full bg-slate-200" />
                        )}
                        <span className="text-[10px] text-[#64748B]">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-[#64748B]">
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
                <Link href={`/explore/${post.id}`} key={post.id} className="bg-white overflow-hidden rounded-[4px]">
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
                    <h3 className="text-[13px] font-medium leading-normal line-clamp-2 mb-2 text-primary">
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
                          <div className="w-4 h-4 rounded-full bg-slate-300" />
                        )}
                        <span className="text-[10px] text-[#64748B]">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-[#64748B]">
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
