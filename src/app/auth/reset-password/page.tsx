'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isValid = password.length >= 8 && passwordsMatch;

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setIsValidSession(true);
      } else {
        // Try to get session from URL hash (Supabase sends tokens in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!error) {
            setIsValidSession(true);
            // Clean up URL
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            setIsValidSession(false);
          }
        } else {
          setIsValidSession(false);
        }
      }
    };

    checkSession();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '重設密碼失敗，請稍後再試';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#cfb9a5]/30 border-t-[#cfb9a5] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#949494]">驗證中...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired link
  if (isValidSession === false) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] font-sans antialiased text-[#5C5C5C] flex flex-col">
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#CFA5A5]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-icons-round text-4xl text-[#CFA5A5]">link_off</span>
            </div>
            <h1 className="text-2xl font-bold text-[#5C5C5C] mb-2">連結已失效</h1>
            <p className="text-[#949494] mb-8">
              此重設密碼連結已過期或無效。<br />
              請重新申請重設密碼。
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#cfb9a5] text-white font-bold rounded-xl hover:bg-[#b09b88] transition-colors"
            >
              <span className="material-icons-round">arrow_back</span>
              返回登入頁面
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] font-sans antialiased text-[#5C5C5C] flex flex-col">
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#A8BFA6]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-icons-round text-4xl text-[#A8BFA6]">check_circle</span>
            </div>
            <h1 className="text-2xl font-bold text-[#5C5C5C] mb-2">密碼重設成功！</h1>
            <p className="text-[#949494] mb-4">
              正在跳轉到登入頁面...
            </p>
            <div className="w-6 h-6 border-2 border-[#cfb9a5]/30 border-t-[#cfb9a5] rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans antialiased text-[#5C5C5C] flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
      </div>

      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center">
        <Link
          href="/login"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm text-[#5C5C5C] hover:text-[#cfb9a5] transition-colors"
        >
          <span className="material-icons-round text-xl">arrow_back</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-8">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#cfb9a5]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons-round text-3xl text-[#cfb9a5]">lock_reset</span>
            </div>
            <h1 className="text-2xl font-bold text-[#5C5C5C] mb-2">設定新密碼</h1>
            <p className="text-[#949494]">請輸入你的新密碼</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[#CFA5A5]/10 border border-[#CFA5A5]/30 rounded-xl">
              <p className="text-sm text-[#CFA5A5] flex items-center gap-2">
                <span className="material-icons-round text-lg">error</span>
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4">
              <label className="block text-xs text-[#949494] font-medium mb-2">
                新密碼
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-[#5C5C5C] font-medium focus:outline-none placeholder:text-[#C5B6AF] pr-10"
                  placeholder="請輸入新密碼（至少8個字元）"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#949494] hover:text-[#5C5C5C] transition-colors"
                >
                  <span className="material-icons-round text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {password.length > 0 && password.length < 8 && (
                <p className="text-xs text-[#CFA5A5] mt-2">密碼需至少 8 個字元</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4">
              <label className="block text-xs text-[#949494] font-medium mb-2">
                確認新密碼
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent text-[#5C5C5C] font-medium focus:outline-none placeholder:text-[#C5B6AF] pr-10"
                  placeholder="請再次輸入新密碼"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#949494] hover:text-[#5C5C5C] transition-colors"
                >
                  <span className="material-icons-round text-xl">
                    {showConfirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-[#CFA5A5] mt-2">密碼不一致</p>
              )}
              {passwordsMatch && confirmPassword.length > 0 && (
                <p className="text-xs text-[#A8BFA6] mt-2 flex items-center gap-1">
                  <span className="material-icons-round text-sm">check_circle</span>
                  密碼一致
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className={`w-full mt-4 py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                isValid && !isLoading
                  ? 'bg-[#cfb9a5] shadow-[#cfb9a5]/30 hover:bg-[#b09b88]'
                  : 'bg-[#C5B6AF] cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  處理中...
                </>
              ) : (
                <>
                  <span className="material-icons-round">check</span>
                  確認重設密碼
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#cfb9a5]/30 border-t-[#cfb9a5] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#949494]">載入中...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
