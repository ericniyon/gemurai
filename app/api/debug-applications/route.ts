import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug applications endpoint called...')
    
    // Fetch all applications from database without authentication
    const applications = await prisma.application.findMany({
      include: {
        user: {
          include: {
            userRole: {
              include: {
                role: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        evaluations: true,
        interviewScores: {
          orderBy: {
            submittedAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('📊 Debug: Found', applications.length, 'applications')
    
    // Transform applications to match expected format
    const transformedApplications = applications.map(app => {
      // Extract total score for sorting - prioritize Google Sheets Total Score
      let totalScore = 0
      
      // First, try to get score from form data (Google Sheets Total Score)
      if (app.formData && app.formData['Total Score'] !== undefined) {
        totalScore = Number(app.formData['Total Score']) || 0
        console.log('🔍 Debug app using formData Total Score:', totalScore)
      } else if (app.formData) {
        // Try different possible score field names
        totalScore = Number(app.formData['totalScore']) || 
                    Number(app.formData['Score']) || 
                    Number(app.formData.score) || 
                    0
        if (totalScore > 0) {
          console.log('🔍 Debug app using alternative formData score:', totalScore)
        }
      } else if (app.evaluations && app.evaluations.length > 0) {
        totalScore = app.evaluations[0].score || 0
        console.log('🔍 Debug app using evaluation score:', totalScore)
      }
      
      // If no score found in form data or evaluations, try to calculate from interview scores
      if (!totalScore && app.interviewScores && app.interviewScores.length > 0) {
        totalScore = app.interviewScores.reduce((sum, score) => sum + (score.totalScore || 0), 0)
        console.log('🔍 Debug app using interview scores as fallback:', totalScore)
      }
      
      return {
        ...app,
        formData: app.formData || {},
        createdAt: app.createdAt || new Date().toISOString(),
        updatedAt: app.updatedAt || new Date().toISOString(),
        user: app.user || null,
        evaluations: app.evaluations || [],
        interviewScores: app.interviewScores || [],
        totalScore: totalScore
      }
    })
    
    console.log('✅ Debug: Transformed', transformedApplications.length, 'applications')
    
    return NextResponse.json({
      success: true,
      count: transformedApplications.length,
      applications: transformedApplications.slice(0, 5), // Return first 5 for debugging
      message: 'Debug endpoint - returning applications without authentication'
    })
    
  } catch (error) {
    console.error('❌ Error in debug applications:', error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch applications for debugging",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
