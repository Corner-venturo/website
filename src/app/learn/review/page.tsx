'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useLearnStore } from '@/stores/learn-store'
import type { VocabularyWithProgress, FSRSRating } from '@/features/learn/types'

type CardState = 'front' | 'back'

export default function ReviewPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const {
    dueVocabulary,
    dueVocabularyLoading,
    dueCount,
    fetchDueVocabulary,
    recordReview,
    profile,
    fetchProfile,
    startSession,
    endSession,
    currentSession,
  } = useLearnStore()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardState, setCardState] = useState<CardState>('front')
  const [reviewedCount, setReviewedCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [sessionXP, setSessionXP] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

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
      fetchDueVocabulary(50)
    }
  }, [profile, fetchDueVocabulary])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/learn/review')
    }
  }, [isInitialized, user, router])

  // 開始學習 Session
  useEffect(() => {
    if (profile && dueVocabulary.length > 0 && !currentSession) {
      startSession('review')
    }
  }, [profile, dueVocabulary.length, currentSession, startSession])

  const currentCard = dueVocabulary[currentIndex]

  const handleFlip = () => {
    setCardState('back')
  }

  const handleRate = useCallback(async (rating: FSRSRating) => {
    if (!currentCard) return

    const isCorrect = rating >= 3
    const xpEarned = isCorrect ? 10 : 5

    // 記錄複習
    await recordReview(currentCard.id, rating)

    setReviewedCount((prev) => prev + 1)
    if (isCorrect) setCorrectCount((prev) => prev + 1)
    setSessionXP((prev) => prev + xpEarned)

    // 移到下一張卡片
    if (currentIndex < dueVocabulary.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setCardState('front')
    } else {
      // 完成所有複習
      setIsComplete(true)
      endSession(sessionXP + xpEarned)
    }
  }, [currentCard, currentIndex, dueVocabulary.length, recordReview, endSession, sessionXP])

  // 鍵盤快捷鍵
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cardState === 'front') {
        if (e.code === 'Space') {
          e.preventDefault()
          handleFlip()
        }
      } else {
        switch (e.key) {
          case '1':
            handleRate(1)
            break
          case '2':
            handleRate(2)
            break
          case '3':
            handleRate(3)
            break
          case '4':
            handleRate(4)
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cardState, handleRate])

  if (!isInitialized || dueVocabularyLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    )
  }

  // 沒有待複習詞彙
  if (dueVocabulary.length === 0 && !isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-700 flex flex-col items-center justify-center px-4 text-white">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-bold mb-2">太棒了！</h1>
        <p className="text-green-100 mb-8">今天沒有需要複習的詞彙</p>
        <Link
          href="/learn"
          className="px-8 py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition"
        >
          返回首頁
        </Link>
      </div>
    )
  }

  // 複習完成
  if (isComplete) {
    const accuracy = reviewedCount > 0 ? Math.round((correctCount / reviewedCount) * 100) : 0

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-600 to-indigo-700 flex flex-col items-center justify-center px-4 text-white">
        <div className="text-6xl mb-6">🏆</div>
        <h1 className="text-2xl font-bold mb-2">複習完成！</h1>
        <p className="text-blue-100 mb-8">你今天表現得很好</p>

        <div className="bg-white/10 rounded-2xl p-6 w-full max-w-sm mb-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{reviewedCount}</p>
              <p className="text-xs text-blue-200">複習詞彙</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{accuracy}%</p>
              <p className="text-xs text-blue-200">正確率</p>
            </div>
            <div>
              <p className="text-3xl font-bold">+{sessionXP}</p>
              <p className="text-xs text-blue-200">獲得 XP</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/learn"
            className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition"
          >
            返回首頁
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between">
        <Link href="/learn" className="p-2 text-white/70 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>

        <div className="flex items-center gap-4 text-white">
          <span className="text-sm">
            {currentIndex + 1} / {dueVocabulary.length}
          </span>
          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / dueVocabulary.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-yellow-400 font-bold">+{sessionXP} XP</div>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div
          className={`w-full max-w-md aspect-[3/4] rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all transform ${
            cardState === 'front'
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
              : 'bg-gradient-to-br from-green-500 to-teal-600'
          }`}
          onClick={cardState === 'front' ? handleFlip : undefined}
        >
          {cardState === 'front' ? (
            <>
              {/* Front: 顯示中文 */}
              <p className="text-white/60 text-sm mb-4">這個詞怎麼說？</p>
              <h2 className="text-4xl font-bold text-white text-center mb-4">
                {currentCard?.word_zh}
              </h2>
              {currentCard?.part_of_speech && (
                <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                  {currentCard.part_of_speech}
                </span>
              )}
              <p className="text-white/60 text-sm mt-8">點擊翻牌查看答案</p>
            </>
          ) : (
            <>
              {/* Back: 顯示日文答案 */}
              <p className="text-white/60 text-sm mb-2">日文</p>
              <h2 className="text-5xl font-bold text-white text-center mb-2">
                {currentCard?.word_ja}
              </h2>
              {currentCard?.reading_hiragana && (
                <p className="text-2xl text-white/80 mb-4">
                  {currentCard.reading_hiragana}
                </p>
              )}
              <p className="text-xl text-white/90 text-center">
                {currentCard?.word_zh}
              </p>

              {/* 記憶提示 */}
              {currentCard?.mnemonic_zh && (
                <div className="mt-6 p-4 bg-white/10 rounded-xl">
                  <p className="text-sm text-white/80">
                    💡 {currentCard.mnemonic_zh}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Rating Buttons */}
      {cardState === 'back' && (
        <div className="px-4 py-6">
          <p className="text-center text-gray-400 text-sm mb-4">你記得這個詞嗎？</p>
          <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
            <button
              onClick={() => handleRate(1)}
              className="py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition"
            >
              <span className="block text-xl">😣</span>
              <span className="text-xs">忘記</span>
            </button>
            <button
              onClick={() => handleRate(2)}
              className="py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition"
            >
              <span className="block text-xl">🤔</span>
              <span className="text-xs">困難</span>
            </button>
            <button
              onClick={() => handleRate(3)}
              className="py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition"
            >
              <span className="block text-xl">😊</span>
              <span className="text-xs">記得</span>
            </button>
            <button
              onClick={() => handleRate(4)}
              className="py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition"
            >
              <span className="block text-xl">🤩</span>
              <span className="text-xs">簡單</span>
            </button>
          </div>
          <p className="text-center text-gray-500 text-xs mt-3">
            鍵盤：1 忘記 • 2 困難 • 3 記得 • 4 簡單
          </p>
        </div>
      )}
    </div>
  )
}
