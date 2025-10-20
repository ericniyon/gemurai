import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface HeroBackgroundProps {
  image: string
  overlayOpacity?: number
  overlayColor?: string
  className?: string
  children?: React.ReactNode
  pattern?: boolean
}

export function HeroBackground({
  image,
  overlayOpacity = 0.7,
  overlayColor = "from-black",
  className,
  children,
  pattern = true
}: HeroBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.src = image
    img.onload = () => {
      setIsLoaded(true)
      // Add a small delay before showing the content for smooth transition
      setTimeout(() => setIsVisible(true), 100)
    }
    img.onerror = () => {
      console.error('Failed to load image:', image)
      setIsLoaded(true)
      setIsVisible(true)
    }
  }, [image])

  return (
    <div className={cn(
      "relative overflow-hidden bg-slate-900",
      className
    )}>
      {/* Background Image with Zoom Effect */}
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000",
          isLoaded ? "scale-100" : "scale-105",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        style={{
          backgroundImage: `url(${image})`,
          transform: isVisible ? "scale(1)" : "scale(1.05)",
        }}
      />

      {/* Pattern Overlay */}
      {pattern && (
        <div
          className={cn(
            "absolute inset-0 bg-[url('/grid.svg')] bg-center mix-blend-soft-light transition-opacity duration-1000",
            isVisible ? "opacity-30" : "opacity-0"
          )}
        />
      )}

      {/* Gradient Overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br transition-opacity duration-1000",
          overlayColor,
          isVisible ? "opacity-100" : "opacity-0"
        )}
        style={{ opacity: overlayOpacity }}
      />

      {/* Bottom Fade */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-1000",
          isVisible ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-t-4 border-white rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* Content with Fade In */}
      <div 
        className={cn(
          "relative transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        {children}
      </div>
    </div>
  )
} 