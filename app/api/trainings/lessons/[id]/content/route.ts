/**
 * GET /api/trainings/lessons/[id]/content
 * Returns HTML content for a lesson. Content focuses on how the HarvestPlus system works.
 */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// System-focused lesson content (how the platform works)
const LESSON_CONTENT: Record<string, string> = {
  "Introduction to HarvestPlus by YDEN": `
    <h2>Introduction to HarvestPlus by YDEN</h2>
    <p>HarvestPlus is a multi-commodity agricultural aggregation platform. It helps collection centers (MCCs), agents, and farmers manage collections, quality, payments, and farm-level data in one place.</p>
    <h3>What the system does</h3>
    <ul>
      <li><strong>Collections</strong> — Record commodity, milk, and crop collections with quality data</li>
      <li><strong>Payments</strong> — Track farmer payments, agent advances, and reconciliation</li>
      <li><strong>Farm-level data</strong> — Farmer profiles, season plans, input usage, and agent assignments</li>
      <li><strong>Quality</strong> — Commodity-specific quality checks and rules</li>
    </ul>
    <p>This training explains how to use the system. You can access it anytime from the <strong>Training</strong> link in the menu.</p>
  `,
  "Roles in the System": `
    <h2>Roles in the System</h2>
    <p>Different users see different parts of the platform depending on their role.</p>
    <h3>Farmer</h3>
    <p>Farmers are linked to collection centers and agents. Their collections, payments, and season plans are managed in the system. Farmers may use the platform to view their data or work with an agent.</p>
    <h3>Agent</h3>
    <p>Agents record collections on behalf of farmers, manage advances, and work with the MCC. They use <strong>Collections</strong>, <strong>HarvestPlus</strong> (payments, advances), and <strong>Farm-Level Data</strong> in the dashboard.</p>
    <h3>MCC Manager</h3>
    <p>MCC (collection center) managers run operations: periods, collections, processing, payments, reconciliation, and farm-level data. They have full access to their MCC’s dashboard sections.</p>
    <h3>Quality Officer / Warehouse Officer</h3>
    <p>These roles focus on quality checks at collection and warehouse handling. The system supports commodity-specific quality fields and rules.</p>
  `,
  "Dashboard Overview": `
    <h2>Dashboard Overview</h2>
    <p>When you log in, the main menu shows the sections you can use. What you see depends on your role.</p>
    <h3>Common sections</h3>
    <ul>
      <li><strong>Dashboard</strong> — Home and summary</li>
      <li><strong>Operations</strong> — Periods, processing, and setup</li>
      <li><strong>Collections</strong> — Record commodity, milk, or crop collections</li>
      <li><strong>HarvestPlus</strong> — Farmer payments, agent advances, reconciliation</li>
      <li><strong>Farm-Level Data</strong> — Farmers, season plans, inputs, agents</li>
      <li><strong>Collection Center</strong> — Sales, customers, warehouses, and more</li>
      <li><strong>Training</strong> — This learning portal</li>
    </ul>
    <p>Use <strong>Training</strong> anytime to learn how each part of the system works.</p>
  `,
  "Recording a Collection": `
    <h2>Recording a Collection</h2>
    <p>Collections are the core of the system: you record what was delivered, by whom, and with what quality.</p>
    <h3>Where to go</h3>
    <p>Open <strong>Collections</strong> from the dashboard. Choose the collection type: <strong>commodity</strong>, <strong>milk</strong>, or <strong>crop</strong>.</p>
    <h3>What you enter</h3>
    <ul>
      <li>Farmer (or select by code/phone)</li>
      <li>Commodity or crop type</li>
      <li>Quantity and unit</li>
      <li>Quality data (as defined for that commodity)</li>
      <li>Price and deductions if applicable</li>
    </ul>
    <p>Once saved, the collection gets a status (e.g. PENDING) and can be approved and paid later.</p>
  `,
  "Quality Data at Collection": `
    <h2>Quality Data at Collection</h2>
    <p>Each commodity can have its own quality fields (e.g. moisture, grade, fat). The system uses these for pricing and acceptance.</p>
    <h3>How it works</h3>
    <ul>
      <li>When you record a collection, the form shows the quality fields configured for that commodity</li>
      <li>Enter the values (e.g. moisture %, grade). Some fields may be mandatory</li>
      <li>Quality rules can mark a collection as pass/fail or affect price</li>
    </ul>
    <p>Quality is set up in <strong>Commodity Studio</strong> (admin). Agents and MCC staff see the right fields for each commodity.</p>
  `,
  "Status and Approval Flow": `
    <h2>Status and Approval Flow</h2>
    <p>Collections move through statuses until they are paid and processed.</p>
    <h3>Typical flow</h3>
    <ul>
      <li><strong>PENDING</strong> — Just recorded; not yet approved</li>
      <li><strong>APPROVED</strong> — Checked and accepted; ready for payment</li>
      <li><strong>PAID</strong> — Farmer payment recorded</li>
      <li><strong>PROCESSED</strong> — Linked to warehouse/stock if applicable</li>
    </ul>
    <p>Some commodities may use REJECTED or other statuses. Use the HarvestPlus section to run payments and reconciliation.</p>
  `,
  "Farmer Payments": `
    <h2>Farmer Payments</h2>
    <p>Farmer payments are managed in the <strong>HarvestPlus</strong> section of the dashboard.</p>
    <h3>How it works</h3>
    <ul>
      <li>Approved collections are eligible for payment</li>
      <li>Payment method (e.g. cash, mobile money, bank) is recorded</li>
      <li>Deductions and advances are applied; net payment is calculated</li>
      <li>Once paid, the collection status is updated so it is not paid again</li>
    </ul>
    <p>Payments can be done per collection or in batches, depending on how your MCC is set up.</p>
  `,
  "Agent Advances and Settlement": `
    <h2>Agent Advances and Settlement</h2>
    <p>Agents can receive advances (prepayments) that are later settled against collections.</p>
    <h3>In the system</h3>
    <ul>
      <li>Advances are recorded in HarvestPlus (e.g. per farmer, commodity, or batch)</li>
      <li>When a collection is paid, the system can link the advance so it is settled</li>
      <li>Status (PENDING, SETTLED, CANCELLED) keeps track of each advance</li>
    </ul>
    <p>MCC managers and agents use the same section to view and settle advances.</p>
  `,
  "Reconciliation Basics": `
    <h2>Reconciliation Basics</h2>
    <p>Reconciliation in HarvestPlus helps match what was expected (e.g. collections, payments) with what actually happened.</p>
    <h3>Types</h3>
    <ul>
      <li>Collection reconciliation — quantities and values</li>
      <li>Payment reconciliation — farmer and agent payments</li>
      <li>Period reconciliation — closing a period</li>
    </ul>
    <p>When there is a discrepancy, the system records it. Authorized users resolve and document the result. Use the HarvestPlus reconciliation tab to run and review these.</p>
  `,
  "Farmer Profiles and Season Plans": `
    <h2>Farmer Profiles and Season Plans</h2>
    <p>Farm-level data is under <strong>Farm-Level Data</strong> in the dashboard.</p>
    <h3>Farmer profiles</h3>
    <p>Each farmer has a profile: contact, location, default collection center, payment method, and other details. This is used when recording collections and payments.</p>
    <h3>Season plans</h3>
    <p>Season plans link a farmer to a commodity and season (e.g. A, B, C). You can record expected harvest volume and dates. This helps plan collection and track actual vs expected.</p>
  `,
  "Input Usage and the Catalog": `
    <h2>Input Usage and the Catalog</h2>
    <p>The system has an <strong>inputs catalog</strong> per commodity (e.g. feed, fertilizer, seed).</p>
    <h3>Catalog</h3>
    <p>Admins define inputs in Commodity Studio. Each input has a name, category, unit, and optional price reference.</p>
    <h3>Usage</h3>
    <p>When farmers use inputs (e.g. for a season plan), you can log usage: quantity, date, cost. This is recorded in Farm-Level Data and helps with traceability and planning.</p>
  `,
  "Agents and Farmer Assignments": `
    <h2>Agents and Farmer Assignments</h2>
    <p>Farmers can be assigned to agents. The agent then records collections and advances for those farmers.</p>
    <h3>In the system</h3>
    <ul>
      <li>Assignments are managed in Farm-Level Data (e.g. Agents tab)</li>
      <li>Each assignment links one farmer to one agent; you can set notes and active/inactive</li>
      <li>When recording a collection, you can choose the agent; the system may suggest based on assignment</li>
    </ul>
    <p>This keeps responsibility clear and supports advance settlement per agent.</p>
  `,
  "How to Use This Training Section": `
    <h2>How to Use This Training Section</h2>
    <p>This training portal is part of HarvestPlus. Use it to learn how the system works without touching live data.</p>
    <h3>What you can do</h3>
    <ul>
      <li><strong>Browse modules</strong> — From the Training dashboard or “All modules”</li>
      <li><strong>Open a module</strong> — Click a module to see its lessons</li>
      <li><strong>Complete lessons</strong> — Read or watch each lesson; use “Mark as complete” when signed in</li>
      <li><strong>Library</strong> — View public modules without signing in</li>
    </ul>
    <p>If you are signed in, your progress is saved and you can earn certifications when you finish a full module.</p>
  `,
  "Progress and Certifications": `
    <h2>Progress and Certifications</h2>
    <p>When you are logged in, the system tracks which lessons you have completed.</p>
    <h3>Progress</h3>
    <ul>
      <li>Each lesson has a “Mark as complete” button. Use it when you have finished the lesson</li>
      <li>The module page shows how many lessons you have completed (e.g. 2/5)</li>
      <li>Progress is saved so you can continue later</li>
    </ul>
    <h3>Certifications</h3>
    <p>When you complete <strong>all</strong> lessons in a module, you earn a certificate. View it under <strong>Certifications</strong>. Certificate numbers follow the format GEMURA-CERT-YYYY-NNNNN and are permanent.</p>
  `,
}

const HTML_TEMPLATE = (body: string, title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; padding: 1.5rem; max-width: 48rem; margin: 0 auto; color: #334155; }
    h2 { color: #0f172a; margin-top: 1.5rem; }
    h3 { color: #1e293b; margin-top: 1rem; }
    ul { padding-left: 1.5rem; }
    iframe { max-width: 100%; border-radius: 8px; margin-top: 0.5rem; }
  </style>
</head>
<body>${body}</body>
</html>
`

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lesson = await prisma.trainingLesson.findUnique({
      where: { id },
      select: { title: true },
    })
    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 })
    }
    const body = LESSON_CONTENT[lesson.title] ?? `<p>Content for "${escapeHtml(lesson.title)}" is being prepared.</p>`
    const html = HTML_TEMPLATE(body, lesson.title)
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  } catch (e) {
    console.error("Lesson content error:", e)
    return new NextResponse("Error loading content", { status: 500 })
  }
}