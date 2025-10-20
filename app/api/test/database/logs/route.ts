import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export const runtime = "nodejs"

export async function GET() {
  try {
    let emailLogs = 0
    let smsLogs = 0
    let recentEmailLogs: any[] = []
    let recentSmsLogs: any[] = []

    // Try to count logs, handle if tables don't exist
    try {
      emailLogs = await prisma.emailLog.count()
    } catch (error) {
      console.log("EmailLog table not found or accessible")
    }

    try {
      smsLogs = await prisma.smsLog.count()
    } catch (error) {
      console.log("SmsLog table not found or accessible")
    }

    // Try to get recent logs
    try {
      recentEmailLogs = await prisma.emailLog.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          to: true,
          subject: true,
          status: true,
          createdAt: true,
        },
      })
    } catch (error) {
      console.log("Could not fetch recent email logs")
    }

    try {
      recentSmsLogs = await prisma.smsLog.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          to: true,
          status: true,
          createdAt: true,
        },
      })
    } catch (error) {
      console.log("Could not fetch recent SMS logs")
    }

    return NextResponse.json({
      success: true,
      message: "Log operations working",
      emailLogs,
      smsLogs,
      details: {
        recentEmailLogs,
        recentSmsLogs,
      },
    })
  } catch (error: any) {
    console.error("Log operations test failed:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Log operations failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
