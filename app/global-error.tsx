'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error only once when the component mounts
    console.error('Global error:', error)
  }, [error])
  
  return (
    <html>
      <body>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong!</h2>
          <p>{error.message || 'An unexpected error occurred'}</p>
          <button onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  )
} 