import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🧪 Fetching Google Sheets scores from rows 42-70, column F...")
    
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

    // Process each applicant with all relevant columns for scoring
    const results = dataArray.map((row: any) => {
      // Education and Work Experience (max 30 points)
      const workExp = Number(row['work Experience']) || 0
      const yearsExp = Number(row['Years of Experience']) || 0
      const educationWorkScore = Math.min(30, workExp + yearsExp)
      
      // Digital Access and Literacy (max 15 points)
      const deviceOwner = Number(row['Device Owner']) || 0
      const internetUsage = Number(row['Internet Usage']) || 0
      const smartphoneAccess = Number(row['Smartphone Access']) || 0
      const usedApps = Number(row['used Apps']) || 0
      const digitalAccessScore = Math.min(15, deviceOwner + internetUsage + smartphoneAccess + usedApps)
      
      // Socio-Economic and Vulnerability Status (max 10 points)
      const householdingHead = Number(row['Householdinghead']) || 0
      const financialProvider = Number(row['Financial provider for your household']) || 0
      const ownHouse = Number(row['Ownhouse']) || 0
      const disability = Number(row['Disability']) || 0
      const socioEconomicScore = Math.min(10, householdingHead + financialProvider + ownHouse + disability)
      
      // Living Environment & Community Connections (max 10 points)
      const refugee = Number(row['Refugee']) || 0
      const refugeeCamp = Number(row['Refugee camp']) || 0
      const envHouseholdingHead = Number(row['Householdinghead']) || 0
      const envFinancialProvider = Number(row['Financial provider for your household']) || 0
      const communityConnection = Number(row['CommunityConnection']) || 0
      const healthcareBackground = Number(row['Healthcare Background']) || 0
      const envOwnHouse = Number(row['Ownhouse']) || 0
      const environmentCommunityScore = Math.min(10, refugee + refugeeCamp + envHouseholdingHead + envFinancialProvider + communityConnection + healthcareBackground + envOwnHouse)
      
      return {
        ID: row.ID,
        firstName: row['First Name'],
        lastName: row['Lat Name'],
        // Education and Work Experience
        educationWorkScore,
        workExperience: workExp,
        yearsOfExperience: yearsExp,
        // Digital Access and Literacy
        digitalAccessScore,
        'Device Owner': deviceOwner,
        'Internet Usage': internetUsage,
        'Smartphone Access': smartphoneAccess,
        'used Apps': usedApps,
        // Socio-Economic and Vulnerability Status
        socioEconomicScore,
        Householdinghead: householdingHead,
        'Financial provider for your household': financialProvider,
        Ownhouse: ownHouse,
        Disability: disability,
        // Living Environment & Community Connections
        environmentCommunityScore,
        Refugee: refugee,
        'Refugee camp': refugeeCamp,
        envHouseholdingHead: envHouseholdingHead,
        envFinancialProvider: envFinancialProvider,
        CommunityConnection: communityConnection,
        'Healthcare Background': healthcareBackground,
        envOwnHouse: envOwnHouse,
        // Raw data for debugging
        rawData: row
      }
    })

    console.log('📊 Processed scores for', results.length, 'applicants')
    console.log('🔍 Sample data structure:', results[0] ? Object.keys(results[0]) : 'No data')

    return NextResponse.json({
      count: results.length,
      results,
    })
  } catch (error) {
    console.error('❌ Error fetching or processing Google Sheets data:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 