import { NextResponse } from "next/server"
import { GoogleSheetsService } from "@/lib/services/google-sheets-service"

export async function GET() {
  try {
    console.log("🧪 Testing Google Sheets integration...")
    
    // Test the raw fetch first
    const response = await fetch('https://script.google.com/macros/s/AKfycby98sxBqV-YjFrC3-KHBlxezCy6azUcaB1Cy2aWS2bvqHYC4h9R3AADz5ACm0sG7SXH/exec?path=Evaluation&action=read', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      redirect: 'follow',
      mode: 'cors',
    })

    const rawData = await response.json()
    
    const result = await GoogleSheetsService.fetchApplicationsWithFallback()
    
    return NextResponse.json({
      success: true,
      source: result.source,
      count: result.data.length,
      data: result.data.slice(0, 3), // Return first 3 items for testing
      error: result.error,
      debug: {
        url: 'https://script.google.com/macros/s/AKfycby98sxBqV-YjFrC3-KHBlxezCy6azUcaB1Cy2aWS2bvqHYC4h9R3AADz5ACm0sG7SXH/exec?path=Evaluation&action=read',
        timestamp: new Date().toISOString(),
        rawDataType: typeof rawData,
        rawDataIsArray: Array.isArray(rawData),
        rawDataLength: rawData?.length,
        rawDataKeys: rawData && typeof rawData === 'object' ? Object.keys(rawData) : null,
        rawDataSample: rawData && typeof rawData === 'object' ? JSON.stringify(rawData).slice(0, 500) : null
      }
    })
  } catch (error) {
    console.error("❌ Error testing Google Sheets:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 