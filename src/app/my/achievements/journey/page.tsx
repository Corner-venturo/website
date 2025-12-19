'use client';

import Link from 'next/link';
import MobileNav from '@/components/MobileNav';

const journeyMilestones = [
  { icon: 'flag', label: '旅程起點', date: '2023.01.15', color: 'bg-[#D1D1D6]', earned: true, isStart: true },
  { icon: 'flight_takeoff', label: '飛行常客', date: '2023.03.10', desc: '達成 10 次飛行', color: 'bg-[#E0D6A8]', rotate: 'rotate-3', earned: true },
  { icon: 'restaurant', label: '美食家', date: '2023.04.22', desc: '收藏 50 間餐廳', color: 'bg-[#CFA5A5]', rotate: '-rotate-2', earned: true },
  { icon: 'hiking', label: '百岳挑戰', date: '2023.06.15', desc: '攻頂 5 座百岳', color: 'bg-[#A8BFA6]', rotate: 'rotate-2', earned: true },
  { icon: 'photo_camera', label: '攝影師', date: '2023.08.01', desc: '分享 100 張照片', color: 'bg-[#A5BCCF]', earned: true, isLatest: true },
  { icon: 'scuba_diving', label: '深海探險', desc: '尚需 3 次潛水紀錄', earned: false },
  { icon: 'ac_unit', label: '極地長征', desc: '尚需造訪緯度 > 66° 地區', earned: false },
  { icon: 'public', label: '環遊世界', desc: '終極目標：踏足 5 大洲', earned: false, isFinal: true },
];

export default function AchievementJourneyPage() {
  const earnedCount = journeyMilestones.filter(m => m.earned).length;
  const progressPercent = Math.round((earnedCount / journeyMilestones.length) * 100);

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden relative bg-[#F0EEE6] font-sans antialiased text-gray-900">
      {/* 背景光暈 */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-96 h-96 bg-[#A5BCCF]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] -left-[10%] w-80 h-80 bg-[#Cfb9a5]/20 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[20%] w-64 h-64 bg-[#CFA5A5]/15 rounded-full blur-3xl" />
      </div>

      {/* Header - absolute 定位 */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 pt-4 pb-4 flex items-center justify-between">
        <Link
          href="/my/achievements"
          className="bg-white/70 backdrop-blur-xl border border-white/60 w-10 h-10 rounded-full shadow-sm text-gray-600 hover:text-[#Cfb9a5] transition-colors flex items-center justify-center"
        >
          <span className="material-icons-round text-xl">arrow_back</span>
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-bold text-gray-800 tracking-tight">成就旅途</h1>
          <p className="text-[10px] text-[#Cfb9a5] font-bold tracking-widest uppercase">My Journey</p>
        </div>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="h-full overflow-y-auto pt-16 pb-12">
        {/* 進度總覽卡片 */}
        <section className="px-6 mb-8">
          <div className="bg-white/50 backdrop-blur-xl border border-white/40 rounded-3xl p-6 relative overflow-hidden shadow-lg">
            <div className="flex justify-between items-end mb-4 relative z-10">
              <div>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">總進度 Total Progress</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-gray-800">{earnedCount}</span>
                  <span className="text-sm text-gray-400 font-medium">/ {journeyMilestones.length} 勳章</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xs text-[#Cfb9a5] font-bold mb-1">等級 Level 12</span>
                <div className="bg-[#A5BCCF] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm inline-block">
                  探索大師
                </div>
              </div>
            </div>
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#A5BCCF] to-[#Cfb9a5] rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="material-icons-round absolute -bottom-4 -right-4 text-8xl text-[#Cfb9a5]/10 rotate-12 pointer-events-none">
              emoji_events
            </span>
          </div>
        </section>

        {/* 時間軸 */}
        <section className="px-6 relative pb-20">
          {/* 中央時間軸線 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-16 -translate-x-1/2 pointer-events-none z-0">
            {/* 虛線背景 */}
            <div
              className="absolute left-1/2 top-2 bottom-0 w-0.5 -ml-px"
              style={{
                backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(156, 163, 175, 0.3) 50%)',
                backgroundSize: '1px 12px',
                backgroundRepeat: 'repeat-y',
              }}
            />
            {/* 已完成的實線 */}
            <div
              className="absolute left-1/2 top-0 w-0.5 -ml-px bg-gradient-to-b from-[#E0D6A8] via-[#CFA5A5] to-[#Cfb9a5] shadow-[0_0_15px_rgba(207,185,165,0.4)]"
              style={{ height: `${progressPercent}%` }}
            />
            {/* 當前進度點 */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-[#Cfb9a5] rounded-full border-2 border-white shadow-sm z-10"
              style={{ top: `${progressPercent}%` }}
            />
          </div>

          {/* 里程碑項目 */}
          {journeyMilestones.map((milestone, index) => {
            const isLeft = index % 2 === 0;

            return (
              <div
                key={milestone.label}
                className={`relative flex items-center justify-between mb-12 group ${!milestone.earned ? 'grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300' : ''} ${milestone.isStart ? 'opacity-60 hover:opacity-100 transition-opacity mb-10' : ''}`}
              >
                {/* 左側內容 */}
                <div className={`w-[42%] ${isLeft ? 'text-right pr-5 pt-2' : ''}`}>
                  {isLeft && (
                    <>
                      {milestone.isLatest && (
                        <div className="inline-block bg-[#Cfb9a5]/10 text-[#Cfb9a5] text-[10px] font-bold px-2 py-0.5 rounded mb-1">
                          最新達成
                        </div>
                      )}
                      <h3 className={`font-bold ${milestone.earned ? 'text-gray-800' : 'text-gray-400'} ${milestone.isLatest ? 'text-lg' : ''}`}>
                        {milestone.label}
                      </h3>
                      <p className="text-[10px] text-gray-500">
                        {milestone.date && `${milestone.date} • `}{milestone.desc}
                      </p>
                    </>
                  )}
                </div>

                {/* 中間勳章 */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                  {milestone.earned ? (
                    <div className={`relative ${milestone.isLatest ? '' : ''}`}>
                      {milestone.isLatest && (
                        <div className="absolute inset-0 bg-[#A5BCCF] blur-md opacity-50 animate-pulse" />
                      )}
                      <div
                        className={`${milestone.isStart ? 'w-10 h-10' : milestone.isLatest ? 'w-16 h-16' : 'w-14 h-14'} rounded-full ${milestone.color} shadow-[2px_4px_6px_rgba(0,0,0,0.15),inset_0_0_0_2px_rgba(255,255,255,0.2)] border-4 border-[#F0EEE6] flex items-center justify-center z-10 transition-transform hover:scale-110 ${milestone.rotate || ''} relative`}
                      >
                        <span className={`material-icons-round text-white ${milestone.isStart ? 'text-lg' : milestone.isLatest ? 'text-3xl' : 'text-2xl'} drop-shadow-md`}>
                          {milestone.icon}
                        </span>
                        {milestone.isLatest && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full border-2 border-white" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`${milestone.isFinal ? 'w-14 h-14' : 'w-12 h-12'} rounded-full bg-transparent border-2 border-dashed ${milestone.isFinal ? 'border-[#Cfb9a5]/50' : 'border-gray-300'} flex items-center justify-center z-10 bg-[#F0EEE6]`}
                    >
                      <span className={`material-icons-round ${milestone.isFinal ? 'text-[#Cfb9a5]/50 text-2xl' : 'text-gray-300 text-xl'}`}>
                        {milestone.icon}
                      </span>
                    </div>
                  )}
                </div>

                {/* 右側內容 */}
                <div className={`w-[42%] ${!isLeft ? 'text-left pl-5 pt-2' : ''}`}>
                  {!isLeft && (
                    <>
                      {milestone.isLatest && (
                        <div className="inline-block bg-[#Cfb9a5]/10 text-[#Cfb9a5] text-[10px] font-bold px-2 py-0.5 rounded mb-1">
                          最新達成
                        </div>
                      )}
                      <h3 className={`font-bold ${milestone.earned ? 'text-gray-800' : 'text-gray-400'} ${milestone.isLatest ? 'text-lg' : ''}`}>
                        {milestone.label}
                      </h3>
                      <p className="text-[10px] text-gray-500">
                        {milestone.date && `${milestone.date} • `}{milestone.desc}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* 下一個目標按鈕 */}
        <div className="px-6 pb-6 mt-4">
          <Link
            href="/explore"
            className="block w-full py-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-center"
          >
            <p className="text-xs text-gray-400 mb-1">下一個目標</p>
            <span className="text-[#Cfb9a5] font-bold flex items-center justify-center gap-2">
              前往探索行程 <span className="material-icons-round text-sm">arrow_forward</span>
            </span>
          </Link>
        </div>
      </main>

      {/* 底部導航 */}
      <MobileNav />
    </div>
  );
}
