export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

// Helper function to get the full API URL
export const getApiUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // If we're in the browser, use relative URLs
  if (typeof window !== 'undefined') {
    return `/${cleanPath}`
  }
  
  // In server-side code, use the full URL
  return `${API_BASE_URL}/${cleanPath}`
} 