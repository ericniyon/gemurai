/**
 * Seed training modules focused on how the HarvestPlus system works.
 * Run: npx tsx scripts/seed-training-modules.ts
 * Use scripts/reset-and-seed-training.ts to replace existing modules with system-focused content.
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const SYSTEM_MODULES = [
  {
    title: "How HarvestPlus Works",
    description: "Understand the platform: roles, dashboard, and how everything connects.",
    targetRole: "Farmer" as const,
    durationMinutes: 25,
    difficultyLevel: "Beginner" as const,
    isPublic: true,
    lessons: [
      { title: "Introduction to HarvestPlus by YDEN", contentType: "text" as const, orderIndex: 0, durationMinutes: 5 },
      { title: "Roles in the System", contentType: "text" as const, orderIndex: 1, durationMinutes: 10 },
      { title: "Dashboard Overview", contentType: "text" as const, orderIndex: 2, durationMinutes: 10 },
    ],
  },
  {
    title: "Collections in the System",
    description: "How to record commodity, milk, and crop collections and understand the approval flow.",
    targetRole: "Agent" as const,
    durationMinutes: 30,
    difficultyLevel: "Beginner" as const,
    isPublic: true,
    lessons: [
      { title: "Recording a Collection", contentType: "text" as const, orderIndex: 0, durationMinutes: 12 },
      { title: "Quality Data at Collection", contentType: "text" as const, orderIndex: 1, durationMinutes: 10 },
      { title: "Status and Approval Flow", contentType: "text" as const, orderIndex: 2, durationMinutes: 8 },
    ],
  },
  {
    title: "Payments and Advances",
    description: "How farmer payments, agent advances, and reconciliation work in the system.",
    targetRole: "Agent" as const,
    durationMinutes: 25,
    difficultyLevel: "Intermediate" as const,
    isPublic: true,
    lessons: [
      { title: "Farmer Payments", contentType: "text" as const, orderIndex: 0, durationMinutes: 10 },
      { title: "Agent Advances and Settlement", contentType: "text" as const, orderIndex: 1, durationMinutes: 8 },
      { title: "Reconciliation Basics", contentType: "text" as const, orderIndex: 2, durationMinutes: 7 },
    ],
  },
  {
    title: "Farm-Level Data",
    description: "Farmer profiles, season plans, input usage, and agent assignments.",
    targetRole: "Agent" as const,
    durationMinutes: 25,
    difficultyLevel: "Beginner" as const,
    isPublic: true,
    lessons: [
      { title: "Farmer Profiles and Season Plans", contentType: "text" as const, orderIndex: 0, durationMinutes: 10 },
      { title: "Input Usage and the Catalog", contentType: "text" as const, orderIndex: 1, durationMinutes: 8 },
      { title: "Agents and Farmer Assignments", contentType: "text" as const, orderIndex: 2, durationMinutes: 7 },
    ],
  },
  {
    title: "Using the Training Portal",
    description: "How to use this training section, track progress, and earn certifications.",
    targetRole: "Farmer" as const,
    durationMinutes: 10,
    difficultyLevel: "Beginner" as const,
    isPublic: true,
    lessons: [
      { title: "How to Use This Training Section", contentType: "text" as const, orderIndex: 0, durationMinutes: 5 },
      { title: "Progress and Certifications", contentType: "text" as const, orderIndex: 1, durationMinutes: 5 },
    ],
  },
]

async function main() {
  const existing = await prisma.trainingModule.count()
  if (existing > 0) {
    console.log("Training modules already exist. Skipping seed.")
    console.log("To replace with system-focused modules, run: npx tsx scripts/reset-and-seed-training.ts")
    return
  }

  for (const mod of SYSTEM_MODULES) {
    const { lessons, ...moduleData } = mod
    const created = await prisma.trainingModule.create({
      data: {
        ...moduleData,
        lessons: {
          create: lessons.map((l) => ({
            title: l.title,
            contentType: l.contentType,
            orderIndex: l.orderIndex,
            durationMinutes: l.durationMinutes,
          })),
        },
      },
    })
    console.log("Created module:", created.title, "with", lessons.length, "lessons")
  }

  console.log("Training seed complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())