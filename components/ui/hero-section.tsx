import { HeroBackground } from "@/components/hero-background"

interface HeroSectionProps {
  title: string
  subtitle?: string
  description?: string
  image: string
  overlayColor?: string
  overlayOpacity?: number
  children?: React.ReactNode
  className?: string
}

export function HeroSection({
  title,
  subtitle,
  description,
  image,
  overlayColor,
  overlayOpacity,
  children,
  className = "",
}: HeroSectionProps) {
  return (
    <HeroBackground
      image={image}
      overlayColor={overlayColor}
      overlayOpacity={overlayOpacity}
      className={className}
    >
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl">
          {subtitle && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium mb-4">
              {subtitle}
            </div>
          )}
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {title}
          </h1>
          
          {description && (
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              {description}
            </p>
          )}

          {children}
        </div>
      </div>
    </HeroBackground>
  )
} 