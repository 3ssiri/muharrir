/**
 * Tiny debug logger.
 *
 * The app previously scattered dozens of `console.log` calls through the chat
 * streaming path, which shipped to production and cluttered the console. This
 * gates verbose logging behind a build-time flag while always surfacing real
 * errors.
 *
 * Enable verbose logs by setting `NEXT_PUBLIC_DEBUG=true` at build time, or at
 * runtime in the browser console: `localStorage.setItem('debug', 'true')`.
 */

function debugEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_DEBUG === 'true') return true
  if (typeof window !== 'undefined') {
    try {
      return window.localStorage.getItem('debug') === 'true'
    } catch {
      /* ignore */
    }
  }
  return false
}

export const log = {
  debug: (...args: unknown[]) => {
    if (debugEnabled()) console.log(...args)
  },
  warn: (...args: unknown[]) => {
    if (debugEnabled()) console.warn(...args)
  },
  // Errors are always reported — they matter regardless of the debug flag.
  error: (...args: unknown[]) => {
    console.error(...args)
  },
}
