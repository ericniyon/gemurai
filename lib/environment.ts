/**
 * Comprehensive environment detection and polyfill utilities
 */

// Safe environment checks
export const isServer = typeof window === "undefined"
export const isBrowser = typeof window !== "undefined"
export const isWorker = typeof WorkerGlobalScope !== "undefined" && typeof self !== "undefined"
export const isNode = typeof process !== "undefined" && process.versions && process.versions.node

/**
 * Safely check if we're in a web worker
 */
export function isWebWorker(): boolean {
  try {
    return typeof WorkerGlobalScope !== "undefined" && typeof self !== "undefined" && self instanceof WorkerGlobalScope
  } catch (e) {
    return false
  }
}

/**
 * Safely check if we're in the main thread
 */
export function isMainThread(): boolean {
  try {
    return typeof window !== "undefined" && typeof WorkerGlobalScope === "undefined"
  } catch (e) {
    return false
  }
}

/**
 * Get the global object safely
 */
export function getGlobalThis(): any {
  if (typeof globalThis !== "undefined") return globalThis
  if (typeof window !== "undefined") return window
  if (typeof global !== "undefined") return global
  if (typeof self !== "undefined") return self
  throw new Error("Unable to locate global object")
}

/**
 * Ensure all required globals are defined
 */
export function ensureGlobals(): void {
  const globalObj = getGlobalThis()

  // Ensure self is defined
  if (typeof globalObj.self === "undefined") {
    if (typeof window !== "undefined") {
      globalObj.self = window
    } else {
      globalObj.self = globalObj
    }
  }

  // Ensure WorkerGlobalScope is properly handled
  if (typeof globalObj.WorkerGlobalScope === "undefined") {
    globalObj.WorkerGlobalScope = undefined
  }

  // Ensure importScripts is properly handled
  if (typeof globalObj.importScripts === "undefined") {
    globalObj.importScripts = undefined
  }
}

/**
 * Safe feature detection
 */
export const features = {
  get localStorage() {
    try {
      return isBrowser && typeof localStorage !== "undefined"
    } catch (e) {
      return false
    }
  },

  get sessionStorage() {
    try {
      return isBrowser && typeof sessionStorage !== "undefined"
    } catch (e) {
      return false
    }
  },

  get indexedDB() {
    try {
      return isBrowser && typeof indexedDB !== "undefined"
    } catch (e) {
      return false
    }
  },

  get webWorkers() {
    try {
      return isBrowser && typeof Worker !== "undefined"
    } catch (e) {
      return false
    }
  },

  get serviceWorkers() {
    try {
      return isBrowser && "serviceWorker" in navigator
    } catch (e) {
      return false
    }
  },

  get resizeObserver() {
    try {
      return isBrowser && typeof ResizeObserver !== "undefined"
    } catch (e) {
      return false
    }
  },

  get intersectionObserver() {
    try {
      return isBrowser && typeof IntersectionObserver !== "undefined"
    } catch (e) {
      return false
    }
  },
}

/**
 * Initialize environment polyfills
 */
export function initializeEnvironment(): void {
  if (isBrowser) {
    ensureGlobals()
  }
}

// Auto-initialize when module is loaded
if (isBrowser) {
  initializeEnvironment()
}
