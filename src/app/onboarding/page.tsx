'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth-store';
import { useProfileStore } from '@/stores/profile-store';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isInitialized, initialize } = useAuthStore();
  const { profile, isLoading, completeProfile, fetchProfile, uploadAvatar } = useProfileStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    display_name: '',
    phone: '',
    location: '',
    bio: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [hasCustomAvatar, setHasCustomAvatar] = useState(false); // 是否上傳自訂頭像
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 檢查登入狀態
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login');
    }
  }, [isInitialized, user, router]);

  // 載入現有資料
  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  // 如果已完成資料填寫，導回首頁
  useEffect(() => {
    if (profile?.is_profile_complete) {
      router.push('/');
    }
  }, [profile, router]);

  // 預填現有資料（從 profile 或 user metadata）
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        display_name: profile.display_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
      });
      // 如果有自訂頭像，標記並顯示
      if (profile.avatar_url) {
        setAvatarPreview(profile.avatar_url);
        setHasCustomAvatar(true);
      } else if (user?.user_metadata) {
        // 沒有自訂頭像，顯示 Google 頭像（但不標記為自訂）
        const metadata = user.user_metadata;
        if (metadata?.avatar_url || metadata?.picture) {
          setAvatarPreview(metadata.avatar_url || metadata.picture);
        }
      }
    } else if (user) {
      // 如果沒有 profile，從 user metadata 預填（Google 登入會有）
      const metadata = user.user_metadata;
      setFormData(prev => ({
        ...prev,
        full_name: metadata?.full_name || metadata?.name || '',
        display_name: metadata?.name || '',
      }));
      // 顯示 Google 頭像（但不標記為自訂）
      if (metadata?.avatar_url || metadata?.picture) {
        setAvatarPreview(metadata?.avatar_url || metadata?.picture);
      }
    }
  }, [profile, user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setHasCustomAvatar(true); // 標記為自訂頭像
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = '請輸入您的姓名';
    }
    if (!formData.display_name.trim()) {
      newErrors.display_name = '請輸入顯示名稱';
    } else if (formData.display_name.length < 2) {
      newErrors.display_name = '顯示名稱至少需要 2 個字元';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.phone.trim()) {
      newErrors.phone = '請輸入手機號碼';
    } else if (!/^09\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = '請輸入有效的台灣手機號碼';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    let avatarUrl: string | undefined = undefined;

    // 如果有上傳自訂頭像，先上傳到 Storage
    if (hasCustomAvatar && avatarFile) {
      const uploadResult = await uploadAvatar(user.id, avatarFile);
      if (uploadResult.success && uploadResult.url) {
        avatarUrl = uploadResult.url;
      } else {
        // 上傳失敗，顯示錯誤但繼續（不阻擋完成資料）
        console.error('Avatar upload failed:', uploadResult.error);
      }
    }

    // 完成個人資料
    const result = await completeProfile(user.id, {
      full_name: formData.full_name,
      display_name: formData.display_name,
      phone: formData.phone,
      location: formData.location || undefined,
      bio: formData.bio || undefined,
      avatar_url: avatarUrl,
    });

    if (result.success) {
      router.push('/');
    }
  };

  const handleSkipOptional = () => {
    handleSubmit();
  };

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-[var(--neutral-50)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--morandi-blue)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--neutral-50)] relative overflow-hidden">
      {/* 背景漸層 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-[var(--brand-primary-light)] opacity-50 blur-[100px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[var(--morandi-blue-light)] opacity-40 blur-[100px] rounded-full" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-[var(--morandi-green)] opacity-20 blur-[80px] rounded-full" />
      </div>

      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 p-6">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[var(--neutral-200)] text-white font-bold text-lg flex items-center justify-center">
                V
              </div>
              <span className="text-xl font-bold text-[var(--neutral-600)]">VENTURO</span>
            </div>
            {/* Progress */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-1.5 rounded-full transition-colors ${
                    s <= step ? 'bg-[var(--morandi-blue)]' : 'bg-[var(--neutral-200)]'
                  }`}
                />
              ))}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center px-6 pb-12">
          <div className="max-w-lg mx-auto w-full">
            {/* Step 1: 基本資料 */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-[var(--neutral-700)] mb-3">
                    讓我們認識你
                  </h1>
                  <p className="text-[var(--neutral-400)]">
                    告訴我們一些基本資訊，打造專屬於你的旅行體驗
                  </p>
                </div>

                {/* Avatar Upload */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group"
                  >
                    <div className="w-28 h-28 rounded-full bg-white/60 backdrop-blur-xl border-2 border-dashed border-[var(--neutral-300)] overflow-hidden flex items-center justify-center group-hover:border-[var(--morandi-blue)] transition">
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <svg className="w-10 h-10 text-[var(--neutral-400)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--morandi-blue)] rounded-full flex items-center justify-center text-white shadow-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                      </svg>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
                      真實姓名 <span className="text-[var(--error-text)]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="您的真實姓名"
                      className={`w-full px-4 py-3.5 bg-white/60 backdrop-blur-xl rounded-xl border ${
                        errors.full_name ? 'border-[var(--error-text)]' : 'border-white/50'
                      } text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition`}
                    />
                    {errors.full_name && (
                      <p className="text-xs text-[var(--error-text)] mt-1">{errors.full_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
                      顯示名稱 <span className="text-[var(--error-text)]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="其他用戶看到的名稱"
                      className={`w-full px-4 py-3.5 bg-white/60 backdrop-blur-xl rounded-xl border ${
                        errors.display_name ? 'border-[var(--error-text)]' : 'border-white/50'
                      } text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition`}
                    />
                    {errors.display_name && (
                      <p className="text-xs text-[var(--error-text)] mt-1">{errors.display_name}</p>
                    )}
                    <p className="text-xs text-[var(--neutral-400)] mt-1">這是其他旅伴看到的名稱</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: 聯絡方式 */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-[var(--neutral-700)] mb-3">
                    聯絡方式
                  </h1>
                  <p className="text-[var(--neutral-400)]">
                    讓我們可以通知你重要的旅程資訊
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
                      手機號碼 <span className="text-[var(--error-text)]">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0912345678"
                      className={`w-full px-4 py-3.5 bg-white/60 backdrop-blur-xl rounded-xl border ${
                        errors.phone ? 'border-[var(--error-text)]' : 'border-white/50'
                      } text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-[var(--error-text)] mt-1">{errors.phone}</p>
                    )}
                    <p className="text-xs text-[var(--neutral-400)] mt-1">用於接收訂單通知和重要訊息</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
                      居住地區 <span className="text-[var(--neutral-400)]">(選填)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="例如：台北市"
                      className="w-full px-4 py-3.5 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: 自我介紹 */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-[var(--neutral-700)] mb-3">
                    關於你
                  </h1>
                  <p className="text-[var(--neutral-400)]">
                    讓其他旅伴更認識你（選填）
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
                      自我介紹
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="分享一些關於你自己的事，例如：喜歡的旅行方式、興趣愛好..."
                      rows={4}
                      maxLength={200}
                      className="w-full px-4 py-3.5 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition resize-none"
                    />
                    <p className="text-xs text-[var(--neutral-400)] mt-1 text-right">
                      {formData.bio.length}/200
                    </p>
                  </div>

                  {/* Preview Card */}
                  <div className="p-5 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50">
                    <p className="text-xs text-[var(--neutral-400)] mb-3">預覽你的個人資料</p>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-[var(--neutral-200)] overflow-hidden flex-shrink-0">
                        {avatarPreview ? (
                          <Image
                            src={avatarPreview}
                            alt="Avatar"
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--neutral-400)]">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--neutral-700)] truncate">
                          {formData.display_name || '顯示名稱'}
                        </h3>
                        {formData.location && (
                          <p className="text-sm text-[var(--neutral-400)] flex items-center gap-1 mt-0.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            {formData.location}
                          </p>
                        )}
                        {formData.bio && (
                          <p className="text-sm text-[var(--neutral-500)] mt-2 line-clamp-2">
                            {formData.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-10">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3.5 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 text-[var(--neutral-600)] font-medium hover:bg-white/80 transition"
                >
                  上一步
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3.5 bg-[var(--morandi-blue)] hover:bg-[var(--morandi-blue-dark)] text-white rounded-xl font-medium shadow-[var(--shadow-blue)] transition"
                >
                  下一步
                </button>
              ) : (
                <div className="flex-1 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full py-3.5 bg-[var(--morandi-blue)] hover:bg-[var(--morandi-blue-dark)] text-white rounded-xl font-medium shadow-[var(--shadow-blue)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      '完成設定'
                    )}
                  </button>
                  {!formData.bio && (
                    <button
                      type="button"
                      onClick={handleSkipOptional}
                      disabled={isLoading}
                      className="w-full py-2 text-[var(--neutral-400)] text-sm hover:text-[var(--neutral-600)] transition"
                    >
                      略過，稍後再填
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
