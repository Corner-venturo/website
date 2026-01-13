'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useLearnStore } from '@/stores/learn-store'
import type { LearningRole, TargetLanguage } from '@/features/learn/types'

type SetupStep = 'language' | 'role' | 'goal' | 'complete'

export default function LearnSetupPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const { roles, fetchRoles, createProfile, profile, isSetupComplete } = useLearnStore()

  const [step, setStep] = useState<SetupStep>('language')
  const [selectedLanguage, setSelectedLanguage] = useState<TargetLanguage>('ja')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [dailyGoal, setDailyGoal] = useState(15) // 分鐘
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  // 如果未登入，導向登入頁
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/learn/setup')
    }
  }, [isInitialized, user, router])

  // 如果已設定完成，導向主頁
  useEffect(() => {
    if (isSetupComplete && profile) {
      router.push('/learn')
    }
  }, [isSetupComplete, profile, router])

  const handleComplete = async () => {
    if (!selectedRole) return

    setIsSubmitting(true)
    try {
      await createProfile({
        target_language: selectedLanguage,
        role_id: selectedRole,
        daily_goal_minutes: dailyGoal,
        daily_goal_xp: dailyGoal * 3, // 簡單計算
      })
      setStep('complete')
      setTimeout(() => {
        router.push('/learn')
      }, 2000)
    } catch (error) {
      console.error('Failed to create profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-indigo-700 px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* 進度指示器 */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['language', 'role', 'goal', 'complete'].map((s, i) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full ${
                step === s
                  ? 'w-8 bg-white'
                  : i < ['language', 'role', 'goal', 'complete'].indexOf(step)
                  ? 'bg-white'
                  : 'bg-white/30'
              } transition-all`}
            />
          ))}
        </div>

        {/* Step 1: 選擇語言 */}
        {step === 'language' && (
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-2">歡迎開始學習！</h1>
            <p className="text-blue-100 mb-8">選擇你想學習的語言</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { code: 'ja' as TargetLanguage, name: '日文', flag: '🇯🇵', native: '日本語' },
                { code: 'en' as TargetLanguage, name: '英文', flag: '🇺🇸', native: 'English' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`p-6 rounded-2xl border-2 transition ${
                    selectedLanguage === lang.code
                      ? 'bg-white text-gray-800 border-white'
                      : 'bg-white/10 border-white/30 hover:bg-white/20'
                  }`}
                >
                  <span className="text-4xl block mb-2">{lang.flag}</span>
                  <p className="font-bold">{lang.name}</p>
                  <p className="text-sm opacity-70">{lang.native}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('role')}
              className="w-full py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition"
            >
              繼續
            </button>
          </div>
        )}

        {/* Step 2: 選擇身份 */}
        {step === 'role' && (
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-2">你的身份是？</h1>
            <p className="text-blue-100 mb-8">我們會根據你的身份提供專屬學習內容</p>

            <div className="space-y-3 mb-8">
              {roles.map((role: LearningRole) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition ${
                    selectedRole === role.id
                      ? 'bg-white text-gray-800 border-white'
                      : 'bg-white/10 border-white/30 hover:bg-white/20'
                  }`}
                >
                  <span className="text-3xl">{role.icon}</span>
                  <div className="text-left">
                    <p className="font-bold">{role.name_zh}</p>
                    <p className="text-sm opacity-70">{role.description || role.name_en}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('language')}
                className="flex-1 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition"
              >
                返回
              </button>
              <button
                onClick={() => setStep('goal')}
                disabled={!selectedRole}
                className="flex-1 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition disabled:opacity-50"
              >
                繼續
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 設定目標 */}
        {step === 'goal' && (
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-2">每日學習目標</h1>
            <p className="text-blue-100 mb-8">設定適合你的學習時間</p>

            <div className="bg-white/10 rounded-2xl p-6 mb-8">
              <p className="text-6xl font-bold mb-2">{dailyGoal}</p>
              <p className="text-blue-100">分鐘/天</p>

              <div className="mt-6 grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((min) => (
                  <button
                    key={min}
                    onClick={() => setDailyGoal(min)}
                    className={`py-2 rounded-lg transition ${
                      dailyGoal === min
                        ? 'bg-white text-blue-600 font-bold'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {min}分
                  </button>
                ))}
              </div>

              <p className="mt-4 text-sm text-blue-100">
                {dailyGoal <= 5 && '適合忙碌的你，輕鬆開始'}
                {dailyGoal === 10 && '每天小進步，穩定成長'}
                {dailyGoal === 15 && '推薦！平衡學習與生活'}
                {dailyGoal >= 20 && '積極學習，快速進步'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('role')}
                className="flex-1 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition"
              >
                返回
              </button>
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition disabled:opacity-50"
              >
                {isSubmitting ? '設定中...' : '開始學習！'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 完成 */}
        {step === 'complete' && (
          <div className="text-center text-white py-16">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-2xl font-bold mb-2">設定完成！</h1>
            <p className="text-blue-100">準備開始你的學習旅程</p>
          </div>
        )}
      </div>
    </div>
  )
}
