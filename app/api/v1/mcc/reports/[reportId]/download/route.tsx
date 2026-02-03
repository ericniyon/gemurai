import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"
import { checkMCCPermission } from "@/lib/mcc-auth"
import { cacheService } from "@/lib/services/redis-service"
import { generateReportData } from "../../route"
import { ReportPDFDocument } from "@/lib/report-pdf-template"

/**
 * GET /api/v1/mcc/reports/[reportId]/download - Download a generated report
 * Requires Authorization: Bearer <token>
 * On cache miss: pass ?reportType=&startDate=&endDate=&mccId=&farmerId= to re-generate
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.reports.generate"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reportId } = await params
    if (!reportId) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 })
    }

    let report = await cacheService.get<Record<string, unknown>>(`mcc_report:${reportId}`)

    // On cache miss, try to re-generate from query params
    if (!report) {
      const { searchParams } = new URL(req.url)
      const reportType = searchParams.get("reportType")
      const format = searchParams.get("format") || "json"
      let startDate = searchParams.get("startDate")
      let endDate = searchParams.get("endDate")
      const mccId = searchParams.get("mccId") || undefined
      const farmerId = searchParams.get("farmerId") || undefined

      // Use default date range (last 30 days) when missing for old reports
      if (!startDate || !endDate) {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 30)
        startDate = startDate || start.toISOString().split("T")[0]
        endDate = endDate || end.toISOString().split("T")[0]
      }

      if (reportType) {
        // If user is MCC_MANAGER, verify they have access to this MCC
        if (user.role === "MCC_MANAGER" && mccId && user.mccId !== mccId) {
          return NextResponse.json({ error: "Unauthorized for this report" }, { status: 403 })
        }
        try {
          const reportData = await generateReportData({
            reportType,
            mccId: mccId || undefined,
            startDate,
            endDate,
            farmerId: farmerId || undefined,
          })
          report = {
            reportId,
            reportType,
            format: format === "pdf" ? "pdf" : "json",
            generatedAt: new Date().toISOString(),
            mccId,
            startDate,
            endDate,
            ...reportData,
          }
        } catch (err) {
          console.error("Report re-generation error:", err)
          return NextResponse.json(
            { error: "Failed to re-generate report. Please try generating again." },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json(
          { error: "Report not found or expired. Please generate the report again." },
          { status: 404 }
        )
      }
    } else {
      // If user is MCC_MANAGER, verify they have access to this MCC's report
      const reportMccId = report.mccId as string | undefined
      if (user.role === "MCC_MANAGER" && reportMccId && user.mccId !== reportMccId) {
        return NextResponse.json({ error: "Unauthorized for this report" }, { status: 403 })
      }
    }

    const format = (report.format as string) || "json"
    const reportType = (report.reportType as string) || "report"
    const generatedAt = (report.generatedAt as string) || new Date().toISOString()
    const startDate = (report.startDate as string) || undefined
    const endDate = (report.endDate as string) || undefined

    if (format === "pdf") {
      try {
        // Sanitize report for PDF - ensure plain JSON (Dates, BigInt, circular refs break @react-pdf)
        let sanitizedReport: Record<string, unknown>
        try {
          sanitizedReport = JSON.parse(
            JSON.stringify(report, (_, v) =>
              typeof v === "bigint" ? Number(v) : v instanceof Date ? v.toISOString() : v
            )
          ) as Record<string, unknown>
        } catch {
          sanitizedReport = report
        }

        const pdfDoc = (
          <ReportPDFDocument
            report={sanitizedReport}
            reportType={reportType}
            generatedAt={generatedAt}
            startDate={startDate}
            endDate={endDate}
          />
        )
        const pdfBuffer = await renderToBuffer(pdfDoc)
        const filename = `${reportType}_${reportId}.pdf`

        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        })
      } catch (pdfError) {
        console.error("PDF generation error:", pdfError)
        return NextResponse.json(
          {
            error: "PDF generation failed. Try downloading as JSON instead.",
            details: process.env.NODE_ENV === "development" && pdfError instanceof Error ? pdfError.message : undefined,
          },
          { status: 500 }
        )
      }
    }

    const filename = `${reportType}_${reportId}.json`
    const content = JSON.stringify(report, null, 2)

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Report download error:", error)
    return NextResponse.json(
      {
        error: "Failed to download report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
