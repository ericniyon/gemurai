"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function ApplicationNotFound() {
  const params = useParams() as { lang: string }
  
  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Application Not Found</h1>
        <p className="text-gray-500 mb-8">
          The application you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href={`/${params.lang}/dashboard/applications`}>
            Return to Applications
          </Link>
        </Button>
      </div>
    </div>
  )
} 