'use client'

import Link from 'next/link'
import type { LearningProfile, UserLearningStats } from '@/features/learn/types'

interface LearnHeaderProps {
  profile: LearningProfile
  userStats: UserLearningStats | null
}

export function LearnHeader({ profile, userStats }: LearnHeaderProps) {
  const targetLanguageLabel = profile.target_language === 'ja' ? '日文' : '英文'

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm">
              {profile.role?.name_zh || '學習者'} - {targetLanguageLabel}學習
            </p>
            <h1 className="text-xl font-bold">
              {profile.display_name || '你好'}！
            </h1>
          </div>
          <Link
            href="/learn/settings"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Link>
        </div>

        {/* 統計摘要 */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-blue-100 text-xs">總經驗值</p>
              <p className="font-semibold">{profile.total_xp.toLocaleString()} XP</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <div>
              <p className="text-blue-100 text-xs">已學詞彙</p>
              <p className="font-semibold">{profile.words_learned} 個</p>
            </div>
          </div>
          {userStats && userStats.due_today > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              <div>
                <p className="text-blue-100 text-xs">待複習</p>
                <p className="font-semibold">{userStats.due_today} 個</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
