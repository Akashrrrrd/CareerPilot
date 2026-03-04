/**
 * Screenshot Cache - Stores screenshots temporarily during agent runs
 * Prevents large base64 strings from being sent over SSE
 */

interface CachedScreenshot {
  data: string // base64
  timestamp: number
}

class ScreenshotCache {
  private cache = new Map<string, CachedScreenshot>()
  private maxAge = 5 * 60 * 1000 // 5 minutes

  /**
   * Store a screenshot and return its ID
   */
  store(screenshotBase64: string): string {
    const id = `screenshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.cache.set(id, {
      data: screenshotBase64,
      timestamp: Date.now(),
    })
    this.cleanup()
    return id
  }

  /**
   * Retrieve a screenshot by ID
   */
  get(id: string): string | null {
    const cached = this.cache.get(id)
    if (!cached) return null

    // Check if expired
    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(id)
      return null
    }

    return cached.data
  }

  /**
   * Clean up expired screenshots
   */
  private cleanup() {
    const now = Date.now()
    for (const [id, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.maxAge) {
        this.cache.delete(id)
      }
    }
  }

  /**
   * Clear all screenshots
   */
  clear() {
    this.cache.clear()
  }
}

export const screenshotCache = new ScreenshotCache()
