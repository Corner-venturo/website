'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useLearnStore } from '@/stores/learn-store'
import type { Vocabulary, VocabularyWithProgress } from '@/features/learn/types'

type TabType = 'vocabulary' | 'patterns' | 'dialogues'

interface ScenarioData {
  id: string
  name_zh: string
  name_en: string
  name_ja: string
  description_zh: string | null
  icon: string | null
  category: string
  difficulty_level: number
  estimated_hours: number
  total_vocabulary: number
}

interface VocabWithProgress extends Vocabulary {
  progress: {
    id: string
    learned: boolean
    mastery_level: number
    stability: number
    difficulty: number
    next_review_at: string | null
    review_count: number
  } | null
}

interface SentencePattern {
  id: string
  pattern_ja: string
  pattern_reading: string | null
  pattern_zh: string
  usage_zh: string | null
  example_ja: string | null
  example_zh: string | null
  difficulty_level: number
}

interface DialogueLine {
  id: string
  speaker: string
  line_ja: string
  line_reading: string | null
  line_zh: string
  display_order: number
}

interface Dialogue {
  id: string
  title_zh: string
  title_ja: string
  context_zh: string | null
  dialogue_lines: DialogueLine[]
}

export default function ScenarioDetailPage() {
  const router = useRouter()
  const params = useParams()
  const scenarioId = params.id as string

  const { user, initialize, isInitialized } = useAuthStore()
  const { profile, fetchProfile, learnNewWord, startSession, endSession, currentSession } = useLearnStore()

  const [scenario, setScenario] = useState<ScenarioData | null>(null)
  const [vocabulary, setVocabulary] = useState<VocabWithProgress[]>([])
  const [patterns, setPatterns] = useState<SentencePattern[]>([])
  const [dialogues, setDialogues] = useState<Dialogue[]>([])
  const [stats, setStats] = useState({ totalVocabulary: 0, learnedVocabulary: 0, masteredVocabulary: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('vocabulary')

  // Learning modal state
  const [learningWord, setLearningWord] = useState<VocabWithProgress | null>(null)
  const [learningStep, setLearningStep] = useState<'intro' | 'practice' | 'done'>('intro')
  const [sessionXP, setSessionXP] = useState(0)

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
    if (isInitialized && !user) {
      router.push(`/login?redirect=/learn/scenarios/${scenarioId}`)
    }
  }, [isInitialized, user, router, scenarioId])

  const fetchScenarioData = useCallback(async () => {
    if (!profile) return

    setLoading(true)
    try {
      const res = await fetch(`/api/learn/scenarios/${scenarioId}`)
      if (!res.ok) throw new Error('Failed to fetch scenario')

      const data = await res.json()
      setScenario(data.scenario)
      setVocabulary(data.vocabulary)
      setPatterns(data.patterns)
      setDialogues(data.dialogues)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching scenario:', error)
    } finally {
      setLoading(false)
    }
  }, [profile, scenarioId])

  useEffect(() => {
    fetchScenarioData()
  }, [fetchScenarioData])

  // Start session when learning
  useEffect(() => {
    if (learningWord && !currentSession) {
      startSession('learn')
    }
  }, [learningWord, currentSession, startSession])

  const handleStartLearning = (word: VocabWithProgress) => {
    setLearningWord(word)
    setLearningStep('intro')
  }

  const handleLearnComplete = async () => {
    if (!learningWord) return

    await learnNewWord(learningWord.id)
    setSessionXP((prev) => prev + 15)
    setLearningStep('done')

    // Update local state
    setVocabulary((prev) =>
      prev.map((v) =>
        v.id === learningWord.id
          ? { ...v, progress: { ...v.progress!, learned: true, mastery_level: 1 } }
          : v
      )
    )
    setStats((prev) => ({
      ...prev,
      learnedVocabulary: prev.learnedVocabulary + 1,
    }))
  }

  const handleCloseLearning = () => {
    setLearningWord(null)
    setLearningStep('intro')
    if (currentSession && sessionXP > 0) {
      endSession(sessionXP)
      setSessionXP(0)
    }
  }

  const handleNextWord = () => {
    // Find next unlearned word
    const currentIndex = vocabulary.findIndex((v) => v.id === learningWord?.id)
    const nextWord = vocabulary.slice(currentIndex + 1).find((v) => !v.progress?.learned)

    if (nextWord) {
      setLearningWord(nextWord)
      setLearningStep('intro')
    } else {
      handleCloseLearning()
    }
  }

  // Get unlearned vocabulary for quick start
  const unlearnedVocabulary = vocabulary.filter((v) => !v.progress?.learned)
  const progressPercent = stats.totalVocabulary > 0
    ? Math.round((stats.learnedVocabulary / stats.totalVocabulary) * 100)
    : 0

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-4xl mb-4">😕</p>
        <p className="text-gray-500 mb-4">找不到此情境</p>
        <Link href="/learn/scenarios" className="text-blue-600 font-medium">
          返回情境列表
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/learn/scenarios" className="p-2 -ml-2 rounded-lg hover:bg-white/10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-3xl">{scenario.icon || '📖'}</span>
            <div>
              <h1 className="text-xl font-bold">{scenario.name_zh}</h1>
              <p className="text-sm text-blue-100">{scenario.name_ja}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-100">學習進度</span>
              <span className="font-bold">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-blue-100">
              <span>已學 {stats.learnedVocabulary} / {stats.totalVocabulary} 詞彙</span>
              <span>精通 {stats.masteredVocabulary}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Start Button */}
      {unlearnedVocabulary.length > 0 && (
        <div className="max-w-lg mx-auto px-4 -mt-4 mb-4">
          <button
            onClick={() => handleStartLearning(unlearnedVocabulary[0])}
            className="w-full py-4 bg-green-500 text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
          >
            <span>開始學習</span>
            <span className="text-green-100">({unlearnedVocabulary.length} 個新詞彙)</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-lg mx-auto px-4 mb-4">
        <div className="flex bg-white rounded-xl p-1 shadow-sm">
          {[
            { key: 'vocabulary', label: '詞彙', count: stats.totalVocabulary },
            { key: 'patterns', label: '句型', count: patterns.length },
            { key: 'dialogues', label: '對話', count: dialogues.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4">
        {/* Vocabulary Tab */}
        {activeTab === 'vocabulary' && (
          <div className="space-y-2">
            {vocabulary.map((word) => {
              const isLearned = word.progress?.learned
              const masteryLevel = word.progress?.mastery_level || 0

              return (
                <div
                  key={word.id}
                  className={`bg-white rounded-xl p-4 shadow-sm ${
                    !isLearned ? 'border-l-4 border-blue-400' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-bold text-gray-800">{word.word_ja}</span>
                        {word.reading_hiragana && (
                          <span className="text-sm text-gray-500">({word.reading_hiragana})</span>
                        )}
                      </div>
                      <p className="text-gray-600">{word.word_zh}</p>
                      {word.part_of_speech && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                          {word.part_of_speech}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isLearned ? (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`w-2 h-2 rounded-full ${
                                level <= masteryLevel ? 'bg-green-500' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartLearning(word)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition"
                        >
                          學習
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {vocabulary.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>此情境尚無詞彙</p>
              </div>
            )}
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="space-y-3">
            {patterns.map((pattern, index) => (
              <div key={pattern.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-xs text-gray-500">句型</span>
                </div>

                <p className="text-lg font-bold text-gray-800 mb-1">{pattern.pattern_ja}</p>
                {pattern.pattern_reading && (
                  <p className="text-sm text-gray-500 mb-2">{pattern.pattern_reading}</p>
                )}
                <p className="text-gray-600 mb-3">{pattern.pattern_zh}</p>

                {pattern.usage_zh && (
                  <p className="text-sm text-gray-500 mb-3">💡 {pattern.usage_zh}</p>
                )}

                {pattern.example_ja && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700">例：{pattern.example_ja}</p>
                    {pattern.example_zh && (
                      <p className="text-sm text-gray-500 mt-1">{pattern.example_zh}</p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {patterns.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>此情境尚無句型</p>
              </div>
            )}
          </div>
        )}

        {/* Dialogues Tab */}
        {activeTab === 'dialogues' && (
          <div className="space-y-4">
            {dialogues.map((dialogue) => (
              <div key={dialogue.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3">
                  <h3 className="font-bold text-white">{dialogue.title_zh}</h3>
                  <p className="text-sm text-orange-100">{dialogue.title_ja}</p>
                </div>

                {dialogue.context_zh && (
                  <p className="px-4 py-2 bg-orange-50 text-sm text-orange-700">
                    📍 {dialogue.context_zh}
                  </p>
                )}

                <div className="p-4 space-y-3">
                  {dialogue.dialogue_lines
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((line, index) => {
                      const isCustomer = line.speaker.includes('客') || line.speaker.includes('旅')

                      return (
                        <div
                          key={line.id}
                          className={`flex gap-3 ${isCustomer ? '' : 'flex-row-reverse'}`}
                        >
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                              isCustomer
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-green-100 text-green-600'
                            }`}
                          >
                            {isCustomer ? '客' : '店'}
                          </div>
                          <div
                            className={`flex-1 p-3 rounded-2xl ${
                              isCustomer
                                ? 'bg-blue-50 rounded-tl-none'
                                : 'bg-green-50 rounded-tr-none'
                            }`}
                          >
                            <p className="font-medium text-gray-800">{line.line_ja}</p>
                            {line.line_reading && (
                              <p className="text-sm text-gray-500">{line.line_reading}</p>
                            )}
                            <p className="text-sm text-gray-600 mt-1">{line.line_zh}</p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}

            {dialogues.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>此情境尚無對話練習</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Learning Modal */}
      {learningWord && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 flex items-center justify-between">
              <span className="text-white font-medium">學習新詞彙</span>
              <button
                onClick={handleCloseLearning}
                className="p-1 text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {learningStep === 'intro' && (
                <>
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-500 mb-2">日文</p>
                    <h2 className="text-4xl font-bold text-gray-800 mb-2">
                      {learningWord.word_ja}
                    </h2>
                    {learningWord.reading_hiragana && (
                      <p className="text-xl text-gray-500">
                        {learningWord.reading_hiragana}
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-blue-600 mb-1">中文意思</p>
                    <p className="text-xl font-bold text-blue-800">
                      {learningWord.word_zh}
                    </p>
                    {learningWord.part_of_speech && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-blue-200 text-blue-700 text-xs rounded">
                        {learningWord.part_of_speech}
                      </span>
                    )}
                  </div>

                  {learningWord.mnemonic_zh && (
                    <div className="bg-yellow-50 rounded-xl p-4 mb-6">
                      <p className="text-sm text-yellow-700">
                        💡 記憶技巧：{learningWord.mnemonic_zh}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setLearningStep('practice')}
                    className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition"
                  >
                    我記住了，繼續
                  </button>
                </>
              )}

              {learningStep === 'practice' && (
                <>
                  <div className="text-center mb-8">
                    <p className="text-sm text-gray-500 mb-4">這個詞的日文是什麼？</p>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      {learningWord.word_zh}
                    </h2>
                    {learningWord.part_of_speech && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
                        {learningWord.part_of_speech}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleLearnComplete}
                    className="w-full py-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition mb-4"
                  >
                    顯示答案
                  </button>
                </>
              )}

              {learningStep === 'done' && (
                <>
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-4">🎉</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">學會了！</h3>
                    <p className="text-gray-500">+15 XP</p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-800">
                        {learningWord.word_ja}
                      </span>
                      <span className="text-green-600">{learningWord.word_zh}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleCloseLearning}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
                    >
                      結束
                    </button>
                    {unlearnedVocabulary.length > 1 && (
                      <button
                        onClick={handleNextWord}
                        className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition"
                      >
                        下一個
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
