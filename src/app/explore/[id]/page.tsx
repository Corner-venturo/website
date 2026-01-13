'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

// Mock posts data
const mockPosts = [
  {
    id: '1',
    title: '京都晨間：尋找城市最深處的寧靜',
    content: `清晨五點半，京都的街道還籠罩在薄霧之中。我獨自漫步在花見小路，聽著自己的腳步聲在石板路上迴響。

這是我第三次來京都，卻是第一次真正感受到這座城市的靈魂。沒有遊客的喧囂，沒有藝妓表演的人潮，只有偶爾經過的晨起居民和遠處傳來的寺廟鐘聲。

我在一間只有三張桌子的小咖啡店停下，老闆娘用流利的京都腔問我要不要試試她的抹茶拿鐵。那一杯綠色的溫暖，至今仍是我最難忘的味道。`,
    images: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&h=800&fit=crop',
    ],
    author: {
      id: 'user1',
      name: 'Ariel_Travels',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      bio: '旅行攝影師 | 用鏡頭記錄世界',
    },
    likes: 1247,
    comments: 89,
    isLiked: false,
    isCollected: false,
    createdAt: '2024-01-15',
    tags: ['京都', '日本旅行', '晨間散步', '咖啡廳'],
  },
  {
    id: '2',
    title: '森之谷：與靈魂對話的初夏露營',
    content: `有些地方，去過一次就會永遠記得。森之谷就是這樣的存在。

那是初夏的一個週末，我們四個人背著帳篷，沿著蜿蜒的山路走了兩個小時。當看到那片被群山環抱的草地時，所有的疲憊都消失了。

夜晚的星空，是我在城市裡從未見過的璀璨。我們圍著營火，分享著彼此的故事，直到凌晨。那一夜，我第一次真正理解了什麼叫做「活在當下」。`,
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=600&h=600&fit=crop',
    ],
    author: {
      id: 'user2',
      name: 'Camp_Vibe',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      bio: '戶外愛好者 | 露營達人',
    },
    likes: 856,
    comments: 42,
    isLiked: false,
    isCollected: false,
    createdAt: '2024-01-10',
    tags: ['露營', '戶外', '星空', '自然'],
  },
  {
    id: '3',
    title: '巷弄裡的琥珀色時光',
    content: `在城市的某個角落，總有一家咖啡店在等你。

這間藏在巷弄深處的小店，沒有招牌，只有一盞暖黃色的燈。推開那扇老舊的木門，時間彷彿慢了下來。

老闆是個不太說話的中年人，但他的手沖咖啡卻說著最動人的故事。每一滴咖啡都帶著他對這份工藝的執著，那種琥珀色的光澤，是我見過最美的風景。`,
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=600&fit=crop',
    ],
    author: {
      id: 'user3',
      name: 'Coffee_Soul',
      avatar: '',
      bio: '咖啡愛好者',
    },
    likes: 2400,
    comments: 156,
    isLiked: false,
    isCollected: false,
    createdAt: '2024-01-08',
    tags: ['咖啡', '巷弄', '城市探索'],
  },
  {
    id: '4',
    title: '巴黎街頭的隨性美學：不經意的時尚角落',
    content: `巴黎的魅力，在於它的不經意。

走在香榭麗舍大道上，你會發現每個轉角都是一幅畫。一位穿著米色風衣的女士走過，手裡拿著一束百合；一對老夫婦在咖啡座前輕聲交談；一個街頭藝人正在演奏著蕭邦。

這座城市教會我，美不需要刻意追求，它就在生活的每一個瞬間。`,
    images: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&h=800&fit=crop',
    ],
    author: {
      id: 'user4',
      name: 'Wanderlust_L',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      bio: '時尚旅人',
    },
    likes: 3100,
    comments: 201,
    isLiked: false,
    isCollected: false,
    createdAt: '2024-01-05',
    tags: ['巴黎', '法國', '街頭風景', '時尚'],
  },
]

// Mock comments
const mockComments = [
  {
    id: 'c1',
    author: {
      name: '小明愛旅行',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    },
    content: '好美的照片！請問這是用什麼相機拍的？',
    likes: 24,
    createdAt: '3小時前',
    replies: [
      {
        id: 'r1',
        author: {
          name: 'Ariel_Travels',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        },
        content: '謝謝！是用 Sony A7III 拍的～',
        likes: 8,
        createdAt: '2小時前',
      },
    ],
  },
  {
    id: 'c2',
    author: {
      name: '咖啡控阿茲',
      avatar: '',
    },
    content: '京都真的很適合清晨去逛，人少又有氣氛',
    likes: 15,
    createdAt: '5小時前',
    replies: [],
  },
  {
    id: 'c3',
    author: {
      name: '旅行日記',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    content: '已收藏！下次去京都一定要試試這樣的行程',
    likes: 31,
    createdAt: '1天前',
    replies: [],
  },
]

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isCollected, setIsCollected] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentText, setCommentText] = useState('')

  // Find the post
  const post = mockPosts.find(p => p.id === postId) || mockPosts[0]

  // Initialize like count
  useState(() => {
    setLikeCount(post.likes)
  })

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleCollect = () => {
    setIsCollected(!isCollected)
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/explore/${postId}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.slice(0, 100) + '...',
          url: shareUrl,
        })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString()
  }

  return (
    <div className="font-display text-charcoal antialiased bg-bone-white min-h-screen pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-bone-white border-b border-[var(--divider)]">
        <div className="pt-12 pb-3 px-4 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center -ml-2"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="w-10 h-10 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[24px] font-light">share</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px] font-light">more_horiz</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-[88px] max-w-md mx-auto">
        {/* Image Carousel */}
        <div className="relative aspect-square bg-[var(--divider-light)]">
          <Image
            src={post.images[currentImageIndex]}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />

          {/* Image Indicators */}
          {post.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {post.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-white w-4'
                      : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Swipe Areas */}
          {post.images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                className="absolute left-0 top-0 bottom-0 w-1/3"
              />
              <button
                onClick={() => setCurrentImageIndex(prev => Math.min(post.images.length - 1, prev + 1))}
                className="absolute right-0 top-0 bottom-0 w-1/3"
              />
            </>
          )}
        </div>

        {/* Author Info */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--divider)]">
          <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3">
            {post.author.avatar ? (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--divider)] flex items-center justify-center">
                <span className="text-charcoal/40 font-medium">{post.author.name[0]}</span>
              </div>
            )}
            <div>
              <p className="font-bold text-[15px]">{post.author.name}</p>
              <p className="text-[12px] text-charcoal/50">{post.author.bio}</p>
            </div>
          </Link>
          <button className="px-4 py-1.5 rounded-full bg-ocean-teal text-bone-white text-[13px] font-bold">
            關注
          </button>
        </div>

        {/* Post Content */}
        <div className="px-4 py-4">
          <h1 className="text-[18px] font-bold leading-tight mb-3">{post.title}</h1>
          <p className="text-[14px] leading-relaxed text-charcoal/80 whitespace-pre-line">
            {post.content}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-[var(--divider-light)] text-ocean-teal text-[12px] rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Post Date */}
          <p className="text-[12px] text-charcoal/40 mt-4">{post.createdAt}</p>
        </div>

        {/* Divider */}
        <div className="h-2 bg-[var(--divider-light)]" />

        {/* Comments Section */}
        <div className="px-4 py-4">
          <h2 className="font-bold text-[16px] mb-4">留言 ({post.comments})</h2>

          {/* Comments List */}
          <div className="space-y-4">
            {mockComments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                {comment.author.avatar ? (
                  <Image
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--divider)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[12px] text-charcoal/40">{comment.author.name[0]}</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[13px]">{comment.author.name}</span>
                    <span className="text-[11px] text-charcoal/40">{comment.createdAt}</span>
                  </div>
                  <p className="text-[14px] mt-1 text-charcoal/80">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button className="flex items-center gap-1 text-charcoal/40">
                      <span className="material-symbols-outlined text-[16px]">favorite</span>
                      <span className="text-[12px]">{comment.likes}</span>
                    </button>
                    <button className="text-[12px] text-charcoal/40">回覆</button>
                  </div>

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-3 space-y-3 pl-2 border-l-2 border-[var(--divider)]">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="flex gap-2">
                          {reply.author.avatar ? (
                            <Image
                              src={reply.author.avatar}
                              alt={reply.author.name}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[var(--divider)] flex-shrink-0" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[12px] text-ocean-teal">{reply.author.name}</span>
                              <span className="text-[10px] text-charcoal/40">{reply.createdAt}</span>
                            </div>
                            <p className="text-[13px] mt-0.5 text-charcoal/80">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-bone-white border-t border-[var(--divider)]">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          {/* Comment Input */}
          <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-[var(--divider-light)] rounded-full">
            <span className="material-symbols-outlined text-[20px] text-charcoal/40">chat_bubble</span>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="說點什麼..."
              className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-charcoal/40"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              className="flex flex-col items-center justify-center w-12 h-12"
            >
              <span className={`material-symbols-outlined text-[24px] ${isLiked ? 'text-[#FF3B30]' : 'text-charcoal/60'}`} style={isLiked ? { fontVariationSettings: "'FILL' 1" } : {}}>
                favorite
              </span>
              <span className="text-[10px] text-charcoal/60">{formatNumber(likeCount)}</span>
            </button>
            <button
              onClick={handleCollect}
              className="flex flex-col items-center justify-center w-12 h-12"
            >
              <span className={`material-symbols-outlined text-[24px] ${isCollected ? 'text-sand-earth' : 'text-charcoal/60'}`} style={isCollected ? { fontVariationSettings: "'FILL' 1" } : {}}>
                bookmark
              </span>
              <span className="text-[10px] text-charcoal/60">{isCollected ? '已收藏' : '收藏'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
