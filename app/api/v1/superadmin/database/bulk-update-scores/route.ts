import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Google Sheets API URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby98sxBqV-YjFrC3-KHBlxezCy6azUcaB1Cy2aWS2bvqHYC4h9R3AADz5ACm0sG7SXH/exec'

async function fetchGoogleSheetsData() {
  try {
    console.log('🔄 Fetching data from Google Sheets...')
    
    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?path=Evaluation&action=read`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      redirect: 'follow',
      mode: 'cors',
      cache: 'no-cache'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('📊 Google Sheets response received')
    
    // Handle different data formats
    let dataArray = data
    if (data && data.data && Array.isArray(data.data)) {
      dataArray = data.data
    } else if (Array.isArray(data)) {
      dataArray = data
    } else {
      console.log('⚠️ Unexpected data format:', data)
      dataArray = []
    }

    return dataArray
  } catch (error) {
    console.error('❌ Error fetching Google Sheets data:', error)
    return []
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 Starting bulk update process...')
    
    // Fetch Google Sheets data
    const googleSheetsData = await fetchGoogleSheetsData()
    
    if (googleSheetsData.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No Google Sheets data found'
      }, { status: 400 })
    }

    console.log(`📊 Found ${googleSheetsData.length} records in Google Sheets`)

    // Get all applications from database
    const dbApplications = await prisma.application.findMany({
      select: {
        id: true,
        formData: true
      }
    })

    console.log(`📊 Found ${dbApplications.length} applications in database`)

    let updatedCount = 0
    let matchedCount = 0
    let skippedCount = 0

    // Create maps for matching
    const googleSheetsMapById = new Map()
    const googleSheetsMapByPhone = new Map()
    const googleSheetsMapByEmail = new Map()

    // Build Google Sheets maps
    googleSheetsData.forEach(app => {
      // Map by ID
      const appId = app.ID || app.id
      if (appId) {
        googleSheetsMapById.set(appId, app)
      }

      // Map by phone number
      const phoneNumber = app['Phone Number'] || 
                         app['Applicant Phone number'] || 
                         app['Other Applicant Phone number'] || 
                         app.phone || 
                         app['Phone'] ||
                         app.cell
      
      if (phoneNumber) {
        const normalizedPhone = phoneNumber.toString().replace(/\s+/g, '').replace(/^\+250/, '0')
        googleSheetsMapByPhone.set(normalizedPhone, app)
      }

      // Map by email
      const email = app.email || app['Applicant email']
      if (email) {
        googleSheetsMapByEmail.set(email.toLowerCase(), app)
      }
    })

    console.log(`📊 Created maps: ${googleSheetsMapById.size} by ID, ${googleSheetsMapByPhone.size} by phone, ${googleSheetsMapByEmail.size} by email`)

    // Process each database application
    for (const dbApp of dbApplications) {
      let googleSheetsApp = null
      let matchMethod = 'none'
      let totalScore = null
      let vulnerabilityCategory = null

      // Try to find matching Google Sheets app
      // First, try to match by ID
      googleSheetsApp = googleSheetsMapById.get(dbApp.id)
      if (googleSheetsApp) {
        matchMethod = 'ID'
        console.log(`✅ Found match by ID for ${dbApp.id}`)
      }

      // If not found by ID, try to match by phone number
      if (!googleSheetsApp && dbApp.formData) {
        const dbPhoneNumber = dbApp.formData.phone || 
                             dbApp.formData.Phone || 
                             dbApp.formData.q10 || 
                             dbApp.formData.cell || 
                             dbApp.formData['Phone Number'] || 
                             dbApp.formData['Applicant Phone number'] ||
                             dbApp.formData['phone'] ||
                             dbApp.formData['Phone number']
        
        if (dbPhoneNumber) {
          const normalizedDbPhone = dbPhoneNumber.toString().replace(/\s+/g, '').replace(/^\+250/, '0')
          googleSheetsApp = googleSheetsMapByPhone.get(normalizedDbPhone)
          if (googleSheetsApp) {
            matchMethod = 'phone'
            console.log(`✅ Found match by phone for ${dbApp.id}: ${normalizedDbPhone}`)
          }
        }
      }

      // If not found by phone, try to match by email
      if (!googleSheetsApp && dbApp.formData) {
        const dbEmail = dbApp.formData.email || dbApp.formData.Email
        if (dbEmail) {
          googleSheetsApp = googleSheetsMapByEmail.get(dbEmail.toLowerCase())
          if (googleSheetsApp) {
            matchMethod = 'email'
            console.log(`✅ Found match by email for ${dbApp.id}: ${dbEmail}`)
          }
        }
      }

      if (googleSheetsApp) {
        matchedCount++
        
        // Extract Total Score and Vulnerability Category from Google Sheets
        const formData = googleSheetsApp.formData || googleSheetsApp
        
        // Extract Total Score
        if (formData['Total Score'] !== undefined) {
          const raw = formData['Total Score']
          const cleaned = typeof raw === 'string' ? raw.replace(/,/g, '') : raw
          totalScore = Number(cleaned)
        }
        
        // Extract Vulnerability Category
        vulnerabilityCategory = formData['Vulnerability Category'] ||
                               formData.vulnerabilityCategory ||
                               formData.category ||
                               formData['Category'] ||
                               formData['Vulnerability'] ||
                               formData.vulnerability ||
                               formData['vulnerability category'] ||
                               formData['Vulnerability category'] ||
                               null
        
        // Check if we need to update
        const needsUpdate = (totalScore !== null && !isNaN(totalScore) && totalScore >= 0 && totalScore <= 100) ||
                           (vulnerabilityCategory !== null)
        
        if (needsUpdate) {
          const updateData = {}
          
          if (totalScore !== null && !isNaN(totalScore) && totalScore >= 0 && totalScore <= 100) {
            updateData.applicationScore = totalScore
          }
          
          if (vulnerabilityCategory !== null) {
            updateData.vulnerabilityCategory = vulnerabilityCategory
          }
          
          // Update database application using raw SQL to avoid Prisma client issues
          await prisma.$executeRaw`
            UPDATE applications 
            SET application_score = ${totalScore !== null && !isNaN(totalScore) && totalScore >= 0 && totalScore <= 100 ? totalScore : null},
                vulnerability_category = ${vulnerabilityCategory || null}
            WHERE id = ${dbApp.id}
          `
          
          updatedCount++
          console.log(`✅ Updated ${dbApp.id}: Score=${totalScore || 'unchanged'}, Category=${vulnerabilityCategory || 'unchanged'} (matched by ${matchMethod})`)
        } else {
          console.log(`⚠️ No valid updates for ${dbApp.id}: Score=${totalScore}, Category=${vulnerabilityCategory}`)
          skippedCount++
        }
      } else {
        console.log(`❌ No Google Sheets match found for ${dbApp.id}`)
        skippedCount++
      }
    }

    const stats = {
      totalProcessed: dbApplications.length,
      matched: matchedCount,
      updated: updatedCount,
      skipped: skippedCount
    }

    console.log('\n📊 Update Summary:')
    console.log(`✅ Total applications processed: ${stats.totalProcessed}`)
    console.log(`🔗 Matched with Google Sheets: ${stats.matched}`)
    console.log(`📝 Updated with new scores/categories: ${stats.updated}`)
    console.log(`⏭️ Skipped (no match/invalid data): ${stats.skipped}`)

    return NextResponse.json({
      success: true,
      message: `Bulk update completed successfully. Updated ${updatedCount} applications.`,
      stats
    })

  } catch (error) {
    console.error('❌ Error during bulk update:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error during bulk update',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
