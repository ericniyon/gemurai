import { NextRequest, NextResponse } from 'next/server'
import { getApplicationsWithAuth } from '@/app/[lang]/dashboard/applications/actions'
import { GoogleSheetsService } from '@/lib/services/google-sheets-service'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing applications data...')
    
    // Test 1: Check Google Sheets directly
    console.log('📊 Testing Google Sheets...')
    const googleSheetsResult = await GoogleSheetsService.fetchApplicationsWithFallback()
    console.log('Google Sheets result:', {
      source: googleSheetsResult.source,
      dataLength: googleSheetsResult.data.length,
      error: googleSheetsResult.error
    })
    
    // Test 2: Check database directly
    console.log('📊 Testing database...')
    const dbApplications = await prisma.application.findMany({
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })
    console.log('Database applications:', dbApplications.length)
    
    // Test 3: Check the full getApplicationsWithAuth function
    console.log('📊 Testing getApplicationsWithAuth...')
    try {
      const authResult = await getApplicationsWithAuth()
      console.log('Auth result type:', typeof authResult)
      console.log('Auth result:', {
        isArray: Array.isArray(authResult),
        length: Array.isArray(authResult) ? authResult.length : 'not array',
        error: !Array.isArray(authResult) ? authResult : null,
        keys: !Array.isArray(authResult) && authResult ? Object.keys(authResult) : []
      })
    } catch (authError) {
      console.log('Auth function threw error:', authError)
    }
    
    return NextResponse.json({
      success: true,
      googleSheets: {
        source: googleSheetsResult.source,
        dataLength: googleSheetsResult.data.length,
        error: googleSheetsResult.error
      },
      database: {
        applicationsCount: dbApplications.length,
        applications: dbApplications.slice(0, 5) // First 5 for debugging
      }
    })
    
  } catch (error) {
    console.error('❌ Error in test route:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
