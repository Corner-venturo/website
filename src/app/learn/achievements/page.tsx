'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MobileNav from '@/components/MobileNav'
import { useAuthStore } from '@/stores/auth-store'
import { useLearnStore } from '@/stores/learn-store'
import type { Badge, BadgeRarity } from '@/features/learn/types'

const rarityColors: Record<BadgeRarity, { bg: string; border: string; text: string }> = {
  common: { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-600' },
  uncommon: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
  rare: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
  epic: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
  legendary: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-600' },
}

const rarityLabels: Record<BadgeRarity, string> = {
  common: '普通',
  uncommon: '稀有',
  rare: '珍貴',
  epic: '史詩',
  legendary: '傳說',
}

export default function AchievementsPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const {
    badges,
    userBadges,
    fetchBadges,
    fetchUserBadges,
    profile,
    fetchProfile,
  } = useLearnStore()

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    }
  }, [user?.id, fetchProfile])

  useEffect(() => {
    if (profile) {
      fetchBadges()
      fetchUserBadges()
    }
  }, [profile, fetchBadges, fetchUserBadges])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/learn/achievements')
    }
  }, [isInitialized, user, router])

  // 取得已獲得的徽章 ID
  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id))

  // 分類徽章
  const streakBadges = badges.filter((b) => b.badge_type === 'streak')
  const vocabularyBadges = badges.filter((b) => b.badge_type === 'vocabulary')
  const scenarioBadges = badges.filter((b) => b.badge_type === 'scenario')
  const specialBadges = badges.filter((b) => b.badge_type === 'special')

  const BadgeCard = ({ badge, earned }: { badge: Badge; earned: boolean }) => {
    const colors = rarityColors[badge.rarity]
    const userBadge = userBadges.find((ub) => ub.badge_id === badge.id)

    return (
      <div
        className={`relative p-4 rounded-xl border-2 ${colors.border} ${colors.bg} ${
          !earned ? 'opacity-50 grayscale' : ''
        }`}
      >
        {/* 稀有度標籤 */}
        {badge.rarity !== 'common' && earned && (
          <span
            className={`absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold rounded-full ${colors.text} bg-white border ${colors.border}`}
          >
            {rarityLabels[badge.rarity]}
          </span>
        )}

        <div className="text-center">
          <div className="text-4xl mb-2">
            {earned ? (badge.icon_url || '🏆') : '🔒'}
          </div>
          <h3 className="font-bold text-gray-800 text-sm">{badge.name_zh}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {badge.description_zh || badge.name_en}
          </p>
          {earned && userBadge && (
            <p className="text-xs text-green-600 mt-2">
              {new Date(userBadge.earned_at).toLocaleDateString('zh-TW')} 獲得
            </p>
          )}
          {!earned && (
            <p className="text-xs text-gray-400 mt-2">+{badge.xp_reward} XP</p>
          )}
        </div>
      </div>
    )
  }

  const BadgeSection = ({
    title,
    icon,
    badges,
  }: {
    title: string
    icon: string
    badges: Badge[]
  }) => {
    if (badges.length === 0) return null

    const earnedCount = badges.filter((b) => earnedBadgeIds.has(b.id)).length

    return (
      <section className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <span>{icon}</span> {title}
          </h2>
          <span className="text-sm text-gray-500">
            {earnedCount}/{badges.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              earned={earnedBadgeIds.has(badge.id)}
            />
          ))}
        </div>
      </section>
    )
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const totalEarned = userBadges.length
  const totalBadges = badges.length

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/learn" className="p-2 -ml-2 rounded-lg hover:bg-white/10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">成就徽章</h1>
          </div>

          {/* 統計摘要 */}
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">已獲得徽章</p>
                <p className="text-3xl font-bold">
                  {totalEarned}
                  <span className="text-lg text-purple-200">/{totalBadges}</span>
                </p>
              </div>
              <div className="text-6xl">🏆</div>
            </div>

            {/* 進度條 */}
            <div className="mt-4 h-2 bg-purple-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${totalBadges > 0 ? (totalEarned / totalBadges) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <BadgeSection title="連續天數" icon="🔥" badges={streakBadges} />
        <BadgeSection title="詞彙學習" icon="📚" badges={vocabularyBadges} />
        <BadgeSection title="情境完成" icon="🎯" badges={scenarioBadges} />
        <BadgeSection title="特殊成就" icon="⭐" badges={specialBadges} />

        {badges.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">🏅</p>
            <p>開始學習來獲得徽章吧！</p>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
