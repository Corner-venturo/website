'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { useProfileStore, getDisplayAvatar } from '@/stores/profile-store';

export default function ProfileEditPage() {
  const { user, initialize, isInitialized } = useAuthStore();
  const { profile, fetchProfile, updateProfile, uploadAvatar, isLoading } = useProfileStore();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  // 載入 profile 資料到表單
  useEffect(() => {
    if (profile) {
      setName(profile.display_name || profile.full_name || '');
      setBio(profile.bio || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const avatarUrl = getDisplayAvatar(profile, user?.user_metadata);
  const email = user?.email || '';
  const displayName = name || user?.user_metadata?.name || '訪客';

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    setMessage('');

    const result = await updateProfile(user.id, {
      display_name: name,
      bio,
      phone,
    });

    setIsSaving(false);

    if (result.success) {
      setMessage('儲存成功！');
      setTimeout(() => setMessage(''), 2000);
    } else {
      setMessage(result.error || '儲存失敗');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    const result = await uploadAvatar(user.id, file);

    if (result.success && result.url) {
      // 更新 profile 的 avatar_url
      await updateProfile(user.id, { avatar_url: result.url });
      // 重新載入 profile
      fetchProfile(user.id);
    } else {
      setMessage(result.error || '上傳失敗');
    }
  };

  return (
    <div className="bg-[#F5F4F0] font-sans antialiased text-[#5C5C5C] min-h-screen flex flex-col">
      {/* 背景光暈 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[5%] -left-[15%] w-[500px] h-[500px] bg-[#D8D0C9] opacity-40 blur-[90px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-[#C8D6D3] opacity-40 blur-[90px] rounded-full" />
      </div>

      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/my/settings"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm text-[#5C5C5C] hover:text-[#94A3B8] transition-colors"
          >
            <span className="material-icons-round text-xl">arrow_back</span>
          </Link>
          <h1 className="text-xl font-bold text-[#5C5C5C]">個人資料</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="px-4 py-2 rounded-full bg-[#94A3B8] text-white text-sm font-bold shadow-lg shadow-[#94A3B8]/30 hover:shadow-xl transition-shadow disabled:opacity-50"
        >
          {isSaving ? '儲存中...' : '儲存'}
        </button>
      </header>

      {/* Message */}
      {message && (
        <div className={`mx-6 mb-4 p-3 rounded-xl text-sm text-center ${message.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Profile Form */}
      <main className="flex-1 px-6 pb-8 overflow-y-auto">
        {/* Avatar Section */}
        <div className="flex flex-col items-center py-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full p-1 border-2 border-[#94A3B8]/30">
              <div className="relative w-full h-full rounded-full overflow-hidden shadow-sm bg-[#D6CDC8] flex items-center justify-center">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Profile"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#94A3B8] text-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-[#8291A6] transition">
              <span className="material-icons-round text-sm">edit</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <label className="mt-3 text-sm text-[#94A3B8] font-medium cursor-pointer hover:text-[#7A8A9E] transition">
            更換頭像
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Name */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4">
            <label className="block text-xs text-[#949494] font-medium mb-2">
              顯示名稱
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-[#5C5C5C] font-bold text-lg focus:outline-none placeholder:text-[#C5B6AF]"
              placeholder="請輸入名稱"
            />
          </div>

          {/* Bio */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4">
            <label className="block text-xs text-[#949494] font-medium mb-2">
              個人簡介
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 100))}
              rows={3}
              className="w-full bg-transparent text-[#5C5C5C] text-sm leading-relaxed focus:outline-none placeholder:text-[#C5B6AF] resize-none"
              placeholder="介紹一下你自己..."
            />
            <div className="text-right text-xs text-[#949494] mt-1">
              {bio.length}/100
            </div>
          </div>

          {/* Email */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4">
            <label className="block text-xs text-[#949494] font-medium mb-2">
              電子郵件
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-transparent text-[#949494] font-medium focus:outline-none cursor-not-allowed"
            />
            <p className="text-xs text-[#B0B0B0] mt-1">電子郵件無法修改</p>
          </div>

          {/* Phone */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4">
            <label className="block text-xs text-[#949494] font-medium mb-2">
              手機號碼
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent text-[#5C5C5C] font-medium focus:outline-none placeholder:text-[#C5B6AF]"
              placeholder="請輸入手機號碼"
            />
          </div>
        </div>

        {/* Delete Account */}
        <div className="mt-8 pt-6 border-t border-[#E8E2DD]">
          <button className="w-full text-center text-sm text-[#C5B6AF] hover:text-red-400 transition-colors">
            刪除帳號
          </button>
        </div>
      </main>
    </div>
  );
}
