'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface CheckInScannerProps {
  tripId: string
  leaderUserId?: string // 可選，如果不提供則從 API 端驗證
  onClose: () => void
  onSuccess?: (result: CheckInResult) => void
  onCheckInSuccess?: () => void // 報到成功後的回調（用於刷新成員列表）
}

interface CheckInResult {
  success: boolean
  travelerName?: string
  alreadyCheckedIn?: boolean
  message: string
}

export function CheckInScanner({ tripId, leaderUserId, onClose, onSuccess, onCheckInSuccess }: CheckInScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startScanner()
    return () => {
      stopScanner()
    }
  }, [])

  const startScanner = async () => {
    if (!containerRef.current) return

    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleScanSuccess,
        () => {} // Ignore scan failures
      )
      setIsScanning(true)
      setError(null)
    } catch (err) {
      console.error('Scanner error:', err)
      setError('無法啟動相機，請確認已授權相機權限')
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current = null
        setIsScanning(false)
      } catch (err) {
        console.error('Stop scanner error:', err)
      }
    }
  }

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessing) return

    try {
      setIsProcessing(true)
      await stopScanner()

      // 解析 QR Code 內容
      const qrData = JSON.parse(decodedText)
      const { trip_id, user_id, ts } = qrData

      // 驗證 trip_id 是否匹配
      if (trip_id !== tripId) {
        setResult({
          success: false,
          message: '此 QR Code 不屬於本行程',
        })
        setIsProcessing(false)
        return
      }

      // 檢查時間戳（可選：防止舊的 QR Code）
      const now = Math.floor(Date.now() / 1000)
      const qrAge = now - ts
      if (qrAge > 300) { // 5 分鐘過期
        setResult({
          success: false,
          message: 'QR Code 已過期，請旅客重新開啟報到碼',
        })
        setIsProcessing(false)
        return
      }

      // 呼叫報到 API
      const response = await fetch(`/api/trips/${tripId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          travelerUserId: user_id,
          leaderUserId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setResult({
          success: false,
          message: data.error || '報到失敗',
        })
      } else {
        setResult({
          success: true,
          travelerName: data.data.travelerName,
          alreadyCheckedIn: data.data.alreadyCheckedIn,
          message: data.message,
        })
        onSuccess?.(data)
        onCheckInSuccess?.()
      }
    } catch (err) {
      console.error('Process QR error:', err)
      setResult({
        success: false,
        message: '無效的 QR Code 格式',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRescan = () => {
    setResult(null)
    setError(null)
    startScanner()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* 頂部導航 */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
        >
          <span className="material-icons-round text-white">close</span>
        </button>
        <div className="text-white font-bold">掃描報到</div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* 掃描區域 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          id="qr-reader"
          ref={containerRef}
          className="w-full max-w-md aspect-square"
        />
      </div>

      {/* 掃描框提示 */}
      {isScanning && !result && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
          </div>
        </div>
      )}

      {/* 底部提示 */}
      {isScanning && !result && (
        <div className="absolute bottom-20 left-0 right-0 text-center">
          <div className="text-white/80 text-sm">
            將旅客的 QR Code 對準掃描框
          </div>
        </div>
      )}

      {/* 錯誤提示 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm text-center">
            <span className="material-icons-round text-red-500 text-5xl mb-4">error</span>
            <div className="text-gray-800 font-bold mb-2">無法啟動相機</div>
            <div className="text-gray-500 text-sm mb-4">{error}</div>
            <button
              onClick={handleRescan}
              className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold"
            >
              重試
            </button>
          </div>
        </div>
      )}

      {/* 結果顯示 */}
      {result && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm text-center">
            {result.success ? (
              <>
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  result.alreadyCheckedIn ? 'bg-amber-100' : 'bg-green-100'
                }`}>
                  <span className={`material-icons-round text-4xl ${
                    result.alreadyCheckedIn ? 'text-amber-500' : 'text-green-500'
                  }`}>
                    {result.alreadyCheckedIn ? 'info' : 'check_circle'}
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-800 mb-2">
                  {result.travelerName}
                </div>
                <div className={`text-sm mb-6 ${
                  result.alreadyCheckedIn ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {result.message}
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <span className="material-icons-round text-red-500 text-4xl">error</span>
                </div>
                <div className="text-xl font-bold text-gray-800 mb-2">報到失敗</div>
                <div className="text-sm text-red-600 mb-6">{result.message}</div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleRescan}
                className="flex-1 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold"
              >
                繼續掃描
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-800 text-white rounded-xl font-bold"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
