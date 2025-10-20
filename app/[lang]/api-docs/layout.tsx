import { Metadata } from "next"

export const metadata: Metadata = {
  title: "API Documentation | Gemurai Platform",
  description: "Comprehensive API documentation for the Gemurai Platform - Explore endpoints, test requests, and integrate with our Digital Community Centers management system",
  keywords: ["API", "Documentation", "Gemurai", "REST API", "Endpoints", "Integration"],
  openGraph: {
    title: "API Documentation | Gemurai Platform",
    description: "Comprehensive API documentation for the Gemurai Platform",
    type: "website",
  },
}

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}