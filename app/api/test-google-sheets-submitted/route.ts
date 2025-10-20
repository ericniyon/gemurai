import { NextResponse } from "next/server"
import { GoogleSheetsService } from "@/lib/services/google-sheets-service"

export async function GET() {
  try {
    console.log("🧪 Testing Google Sheets submitted applications integration...")
    
    const result = await GoogleSheetsService.fetchSubmittedApplicationsWithFallback()
    
    return NextResponse.json({
      success: true,
      source: result.source,
      count: result.data.length,
      data: result.data.slice(0, 5), // Return first 5 items for testing
      error: result.error,
      debug: {
        url: 'https://script.google.com/macros/s/AKfycby98sxBqV-YjFrC3-KHBlxezCy6azUcaB1Cy2aWS2bvqHYC4h9R3AADz5ACm0sG7SXH/exec?path=Evaluation&action=read&filter=submitted',
        timestamp: new Date().toISOString(),
        dataType: typeof result.data,
        dataIsArray: Array.isArray(result.data),
        dataLength: result.data?.length,
        dataKeys: result.data && result.data.length > 0 && typeof result.data[0] === 'object' ? Object.keys(result.data[0]) : null,
        dataSample: result.data && result.data.length > 0 ? JSON.stringify(result.data[0]).slice(0, 500) : null
      }
    })
  } catch (error) {
    console.error("❌ Error testing Google Sheets submitted applications:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
