/**
 * Universal Logger for Client & Server
 * 支援瀏覽器和伺服器端的統一日誌工具
 *
 * - 開發環境：輸出所有日誌
 * - 生產環境：只輸出 error 和 warn
 */

const isDevelopment = process.env.NODE_ENV === 'development'
const isBrowser = typeof window !== 'undefined'

// 伺服器端直接使用 console（Node.js 環境）
// 瀏覽器端使用 window.console
const getConsole = (): Console | null => {
  if (isBrowser) {
    return typeof window !== 'undefined' ? window.console : null
  }
  // 伺服器端
  return console
}

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      const c = getConsole()
      c?.log('[LOG]', ...args)
    }
  },

  error: (...args: unknown[]) => {
    // error 在生產環境也輸出
    const c = getConsole()
    c?.error('[ERROR]', ...args)
  },

  warn: (...args: unknown[]) => {
    // warn 在生產環境也輸出
    const c = getConsole()
    c?.warn('[WARN]', ...args)
  },

  info: (...args: unknown[]) => {
    if (isDevelopment) {
      const c = getConsole()
      c?.info('[INFO]', ...args)
    }
  },

  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      const c = getConsole()
      c?.debug('[DEBUG]', ...args)
    }
  },
}
