import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('id')
    
    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 })
    }

    console.log(`🔍 Searching for application ID: ${applicationId}`)
    
    // Fetch data from Google Sheets
    const response = await fetch('https://script.google.com/macros/s/AKfycby98sxBqV-YjFrC3-KHBlxezCy6azUcaB1Cy2aWS2bvqHYC4h9R3AADz5ACm0sG7SXH/exec?path=Evaluation&action=read&range=A42:Z70', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      redirect: 'follow',
      mode: 'cors',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const rawData = await response.json()
    let dataArray = rawData
    if (rawData && rawData.data && Array.isArray(rawData.data)) {
      dataArray = rawData.data
    } else if (Array.isArray(rawData)) {
      dataArray = rawData
    } else {
      console.log('⚠️ Unexpected data format:', rawData)
      dataArray = []
    }

    // Search for the specific application ID
    const foundApplication = dataArray.find((row: any) => row.ID === applicationId)
    
    if (foundApplication) {
      console.log(`✅ Found application: ${applicationId}`)
      return NextResponse.json({
        found: true,
        application: foundApplication,
        message: "Application found in Google Sheets data"
      })
    } else {
      console.log(`❌ Application not found: ${applicationId}`)
      // Show first few IDs for debugging
      const firstFewIds = dataArray.slice(0, 5).map((row: any) => row.ID)
      return NextResponse.json({
        found: false,
        searchedId: applicationId,
        firstFewIds,
        totalRecords: dataArray.length,
        message: "Application not found in Google Sheets data"
      })
    }
  } catch (error) {
    console.error('❌ Error searching for application:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 