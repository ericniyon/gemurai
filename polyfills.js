// Global polyfills for browser compatibility and SSR safety
;(() => {
  // Polyfill for self
  if (typeof self === "undefined") {
    if (typeof window !== "undefined") {
      window.self = window
    } else if (typeof global !== "undefined") {
      global.self = global
    } else {
      // Create a minimal self object
      var selfPolyfill = {}
      if (typeof globalThis !== "undefined") {
        globalThis.self = selfPolyfill
      }
    }
  }

  // Ensure self is available globally
  if (typeof window !== "undefined" && typeof window.self === "undefined") {
    window.self = window
  }

  // Polyfill for WorkerGlobalScope (always undefined in main thread)
  if (typeof WorkerGlobalScope === "undefined") {
    if (typeof window !== "undefined") {
      window.WorkerGlobalScope = undefined
    } else if (typeof global !== "undefined") {
      global.WorkerGlobalScope = undefined
    }
  }

  // Polyfill for importScripts (only available in workers)
  if (typeof importScripts === "undefined") {
    if (typeof window !== "undefined") {
      window.importScripts = undefined
    } else if (typeof global !== "undefined") {
      global.importScripts = undefined
    }
  }

  // Navigator polyfill for server-side
  if (typeof navigator === "undefined" && typeof window === "undefined") {
    if (typeof global !== "undefined") {
      global.navigator = {
        userAgent: "Node.js",
        platform: "node",
        language: "en-US",
        languages: ["en-US"],
        onLine: true,
        cookieEnabled: false,
        doNotTrack: null,
        hardwareConcurrency: 1,
        maxTouchPoints: 0,
        vendor: "",
        vendorSub: "",
        productSub: "",
        appCodeName: "Mozilla",
        appName: "Netscape",
        appVersion: "5.0 (Node.js)",
        product: "Gecko",
      }
    }
  }

  // Additional polyfills for common globals
  if (typeof window !== "undefined") {
    // Ensure requestAnimationFrame is available
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = (callback) => setTimeout(callback, 16)
    }

    // Ensure cancelAnimationFrame is available
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = (id) => {
        clearTimeout(id)
      }
    }

    // Ensure requestIdleCallback is available
    if (!window.requestIdleCallback) {
      window.requestIdleCallback = (callback, options) => {
        var start = Date.now()
        return setTimeout(() => {
          callback({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
          })
        }, 1)
      }
    }

    // Ensure cancelIdleCallback is available
    if (!window.cancelIdleCallback) {
      window.cancelIdleCallback = (id) => {
        clearTimeout(id)
      }
    }

    // Polyfill for ResizeObserver
    if (!window.ResizeObserver) {
      window.ResizeObserver = class ResizeObserver {
        constructor(callback) {
          this.callback = callback
          this.observations = []
        }

        observe(target) {
          this.observations.push(target)
          // Simple fallback - call callback immediately
          setTimeout(() => {
            this.callback([
              {
                target: target,
                contentRect: target.getBoundingClientRect ? target.getBoundingClientRect() : { width: 0, height: 0 },
              },
            ])
          }, 0)
        }

        unobserve(target) {
          this.observations = this.observations.filter((obs) => obs !== target)
        }

        disconnect() {
          this.observations = []
        }
      }
    }

    // Polyfill for IntersectionObserver
    if (!window.IntersectionObserver) {
      window.IntersectionObserver = class IntersectionObserver {
        constructor(callback, options) {
          this.callback = callback
          this.options = options || {}
          this.observations = []
        }

        observe(target) {
          this.observations.push(target)
          // Simple fallback - assume element is intersecting
          setTimeout(() => {
            this.callback([
              {
                target: target,
                isIntersecting: true,
                intersectionRatio: 1,
                boundingClientRect: target.getBoundingClientRect
                  ? target.getBoundingClientRect()
                  : { width: 0, height: 0 },
                intersectionRect: target.getBoundingClientRect
                  ? target.getBoundingClientRect()
                  : { width: 0, height: 0 },
                rootBounds: null,
                time: Date.now(),
              },
            ])
          }, 0)
        }

        unobserve(target) {
          this.observations = this.observations.filter((obs) => obs !== target)
        }

        disconnect() {
          this.observations = []
        }
      }
    }
  }

  // Server-side polyfills
  if (typeof window === "undefined" && typeof global !== "undefined") {
    // Polyfill document for server-side
    if (typeof document === "undefined") {
      global.document = {
        createElement: () => ({
          setAttribute: () => {},
          getAttribute: () => null,
          appendChild: () => {},
          removeChild: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          style: {},
          classList: {
            add: () => {},
            remove: () => {},
            contains: () => false,
            toggle: () => {},
          },
        }),
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
        body: {
          appendChild: () => {},
          removeChild: () => {},
          style: {},
        },
        head: {
          appendChild: () => {},
          removeChild: () => {},
        },
      }
    }

    // Polyfill location for server-side
    if (typeof location === "undefined") {
      global.location = {
        href: "http://localhost:3000",
        origin: "http://localhost:3000",
        protocol: "http:",
        host: "localhost:3000",
        hostname: "localhost",
        port: "3000",
        pathname: "/",
        search: "",
        hash: "",
        reload: () => {},
        assign: () => {},
        replace: () => {},
      }
    }
  }
})()
