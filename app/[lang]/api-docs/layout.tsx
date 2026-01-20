import { Metadata } from "next"

export const metadata: Metadata = {
  title: "API Documentation | HarvestPlus Platform",
  description: "Comprehensive API documentation for the HarvestPlus Platform - Explore endpoints, test requests, and integrate with our Digital Community Centers management system",
  keywords: ["API", "Documentation", "HarvestPlus", "REST API", "Endpoints", "Integration"],
  openGraph: {
    title: "API Documentation | HarvestPlus Platform",
    description: "Comprehensive API documentation for the HarvestPlus Platform",
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