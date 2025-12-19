'use client';

import { useState } from 'react';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';

export default function AchievementSettingsPage() {
  const [isPublic, setIsPublic] = useState(true);
  const [notifyNewAchievement, setNotifyNewAchievement] = useState(true);
  const [sortBy, setSortBy] = useState('date');

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden relative bg-[#F0EEE6] font-sans antialiased text-gray-900">
      {/* 背景光暈 */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-96 h-96 bg-[#A5BCCF]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] -left-[10%] w-80 h-80 bg-[#Cfb9a5]/20 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[20%] w-64 h-64 bg-[#CFA5A5]/15 rounded-full blur-3xl" />
      </div>

      {/* Header - absolute 定位 */}
      <header className="absolute top-0 left-0 right-0 z-20 px-4 pt-4 pb-4 flex items-center justify-between">
        <Link
          href="/my/achievements"
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 flex items-center justify-center text-gray-600 hover:text-[#Cfb9a5] transition-colors shadow-sm"
        >
          <span className="material-icons-round">arrow_back</span>
        </Link>
        <h1 className="text-lg font-bold text-gray-800 tracking-wide">勳章牆設定</h1>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="h-full overflow-y-auto pt-16 pb-32 px-5">
        {/* 顯示偏好設定 */}
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">顯示偏好設定</h2>
          <div className="bg-white/65 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm overflow-hidden">
            {/* 公開成就牆 */}
            <div className="p-4 border-b border-gray-100/50 flex items-center justify-between">
              <div className="pr-4">
                <div className="text-sm font-bold text-gray-800 mb-1">公開我的成就牆</div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  開啟後，其他旅人可以在您的個人頁面上看到您獲得的勳章收藏。
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#Cfb9a5]" />
              </label>
            </div>

            {/* 選擇展示勳章 */}
            <button className="w-full p-4 border-b border-gray-100/50 flex items-center justify-between hover:bg-white/40 transition-colors group">
              <div className="text-sm font-medium text-gray-800">選擇展示勳章</div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 mr-1">
                  <div className="w-6 h-6 rounded-full bg-[#A8BFA6] border-2 border-white flex items-center justify-center">
                    <span className="material-icons-round text-[14px] text-white">hiking</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#A5BCCF] border-2 border-white flex items-center justify-center">
                    <span className="material-icons-round text-[14px] text-white">photo_camera</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#CFA5A5] border-2 border-white flex items-center justify-center">
                    <span className="material-icons-round text-[14px] text-white">restaurant</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">已選 4 個</span>
                <span className="material-icons-round text-gray-400 text-lg group-hover:text-[#Cfb9a5] transition-colors">chevron_right</span>
              </div>
            </button>

            {/* 勳章排序 */}
            <div className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors relative">
              <div className="text-sm font-medium text-gray-800">勳章排序</div>
              <div className="flex items-center gap-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-transparent border-none text-sm text-[#Cfb9a5] font-medium pr-8 focus:ring-0 cursor-pointer text-right"
                >
                  <option value="date">按獲得日期</option>
                  <option value="rarity">按稀有度</option>
                  <option value="category">按類別</option>
                </select>
                <span className="material-icons-round text-gray-400 text-lg absolute right-4 pointer-events-none">unfold_more</span>
              </div>
            </div>
          </div>
        </section>

        {/* 成就通知設定 */}
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">成就通知設定</h2>
          <div className="bg-white/65 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="pr-4">
                <div className="text-sm font-bold text-gray-800 mb-1">新成就通知</div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  當您解鎖新的旅行成就或勳章時，立即發送推播通知。
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={notifyNewAchievement}
                  onChange={(e) => setNotifyNewAchievement(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#Cfb9a5]" />
              </label>
            </div>
          </div>
        </section>

        {/* 查看所有成就列表 */}
        <div className="flex justify-center mb-8">
          <Link
            href="/my/achievements/gallery"
            className="flex items-center gap-2 px-5 py-2 rounded-full hover:bg-white/30 text-gray-500 text-xs font-medium transition-all group"
          >
            <span className="material-icons-round text-lg group-hover:text-[#Cfb9a5] transition-colors">grid_view</span>
            <span>查看所有成就列表</span>
          </Link>
        </div>
      </main>

      {/* 保存按鈕 */}
      <div className="fixed bottom-20 left-0 right-0 p-6 z-40 bg-gradient-to-t from-[#F0EEE6] via-[#F0EEE6] to-transparent">
        <button className="w-full py-4 rounded-2xl bg-[#Cfb9a5] text-white font-bold text-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:bg-[#b09b88] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <span className="material-icons-round">save</span>
          保存設定
        </button>
      </div>

      {/* 底部導航 */}
      <MobileNav />
    </div>
  );
}
