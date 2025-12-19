'use client'

import { useState, useEffect, ReactNode } from 'react'

interface DesktopWrapperProps {
  children: ReactNode
}

export default function DesktopWrapper({ children }: DesktopWrapperProps) {
  const [isDesktop, setIsDesktop] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    setMounted(true)
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }

    // 更新時間
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }))
    }

    checkDesktop()
    updateTime()
    window.addEventListener('resize', checkDesktop)
    const timeInterval = setInterval(updateTime, 1000)

    return () => {
      window.removeEventListener('resize', checkDesktop)
      clearInterval(timeInterval)
    }
  }, [])

  // SSR 時不顯示，避免 hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  // 手機版直接顯示內容
  if (!isDesktop) {
    return <>{children}</>
  }

  // 桌面版顯示 iPhone 模擬器
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0EEE6] via-[#E8E4DC] to-[#DDD8CE] flex items-center justify-center p-8">
      {/* 背景裝飾 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#cfb9a5]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#a5bccf]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-[#a8bfa6]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center gap-16 max-w-6xl mx-auto">
        {/* 左側 - iPhone 模擬器（基於 iPhone 15 Pro 比例 393:852） */}
        <div className="flex-shrink-0">
          <div className="relative">
            {/* iPhone 外框 - 使用 Flowbite 參考尺寸 */}
            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
              {/* 側邊按鈕 */}
              <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg" />
              <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg" />
              <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg" />
              <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg" />

              {/* 螢幕區域 */}
              <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] relative">
                {/* APP 內容區 - 填滿整個螢幕，縮放 0.7 */}
                <div
                  className="iphone-simulator overflow-hidden relative origin-top-left"
                  style={{
                    transform: 'scale(0.7) translateZ(0)',
                    width: '390px',
                    height: '817px',
                  }}
                >
                  {children}
                </div>

                {/* iOS 狀態列 - 透明疊加 */}
                <div className="absolute top-0 left-0 right-0 h-[34px] flex items-end justify-between px-5 pb-1 z-50 pointer-events-none">
                  {/* 左側 - 時間 */}
                  <span className="text-[14px] font-semibold text-black w-[54px]">{currentTime}</span>

                  {/* 右側 - 訊號 WiFi 電量 */}
                  <div className="flex items-center gap-[3px] w-[54px] justify-end">
                    <svg className="w-[17px] h-[12px]" viewBox="0 0 17 12" fill="none">
                      <rect x="0" y="8" width="3" height="4" rx="0.5" fill="black"/>
                      <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5" fill="black"/>
                      <rect x="9" y="3" width="3" height="9" rx="0.5" fill="black"/>
                      <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="black"/>
                    </svg>
                    <svg className="w-[15px] h-[11px]" viewBox="0 0 15 11" fill="black">
                      <path d="M7.5 2.5c2.1 0 4 .8 5.4 2.1l-1.1 1.1c-1.1-1-2.6-1.7-4.3-1.7s-3.2.6-4.3 1.7L2.1 4.6C3.5 3.3 5.4 2.5 7.5 2.5zm0-2.5C4.6 0 2 1.1.3 3l1.1 1.1C2.9 2.6 5.1 1.5 7.5 1.5s4.6 1.1 6.1 2.6L14.7 3C13 1.1 10.4 0 7.5 0zm0 7.5c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5z"/>
                    </svg>
                    <svg className="w-[25px] h-[12px]" viewBox="0 0 25 12" fill="none">
                      <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="black" strokeOpacity="0.35"/>
                      <rect x="2" y="2" width="18" height="8" rx="1.5" fill="black"/>
                      <path d="M23 4v4a2 2 0 0 0 0-4z" fill="black" fillOpacity="0.4"/>
                    </svg>
                  </div>
                </div>

                {/* Dynamic Island */}
                <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-[84px] h-[24px] bg-black rounded-full z-50" />
              </div>

              {/* 底部 Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-gray-300 rounded-full z-50" />
            </div>
          </div>
        </div>

        {/* 右側 - 提示區塊 */}
        <div className="flex-1 max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-16 h-16 bg-[#cfb9a5] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl font-bold">V</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#5C5C5C]">Venturo</h1>
                <p className="text-[#949494] text-sm">探索你的下一場冒險</p>
              </div>
            </div>
          </div>

          {/* 主要文字 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#5C5C5C] mb-3">
              為行動裝置優化設計
            </h2>
            <p className="text-[#949494] leading-relaxed">
              Venturo 專為手機使用者打造，讓你隨時隨地探索並加入有趣的揪團活動。
              建議使用手機瀏覽以獲得最佳體驗。
            </p>
          </div>

          {/* 使用方式 */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 p-4 bg-white/60 rounded-2xl backdrop-blur">
              <div className="w-10 h-10 bg-[#a8bfa6]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-icons-round text-[#a8bfa6]">phone_iphone</span>
              </div>
              <div>
                <h3 className="font-semibold text-[#5C5C5C] mb-1">手機瀏覽</h3>
                <p className="text-sm text-[#949494]">
                  使用手機開啟此網址，享受完整功能
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/60 rounded-2xl backdrop-blur">
              <div className="w-10 h-10 bg-[#a5bccf]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-icons-round text-[#a5bccf]">qr_code_2</span>
              </div>
              <div>
                <h3 className="font-semibold text-[#5C5C5C] mb-1">掃描 QR Code</h3>
                <p className="text-sm text-[#949494]">
                  使用手機掃描下方 QR Code 快速開啟
                </p>
              </div>
            </div>
          </div>

          {/* QR Code 區域（之後可以加入真實 QR Code） */}
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <span className="material-icons-round text-4xl text-[#949494]">qr_code</span>
            </div>
            <div className="text-sm text-[#949494]">
              <p>掃描 QR Code</p>
              <p>在手機上開啟 Venturo</p>
            </div>
          </div>

          {/* 小提示 */}
          <div className="mt-8 p-4 bg-[#cfb9a5]/10 rounded-2xl border border-[#cfb9a5]/20">
            <div className="flex items-start gap-3">
              <span className="material-icons-round text-[#cfb9a5] text-lg">lightbulb</span>
              <p className="text-sm text-[#5C5C5C]">
                <span className="font-medium">小提示：</span>你現在看到的是 APP 預覽模式，
                左側顯示的是實際手機上的畫面。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
