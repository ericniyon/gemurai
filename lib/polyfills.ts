// Ensure global object is available
const getGlobalThis = () => {
  if (typeof globalThis !== 'undefined') return globalThis
  if (typeof self !== 'undefined') return self
  if (typeof window !== 'undefined') return window
  if (typeof global !== 'undefined') return global
  throw new Error('Unable to locate global object')
}

try {
  const globalObj = getGlobalThis() as unknown as Window & typeof globalThis
  
  // Ensure self is defined
  if (typeof globalObj.self === 'undefined') {
    if (typeof window !== 'undefined') {
      globalObj.self = window
    } else {
      (globalObj as any).self = globalObj
    }
  }

  // Ensure window is defined
  if (typeof globalObj.window === 'undefined') {
    (globalObj as any).window = globalObj
  }

  // Ensure global is defined
  if (typeof globalObj.global === 'undefined') {
    (globalObj as any).global = globalObj
  }

  // Handle worker-specific globals
  if (typeof globalObj.WorkerGlobalScope === 'undefined') {
    (globalObj as any).WorkerGlobalScope = undefined
  }

  if (typeof globalObj.importScripts === 'undefined') {
    (globalObj as any).importScripts = undefined
  }
} catch (e) {
  console.warn('Failed to polyfill global object:', e)
} 