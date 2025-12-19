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

  // 初始化 Auth
  useEffect(() => {
    initialize();
  }, [initialize]);

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

          {/* Social Login */}
          {mode !== 'forgot' && (
            <SocialLogin isLoading={isLoading} onGoogleLogin={handleGoogleLogin} />
          )}

          {/* Switch Mode */}
          <AuthModeSwitch mode={mode} onModeChange={setMode} />
        </main>
      </div>
    </div>
  );
}
