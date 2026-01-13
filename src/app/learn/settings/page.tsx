'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MobileNav from '@/components/MobileNav'
import { useAuthStore } from '@/stores/auth-store'
import { useLearnStore } from '@/stores/learn-store'

const DAILY_GOAL_OPTIONS = [
  { value: 5, label: '輕鬆', desc: '5 分鐘/天', emoji: '🌱' },
  { value: 10, label: '適中', desc: '10 分鐘/天', emoji: '🌿' },
  { value: 15, label: '認真', desc: '15 分鐘/天', emoji: '🌳' },
  { value: 30, label: '積極', desc: '30 分鐘/天', emoji: '🔥' },
]

export default function LearnSettingsPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const { profile, fetchProfile, updateProfile } = useLearnStore()

  const [dailyGoal, setDailyGoal] = useState(10)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('09:00')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

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
      setDailyGoal(profile.daily_goal_minutes)
      setReminderEnabled(profile.reminder_enabled || false)
      setReminderTime(profile.reminder_time || '09:00')
    }
  }, [profile])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/learn/settings')
    }
  }, [isInitialized, user, router])

  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)
    setSaveSuccess(false)

    try {
      await updateProfile({
        daily_goal_minutes: dailyGoal,
        reminder_enabled: reminderEnabled,
        reminder_time: reminderTime,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/learn" className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold">學習設定</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Daily Goal */}
        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4">每日學習目標</h2>

          <div className="grid grid-cols-2 gap-3">
            {DAILY_GOAL_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setDailyGoal(option.value)}
                className={`p-4 rounded-xl border-2 text-center transition ${
                  dailyGoal === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl block mb-1">{option.emoji}</span>
                <p className="font-semibold text-gray-800">{option.label}</p>
                <p className="text-sm text-gray-500">{option.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Reminder Settings */}
        <section className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800">學習提醒</h2>
              <p className="text-sm text-gray-500">每天提醒你學習</p>
            </div>
            <button
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`relative w-12 h-6 rounded-full transition ${
                reminderEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  reminderEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {reminderEnabled && (
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提醒時間
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </section>

        {/* Learning Profile Info */}
        {profile && (
          <section className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4">學習檔案</h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">學習語言</span>
                <span className="font-medium text-gray-800">
                  {profile.target_language === 'ja' ? '日文' : profile.target_language === 'en' ? '英文' : profile.target_language}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">學習身份</span>
                <span className="font-medium text-gray-800">
                  {profile.role?.name_zh || '未設定'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">總經驗值</span>
                <span className="font-medium text-blue-600">{profile.total_xp} XP</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">連續天數</span>
                <span className="font-medium text-orange-600">{profile.current_streak} 天</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">開始日期</span>
                <span className="font-medium text-gray-800">
                  {new Date(profile.created_at).toLocaleDateString('zh-TW')}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Reset Learning Data */}
        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-2">重置學習資料</h2>
          <p className="text-sm text-gray-500 mb-4">
            這將清除所有學習進度，包括詞彙進度、經驗值和連續天數
          </p>

          <button
            className="w-full py-3 border-2 border-red-200 text-red-500 font-medium rounded-xl hover:bg-red-50 transition"
            onClick={() => {
              if (confirm('確定要重置所有學習資料嗎？此操作無法復原。')) {
                // TODO: Implement reset functionality
                alert('功能開發中')
              }
            }}
          >
            重置學習資料
          </button>
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>儲存中...</span>
            </>
          ) : saveSuccess ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>已儲存</span>
            </>
          ) : (
            '儲存設定'
          )}
        </button>
      </main>

      <MobileNav />
    </div>
  )
}
