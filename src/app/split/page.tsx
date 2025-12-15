'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

const participants = [
  {
    name: '我',
    role: '我',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ',
    accent: 'primary',
    amount: '$ 827',
    percent: '33.3%',
    paid: '$2,480',
    isPayer: true,
  },
  {
    name: 'Alice',
    role: 'Alice',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBvF2J-hlJIbdIC1Zhk3h66lPKdCASqxoUNDT5DR9he5w1MfhJDXI1O_frJyo2uYhLobQ0_u1nLH0eQeEifXxnEQb0cz5wn2MJRTHFXe0Pkfa3JepHynrlVFLiyd66xSfjKz5z8Jxk2DzcoYdfFA2cCeba_l5jqRdopIxaedRspIjNrtHf3-Nyhhetfd2kO4xkzRwcxejVimNu5QbVu4NZz99d1uv1N4LpbDeXDMwpo0GHzix50XR4ZAGUWfcon0Ci41_X8fWT8xn16',
    accent: 'morandi-blue',
    amount: '$ 827',
    percent: '33.3%',
  },
  {
    name: 'Ben',
    role: 'Ben',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCBqTUmBLXZhqnZPcQe1nIwGuRohyZdFc47OG_sWdrh-8saBlb34Y3uBw_YSd3Ydp2nV6EPktexnXTw9wPF6eb36Rn8uQRi2rpc1GaDxQWmwktHbyyAER_xn5iJHi57wdMmjPJMAPOHV6gWVqxjjPN6x3WoQ896n7YFsHWPU3QML6BZE7hdafcgPI1Fec6SXhNEWVo_t1Q8zw0I0CXTZmbO0cZY5vS3xQ7FdyX36K86T9W5NsNVF5QEMEo3e6tavseKbCcuFdaXTaUQ',
    accent: 'morandi-green',
    amount: '$ 826',
    percent: '33.3%',
  },
  {
    name: 'Coco',
    role: 'Coco',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBvF2J-hlJIbdIC1Zhk3h66lPKdCASqxoUNDT5DR9he5w1MfhJDXI1O_frJyo2uYhLobQ0_u1nLH0eQeEifXxnEQb0cz5wn2MJRTHFXe0Pkfa3JepHynrlVFLiyd66xSfjKz5z8Jxk2DzcoYdfFA2cCeba_l5jqRdopIxaedRspIjNrtHf3-Nyhhetfd2kO4xkzRwcxejVimNu5QbVu4NZz99d1uv1N4LpbDeXDMwpo0GHzix50XR4ZAGUWfcon0Ci41_X8fWT8xn16',
    accent: 'transparent',
  },
];

const accentBorderClass: Record<string, string> = {
  primary: 'border-primary',
  'morandi-blue': 'border-morandi-blue',
  'morandi-green': 'border-morandi-green',
};

const accentChipClass: Record<string, string> = {
  primary: 'bg-primary',
  'morandi-blue': 'bg-morandi-blue',
  'morandi-green': 'bg-morandi-green',
};

export default function SplitBillPage() {
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <main className="bg-[#F0EEE6] dark:bg-[#1a1a1a] text-gray-900 dark:text-white min-h-screen font-sans relative overflow-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#EFEFE8] dark:bg-[#232323]" />
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-morandi-blue/20 dark:bg-morandi-blue/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-80 h-80 bg-morandi-pink/20 dark:bg-morandi-pink/10 rounded-full blur-[80px]" />
        <div className="absolute top-[40%] left-[30%] w-64 h-64 bg-primary/20 dark:bg-primary/5 rounded-full blur-[60px]" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto flex flex-col min-h-screen">
        <header className="px-6 pt-14 pb-4 flex items-center justify-between">
          <Link
            href="/"
            className="w-10 h-10 rounded-full glass dark:glass-dark flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-sm hover:scale-105 transition-transform"
            aria-label="回到首頁"
          >
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-wide">建立分帳</h1>
          <button
            className="w-10 h-10 rounded-full glass dark:glass-dark flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-sm hover:scale-105 transition-transform"
            aria-label="分帳紀錄"
          >
            <span className="material-symbols-outlined text-xl">history</span>
          </button>
        </header>

        <div className="flex-1 px-5 pb-32 space-y-6 overflow-y-auto hide-scrollbar">
          <section className="glass-card dark:glass-card-dark rounded-3xl p-6 flex flex-col items-center justify-center space-y-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-morandi-blue via-primary to-morandi-pink opacity-50" />
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">總金額</label>
            <div className="flex items-baseline gap-2 text-gray-800 dark:text-white">
              <span className="text-2xl font-medium text-gray-400">$</span>
              <input
                className="bg-transparent border-none p-0 text-5xl font-bold text-center w-48 focus:ring-0 placeholder-gray-300"
                placeholder="0"
                type="number"
                defaultValue={2480}
              />
            </div>
            <div className="w-full pt-4">
              <input
                className="w-full bg-background-light/50 dark:bg-black/20 border-none rounded-xl py-3 px-4 text-center text-sm font-medium placeholder-gray-400 focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="輸入項目名稱 (例如: 晚餐)"
                defaultValue="週末爵士樂聚餐"
              />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">
                分帳對象 <span className="text-primary ml-1 text-xs font-normal">(4人)</span>
              </h2>
              <button className="text-xs text-primary font-medium flex items-center gap-0.5">
                <span className="material-symbols-outlined text-sm">add</span>
                邀請好友
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 px-1">
              {participants.map((person) => (
                <div key={person.name} className="flex flex-col items-center gap-2 shrink-0">
                  <div
                    className={`relative w-14 h-14 rounded-full p-0.5 border-2 ${
                      person.accent === 'transparent'
                        ? 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        : accentBorderClass[person.accent] || 'border-transparent'
                    } shadow-sm transition-colors cursor-pointer group`}
                  >
                    <Image
                      src={person.avatar}
                      alt={person.name}
                      fill
                      className={`rounded-full object-cover ${
                        person.accent === 'transparent' ? 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100' : ''
                      }`}
                    />
                    {person.accent !== 'transparent' ? (
                      <div
                        className={`absolute -bottom-1 -right-1 ${accentChipClass[person.accent] || 'bg-gray-300'} text-white rounded-full p-0.5 border-2 border-white dark:border-card-dark`}
                      >
                        <span className="material-symbols-outlined text-[10px] font-bold block">check</span>
                      </div>
                    ) : (
                      <div className="absolute top-0 right-0 w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center border border-white dark:border-card-dark">
                        <span className="material-symbols-outlined text-[10px] text-gray-500">add</span>
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${person.accent === 'transparent' ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                    {person.role}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card dark:glass-card-dark rounded-3xl p-1 overflow-hidden">
            <div className="flex p-1 bg-gray-100/50 dark:bg-black/20 rounded-2xl mb-4">
              <button className="flex-1 py-2 rounded-xl bg-white dark:bg-card-dark shadow-sm text-sm font-bold text-gray-800 dark:text-white transition-all flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-base">call_split</span>
                均分
              </button>
              <button className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-base">pie_chart</span>
                按比例
              </button>
              <button className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-base">edit</span>
                手動
              </button>
            </div>

            <div className="px-4 pb-2 space-y-4">
              {participants.slice(0, 3).map((person, index) => (
                <div key={person.name}>
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full relative">
                        <Image
                          src={person.avatar}
                          alt={person.name}
                          fill
                          className={`rounded-full object-cover ${index === 0 ? 'ring-2 ring-primary/20' : ''}`}
                        />
                      </div>
                      <div>
                        {index === 0 ? (
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                            {person.name} (支付者)
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{person.name}</p>
                        )}
                        {person.isPayer && (
                          <p className="text-[10px] text-primary">已先墊付 {person.paid}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-800 dark:text-white block">{person.amount}</span>
                      <span className="text-[10px] text-gray-400">{person.percent}</span>
                    </div>
                  </div>
                  {index < 2 && <div className="h-px bg-gray-100 dark:bg-white/5 my-3" />}
                </div>
              ))}
            </div>

            <div className="mt-2 py-3 px-4 bg-morandi-yellow/10 dark:bg-morandi-yellow/5 border-t border-morandi-yellow/20 flex items-center justify-between">
              <span className="text-xs text-morandi-yellow font-bold dark:text-morandi-yellow/80 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                餘數調整
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Ben 少付 $1</span>
            </div>
          </section>

          <div className="flex gap-3">
            <Link
              href="/split/record"
              className="flex-1 glass dark:glass-dark py-3 rounded-2xl flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors text-sm font-medium shadow-sm"
            >
              <span className="material-symbols-outlined text-lg text-morandi-blue">receipt_long</span>
              新增費用記錄
            </Link>
            <button className="flex-1 glass dark:glass-dark py-3 rounded-2xl flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors text-sm font-medium shadow-sm">
              <span className="material-symbols-outlined text-lg text-morandi-pink">event_note</span>
              加入備註
            </button>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-50 p-5 bg-gradient-to-t from-[#F0EEE6] via-[#F0EEE6]/95 to-transparent dark:from-[#1a1a1a] dark:via-[#1a1a1a]/95">
          <div className="max-w-xl mx-auto pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">每人應付</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">$ 827</p>
              </div>
              <button className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center gap-2 font-bold transition-colors w-2/3 justify-center text-base">
                <span>發送通知</span>
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
