import { prisma } from "@/lib/prisma"

export interface SeasonPlanInput {
  farmerId: string
  commodityId: string
  season: string
  plotHerdReference?: string
  expectedHarvestVolume: number
  expectedHarvestStartDate: Date
  expectedHarvestEndDate: Date
  collectionFrequency?: string
  region?: string
  notes?: string
}

export interface SeasonTemplateInput {
  commodityId: string
  season: string
  expectedHarvestStartDate: Date
  expectedHarvestEndDate: Date
  collectionFrequency?: string
  region?: string
  notes?: string
}

export interface InputUsageInput {
  seasonPlanId: string
  inputCatalogId: string
  farmerId: string
  quantity: number
  unit: string
  cost?: number
  notes?: string
}

export class SeasonPlanService {
  /**
   * Create season plan
   */
  static async createSeasonPlan(data: SeasonPlanInput) {
    return await prisma.season_plans.create({
      data: {
        farmerId: data.farmerId,
        commodityId: data.commodityId,
        season: data.season,
        plotHerdReference: data.plotHerdReference,
        expectedHarvestVolume: data.expectedHarvestVolume,
        expectedHarvestStartDate: data.expectedHarvestStartDate,
        expectedHarvestEndDate: data.expectedHarvestEndDate,
        collectionFrequency: data.collectionFrequency,
        region: data.region,
        notes: data.notes,
        status: "PLANNED",
      },
      include: {
        commodity: true,
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    })
  }

  /**
   * Get season plans for farmer
   */
  static async getFarmerSeasonPlans(farmerId: string, filters?: {
    commodityId?: string
    season?: string
    status?: string
    region?: string
  }) {
    const where: any = { farmerId }
    if (filters?.commodityId) where.commodityId = filters.commodityId
    if (filters?.season) where.season = filters.season
    if (filters?.status) where.status = filters.status
    if (filters?.region) where.region = filters.region

    return await prisma.season_plans.findMany({
      where,
      include: {
        commodity: true,
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        inputUsage: {
          include: {
            inputCatalog: true,
          },
        },
      },
      orderBy: { expectedHarvestStartDate: "desc" },
    })
  }

  /**
   * Get all season plans for an MCC (when farmerId is not provided)
   */
  static async getAllSeasonPlansForMcc(mccId: string, filters?: {
    commodityId?: string
    season?: string
    status?: string
    region?: string
  }) {
    const where: any = {
      farmer: { mccId },
    }
    if (filters?.commodityId) where.commodityId = filters.commodityId
    if (filters?.season) where.season = filters.season
    if (filters?.status) where.status = filters.status
    if (filters?.region) where.region = filters.region

    return await prisma.season_plans.findMany({
      where,
      include: {
        commodity: true,
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        inputUsage: {
          include: {
            inputCatalog: true,
          },
        },
      },
      orderBy: { expectedHarvestStartDate: "desc" },
    })
  }

  /**
   * Create season template (admin-level, no farmer required)
   */
  static async createSeasonTemplate(data: SeasonTemplateInput) {
    // season_plans requires farmerId; we use a system template farmer (farmerCode SYSTEM_TEMPLATE)
    // farmers table requires mccId and location, so we attach to the first MCC
    let templateFarmer = await prisma.farmers.findFirst({
      where: { farmerCode: "SYSTEM_TEMPLATE" },
    })

    if (!templateFarmer) {
      const firstMcc = await prisma.mccs.findFirst({
        select: { id: true },
      })
      if (!firstMcc) {
        throw new Error(
          "Cannot create season template: no MCC exists. Create at least one MCC first."
        )
      }
      templateFarmer = await prisma.farmers.create({
        data: {
          name: "System Template",
          farmerCode: "SYSTEM_TEMPLATE",
          phone: "0000000000",
          mccId: firstMcc.id,
          location: "System (template only)",
        },
      })
    }

    return await prisma.season_plans.create({
      data: {
        farmerId: templateFarmer.id,
        commodityId: data.commodityId,
        season: data.season,
        expectedHarvestVolume: 0, // Template doesn't need volume
        expectedHarvestStartDate: data.expectedHarvestStartDate,
        expectedHarvestEndDate: data.expectedHarvestEndDate,
        collectionFrequency: data.collectionFrequency,
        region: data.region,
        notes: data.notes,
        status: "PLANNED",
      },
      include: {
        commodity: true,
      },
    })
  }

  /**
   * Get season templates for commodity (admin templates)
   */
  static async getSeasonTemplates(commodityId: string, filters?: {
    season?: string
    region?: string
  }) {
    // Get template farmer
    const templateFarmer = await prisma.farmers.findFirst({
      where: { farmerCode: "SYSTEM_TEMPLATE" },
    })

    if (!templateFarmer) {
      return []
    }

    const where: any = {
      farmerId: templateFarmer.id,
      commodityId,
    }
    if (filters?.season) where.season = filters.season
    if (filters?.region) where.region = filters.region

    return await prisma.season_plans.findMany({
      where,
      include: {
        commodity: true,
      },
      orderBy: { expectedHarvestStartDate: "asc" },
    })
  }

  /**
   * Log input usage
   */
  static async logInputUsage(data: InputUsageInput) {
    return await prisma.input_usage_logs.create({
      data: {
        seasonPlanId: data.seasonPlanId,
        inputCatalogId: data.inputCatalogId,
        farmerId: data.farmerId,
        quantity: data.quantity,
        unit: data.unit,
        cost: data.cost,
        notes: data.notes,
        usageDate: new Date(),
      },
      include: {
        inputCatalog: true,
        seasonPlan: {
          include: {
            commodity: true,
          },
        },
      },
    })
  }

  /**
   * Get input catalog for commodity
   */
  static async getInputCatalog(commodityId: string, activeOnly: boolean = true) {
    return await prisma.input_catalog.findMany({
      where: {
        commodityId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: { name: "asc" },
    })
  }

  /**
   * Create input catalog item
   */
  static async createInputCatalogItem(data: {
    commodityId: string
    name: string
    category: string
    unit: string
    pricingReference?: number
    description?: string
  }) {
    return await prisma.input_catalog.create({
      data: {
        commodityId: data.commodityId,
        name: data.name,
        category: data.category,
        unit: data.unit,
        pricingReference: data.pricingReference,
        description: data.description,
        isActive: true,
      },
    })
  }

  /**
   * Update season plan with actual harvest
   */
  static async updateActualHarvest(
    seasonPlanId: string,
    actualHarvestVolume: number
  ) {
    return await prisma.season_plans.update({
      where: { id: seasonPlanId },
      data: {
        actualHarvestVolume,
        status: "COMPLETED",
      },
    })
  }
}
