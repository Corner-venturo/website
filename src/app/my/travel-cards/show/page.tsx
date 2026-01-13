'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import {
  useTravelCardsStore,
  getCardDisplay,
} from '@/stores/travel-cards-store';

export default function TravelCardsShowPage() {
  const { user, initialize, isInitialized } = useAuthStore();
  const {
    myCards,
    myCardsLoading,
    displayLanguage,
    fetchMyCards,
    setDisplayLanguage,
  } = useTravelCardsStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 初始化
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  // 載入資料
  useEffect(() => {
    if (user?.id) {
      fetchMyCards(user.id);
    }
  }, [fetchMyCards, user?.id]);

  // 最小滑動距離
  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    setDragOffset(currentTouch - touchStart);
  }, [touchStart]);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < myCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
    setDragOffset(0);
  }, [touchStart, touchEnd, currentIndex, myCards.length]);

  // 鍵盤導航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < myCards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, myCards.length]);

  const languages = [
    { code: 'ja' as const, label: '日', flag: '🇯🇵' },
    { code: 'en' as const, label: 'EN', flag: '🇺🇸' },
    { code: 'ko' as const, label: '한', flag: '🇰🇷' },
    { code: 'th' as const, label: 'ไท', flag: '🇹🇭' },
  ];

  // 如果沒有小卡
  if (!myCardsLoading && myCards.length === 0) {
    return (
      <div className="bg-[#F0EEE6] font-sans antialiased text-[#5C5C5C] min-h-screen flex flex-col items-center justify-center p-5">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-xl font-bold mb-2">還沒有小卡</h2>
        <p className="text-sm text-[#949494] mb-6 text-center">
          請先選擇你需要的旅遊便利小卡
        </p>
        <Link
          href="/my/travel-cards"
          className="px-6 py-3 rounded-full bg-[#94A3B8] text-white font-bold shadow-lg shadow-[#94A3B8]/30"
        >
          選擇小卡
        </Link>
      </div>
    );
  }

  const currentCard = myCards[currentIndex];
  const cardDisplay = currentCard ? getCardDisplay(currentCard, displayLanguage) : null;

  return (
    <div
      ref={containerRef}
      className="bg-gradient-to-br from-[#F0EEE6] to-[#E8E2DD] font-sans antialiased text-[#5C5C5C] min-h-screen flex flex-col select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <header className="px-5 pt-4 pb-4 flex items-center justify-between z-10">
        <Link
          href="/my/travel-cards"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm text-[#5C5C5C] hover:text-[#94A3B8] transition-colors"
        >
          <span className="material-icons-round text-xl">close</span>
        </Link>

        {/* 語言切換 */}
        <div className="flex gap-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setDisplayLanguage(lang.code)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                displayLanguage === lang.code
                  ? 'bg-[#5C5C5C] text-white shadow-md'
                  : 'bg-white/60 hover:bg-white/80'
              }`}
            >
              {lang.flag}
            </button>
          ))}
        </div>
      </header>

      {/* 卡片區域 */}
      <main className="flex-1 flex items-center justify-center px-5 pb-8 overflow-hidden">
        {myCardsLoading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#94A3B8]"></div>
        ) : cardDisplay ? (
          <div
            className="w-full max-w-md transition-transform duration-300 ease-out"
            style={{
              transform: isDragging ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.02}deg)` : 'translateX(0)',
            }}
          >
            {/* 主卡片 */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-black/10 p-8 border border-white/80">
              {/* 圖示 */}
              <div className="text-center mb-6">
                <span className="text-7xl">{cardDisplay.icon}</span>
              </div>

              {/* 中文（主要） */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-[#3C3C3C] leading-tight">
                  {cardDisplay.labelZh}
                </h2>
              </div>

              {/* 分隔線 */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex-1 h-px bg-[#E8E2DD]"></div>
                <span className="text-2xl">
                  {languages.find(l => l.code === displayLanguage)?.flag}
                </span>
                <div className="flex-1 h-px bg-[#E8E2DD]"></div>
              </div>

              {/* 翻譯 */}
              <div className="text-center">
                <p className="text-xl text-[#5C5C5C] leading-relaxed">
                  {cardDisplay.translation}
                </p>
              </div>
            </div>

            {/* 滑動提示 */}
            <div className="flex items-center justify-center gap-4 mt-6 text-[#949494]">
              <button
                onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
                disabled={currentIndex === 0}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  currentIndex === 0
                    ? 'bg-white/30 text-[#C5B6AF]'
                    : 'bg-white/60 hover:bg-white shadow-sm'
                }`}
              >
                <span className="material-icons-round">chevron_left</span>
              </button>

              {/* 頁碼指示 */}
              <div className="flex items-center gap-2">
                {myCards.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`transition-all ${
                      idx === currentIndex
                        ? 'w-6 h-2 bg-[#5C5C5C] rounded-full'
                        : 'w-2 h-2 bg-[#C5B6AF] rounded-full hover:bg-[#949494]'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => currentIndex < myCards.length - 1 && setCurrentIndex(prev => prev + 1)}
                disabled={currentIndex === myCards.length - 1}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  currentIndex === myCards.length - 1
                    ? 'bg-white/30 text-[#C5B6AF]'
                    : 'bg-white/60 hover:bg-white shadow-sm'
                }`}
              >
                <span className="material-icons-round">chevron_right</span>
              </button>
            </div>

            {/* 頁碼文字 */}
            <div className="text-center mt-3 text-sm text-[#949494]">
              {currentIndex + 1} / {myCards.length}
            </div>
          </div>
        ) : null}
      </main>

      {/* 底部提示 */}
      <footer className="px-5 pb-8 text-center">
        <p className="text-xs text-[#949494]">
          👆 左右滑動切換小卡
        </p>
      </footer>
    </div>
  );
}
