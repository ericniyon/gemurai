const img = new window.Image()
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface HeroImageProps {
  src: string
  alt: string
  className?: string
}

export function HeroImage({ src, alt, className = '' }: HeroImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const img = new window.Image()
    img.src = src
    img.onload = () => setIsLoading(false)
    img.onerror = () => {
      setError(true)
      setIsLoading(false)
    }
  }, [src])

  if (error) {
    return (
      <div className={`bg-slate-900 ${className} flex items-center justify-center`}>
        <p className="text-white text-center">Failed to load image</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
        style={{
          backgroundImage: `url(${src})`,
          backgroundColor: '#1a365d',
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
        </div>
      )}
    </div>
  )
} 