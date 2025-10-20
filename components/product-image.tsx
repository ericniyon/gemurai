"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  darkOverlay?: boolean
  overlayOpacity?: number
  className?: string
  fallbackSrc?: string
}

export function ProductImage({
  src,
  alt,
  width = 400,
  height = 300,
  fill = false,
  priority = false,
  darkOverlay = false,
  overlayOpacity = 0.4,
  className,
  fallbackSrc = "/placeholder.jpg",
}: ProductImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleError = () => {
    console.error("Image failed to load:", src)
    setError(true)
    setLoading(false)
  }

  // Normalize image source path
  const imageSrc = (() => {
    if (!src) return fallbackSrc
    if (src.startsWith('http')) return src
    if (src.startsWith('/')) return src
    if (src.startsWith('uploads/')) return `/${src}`
    return `/images/products/${src}`
  })()

  if (error) {
    console.log("Using fallback for:", src)
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        className={cn(
          "object-cover",
          className
        )}
      />
    )
  }

  return (
    <div className={cn(
      "relative overflow-hidden",
      className
    )}>
      <Image
        src={imageSrc}
        alt={alt}
        width={100}
        height={100}
        placeholder="blur"
        blurDataURL="..."
        objectFit="cover"
        priority={priority}
        className={cn(
          "transition-all duration-300 w-full  top-0 left-0 object-cover rounded-2xl",
          loading ? "scale-110 blur-sm" : "scale-100 blur-0"
        )}
        onError={handleError}
        onLoad={() => setLoading(false)}
      />
      {darkOverlay && !error && !loading && (
        <div 
          className="absolute inset-0 bg-black transition-opacity duration-300"
          style={{ opacity: overlayOpacity }}
        />
      )}
      {loading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
    </div>
  )
} 