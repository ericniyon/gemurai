"use client"

/**
 * Certifications page – list current user's earned certificates.
 * Requires authentication.
 */
import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Award, Shield } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

type Certification = {
  id: string
  certificateNumber: string
  certificationDate: string
  expiryDate: string | null
  module: {
    id: string
    title: string
    durationMinutes: number
    difficultyLevel: string
  }
}

export default function CertificationsPage() {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const { isAuthenticated } = useAuth()
  const [certs, setCerts] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    const token = localStorage.getItem("Gemurai_token")
    if (!token) {
      setLoading(false)
      return
    }
    fetch("/api/trainings/certifications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCerts(json.data)
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Certifications</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">Sign in to view your certifications.</p>
            <Link href={`/${lang}/login?redirect=/${lang}/trainings/certifications`}>
              <Button className="mt-4">Sign in</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Certifications</h1>
        <p className="mt-1 text-slate-600">
          Certificates earned by completing training modules. Immutable and verifiable.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : certs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Award className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-slate-600">No certifications yet.</p>
            <p className="text-sm text-slate-500">
              Complete training modules to earn certificates (e.g. GEMURA-CERT-2026-00001).
            </p>
            <Link href={`/${lang}/trainings/modules`}>
              <Button className="mt-4">Browse modules</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certs.map((c) => (
            <Card key={c.id} className="border-amber-200/50">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-100 p-2">
                    <Shield className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{c.module.title}</CardTitle>
                    <p className="mt-1 font-mono text-xs text-slate-500">
                      {c.certificateNumber}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-slate-500">
                  Issued {new Date(c.certificationDate).toLocaleDateString()}
                  {c.expiryDate &&
                    ` · Expires ${new Date(c.expiryDate).toLocaleDateString()}`}
                </p>
                <Link href={`/${lang}/trainings/modules/${c.module.id}`}>
                  <Button variant="ghost" size="sm">
                    View module
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
