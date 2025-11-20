import { Metadata, Viewport } from "next"
import "./globals.css"

import { Providers } from "./providers"
import { PerformanceMonitor } from "@/components/performance-monitor"

export const metadata: Metadata = {
  title: {
    template: "%s | Gemurai",
    default: "Gemurai",
  },
  description: "Gemurai Platform",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gemurai Platform",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#0D47A1"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.Gemurai.rw",
    siteName: "Gemurai Platform",
    title: "Gemurai Platform",
    description: "Digital Community Platform for Rwanda",
    images: [{
      url: "/placeholder.jpg",
      width: 1200,
      height: 630,
      alt: "Gemurai Platform",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gemurai Platform",
    description: "Digital Community Platform for Rwanda",
    images: ["/placeholder.jpg"],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="dns-prefetch" href="//www.Gemurai.rw" />
        
        {/* Performance optimization meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Resource hints for faster loading */}
        <link rel="preload" href="/api/health" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <Providers>
          {children}
          {/* Performance monitor - only in development */}
          {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
        </Providers>
      </body>
    </html>
  )
} 