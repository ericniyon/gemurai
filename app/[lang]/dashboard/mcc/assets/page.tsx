"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function MccAssetsPage() {
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  useEffect(() => {
    router.replace(`/${lang}/dashboard/mcc/warehouses`)
  }, [router, lang])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <div>
          <p className="text-base font-semibold text-gray-800">Redirecting to Warehouses…</p>
          <p className="text-sm text-gray-500">
            If you are not redirected automatically,{" "}
            <button
              type="button"
              onClick={() => router.replace(`/${lang}/dashboard/mcc/warehouses`)}
              className="font-semibold text-blue-600 underline-offset-2 hover:underline"
            >
              click here
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

