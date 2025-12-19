'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useProfileStore } from '@/stores/profile-store';
import {
  OnboardingHeader,
  StepBasicInfo,
  StepContact,
  StepAbout,
  StepActions,
  FormData,
  FormErrors,
} from './components';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isInitialized, initialize } = useAuthStore();
  const { profile, isLoading, completeProfile, fetchProfile, uploadAvatar } = useProfileStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    display_name: '',
    username: '',
    phone: '',
    location: '',
    bio: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [hasCustomAvatar, setHasCustomAvatar] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUsernameValid, setIsUsernameValid] = useState(false);

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

  // 如果已完成資料填寫，導回首頁或待跳轉頁面
  useEffect(() => {
    if (profile?.is_profile_complete) {
      const redirectUrl = localStorage.getItem('redirect_after_login');
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/');
      }
    }
  }, [profile, router]);

  // 預填現有資料
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        display_name: profile.display_name || '',
        username: profile.username || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
      });
      if (profile.username) {
        setIsUsernameValid(true);
      }
      if (profile.avatar_url) {
        setAvatarPreview(profile.avatar_url);
        setHasCustomAvatar(true);
      } else if (user?.user_metadata) {
        const metadata = user.user_metadata;
        if (metadata?.avatar_url || metadata?.picture) {
          setAvatarPreview(metadata.avatar_url || metadata.picture);
        }
      }
    } else if (user) {
      const metadata = user.user_metadata;
      setFormData(prev => ({
        ...prev,
        full_name: metadata?.full_name || metadata?.name || '',
        display_name: metadata?.name || '',
      }));
      if (metadata?.avatar_url || metadata?.picture) {
        setAvatarPreview(metadata?.avatar_url || metadata?.picture);
      }
    }
  }, [profile, user]);

  const handleAvatarChange = (file: File) => {
    setAvatarFile(file);
    setHasCustomAvatar(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFormChange = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const validateStep1 = () => {
    const newErrors: FormErrors = {};
    if (!formData.full_name.trim()) {
      newErrors.full_name = '請輸入您的姓名';
    }
    if (!formData.display_name.trim()) {
      newErrors.display_name = '請輸入顯示名稱';
    } else if (formData.display_name.length < 2) {
      newErrors.display_name = '顯示名稱至少需要 2 個字元';
    }
    // username 是選填，但如果有填就要驗證
    if (formData.username && !isUsernameValid) {
      newErrors.username = '請輸入有效的用戶名';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: FormErrors = {};
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

    if (hasCustomAvatar && avatarFile) {
      const uploadResult = await uploadAvatar(user.id, avatarFile);
      if (uploadResult.success && uploadResult.url) {
        avatarUrl = uploadResult.url;
      } else {
        console.error('Avatar upload failed:', uploadResult.error);
      }
    }

    const result = await completeProfile(user.id, {
      full_name: formData.full_name,
      display_name: formData.display_name,
      username: formData.username || undefined,
      phone: formData.phone,
      location: formData.location || undefined,
      bio: formData.bio || undefined,
      avatar_url: avatarUrl,
    });

    if (result.success) {
      // 檢查是否有待跳轉的頁面（例如好友邀請連結）
      const redirectUrl = localStorage.getItem('redirect_after_login');
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/');
      }
    }
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
        <OnboardingHeader currentStep={step} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center px-6 pb-12">
          <div className="max-w-lg mx-auto w-full">
            {/* Step 1: 基本資料 */}
            {step === 1 && (
              <StepBasicInfo
                formData={formData}
                errors={errors}
                avatarPreview={avatarPreview}
                onFormChange={handleFormChange}
                onAvatarChange={handleAvatarChange}
                onUsernameValidChange={setIsUsernameValid}
              />
            )}

            {/* Step 2: 聯絡方式 */}
            {step === 2 && (
              <StepContact
                formData={formData}
                errors={errors}
                onFormChange={handleFormChange}
              />
            )}

            {/* Step 3: 自我介紹 */}
            {step === 3 && (
              <StepAbout
                formData={formData}
                avatarPreview={avatarPreview}
                onFormChange={handleFormChange}
              />
            )}

            {/* Actions */}
            <StepActions
              step={step}
              isLoading={isLoading}
              showSkip={!formData.bio}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={handleSubmit}
              onSkip={handleSubmit}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
