import { ApiDocs } from "./client"

interface PageProps {
  params: Promise<{
    lang: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params
  const resolvedLang = lang || "en"
  
  return <ApiDocs params={{ lang: resolvedLang }} />
}
