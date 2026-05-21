import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { ensureDatabaseConnected, prisma } from "@/lib/database"
import { NEXGEN_FORUM_APPLICATIONS_OPEN } from "@/lib/nexgen-forum"

const PHONE_REGEX = /^(078|079|072|073)\d{7}$/

const asText = (value: unknown, fallback = "not_specified") => {
  if (typeof value !== "string") return fallback
  const trimmed = value.trim()
  return trimmed || fallback
}

export async function POST(req: NextRequest) {
  try {
    if (!NEXGEN_FORUM_APPLICATIONS_OPEN) {
      return NextResponse.json(
        { success: false, error: "Applications are now closed. We are no longer accepting new submissions." },
        { status: 403 }
      )
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      )
    }

    const phoneNumber = asText(body.phoneNumber || body.phone, "")
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: "Phone Number is required." },
        { status: 400 }
      )
    }

    if (!PHONE_REGEX.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, error: "Phone Number must be 10 digits and start with 078, 079, 072, or 073." },
        { status: 400 }
      )
    }

    const selectedValueChains = Array.isArray(body.selectedValueChains) ? body.selectedValueChains : []
    const invalidValueChain = selectedValueChains.some(
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

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS nexgen_forum_applications_phone_unique_idx
      ON nexgen_forum_applications ((COALESCE(payload->>'phoneNumber', payload->>'phone', '')));
    `)

    const duplicatePhoneRows = await prisma.$queryRawUnsafe<{ total: number }[]>(
      `
        SELECT COUNT(*)::int AS total
        FROM nexgen_forum_applications
        WHERE COALESCE(payload->>'phoneNumber', payload->>'phone', '') = $1
      `,
      phoneNumber
    )
    if ((duplicatePhoneRows[0]?.total ?? 0) > 0) {
      return NextResponse.json(
        { success: false, error: "This phone number has already submitted an application." },
        { status: 409 }
      )
    }

    const submissionId = randomUUID()
    const growthPriorities = Array.isArray(body.growthPriorities)
      ? body.growthPriorities.map((item: unknown) => String(item))
      : []
    const toolsUsed = Array.isArray(body.toolsUsed) ? body.toolsUsed.map((item: unknown) => String(item)) : []
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
      asText(body.companyName, "Untitled application"),
      asText(body.applicantName, "Forum Applicant"),
      asText(body.companyDescription, "No description provided"),
      asText(body.ageGroup),
      asText(body.currentSituation),
      asText(body.engagementLevel),
      asText(body.experienceDuration),
      asText(body.businessStatus),
      asText(body.teamSize),
      asText(body.monthlyCustomers),
      asText(body.monthlyRevenue),
      growthPriorities,
      toolsUsed,
      asText(body.decisionStyle),
      asText(body.innovationStage),
      asText(body.leadershipLevel),
      asText(body.groupType),
      asText(body.primaryReason),
      asText(body.postForumAction),
      asText(body.weeklyCommitment),
      asText(body.nyagatareConnection),
      JSON.stringify(selectedValueChains),
      JSON.stringify({ ...body, phoneNumber })
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
