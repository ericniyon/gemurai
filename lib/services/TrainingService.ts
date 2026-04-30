/**
 * TrainingService – standalone learning portal logic.
 * Used by /api/trainings/*. Does not depend on collections, payments, or inventory.
 */
import { prisma } from "@/lib/prisma"

export type TrainingTargetRole = "Farmer" | "Agent" | "QualityOfficer" | "WarehouseOfficer"
export type TrainingDifficultyLevel = "Beginner" | "Intermediate" | "Advanced"
export type LessonContentType = "video" | "pdf" | "text" | "image"

// Map platform UserRole to training target roles for recommendations
const ROLE_TO_TRAINING_ROLE: Record<string, TrainingTargetRole> = {
  FARMER: "Farmer",
  AGENT: "Agent",
  MCC_MANAGER: "Agent", // can see agent-level training
  COOP_ADMIN: "Agent",
  QUALITY_OFFICER: "QualityOfficer",
  WAREHOUSE_OFFICER: "WarehouseOfficer",
  ADMIN: "Agent",
  SUPER_ADMIN: "Agent",
}

export class TrainingService {
  /**
   * List active modules with optional filters. Supports public (unauthenticated) access for isPublic modules.
   */
  static async getModules(options: {
    role?: TrainingTargetRole
    commodityId?: string
    publicOnly?: boolean
  } = {}) {
    const where: any = { isActive: true }
    if (options.publicOnly) where.isPublic = true
    if (options.role) where.targetRole = options.role
    if (options.commodityId) where.commodityId = options.commodityId

    return prisma.trainingModule.findMany({
      where,
      include: {
        commodity: { select: { id: true, name: true, code: true } },
        _count: { select: { lessons: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Get a single module by id. For public library, only return if isPublic.
   */
  static async getModuleById(id: string, publicOnly = false) {
    const where: any = { id, isActive: true }
    if (publicOnly) where.isPublic = true

    return prisma.trainingModule.findFirst({
      where,
      include: {
        commodity: { select: { id: true, name: true, code: true } },
        lessons: { orderBy: { orderIndex: "asc" } },
        _count: { select: { lessons: true } },
      },
    })
  }

  /**
   * Get lessons for a module (ordered by orderIndex).
   */
  static async getLessons(moduleId: string, publicOnly = false) {
    const module = await prisma.trainingModule.findFirst({
      where: { id: moduleId, isActive: true, ...(publicOnly ? { isPublic: true } : {}) },
    })
    if (!module) return null
    return prisma.trainingLesson.findMany({
      where: { moduleId },
      orderBy: { orderIndex: "asc" },
    })
  }

  /**
   * Recommended modules for the current user: by role and commodity access.
   * Excludes modules the user has already completed (100%).
   */
  static async getRecommended(userId: string, userRole: string, commodityIds: string[]) {
    const trainingRole = ROLE_TO_TRAINING_ROLE[userRole] || "Farmer"
    const completedModuleIds = await this.getCompletedModuleIds(userId)

    const where: any = {
      isActive: true,
      id: { notIn: completedModuleIds },
      OR: [
        { targetRole: trainingRole },
        ...(commodityIds.length ? commodityIds.map((c) => ({ commodityId: c })) : []),
      ],
    }
    if (where.OR.length === 1) delete where.OR

    const modules = await prisma.trainingModule.findMany({
      where,
      include: {
        commodity: { select: { id: true, name: true, code: true } },
        _count: { select: { lessons: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })
    return modules
  }

  /**
   * Continue learning: modules the user has started but not completed.
   */
  static async getInProgress(userId: string) {
    const started = await prisma.userTrainingProgress.groupBy({
      by: ["moduleId"],
      where: { userId },
    })
    const moduleIds = started.map((s) => s.moduleId)
    if (moduleIds.length === 0) return []

    const modules = await prisma.trainingModule.findMany({
      where: { id: { in: moduleIds }, isActive: true },
      include: {
        commodity: { select: { id: true, name: true, code: true } },
        _count: { select: { lessons: true } },
        progress: { where: { userId }, select: { lessonId: true } },
      },
    })

    return modules.map((m) => {
      const completedCount = m.progress.length
      const total = m._count.lessons
      const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0
      return {
        ...m,
        progressPercent,
        completedLessons: completedCount,
        totalLessons: total,
      }
    })
  }

  /**
   * Completed training: modules where the user has completed all lessons.
   */
  static async getCompleted(userId: string) {
    const completedModuleIds = await this.getCompletedModuleIds(userId)
    if (completedModuleIds.length === 0) return []

    return prisma.trainingModule.findMany({
      where: { id: { in: completedModuleIds }, isActive: true },
      include: {
        commodity: { select: { id: true, name: true, code: true } },
        _count: { select: { lessons: true } },
      },
      orderBy: { updatedAt: "desc" },
    })
  }

  static async getCompletedModuleIds(userId: string): Promise<string[]> {
    const [progressCounts, moduleLessons] = await Promise.all([
      prisma.userTrainingProgress.groupBy({
        by: ["moduleId"],
        where: { userId },
        _count: { lessonId: true },
      }),
      prisma.trainingModule.findMany({
        where: { isActive: true },
        select: { id: true, _count: { select: { lessons: true } } },
      }),
    ])
    const totalByModule = Object.fromEntries(moduleLessons.map((m) => [m.id, m._count.lessons]))
    return progressCounts
      .filter((p) => (totalByModule[p.moduleId] ?? 0) > 0 && p._count.lessonId >= (totalByModule[p.moduleId] ?? 0))
      .map((p) => p.moduleId)
  }

  /**
   * Enroll: no-op for now (we track progress per lesson). Can be used to record "started at" later.
   */
  static async enroll(userId: string, moduleId: string) {
    const module = await prisma.trainingModule.findFirst({
      where: { id: moduleId, isActive: true },
    })
    if (!module) return null
    return { moduleId, userId, enrolled: true }
  }

  /**
   * Record lesson completion. Idempotent (same user/module/lesson can be recorded again).
   */
  static async recordProgress(userId: string, moduleId: string, lessonId: string) {
    const [module, lesson] = await Promise.all([
      prisma.trainingModule.findFirst({ where: { id: moduleId, isActive: true } }),
      prisma.trainingLesson.findFirst({ where: { id: lessonId, moduleId } }),
    ])
    if (!module || !lesson) return null

    await prisma.userTrainingProgress.upsert({
      where: {
        userId_moduleId_lessonId: { userId, moduleId, lessonId },
      },
      create: { userId, moduleId, lessonId },
      update: {},
    })

    const totalLessons = await prisma.trainingLesson.count({ where: { moduleId } })
    const completedCount = await prisma.userTrainingProgress.count({
      where: { userId, moduleId },
    })
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
    return { progressPercent, completedLessons: completedCount, totalLessons }
  }

  /**
   * Get progress for a user in a module (completed lesson ids and percentage).
   */
  static async getProgress(userId: string, moduleId: string) {
    const [module, completed] = await Promise.all([
      prisma.trainingModule.findFirst({
        where: { id: moduleId, isActive: true },
        include: { _count: { select: { lessons: true } } },
      }),
      prisma.userTrainingProgress.findMany({
        where: { userId, moduleId },
        select: { lessonId: true },
      }),
    ])
    if (!module) return null
    const total = module._count.lessons
    const completedIds = completed.map((c) => c.lessonId)
    const progressPercent = total > 0 ? Math.round((completedIds.length / total) * 100) : 0
    return { progressPercent, completedLessonIds: completedIds, totalLessons: total }
  }

  /**
   * List certifications for a user.
   */
  static async getCertifications(userId: string) {
    return prisma.userCertification.findMany({
      where: { userId },
      include: {
        module: {
          select: { id: true, title: true, durationMinutes: true, difficultyLevel: true },
        },
      },
      orderBy: { certificationDate: "desc" },
    })
  }

  /**
   * Issue certification when user completes all lessons. Certifications are immutable.
   * Certificate number format: GEMURA-CERT-YYYY-NNNNN
   */
  static async issueCertificationIfEligible(userId: string, moduleId: string) {
    const completedIds = await this.getCompletedModuleIds(userId)
    if (!completedIds.includes(moduleId)) return null

    const existing = await prisma.userCertification.findFirst({
      where: { userId, moduleId },
    })
    if (existing) return existing

    const year = new Date().getFullYear()
    const count = await prisma.userCertification.count({
      where: { certificateNumber: { startsWith: `GEMURA-CERT-${year}-` } },
    })
    const certificateNumber = `GEMURA-CERT-${year}-${String(count + 1).padStart(5, "0")}`

    return prisma.userCertification.create({
      data: {
        userId,
        moduleId,
        certificateNumber,
      },
      include: {
        module: { select: { id: true, title: true } },
      },
    })
  }
}
