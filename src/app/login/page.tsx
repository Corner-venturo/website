'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { getSupabaseClient } from '@/lib/supabase';
import {
  LoginHeader,
  Logo,
  AuthForm,
  SocialLogin,
  AuthModeSwitch,
  AuthMode,
  titles,
} from './components';

// 偵測是否在 WebView（App 內建瀏覽器）中
function detectWebView(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent || navigator.vendor || '';

  // 常見的 WebView 特徵
  const webviewPatterns = [
    /Line\//i,           // LINE
    /FBAN|FBAV/i,        // Facebook
    /Instagram/i,        // Instagram
    /MicroMessenger/i,   // WeChat
    /Twitter/i,          // Twitter
    /Snapchat/i,         // Snapchat
    /BytedanceWebview/i, // TikTok
    /musical_ly/i,       // TikTok (舊版)
    /Telegram/i,         // Telegram
    /Discord/i,          // Discord
    /Slack/i,            // Slack
    /WebView/i,          // 通用 WebView
    /wv\)/i,             // Android WebView
  ];

  return webviewPatterns.some(pattern => pattern.test(ua));
}

export default function LoginPage() {
  const router = useRouter();
  const {
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
  const [isWebView, setIsWebView] = useState(false);
  const [copied, setCopied] = useState(false);

  // 初始化 Auth
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 偵測 WebView
  useEffect(() => {
    setIsWebView(detectWebView());
  }, []);

  // 切換模式時清除錯誤
  useEffect(() => {
    clearError();
    setSuccessMessage('');
  }, [mode, clearError]);

  // 複製網址到剪貼簿
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 嘗試用外部瀏覽器開啟
  const handleOpenInBrowser = () => {
    const url = window.location.href;
    const ua = navigator.userAgent || '';

    // Android: 嘗試用 intent:// 開啟 Chrome
    if (/android/i.test(ua)) {
      const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
      return;
    }

    // iOS: 嘗試幾種方式
    // 1. 先複製網址
    handleCopyUrl();

    // 2. 嘗試用 window.open（某些 WebView 會開外部瀏覽器）
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');

    // 3. 如果沒成功，顯示提示
    if (!newWindow) {
      alert('已複製網址！\n\n請手動貼到 Safari 或 Chrome 開啟。');
    }
  };

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
        // 檢查是否有待跳轉頁面
        const redirectUrl = localStorage.getItem('redirect_after_login');
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push('/');
        }
      }
    } else if (mode === 'register') {
      const result = await signUp(email, password, name);
      if (result.success) {
        // 註冊後一律去 onboarding，onboarding 完成後會檢查 localStorage
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

  return (
    <div className="min-h-screen bg-[#F0EEE6] relative overflow-hidden">
      {/* 背景漸層 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-[#cfb9a5] opacity-30 blur-[100px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#a5bccf] opacity-30 blur-[100px] rounded-full" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-[#a8bfa6] opacity-20 blur-[80px] rounded-full" />
      </div>

      {/* 手機版佈局 */}
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <LoginHeader />

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center px-6 pb-8">
          {/* Logo */}
          <Logo />

          {/* WebView 警告 */}
          {isWebView && (
            <div className="max-w-sm mx-auto w-full mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex items-start gap-3">
                <span className="material-icons-round text-amber-500 text-xl flex-shrink-0 mt-0.5">
                  warning
                </span>
                <div className="flex-1">
                  <p className="text-sm text-amber-800 font-medium mb-2">
                    目前無法使用 Google 登入
                  </p>
                  <p className="text-xs text-amber-700 mb-3">
                    請用 Safari 或 Chrome 開啟此頁面，或使用 Email 登入。
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleOpenInBrowser}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span className="material-icons-round text-lg">open_in_browser</span>
                      開啟瀏覽器
                    </button>
                    <button
                      onClick={handleCopyUrl}
                      className="py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-bold rounded-xl flex items-center justify-center transition-colors"
                    >
                      <span className="material-icons-round text-lg">
                        {copied ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#5C5C5C] mb-2">
              {titles[mode].title}
            </h1>
            <p className="text-[#949494]">{titles[mode].subtitle}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-sm mx-auto w-full mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="max-w-sm mx-auto w-full mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm">
              {successMessage}
            </div>
          )}

          {/* Form */}
          <AuthForm
            mode={mode}
            email={email}
            password={password}
            name={name}
            showPassword={showPassword}
            isLoading={isLoading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onNameChange={setName}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onSubmit={handleSubmit}
            onForgotPassword={() => setMode('forgot')}
          />

          {/* Social Login - 在 WebView 中隱藏 */}
          {mode !== 'forgot' && !isWebView && (
            <SocialLogin isLoading={isLoading} onGoogleLogin={handleGoogleLogin} />
          )}

          {/* Switch Mode */}
          <AuthModeSwitch mode={mode} onModeChange={setMode} />
        </main>
      </div>
    </div>
  );
}
