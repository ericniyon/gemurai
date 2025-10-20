import { NextResponse } from "next/server"
import { headers } from "next/headers"

export const runtime = 'edge'
export const preferredRegion = 'fra1'
export const dynamic = 'force-dynamic'


export async function GET(request: Request) {
  const headersList = headers()
  const cronSecret = headersList.get('x-cron-secret')

  // Verify cron secret
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Call the evaluation API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/evaluate-applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json(
      { error: 'Failed to process applications' },
      { status: 500 }
    )
  }
} 