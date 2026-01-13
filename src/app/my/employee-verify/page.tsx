'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ShieldCheck, AlertCircle, CheckCircle2, BadgeCheck } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useProfileStore, isEmployee } from '@/stores/profile-store'

export default function EmployeeVerifyPage() {
  const router = useRouter()
  const { user, initialize, isInitialized } = useAuthStore()
  const { profile, fetchProfile } = useProfileStore()

  const [nationalId, setNationalId] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{
    employee_number: string
    name: string
    roles: string[]
  } | null>(null)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/my/employee-verify')
    }
  }, [isInitialized, user, router])

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id)
    }
  }, [user?.id, fetchProfile])

  const handleVerify = async () => {
    if (!nationalId.trim()) {
      setError('請輸入身分證字號')
      return
    }

    // 驗證身分證格式
    const idPattern = /^[A-Z][12]\d{8}$/
    if (!idPattern.test(nationalId.toUpperCase())) {
      setError('身分證字號格式不正確')
      return
    }

    setVerifying(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ national_id: nationalId.toUpperCase() }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess({
          employee_number: data.employee.employee_number,
          name: data.employee.name,
          roles: data.employee.roles,
        })
        // 重新載入 profile
        if (user?.id) {
          fetchProfile(user.id, true)
        }
      } else {
        setError(data.error || '驗證失敗')
      }
    } catch {
      setError('驗證失敗，請稍後再試')
    } finally {
      setVerifying(false)
    }
  }

  const formatRole = (role: string) => {
    const roleNames: Record<string, string> = {
      leader: '領隊',
      manager: '主管',
      admin: '管理員',
      staff: '員工',
    }
    return roleNames[role] || role
  }

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  // 已經是員工
  if (isEmployee(profile)) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-4">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="ml-2 text-lg font-bold">員工驗證</h1>
          </div>
        </div>

        <main className="p-4">
          <div className="bg-white rounded-2xl p-6 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BadgeCheck className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">已驗證員工</h2>
            <p className="text-gray-500 mb-4">
              員工編號：{profile?.employee_number}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {profile?.employee_roles?.map(role => (
                <span
                  key={role}
                  className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                >
                  {formatRole(role)}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              驗證時間：{profile?.employee_verified_at
                ? new Date(profile.employee_verified_at).toLocaleString('zh-TW')
                : '-'}
            </p>
          </div>
        </main>
      </div>
    )
  }

  // 驗證成功
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-4">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="ml-2 text-lg font-bold">員工驗證</h1>
          </div>
        </div>

        <main className="p-4">
          <div className="bg-white rounded-2xl p-6 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">驗證成功！</h2>
            <p className="text-gray-600 mb-4">
              歡迎 <span className="font-bold">{success.name}</span>
            </p>
            <p className="text-gray-500 mb-4">
              員工編號：{success.employee_number}
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {success.roles.map(role => (
                <span
                  key={role}
                  className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                >
                  {formatRole(role)}
                </span>
              ))}
            </div>
            <button
              onClick={() => router.push('/my')}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition"
            >
              返回我的頁面
            </button>
          </div>
        </main>
      </div>
    )
  }

  // 未驗證，顯示驗證表單
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-4">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="ml-2 text-lg font-bold">員工驗證</h1>
        </div>
      </div>

      <main className="p-4 space-y-4">
        {/* 說明 */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">員工身份驗證</h2>
              <p className="text-sm text-gray-500">驗證後可使用員工專屬功能</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            如果您是公司員工，請輸入您的身分證字號進行驗證。
            驗證成功後，您將可以使用員工專屬功能，如領隊工具等。
          </p>
        </div>

        {/* 驗證表單 */}
        <div className="bg-white rounded-2xl p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">身分證字號</label>
              <input
                type="text"
                value={nationalId}
                onChange={e => setNationalId(e.target.value.toUpperCase())}
                placeholder="例如：A123456789"
                maxLength={10}
                className="w-full mt-2 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none uppercase"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={verifying || !nationalId.trim()}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold rounded-xl transition"
            >
              {verifying ? '驗證中...' : '驗證身份'}
            </button>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-amber-50 rounded-2xl p-4">
          <p className="text-sm text-amber-800">
            <span className="font-medium">注意：</span>
            每個身分證字號只能綁定一個帳號。如果您之前已經在其他帳號驗證過，
            將無法再次驗證。如需變更綁定，請聯繫系統管理員。
          </p>
        </div>
      </main>
    </div>
  )
}
