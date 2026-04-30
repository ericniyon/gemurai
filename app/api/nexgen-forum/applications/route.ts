import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { ensureDatabaseConnected, prisma } from "@/lib/database"

const REQUIRED_FIELDS = [
  "companyName",
  "applicantName",
  "companyDescription",
  "ageGroup",
  "currentSituation",
  "engagementLevel",
  "experienceDuration",
  "businessStatus",
  "teamSize",
  "monthlyCustomers",
  "monthlyRevenue",
  "decisionStyle",
  "innovationStage",
  "leadershipLevel",
  "groupType",
  "primaryReason",
  "postForumAction",
  "weeklyCommitment",
  "nyagatareConnection",
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      )
    }

    for (const field of REQUIRED_FIELDS) {
      const value = body[field]
      if (!value || typeof value !== "string" || !value.trim()) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    if (!Array.isArray(body.growthPriorities) || body.growthPriorities.length !== 2) {
      return NextResponse.json(
        { success: false, error: "Exactly two growth priorities are required." },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.toolsUsed)) {
      return NextResponse.json(
        { success: false, error: "Invalid tools selection." },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.selectedValueChains) || body.selectedValueChains.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one value chain is required." },
        { status: 400 }
      )
    }

    const invalidValueChain = body.selectedValueChains.some(
      (item: { label?: string; details?: string }) =>
        !item || typeof item.label !== "string" || typeof item.details !== "string" || !item.details.trim()
    )

    if (invalidValueChain) {
      return NextResponse.json(
        { success: false, error: "Each selected value chain must include details." },
        { status: 400 }
      )
    }

    await ensureDatabaseConnected()

    // Ensure storage table exists (safe no-op if already present)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS nexgen_forum_applications (
        id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL,
        applicant_name TEXT NOT NULL,
        company_description TEXT NOT NULL,
        age_group TEXT NOT NULL,
        current_situation TEXT NOT NULL,
        engagement_level TEXT NOT NULL,
        experience_duration TEXT NOT NULL,
        business_status TEXT NOT NULL,
        team_size TEXT NOT NULL,
        monthly_customers TEXT NOT NULL,
        monthly_revenue TEXT NOT NULL,
        growth_priorities TEXT[] NOT NULL DEFAULT '{}',
        tools_used TEXT[] NOT NULL DEFAULT '{}',
        decision_style TEXT NOT NULL,
        innovation_stage TEXT NOT NULL,
        leadership_level TEXT NOT NULL,
        group_type TEXT NOT NULL,
        primary_reason TEXT NOT NULL,
        post_forum_action TEXT NOT NULL,
        weekly_commitment TEXT NOT NULL,
        nyagatare_connection TEXT NOT NULL,
        selected_value_chains JSONB NOT NULL,
        payload JSONB NOT NULL,
        submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `)

    const submissionId = randomUUID()
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO nexgen_forum_applications (
          id, company_name, applicant_name, company_description, age_group, current_situation,
          engagement_level, experience_duration, business_status, team_size, monthly_customers,
          monthly_revenue, growth_priorities, tools_used, decision_style, innovation_stage,
          leadership_level, group_type, primary_reason, post_forum_action, weekly_commitment,
          nyagatare_connection, selected_value_chains, payload, submitted_at, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
          $13::text[], $14::text[], $15, $16, $17, $18, $19, $20, $21, $22,
          $23::jsonb, $24::jsonb, NOW(), NOW(), NOW()
        )
      `,
      submissionId,
      String(body.companyName).trim(),
      String(body.applicantName).trim(),
      String(body.companyDescription).trim(),
      String(body.ageGroup).trim(),
      String(body.currentSituation).trim(),
      String(body.engagementLevel).trim(),
      String(body.experienceDuration).trim(),
      String(body.businessStatus).trim(),
      String(body.teamSize).trim(),
      String(body.monthlyCustomers).trim(),
      String(body.monthlyRevenue).trim(),
      body.growthPriorities,
      body.toolsUsed,
      String(body.decisionStyle).trim(),
      String(body.innovationStage).trim(),
      String(body.leadershipLevel).trim(),
      String(body.groupType).trim(),
      String(body.primaryReason).trim(),
      String(body.postForumAction).trim(),
      String(body.weeklyCommitment).trim(),
      String(body.nyagatareConnection).trim(),
      JSON.stringify(body.selectedValueChains),
      JSON.stringify(body)
    )

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully.",
      data: {
        id: submissionId,
        submittedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("POST /api/nexgen-forum/applications error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to submit application." },
      { status: 500 }
    )
  }
}
