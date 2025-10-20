import { redirect } from "next/navigation"

async function ServerWrapper({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return { lang }
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await ServerWrapper({ params })
  
  // Redirect to login page instead of showing home content
  redirect(`/${lang}/login`)
} 