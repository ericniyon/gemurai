import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Direct applications fetch...')
    
    // Fetch all applications from database
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
    
    console.log('📊 Direct database applications found:', applications.length)
    
    // Transform applications to match expected format
    const transformedApplications = applications.map(app => {
      // Extract total score for sorting - prioritize Google Sheets Total Score
      let totalScore = 0
      
      // First, try to get score from form data (Google Sheets Total Score)
      if (app.formData && app.formData['Total Score'] !== undefined) {
        totalScore = Number(app.formData['Total Score']) || 0
        console.log('🔍 Direct app using formData Total Score:', totalScore)
      } else if (app.formData) {
        // Try different possible score field names
        totalScore = Number(app.formData['totalScore']) || 
                    Number(app.formData['Score']) || 
                    Number(app.formData.score) || 
                    0
        if (totalScore > 0) {
          console.log('🔍 Direct app using alternative formData score:', totalScore)
        }
      } else if (app.evaluations && app.evaluations.length > 0) {
        totalScore = app.evaluations[0].score || 0
        console.log('🔍 Direct app using evaluation score:', totalScore)
      }
      
      // If no score found in form data or evaluations, try to calculate from interview scores
      if (!totalScore && app.interviewScores && app.interviewScores.length > 0) {
        totalScore = app.interviewScores.reduce((sum, score) => sum + (score.totalScore || 0), 0)
        console.log('🔍 Direct app using interview scores as fallback:', totalScore)
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
    
    console.log('✅ Direct applications transformed successfully:', transformedApplications.length)
    
    return NextResponse.json(transformedApplications)
    
  } catch (error) {
    console.error('❌ Error in direct applications fetch:', error)
    return NextResponse.json(
      { 
        error: "Failed to fetch applications from database",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
