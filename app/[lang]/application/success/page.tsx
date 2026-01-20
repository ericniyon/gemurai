"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Home } from "lucide-react"
import { useNavigate } from "@/lib/navigation"
import { clearSession } from "@/lib/session-manager"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ApplicationSuccessPage() {
  const navigate = useNavigate()
  const params = useParams()
  const lang = params?.lang as string || "en"

  // Clear any remaining session data on mount
  useEffect(() => {
    clearSession()
  }, [])

  const translations = {
    en: {
      title: "Application Submitted Successfully!",
      subtitle: "Thank you for applying to become a Digital Community Champion",
      whatNext: "What happens next?",
      steps: [
        "Our team will carefully review your application",
        "You will be notified of the outcome within 5-7 working days",
        "If successful, you will receive further instructions about next steps"
      ],
      importantInfo: "Important Information",
      infoPoints: [
        "Keep your phone and email accessible for updates",
        "Check your spam/junk folder for emails from HarvestPlus",
        "You can contact support if you don't hear back within 7 days"
      ],
      returnHome: "Return to Homepage"
    },
    rw: {
      title: "Ubusabe Bwoherejwe Neza!",
      subtitle: "Urakoze kwiyandikisha kuba Intumwa y'Ikoranabuhanga mu Muryango",
      whatNext: "Ibikurikira ni ibihe?",
      steps: [
        "Ikipe yacu izasuzuma ubusabe bwawe",
        "Uzamenyeshwa igisubizo mu minsi 5-7 y'akazi",
        "Niba wemerewe, uzahabwa amabwiriza y'ibikurikira"
      ],
      importantInfo: "Amakuru y'Ingenzi",
      infoPoints: [
        "Komeza kugenzura telefoni n'imeyili yawe",
        "Reba muri spam/junk folder imeyili ziva kuri HarvestPlus",
        "Ushobora guhamagara ubufasha niba utabonye igisubizo mu minsi 7"
      ],
      returnHome: "Subira ku Ipaji y'Ibanze"
    }
  }

  const t = translations[lang as keyof typeof translations] || translations.en

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">{t.title}</CardTitle>
            <CardDescription className="text-lg mt-2">
              {t.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">{t.whatNext}</h3>
              <ul className="space-y-2 text-green-700">
                {t.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">{index + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">{t.importantInfo}</h3>
              <ul className="space-y-2 text-blue-700">
                {t.infoPoints.map((point, index) => (
                  <li key={index}>• {point}</li>
                ))}
              </ul>
            </div>

            <div className="text-center pt-4">
              <Link href={`/${lang}`}>
                <Button className="bg-primary hover:bg-primary/90">
                  <Home className="mr-2 h-4 w-4" />
                  {t.returnHome}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}