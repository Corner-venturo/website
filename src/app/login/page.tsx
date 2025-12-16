'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth-store';
import { getSupabaseClient } from '@/lib/supabase';

type AuthMode = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    isLoading,
    error,
    initialize,
    signUp,
    signIn,
    signInWithGoogle,
    resetPassword,
    clearError,
  } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 初始化 Auth
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 如果已登入，檢查 profile 狀態
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!user) return;

      const supabase = getSupabaseClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_profile_complete')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.is_profile_complete) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    };

    checkAndRedirect();
  }, [user, router]);

  // 切換模式時清除錯誤
  useEffect(() => {
    clearError();
    setSuccessMessage('');
  }, [mode, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (mode === 'login') {
      const result = await signIn(email, password);
      if (result.success) {
        // 檢查是否已完成個人資料
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_profile_complete')
            .eq('id', user.id)
            .single();

          if (!profile?.is_profile_complete) {
            router.push('/onboarding');
            return;
          }
        }
        router.push('/');
      }
    } else if (mode === 'register') {
      const result = await signUp(email, password, name);
      if (result.success) {
        // 註冊成功後導向 onboarding 填寫資料
        router.push('/onboarding');
      }
    } else if (mode === 'forgot') {
      const result = await resetPassword(email);
      if (result.success) {
        setSuccessMessage('重設連結已發送至您的信箱！');
      }
    }
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  const titles = {
    login: { title: '歡迎回來', subtitle: '登入以繼續你的旅程' },
    register: { title: '開始冒險', subtitle: '建立帳號，探索無限可能' },
    forgot: { title: '忘記密碼', subtitle: '輸入信箱，我們將寄送重設連結' },
  };

  return (
    <div className="min-h-screen bg-[var(--neutral-50)] relative overflow-hidden">
      {/* 背景漸層 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-[var(--brand-primary-light)] opacity-50 blur-[100px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[var(--morandi-blue-light)] opacity-40 blur-[100px] rounded-full" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-[var(--morandi-green)] opacity-20 blur-[80px] rounded-full" />
      </div>

      {/* 手機版 + 平板版 */}
      <div className="xl:hidden min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 p-4">
          <Link href="/" className="inline-flex items-center gap-2 text-[var(--neutral-400)] hover:text-[var(--neutral-600)] transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">返回首頁</span>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center px-6 pb-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-[var(--neutral-200)] text-white font-bold text-xl flex items-center justify-center">
              V
            </div>
            <span className="text-2xl font-bold text-[var(--neutral-600)]">VENTURO</span>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--neutral-700)] mb-2">{titles[mode].title}</h1>
            <p className="text-[var(--neutral-400)]">{titles[mode].subtitle}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-sm mx-auto w-full mb-4 p-3 bg-[var(--error)] text-[var(--error-text)] rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="max-w-sm mx-auto w-full mb-4 p-3 bg-[var(--success)] text-[var(--success-text)] rounded-xl text-sm">
              {successMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
                  你的名字
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="輸入你的名字"
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
                電子信箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition"
                required
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
                  密碼
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="輸入密碼"
                    className="w-full px-4 py-3 pr-12 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--neutral-400)] hover:text-[var(--neutral-600)] transition"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {mode === 'register' && (
                  <p className="text-xs text-[var(--neutral-400)] mt-1">密碼至少需要 6 個字元</p>
                )}
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-[var(--morandi-blue)] hover:text-[var(--morandi-blue-dark)] font-medium transition"
                >
                  忘記密碼？
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[var(--morandi-blue)] hover:bg-[var(--morandi-blue-dark)] text-white rounded-xl font-medium shadow-[var(--shadow-blue)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  {mode === 'login' && '登入'}
                  {mode === 'register' && '建立帳號'}
                  {mode === 'forgot' && '發送重設連結'}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          {mode !== 'forgot' && (
            <>
              <div className="flex items-center gap-4 my-6 max-w-sm mx-auto w-full">
                <div className="flex-1 h-px bg-[var(--neutral-200)]" />
                <span className="text-sm text-[var(--neutral-400)]">或使用以下方式</span>
                <div className="flex-1 h-px bg-[var(--neutral-200)]" />
              </div>

              {/* Social Login */}
              <div className="max-w-sm mx-auto w-full">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-3 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 text-[var(--neutral-600)] font-medium hover:bg-white/80 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  使用 Google 登入
                </button>
              </div>
            </>
          )}

          {/* Switch Mode */}
          <div className="text-center mt-8">
            {mode === 'login' && (
              <p className="text-[var(--neutral-400)]">
                還沒有帳號？{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-[var(--morandi-blue)] hover:text-[var(--morandi-blue-dark)] font-medium transition"
                >
                  立即註冊
                </button>
              </p>
            )}
            {mode === 'register' && (
              <p className="text-[var(--neutral-400)]">
                已經有帳號？{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[var(--morandi-blue)] hover:text-[var(--morandi-blue-dark)] font-medium transition"
                >
                  立即登入
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[var(--morandi-blue)] hover:text-[var(--morandi-blue-dark)] font-medium transition"
              >
                返回登入
              </button>
            )}
          </div>
        </main>
      </div>

      {/* 電腦版 */}
      <div className="hidden xl:flex min-h-screen">
        {/* 左側 - 圖片區 */}
        <div className="w-1/2 relative">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1280&fit=crop"
            alt="Travel"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
          <div className="absolute bottom-12 left-12 right-12">
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              探索世界的<br />每一個角落
            </h2>
            <p className="text-white/80 text-lg max-w-md">
              加入 VENTURO，與志同道合的旅人一起創造難忘的回憶。
            </p>
          </div>
          {/* 返回首頁 */}
          <Link
            href="/"
            className="absolute top-8 left-8 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-xl rounded-full text-white hover:bg-white/30 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">返回首頁</span>
          </Link>
        </div>

        {/* 右側 - 表單區 */}
        <div className="w-1/2 flex items-center justify-center p-12">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-full bg-[var(--neutral-200)] text-white font-bold text-xl flex items-center justify-center">
                V
              </div>
              <span className="text-2xl font-bold text-[var(--neutral-600)]">VENTURO</span>
            </div>

            {/* Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-[var(--neutral-700)] mb-3">{titles[mode].title}</h1>
              <p className="text-lg text-[var(--neutral-400)]">{titles[mode].subtitle}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-[var(--error)] text-[var(--error-text)] rounded-2xl text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-[var(--success)] text-[var(--success-text)] rounded-2xl text-sm">
                {successMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
                    你的名字
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="輸入你的名字"
                    className="w-full px-5 py-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition text-base"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
                  電子信箱
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-5 py-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition text-base"
                  required
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
                    密碼
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="輸入密碼"
                      className="w-full px-5 py-4 pr-14 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition text-base"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--neutral-400)] hover:text-[var(--neutral-600)] transition"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {mode === 'register' && (
                    <p className="text-xs text-[var(--neutral-400)] mt-2">密碼至少需要 6 個字元</p>
                  )}
                </div>
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm text-[var(--morandi-blue)] hover:text-[var(--morandi-blue-dark)] font-medium transition"
                  >
                    忘記密碼？
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[var(--morandi-blue)] hover:bg-[var(--morandi-blue-dark)] text-white rounded-2xl font-medium text-base shadow-[var(--shadow-blue)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    {mode === 'login' && '登入'}
                    {mode === 'register' && '建立帳號'}
                    {mode === 'forgot' && '發送重設連結'}
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            {mode !== 'forgot' && (
              <>
                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-[var(--neutral-200)]" />
                  <span className="text-sm text-[var(--neutral-400)]">或使用以下方式</span>
                  <div className="flex-1 h-px bg-[var(--neutral-200)]" />
                </div>

                {/* Social Login */}
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full py-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 text-[var(--neutral-600)] font-medium hover:bg-white/80 transition disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    使用 Google 登入
                  </button>
                </div>
              </>
            )}

            {/* Switch Mode */}
            <div className="text-center mt-8">
              {mode === 'login' && (
                <p className="text-[var(--neutral-400)]">
                  還沒有帳號？{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-[var(--morandi-blue)] hover:text-[var(--morandi-blue-dark)] font-medium transition"
                  >
                    立即註冊
                  </button>
                </p>
              )}
              {mode === 'register' && (
                <p className="text-[var(--neutral-400)]">
                  已經有帳號？{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-[var(--morandi-blue)] hover:text-[var(--morandi-blue-dark)] font-medium transition"
                  >
                    立即登入
                  </button>
                </p>
              )}
              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[var(--morandi-blue)] hover:text-[var(--morandi-blue-dark)] font-medium transition"
                >
                  返回登入
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
