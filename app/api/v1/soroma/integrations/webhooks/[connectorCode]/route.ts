import { NextRequest } from "next/server"
import { handleSoromaApiError, soromaJson } from "@/lib/soroma/api-handler"
import { handleConnectorWebhook } from "@/lib/soroma/integrations"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ connectorCode: string }> }
) {
  try {
    const { connectorCode } = await params
    const body = (await request.json()) as {
      tenantId?: string
      externalAccountId?: string
      eventType?: string
      payload?: Record<string, unknown>
    }

    const result = await handleConnectorWebhook({
      connectorCode,
      tenantId: body.tenantId,
      externalAccountId: body.externalAccountId,
      eventType: body.eventType ?? "UNKNOWN",
      payload: body.payload,
    })

    return soromaJson({
      accepted: !!result,
      connectorCode,
      queuedJobId: result?.job.id ?? null,
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
