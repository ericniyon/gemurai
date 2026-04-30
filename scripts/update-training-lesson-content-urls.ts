/**
 * Set contentUrl for all training lessons to the API content route.
 * Run once: npx tsx scripts/update-training-lesson-content-urls.ts
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const lessons = await prisma.trainingLesson.findMany({ select: { id: true, title: true } })
  for (const lesson of lessons) {
    await prisma.trainingLesson.update({
      where: { id: lesson.id },
      data: {
        contentUrl: `/api/trainings/lessons/${lesson.id}/content`,
      },
    })
    console.log("Updated:", lesson.title)
  }
  console.log("Done. Updated", lessons.length, "lessons.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
