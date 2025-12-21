'use client'

import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'

interface CheckInQRCodeProps {
  tripId: string
  userId: string
  userName?: string
  tripTitle?: string
  onClose?: () => void // 如果提供 onClose，則直接顯示全螢幕模式
}

export function CheckInQRCode({ tripId, userId, userName, tripTitle, onClose }: CheckInQRCodeProps) {
  const [showFullScreen, setShowFullScreen] = useState(!!onClose) // 如果有 onClose，預設顯示全螢幕

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setShowFullScreen(false)
    }
  }

  // 產生 QR Code 內容（含時間戳防止截圖重複使用）
  const qrData = JSON.stringify({
    trip_id: tripId,
    user_id: userId,
    ts: Math.floor(Date.now() / 1000),
  })

  return (
    <>
      {/* 小型顯示 (只在沒有 onClose 時顯示，因為有 onClose 表示直接顯示全螢幕) */}
      {!onClose && (
        <div
          onClick={() => setShowFullScreen(true)}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="bg-gray-50 p-2 rounded-xl">
              <QRCodeSVG
                value={qrData}
                size={80}
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">個人報到碼</div>
              <div className="text-sm font-bold text-gray-800">{userName || '旅客'}</div>
              <div className="text-xs text-gray-500 mt-1">點擊放大顯示</div>
            </div>
            <span className="material-icons-round text-gray-300">qr_code_2</span>
          </div>
        </div>
      )}

      {/* 全螢幕顯示 */}
      {showFullScreen && (
        <div
          className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6"
          onClick={handleClose}
        >
          {/* 關閉按鈕 */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <span className="material-icons-round text-gray-600">close</span>
          </button>

          {/* 標題 */}
          <div className="text-center mb-8">
            <div className="text-sm text-gray-400 mb-2">報到 QR Code</div>
            <div className="text-2xl font-bold text-gray-800">{userName || '旅客'}</div>
            {tripTitle && (
              <div className="text-sm text-gray-500 mt-1">{tripTitle}</div>
            )}
          </div>

          {/* QR Code */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
            <QRCodeSVG
              value={qrData}
              size={240}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: '/icon.png',
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>

          {/* 說明 */}
          <div className="mt-8 text-center">
            <div className="text-gray-400 text-sm">
              請讓領隊掃描此 QR Code 進行報到
            </div>
            <div className="text-gray-300 text-xs mt-2">
              點擊任意處關閉
            </div>
          </div>

          {/* 狀態指示 */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs text-amber-600 font-medium">等待報到</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
