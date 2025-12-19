'use client';

import Link from 'next/link';

const contributors = ['我', 'Alice', 'Ben', 'Coco'];

export default function SplitRecordPage() {
  return (
    <main className="bg-[#F0EEE6] text-gray-900 min-h-screen font-sans relative overflow-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#F0EEE6]" />
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#A5BCCF]/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-80 h-80 bg-[#CFA5A5]/20 rounded-full blur-[80px]" />
        <div className="absolute top-[30%] left-[40%] w-64 h-64 bg-[#Cfb9a5]/15 rounded-full blur-[60px]" />
      </div>

      {/* 手機版佈局 */}
      <div className="relative z-10 max-w-xl mx-auto flex flex-col min-h-screen">
        <header className="px-6 pt-14 pb-4 flex items-center justify-between">
          <Link
            href="/split"
            className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-xl border border-white/50 flex items-center justify-center text-[#5C5C5C] shadow-sm hover:scale-105 transition-transform"
            aria-label="返回分帳頁"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </Link>
          <h1 className="text-lg font-bold text-[#5C5C5C] tracking-wide">新增費用記錄</h1>
          <button className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-xl border border-white/50 flex items-center justify-center text-[#Cfb9a5] shadow-sm hover:scale-105 transition-transform font-bold text-sm">
            儲存
          </button>
        </header>

        <div className="flex-1 px-5 pb-32 space-y-6 overflow-y-auto hide-scrollbar">
          <section className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-6 flex flex-col items-center justify-center space-y-4 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#A5BCCF]/40 via-[#Cfb9a5]/60 to-[#CFA5A5]/40" />
            <div className="flex flex-col items-center w-full">
              <label className="text-xs font-semibold text-[#Cfb9a5] uppercase tracking-wider mb-1">金額 Amount</label>
              <div className="flex items-baseline gap-2 text-[#5C5C5C] relative">
                <span className="text-3xl font-medium text-[#949494] absolute -left-6 top-2">$</span>
                <input
                  className="bg-transparent border-none p-0 text-6xl font-bold text-center w-64 focus:ring-0 placeholder-gray-200 text-[#5C5C5C] tracking-tight"
                  placeholder="0"
                  type="number"
                />
              </div>
            </div>
            <div className="w-full relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#949494] text-xl">edit_note</span>
              </div>
              <input
                className="w-full bg-white/50 border-none rounded-2xl py-4 pl-12 pr-4 text-left text-base font-medium placeholder-[#949494] text-[#5C5C5C] focus:ring-2 focus:ring-[#Cfb9a5]/30 transition-all shadow-inner"
                placeholder="輸入項目名稱 (例如: 晚餐)"
                type="text"
              />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3 px-2">
              <h2 className="text-base font-bold text-[#5C5C5C] flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-[#Cfb9a5] block" />
                誰付的錢?
              </h2>
              <div className="flex items-center gap-2 bg-white/50 rounded-full p-1 pl-3 pr-1 border border-white/40">
                <span className="text-xs font-medium text-[#949494]">多人付款</span>
                <button className="relative w-10 h-6 rounded-full bg-gray-200 transition-colors focus:outline-none" aria-label="多人付款切換">
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out" />
                </button>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-5">
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 px-1">
                {contributors.map((person, index) => {
                  const isPayer = index === 0;

                  return (
                    <div
                      key={person}
                      className={`flex flex-col items-center gap-2 shrink-0 cursor-pointer group ${
                        isPayer ? '' : 'opacity-60 hover:opacity-100 transition-all'
                      }`}
                    >
                      <div
                        className={`relative w-16 h-16 rounded-full p-1 border-2 transition-all ${
                          isPayer
                            ? 'border-[#Cfb9a5] shadow-lg shadow-[#Cfb9a5]/20 bg-white'
                            : 'border-transparent group-hover:border-[#A5BCCF]/50'
                        }`}
                      >
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ"
                          alt={person}
                          className={`w-full h-full rounded-full object-cover ${
                            isPayer
                              ? ''
                              : 'grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all'
                          }`}
                        />
                        {isPayer && (
                          <div className="absolute -top-1 -right-1 bg-[#Cfb9a5] text-white rounded-full p-1 border-2 border-white shadow-sm">
                            <span className="material-symbols-outlined text-[12px] font-bold block">credit_card</span>
                          </div>
                        )}
                      </div>
                      <span
                        className={
                          isPayer
                            ? 'text-sm font-bold text-[#5C5C5C]'
                            : 'text-sm font-medium text-[#949494] group-hover:text-[#5C5C5C]'
                        }
                      >
                        {person}
                      </span>
                    </div>
                  );
                })}
                <div className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
                  <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 hover:border-[#Cfb9a5] transition-colors">
                    <span className="material-symbols-outlined text-[#949494] group-hover:text-[#Cfb9a5]">person_add</span>
                  </div>
                  <span className="text-sm font-medium text-[#949494]">邀請</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#949494]">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">group</span>
                  <span>
                    分帳成員: <span className="text-[#5C5C5C] font-medium">所有人 (4)</span>
                  </span>
                </div>
                <button className="text-[#Cfb9a5] hover:text-[#c0aa96] font-medium">修改</button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-4">
              <label className="block text-xs font-semibold text-[#949494] mb-2 uppercase tracking-wide flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">notes</span> 備註 Remarks
              </label>
              <textarea
                className="w-full bg-white/50 border-none rounded-xl p-3 text-sm text-[#5C5C5C] placeholder-[#949494] focus:ring-1 focus:ring-[#Cfb9a5]/50 resize-none"
                placeholder="添加關於這筆費用的詳細說明..."
                rows={3}
              />
            </div>

            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-4">
              <label className="block text-xs font-semibold text-[#949494] mb-3 uppercase tracking-wide flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">receipt_long</span> 收據照片 Receipt
              </label>
              <div className="border-2 border-dashed border-[#A5BCCF]/30 rounded-xl bg-[#A5BCCF]/5 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#A5BCCF]/10 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[#A5BCCF] text-2xl">add_a_photo</span>
                </div>
                <p className="text-sm font-medium text-[#5C5C5C]">上傳收據或照片</p>
                <p className="text-[10px] text-[#949494] mt-1">支持 JPG, PNG</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
