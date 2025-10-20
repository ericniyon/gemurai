'use server'

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifyAuthToken } from "@/lib/api-auth"

export async function getAgentApplications() {
  try {
    console.log("Starting getAgentApplications...")
    
    const cookieStore = await cookies()
    const token = await cookieStore.get("Gemurai_token")

    if (!token) {
      console.log("No token found")
      return { 
        error: "Unauthorized", 
        redirect: `/login?redirect=/dashboard/agent-applications` 
      }
    }

    const user = await verifyAuthToken(token.value)
    if (!user) {
      console.log("Invalid token or user not found")
      return { 
        error: "Invalid token", 
        redirect: `/login?redirect=/dashboard/agent-applications` 
      }
    }

    console.log("User found:", { id: user.id, role: user.role })

    // Verify user is an agent
    if (user.role !== "AGENT") {
      console.log("User is not an agent:", user.role)
      return {
        error: "Unauthorized",
        redirect: "/dashboard"
      }
    }

    // Get applications submitted by this agent
    console.log("Fetching applications for user:", user.id)
    
    const applications = await prisma.application.findMany({
      where: {
        userId: user.id,
        status: {
          not: "TEMPORARY" // Only show non-temporary applications
        }
      },
      include: {
        evaluations: {
          select: {
            id: true,
            type: true,
            score: true,
            createdAt: true
          }
        },
        interviewScores: {
          select: {
            id: true,
            totalScore: true,
            totalPossibleScore: true,
            overallScore: true,
            scores: true,
            submittedAt: true,
            submittedBy: true
          },
          orderBy: {
            submittedAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log("Found applications:", applications.length)
    return { applications }
  } catch (error) {
    // Log the full error details
    console.error("Detailed error in getAgentApplications:", {
      error,
      message: error.message,
      stack: error.stack,
      name: error.name
    })

    // Check for specific Prisma errors
    if (error.code) {
      console.error("Prisma error code:", error.code)
      switch (error.code) {
        case 'P2001':
          return { error: "The record does not exist" }
        case 'P2002':
          return { error: "Unique constraint violation" }
        case 'P2025':
          return { error: "Record not found" }
        default:
          return { error: `Database error: ${error.code}` }
      }
    }

    return { 
      error: "Failed to get applications: " + (error.message || "Unknown error")
    }
  }
} 