import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🧪 Fetching sample application IDs from Google Sheets...")
    
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

    // Return first 10 application IDs for testing
    const sampleIds = dataArray.slice(0, 10).map((row: any) => ({
      ID: row.ID,
      firstName: row['First Name'],
      lastName: row['Lat Name'],
      'Device Owner': row['Device Owner'],
      'Internet Usage': row['Internet Usage'],
      'Smartphone Access': row['Smartphone Access'],
      'used Apps': row['used Apps'],
      'work Experience': row['work Experience'],
      'Years of Experience': row['Years of Experience']
    }))

    return NextResponse.json({
      count: sampleIds.length,
      sampleIds,
      message: "Use one of these IDs to test the interview scoring"
    })
  } catch (error) {
    console.error('❌ Error fetching Google Sheets sample data:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 