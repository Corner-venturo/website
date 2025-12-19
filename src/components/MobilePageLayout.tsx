'use client';

import MobileNav from './MobileNav';

interface MobilePageLayoutProps {
  children: React.ReactNode;
  /** 背景顏色，預設 bg-[#F7F5F2] */
  bgColor?: string;
  /** 是否顯示 MobileNav，預設 true */
  showNav?: boolean;
  /** 額外的 className */
  className?: string;
}

/**
 * 統一的手機版頁面佈局
 * - 使用 100dvh 確保佔滿螢幕（適應手機瀏覽器）
 * - 頂部 pt-14 預留安全區域（對齊探索頁搜尋框位置）
 * - 底部 pb-24 預留 MobileNav 空間
 */
export default function MobilePageLayout({
  children,
  bgColor = 'bg-[#F7F5F2]',
  showNav = true,
  className = '',
}: MobilePageLayoutProps) {
  return (
    <div className={`h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col ${bgColor} ${className}`}>
      {/* 主要內容區 */}
      <main className="flex-1 overflow-y-auto pt-14 pb-24">
        {children}
      </main>

      {/* 底部導航 */}
      {showNav && <MobileNav />}
    </div>
  );
}
