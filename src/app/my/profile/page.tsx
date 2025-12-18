'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfileEditPage() {
  const [name, setName] = useState('Alex Chen');
  const [bio, setBio] = useState('尋找世界角落的風景，用鏡頭記錄每一個感動瞬間');
  const [email, setEmail] = useState('alex.chen@email.com');
  const [phone, setPhone] = useState('0912-345-678');

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
        <button className="px-4 py-2 rounded-full bg-[#94A3B8] text-white text-sm font-bold shadow-lg shadow-[#94A3B8]/30 hover:shadow-xl transition-shadow">
          儲存
        </button>
      </header>

      {/* Profile Form */}
      <main className="flex-1 px-6 pb-8 overflow-y-auto">
        {/* Avatar Section */}
        <div className="flex flex-col items-center py-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full p-1 border-2 border-[#94A3B8]/30">
              <div className="relative w-full h-full rounded-full overflow-hidden shadow-sm">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5_eWkWytRxj_z3ImVOFNOGbw-3gTjLrh0gJUyGKU2a4p-6Qw9h1Xya8DMPdQmIxwaNeXwgbjRF0271JMx8c8VVhLbPt1sXs9O2X6Z0wm3EdnU3D19GIYooQrZr1uqMCA1l0i9tM-EbMy30MIkmPHUSGd_2FWG8X10WUtwAeJ581lKAdLchWnRl1aMuDSwCXQbIe8kYx0vIGYxhlLHY-8_d-wmc_Rpacqcuy3JoV4hOo0GtBeZ1mZT-_1i3OFfeWdrxu3Gxsbnwvjk"
                  alt="Profile"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#94A3B8] text-white shadow-lg flex items-center justify-center">
              <span className="material-icons-round text-sm">edit</span>
            </button>
          </div>
          <button className="mt-3 text-sm text-[#94A3B8] font-medium">
            更換頭像
          </button>
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
              onChange={(e) => setBio(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-[#5C5C5C] font-medium focus:outline-none placeholder:text-[#C5B6AF]"
              placeholder="請輸入電子郵件"
            />
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
