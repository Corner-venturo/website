'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import { useAuthStore } from '@/stores/auth-store'

const categories = ['全部', '行程', '創作者', '主題', '活動']

const searchResults = [
  {
    id: 1,
    title: '奢華露營：星空下的秘境體驗',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=800&fit=crop',
    author: 'Camp_Vibe',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    likes: '2.8k',
    aspectRatio: '3/4',
  },
  {
    id: 2,
    title: '森林露營小食指南：大自然的美味時光',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&h=600&fit=crop',
    author: 'Outdoor_Chef',
    avatar: '',
    likes: '1.5k',
    aspectRatio: '1/1',
  },
  {
    id: 3,
    title: '湖畔露營：晨霧中的寧靜時刻',
    image: 'https://images.unsplash.com/photo-1487730116445-4f28e6f8b176?w=600&h=600&fit=crop',
    author: 'Nature_Soul',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    likes: '3.2k',
    aspectRatio: '1/1',
  },
  {
    id: 4,
    title: '山谷秘境：被遺忘的露營天堂',
    image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&h=800&fit=crop',
    author: 'Wild_Explorer',
    avatar: '',
    likes: '4.1k',
    aspectRatio: '3/4',
  },
  {
    id: 5,
    title: '露營裝備清單：從入門到專業',
    image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&h=600&fit=crop',
    author: 'Gear_Pro',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    likes: '987',
    aspectRatio: '1/1',
  },
  {
    id: 6,
    title: '親子露營：與孩子一起探索自然',
    image: 'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=600&h=800&fit=crop',
    author: 'Family_Camp',
    avatar: '',
    likes: '2.1k',
    aspectRatio: '3/4',
  },
]

function ExploreSearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { initialize, isInitialized } = useAuthStore()
  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '露營')

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  // Split posts into two columns for masonry effect
  const leftPosts = searchResults.filter((_, i) => i % 2 === 0)
  const rightPosts = searchResults.filter((_, i) => i % 2 === 1)

  return (
    <div className="font-display text-primary antialiased bg-[#F4F5F7]">
      <div className="relative min-h-screen w-full flex flex-col">
        {/* Header with Search */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#F4F5F7] border-b border-[#E2E8F0] pt-12 pb-3 px-4">
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <button onClick={() => router.back()} className="text-primary">
              <span className="material-symbols-outlined text-[24px] font-light">arrow_back</span>
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋行程、創作者、主題..."
                className="w-full h-10 pl-10 pr-4 rounded-full bg-white border border-[#E2E8F0] text-[14px] focus:outline-none focus:border-primary"
              />
              <span className="material-symbols-outlined text-[20px] text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2">
                search
              </span>
            </div>
          </div>
        </header>

        {/* Category Filters */}
        <div className="mt-[88px] sticky top-[88px] z-40 bg-[#F4F5F7] border-b border-[#E2E8F0]">
          <div className="px-4 py-3 flex items-center gap-3 overflow-x-auto no-scrollbar max-w-md mx-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[13px] shrink-0 transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-white font-bold'
                    : 'bg-white border border-[#E2E8F0] text-[#64748B] font-medium'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Header */}
        <div className="px-4 pt-4 pb-2 max-w-md mx-auto w-full">
          <p className="text-[12px] text-[#64748B]">
            找到 <span className="font-bold text-primary">{searchResults.length}</span> 個關於「{searchQuery}」的結果
          </p>
        </div>

        {/* Main Content - Masonry Grid */}
        <main className="relative z-10 flex-1 px-3 py-2 pb-24 max-w-md mx-auto w-full">
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

export default function ExploreSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
        <div className="text-[#64748B]">載入中...</div>
      </div>
    }>
      <ExploreSearchContent />
    </Suspense>
  )
}
