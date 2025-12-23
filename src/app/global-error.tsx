'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="zh-TW">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-4">發生錯誤</h2>
          <p className="text-gray-600 mb-4">很抱歉，系統發生了一個錯誤。</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重試
          </button>
        </div>
      </body>
    </html>
  )
}
