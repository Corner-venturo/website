"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import MobileNav from "@/components/MobileNav";

export default function ContactPage() {
  const router = useRouter();
  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden relative bg-[#F0EEE6] font-sans antialiased text-gray-900">
      {/* 背景光暈 */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#A5BCCF]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-[#Cfb9a5]/20 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[20%] w-64 h-64 bg-[#CFA5A5]/15 rounded-full blur-3xl" />
      </div>

      {/* Header - absolute 定位 */}
      <header className="absolute top-0 left-0 right-0 z-20 px-5 pt-4 pb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="bg-white/70 backdrop-blur-xl border border-white/60 w-10 h-10 flex items-center justify-center rounded-full shadow-sm text-gray-600 hover:text-[#Cfb9a5] transition-colors"
        >
          <span className="material-icons-round text-xl">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-800 tracking-tight">聯絡客服</h1>
        <div className="w-10" />
      </header>

      {/* 主要內容 */}
      <main className="h-full overflow-y-auto pt-16 pb-24">
        {/* 歡迎訊息 */}
        <div className="px-6 mb-6 mt-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">您好,</h2>
          <p className="text-gray-500">我們隨時準備為您提供協助。</p>
        </div>

        {/* 線上對話卡片 */}
        <div className="px-6 mb-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl relative overflow-hidden group border border-white/60">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#Cfb9a5]/20 rounded-full blur-2xl group-hover:bg-[#Cfb9a5]/30 transition-all duration-500" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#Cfb9a5]/20 text-[#b09b88] flex items-center justify-center">
                  <span className="material-icons-round text-3xl">forum</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  在線中
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">立即線上對話</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                與我們的客服專員即時交談，獲得最快速的旅遊支援與解答。
              </p>
              <button className="w-full py-4 rounded-xl bg-[#Cfb9a5] hover:bg-[#c0a996] text-white font-bold shadow-lg shadow-[#Cfb9a5]/30 flex items-center justify-center gap-2 transition-all active:scale-95 group-hover:shadow-[#Cfb9a5]/40">
                <span className="material-icons-round">chat_bubble_outline</span>
                開始對話
              </button>
            </div>
          </div>
        </div>

        {/* 其他聯繫方式 */}
        <div className="px-6 space-y-4 mb-8">
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="material-icons-round text-gray-400 text-sm">tune</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">其他聯繫方式</span>
          </div>

          {/* 撥打客服專線 */}
          <button className="w-full bg-white/50 backdrop-blur-xl border border-white/40 rounded-2xl p-4 flex items-center gap-4 text-left shadow-lg hover:bg-white/70 transition-all group active:scale-[0.98]">
            <div className="w-12 h-12 rounded-full bg-[#A5BCCF]/20 text-[#A5BCCF] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-icons-round text-xl">phone</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-[15px]">撥打客服專線</p>
              <p className="text-sm text-gray-500 mt-0.5">02-2345-6789</p>
            </div>
            <span className="material-icons-round text-gray-300 group-hover:text-[#Cfb9a5] transition-colors">chevron_right</span>
          </button>

          {/* 寄送電子郵件 */}
          <button className="w-full bg-white/50 backdrop-blur-xl border border-white/40 rounded-2xl p-4 flex items-center gap-4 text-left shadow-lg hover:bg-white/70 transition-all group active:scale-[0.98]">
            <div className="w-12 h-12 rounded-full bg-[#CFA5A5]/20 text-[#CFA5A5] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-icons-round text-xl">mail</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-[15px]">寄送電子郵件</p>
              <p className="text-sm text-gray-500 mt-0.5 truncate">support@travel-agency.com</p>
            </div>
            <span className="material-icons-round text-gray-300 group-hover:text-[#Cfb9a5] transition-colors">chevron_right</span>
          </button>

          {/* 提交問題表單 */}
          <button className="w-full bg-white/50 backdrop-blur-xl border border-white/40 rounded-2xl p-4 flex items-center gap-4 text-left shadow-lg hover:bg-white/70 transition-all group active:scale-[0.98]">
            <div className="w-12 h-12 rounded-full bg-[#A8BFA6]/20 text-[#A8BFA6] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-icons-round text-xl">assignment_turned_in</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-[15px]">提交問題表單</p>
              <p className="text-sm text-gray-500 mt-0.5">一般問題詢問</p>
            </div>
            <span className="material-icons-round text-gray-300 group-hover:text-[#Cfb9a5] transition-colors">chevron_right</span>
          </button>
        </div>

        {/* 服務時間 */}
        <div className="px-6">
          <div className="p-5 rounded-2xl bg-white/40 border border-white/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-icons-round text-[#E0D6A8] text-xl">access_time_filled</span>
              <h3 className="font-bold text-gray-700 text-sm">客服服務時間 (GMT+8)</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                <span className="text-gray-500">週一至週五</span>
                <span className="font-semibold text-gray-700">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">週末及假日</span>
                <span className="font-semibold text-gray-700">暫停服務</span>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6 mb-4">© 2024 Digital Traveler. All rights reserved.</p>
        </div>
      </main>

      {/* 底部導航 */}
      <MobileNav />
    </div>
  );
}
