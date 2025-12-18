'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PasswordChangePage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isValid = currentPassword.length > 0 && newPassword.length >= 8 && passwordsMatch;

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
          <h1 className="text-xl font-bold text-[#5C5C5C]">修改密碼</h1>
        </div>
      </header>

      {/* Password Form */}
      <main className="flex-1 px-6 pb-8">
        <div className="space-y-4">
          {/* Current Password */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4">
            <label className="block text-xs text-[#949494] font-medium mb-2">
              目前密碼
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-transparent text-[#5C5C5C] font-medium focus:outline-none placeholder:text-[#C5B6AF] pr-10"
                placeholder="請輸入目前密碼"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#949494] hover:text-[#5C5C5C] transition-colors"
              >
                <span className="material-icons-round text-xl">
                  {showCurrent ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4">
            <label className="block text-xs text-[#949494] font-medium mb-2">
              新密碼
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-transparent text-[#5C5C5C] font-medium focus:outline-none placeholder:text-[#C5B6AF] pr-10"
                placeholder="請輸入新密碼（至少8個字元）"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#949494] hover:text-[#5C5C5C] transition-colors"
              >
                <span className="material-icons-round text-xl">
                  {showNew ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {newPassword.length > 0 && newPassword.length < 8 && (
              <p className="text-xs text-[#C5B6AF] mt-2">密碼需至少 8 個字元</p>
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
              <p className="text-xs text-[#C5B6AF] mt-2">密碼不一致</p>
            )}
            {passwordsMatch && confirmPassword.length > 0 && (
              <p className="text-xs text-[#A8BCA1] mt-2 flex items-center gap-1">
                <span className="material-icons-round text-sm">check_circle</span>
                密碼一致
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          disabled={!isValid}
          className={`w-full mt-8 py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${
            isValid
              ? 'bg-[#94A3B8] shadow-[#94A3B8]/30 hover:shadow-xl'
              : 'bg-[#C5B6AF] cursor-not-allowed'
          }`}
        >
          確認修改
        </button>

        {/* Forgot Password Link */}
        <div className="mt-6 text-center">
          <button className="text-sm text-[#94A3B8] font-medium hover:underline">
            忘記密碼？
          </button>
        </div>
      </main>
    </div>
  );
}
