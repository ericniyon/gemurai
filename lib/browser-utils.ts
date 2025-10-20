import { isBrowser, ensureGlobals, features } from "./environment"

/**
 * Safe browser environment detection with comprehensive polyfills
 */
export { isBrowser, isServer } from "./environment"

/**
 * Ensure all globals are properly defined
 */
export const ensureSafeBrowserEnvironment = () => {
  if (isBrowser) {
    ensureGlobals()
  }
}

/**
 * Safe localStorage access
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!features.localStorage) return null
    try {
      ensureSafeBrowserEnvironment()
      return localStorage.getItem(key)
    } catch (e) {
      console.error("localStorage.getItem error:", e)
      return null
    }
  },
  setItem: (key: string, value: string): boolean => {
    if (!features.localStorage) return false
    try {
      ensureSafeBrowserEnvironment()
      localStorage.setItem(key, value)
      return true
    } catch (e) {
      console.error("localStorage.setItem error:", e)
      return false
    }
  },
  removeItem: (key: string): boolean => {
    if (!features.localStorage) return false
    try {
      ensureSafeBrowserEnvironment()
      localStorage.removeItem(key)
      return true
    } catch (e) {
      console.error("localStorage.removeItem error:", e)
      return false
    }
  },
}

/**
 * Safe sessionStorage access
 */
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (!features.sessionStorage) return null
    try {
      ensureSafeBrowserEnvironment()
      return sessionStorage.getItem(key)
    } catch (e) {
      console.error("sessionStorage.getItem error:", e)
      return null
    }
  },
  setItem: (key: string, value: string): boolean => {
    if (!features.sessionStorage) return false
    try {
      ensureSafeBrowserEnvironment()
      sessionStorage.setItem(key, value)
      return true
    } catch (e) {
      console.error("sessionStorage.setItem error:", e)
      return false
    }
  },
  removeItem: (key: string): boolean => {
    if (!features.sessionStorage) return false
    try {
      ensureSafeBrowserEnvironment()
      sessionStorage.removeItem(key)
      return true
    } catch (e) {
      console.error("sessionStorage.removeItem error:", e)
      return false
    }
  },
}

/**
 * Safe document access
 */
export const safeDocument = {
  querySelector: (selector: string): Element | null => {
    if (!isBrowser) return null
    try {
      ensureSafeBrowserEnvironment()
      return document.querySelector(selector)
    } catch (e) {
      console.error("document.querySelector error:", e)
      return null
    }
  },
  getElementById: (id: string): Element | null => {
    if (!isBrowser) return null
    try {
      ensureSafeBrowserEnvironment()
      return document.getElementById(id)
    } catch (e) {
      console.error("document.getElementById error:", e)
      return null
    }
  },
}

/**
 * Safe navigator access
 */
export const safeNavigator = {
  get userAgent(): string {
    if (!isBrowser) return "Node.js"
    try {
      return navigator.userAgent || "Unknown"
    } catch (e) {
      return "Unknown"
    }
  },
  get language(): string {
    if (!isBrowser) return "en-US"
    try {
      return navigator.language || "en-US"
    } catch (e) {
      return "en-US"
    }
  },
  get onLine(): boolean {
    if (!isBrowser) return true
    try {
      return navigator.onLine !== false
    } catch (e) {
      return true
    }
  },
}
