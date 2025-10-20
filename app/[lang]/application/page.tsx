"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users, Sparkles, Globe2 } from "lucide-react"
import { clearSession } from "@/lib/session-manager"
import { getFormConfig, type FormConfig } from "@/lib/form-service"
import Image from "next/image"

type SupportedLanguage = 'en' | 'rw'

// Middleware function to validate language
function validateLanguage(lang: string): SupportedLanguage {
  return lang === 'rw' ? 'rw' : 'en'
}

const translations = {
  en: {
    loading: {
      title: "Loading Application Form",
      description: "Please wait while we load the application form..."
    },
    error: {
      title: "Error Loading Form",
      tryAgain: "Try Again"
    },
    maintenance: {
      title: "System Maintenance",
      description: "The application system is currently under maintenance. Please try again later."
    },
    branding: {
      title: "Digital Community Champions",
      subtitle: "Join our network of digital leaders making a difference in communities across Rwanda",
      communityImpact: {
        title: "Community Impact",
        description: "Empower your community with digital skills and knowledge"
      },
      professionalGrowth: {
        title: "Professional Growth",
        description: "Develop your skills and advance your career in digital technology"
      },
      networkOpportunities: {
        title: "Network Opportunities",
        description: "Connect with like-minded individuals and organizations"
      },
      copyright: "© 2024 Gemurai. All rights reserved."
    }
  },
  rw: {
    loading: {
      title: "Tegereza Ifishi y'ubusabe",
      description: "Nyamuneka tegereza Ifishi y'ubusabe ruribukinguke..."
    },
    error: {
      title: "Ikibazo mu Gukingura Urupapuro",
      tryAgain: "Ongera Ugerageze"
    },
    maintenance: {
      title: "Gusana Sisitemu",
      description: "Sisitemu y'ubusabe irimo gusanwa. Nyamuneka ongera ugerageze nyuma."
    },
    branding: {
      title: "Intumwa z'Ikoranabuhanga mu Muryango",
      subtitle: "Injira mu muryango w'abayobozi b'ikoranabuhanga bagira uruhare mu iterambere ry'imiryango mu Rwanda",
      communityImpact: {
        title: "Iterambere ry'Umuryango",
        description: "Teza imbere umuryango wawe mu bumenyi n'ubushobozi bw'ikoranabuhanga"
      },
      professionalGrowth: {
        title: "Iterambere ry'Umwuga",
        description: "Ongera ubumenyi bwawe kandi utere imbere mu mwuga w'ikoranabuhanga"
      },
      networkOpportunities: {
        title: "Amahirwe yo Gukorana",
        description: "Huza n'abantu n'imiryango bafite intego zimwe"
      },
      copyright: "© 2024 Gemurai. Uburenganzira bwose bwahawe"
    }
  }
} as const

function LoadingComponent({ lang = 'en' }: { lang?: SupportedLanguage }) {
  const t = translations[lang] || translations.en

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            {t.loading.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-600">
            <p>{t.loading.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorComponent({ error, reset, lang = 'en' }: { error: Error; reset: () => void; lang?: SupportedLanguage }) {
  const t = translations[lang] || translations.en

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-red-600">{t.error.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-600">
            <p>{error.message}</p>
            <button 
              onClick={reset}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              {t.error.tryAgain}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MaintenanceComponent({ lang = 'en' }: { lang?: SupportedLanguage }) {
  const t = translations[lang] || translations.en

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{t.maintenance.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-600">
            <p>{t.maintenance.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Import the fixed application form
const ApplicationFormFixed = dynamic(
  () => import("@/components/application-form-fixed"),
  {
    ssr: false,
    loading: () => {
      // Get language from URL in loading component
      const lang = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'en' : 'en'
      return <LoadingComponent lang={validateLanguage(lang)} />
    },
  }
)

function BrandingSection({ lang = 'en' }: { lang?: SupportedLanguage }) {
  const t = translations[lang] || translations.en

  return (
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white p-8 min-h-screen w-1/3">
      <div>
        <div className="mb-12">
          <h1 className="text-2xl font-bold mb-2">{t.branding.title}</h1>
          <p className="text-sm opacity-90">{t.branding.subtitle}</p>
        </div>

        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t.branding.communityImpact.title}</h3>
              <p className="text-sm opacity-80">{t.branding.communityImpact.description}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t.branding.professionalGrowth.title}</h3>
              <p className="text-sm opacity-80">{t.branding.professionalGrowth.description}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <Globe2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t.branding.networkOpportunities.title}</h3>
              <p className="text-sm opacity-80">{t.branding.networkOpportunities.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ApplicationContent() {
  const searchParams = useSearchParams()
  const [isUnderMaintenance, setIsUnderMaintenance] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [applicationId] = useState(`APP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`)

  // Get language from URL and validate it
  const lang = validateLanguage(window.location.pathname.split('/')[1] || 'en')

  useEffect(() => {
    // Check maintenance status
    const checkMaintenance = async () => {
      try {
        const response = await fetch("/api/v1/system/maintenance")
        const data = await response.json()
        setIsUnderMaintenance(data.isUnderMaintenance || false)
      } catch (error) {
        console.error("Failed to check maintenance status:", error)
        setIsUnderMaintenance(false)
      }
    }
    checkMaintenance()

    // Check if session is expired from URL parameter
    if (searchParams) {
      const expired = searchParams.get("expired")
      if (expired === "true") {
        setIsExpired(true)
        clearSession()
      }
    }
  }, [searchParams])

  if (isUnderMaintenance) {
    return <MaintenanceComponent lang={lang} />
  }

  return (
    <div className="flex min-h-screen">
      <BrandingSection lang={lang} />
      <div className="flex-1">
        <div className="container mx-auto max-w-5xl px-4 py-8 h-screen overflow-y-auto">
          <ApplicationFormFixed lang={lang} />
        </div>
      </div>
    </div>
  )
}

export default function ApplicationPage({ params }: { params: { lang: string } }) {
  const validLang = validateLanguage(params.lang)

  return (
    <div className="flex min-h-screen">
      <BrandingSection lang={validLang} />
      <div className="flex-1">
        <div className="container mx-auto max-w-5xl px-4 py-8 h-screen overflow-y-auto">
          <ApplicationFormFixed lang={validLang} />
        </div>
      </div>
    </div>
  )
} 