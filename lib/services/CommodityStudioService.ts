import { prisma } from "@/lib/prisma"

export interface CommodityCategoryInput {
  name: string
  description?: string
  defaultStorageType?: string
  status?: string
}

export interface CommodityInput {
  name: string
  code: string
  categoryId: string
  unitOfMeasure: string
  pricingMethod: "SPOT" | "GRADE_BASED" | "DEFERRED" | "POST_SALE"
  storageType: string
  isPerishable?: boolean
  defaultCollectionCenterType?: string
  defaultCollectionFrequency?: string
  metadata?: Record<string, any>
}

export interface QualityFieldInput {
  commodityId: string
  fieldName: string
  fieldType: "NUMERIC" | "DROPDOWN" | "BOOLEAN" | "INDICATOR" | "TEXT"
  dataType: "PERCENTAGE" | "DECIMAL" | "INTEGER" | "STRING" | "BOOLEAN"
  options?: string[] // For dropdown
  isMandatory?: boolean
  displayOrder?: number
  description?: string
}

export interface QualityRuleInput {
  commodityId: string
  qualityFieldId?: string
  ruleName: string
  ruleType: "PASS" | "FAIL" | "CONDITIONAL" | "WARNING"
  thresholdValue?: number
  thresholdOperator?: string
  impactOnPricing?: boolean
  pricingMultiplier?: number
  errorMessage?: string
}

export class CommodityStudioService {
  /**
   * Create commodity category
   */
  static async createCategory(data: CommodityCategoryInput) {
    return await prisma.commodity_categories.create({
      data: {
        name: data.name,
        description: data.description,
        defaultStorageType: data.defaultStorageType,
        status: data.status || "active",
      },
    })
  }

  /**
   * Get all categories
   */
  static async getCategories(activeOnly: boolean = false) {
    return await prisma.commodity_categories.findMany({
      where: activeOnly ? { status: "active" } : {},
      include: {
        commodities: {
          where: { isActive: true },
        },
      },
      orderBy: { name: "asc" },
    })
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(id: string) {
    return await prisma.commodity_categories.findUnique({
      where: { id },
      include: {
        commodities: {
          where: { isActive: true },
        },
      },
    })
  }

  /**
   * Update commodity category
   */
  static async updateCategory(id: string, data: Partial<CommodityCategoryInput>) {
    return await prisma.commodity_categories.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.defaultStorageType !== undefined && { defaultStorageType: data.defaultStorageType }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: {
        commodities: {
          where: { isActive: true },
        },
      },
    })
  }

  /**
   * Delete commodity category
   */
  static async deleteCategory(id: string) {
    // Check if category has commodities
    const category = await prisma.commodity_categories.findUnique({
      where: { id },
      include: {
        commodities: true,
      },
    })

    if (!category) {
      throw new Error("Category not found")
    }

    if (category.commodities.length > 0) {
      throw new Error("Cannot delete category with existing commodities")
    }

    return await prisma.commodity_categories.delete({
      where: { id },
    })
  }

  /**
   * Create commodity
   */
  static async createCommodity(data: CommodityInput) {
    return await prisma.commodities.create({
      data: {
        name: data.name,
        code: data.code,
        categoryId: data.categoryId,
        unitOfMeasure: data.unitOfMeasure,
        pricingMethod: data.pricingMethod,
        storageType: data.storageType,
        isPerishable: data.isPerishable ?? false,
        defaultCollectionCenterType: data.defaultCollectionCenterType || null,
        defaultCollectionFrequency: data.defaultCollectionFrequency || null,
        metadata: data.metadata && Object.keys(data.metadata).length > 0 ? data.metadata : null,
        isActive: true,
      },
      include: {
        category: true,
        qualityFields: {
          orderBy: { displayOrder: "asc" },
        },
      },
    })
  }

  /**
   * Get all commodities
   */
  static async getCommodities(activeOnly: boolean = true) {
    return await prisma.commodities.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: {
        category: true,
        qualityFields: {
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { name: "asc" },
    })
  }

  /**
   * Get commodity by ID with full details
   */
  static async getCommodityById(id: string) {
    return await prisma.commodities.findUnique({
      where: { id },
      include: {
        category: true,
        qualityFields: {
          orderBy: { displayOrder: "asc" },
        },
        qualityRules: {
          include: {
            qualityField: true,
          },
        },
      },
    })
  }

  /**
   * Update commodity
   */
  static async updateCommodity(id: string, data: Partial<CommodityInput> & { isActive?: boolean }) {
    return await prisma.commodities.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.unitOfMeasure && { unitOfMeasure: data.unitOfMeasure }),
        ...(data.pricingMethod && { pricingMethod: data.pricingMethod }),
        ...(data.storageType && { storageType: data.storageType }),
        ...(data.isPerishable !== undefined && { isPerishable: data.isPerishable }),
        ...(data.defaultCollectionCenterType !== undefined && { defaultCollectionCenterType: data.defaultCollectionCenterType }),
        ...(data.defaultCollectionFrequency !== undefined && { defaultCollectionFrequency: data.defaultCollectionFrequency }),
        ...(data.metadata && { metadata: data.metadata }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        category: true,
        qualityFields: {
          orderBy: { displayOrder: "asc" },
        },
      },
    })
  }

  /**
   * Add quality field to commodity
   */
  static async addQualityField(data: QualityFieldInput) {
    return await prisma.commodity_quality_fields.create({
      data: {
        commodityId: data.commodityId,
        fieldName: data.fieldName,
        fieldType: data.fieldType,
        dataType: data.dataType,
        options: data.options ? (data.options as any) : null,
        isMandatory: data.isMandatory || false,
        displayOrder: data.displayOrder || 0,
        description: data.description,
      },
    })
  }

  /**
   * Add quality rule
   */
  static async addQualityRule(data: QualityRuleInput) {
    return await prisma.commodity_quality_rules.create({
      data: {
        commodityId: data.commodityId,
        qualityFieldId: data.qualityFieldId || null,
        ruleName: data.ruleName,
        ruleType: data.ruleType,
        thresholdValue: data.thresholdValue || null,
        thresholdOperator: data.thresholdOperator || null,
        impactOnPricing: data.impactOnPricing || false,
        pricingMultiplier: data.pricingMultiplier || null,
        errorMessage: data.errorMessage,
        isActive: true,
      },
    })
  }

  /**
   * Validate quality data against commodity rules
   */
  static async validateQuality(
    commodityId: string,
    qualityData: Record<string, any>
  ): Promise<{
    passed: boolean
    rejected: boolean
    qualityStatus: "pending" | "accepted" | "rejected"
    issues: string[]
    qualityScore: number
    pricingMultiplier: number
  }> {
    const commodity = await this.getCommodityById(commodityId)
    if (!commodity) {
      throw new Error("Commodity not found")
    }

    const issues: string[] = []
    let qualityScore = 100
    let pricingMultiplier = 1.0

    // Get all active quality rules
    const rules = commodity.qualityRules.filter((r) => r.isActive)

    for (const rule of rules) {
      if (!rule.qualityFieldId) {
        // General rule (not field-specific)
        continue
      }

      const field = commodity.qualityFields.find((f) => f.id === rule.qualityFieldId)
      if (!field) continue

      const fieldValue = qualityData[field.fieldName]
      if (fieldValue == null && field.isMandatory) {
        issues.push(`Missing mandatory field: ${field.fieldName}`)
        qualityScore -= 20
        continue
      }

      if (fieldValue == null) continue

      // Apply threshold rules
      if (rule.thresholdValue != null && rule.thresholdOperator) {
        const passed = this.evaluateThreshold(
          fieldValue,
          rule.thresholdValue,
          rule.thresholdOperator
        )

        if (!passed) {
          if (rule.ruleType === "FAIL") {
            issues.push(rule.errorMessage || `${field.fieldName} failed quality check`)
            qualityScore -= 30
          } else if (rule.ruleType === "WARNING") {
            issues.push(`Warning: ${field.fieldName} - ${rule.errorMessage || "Out of range"}`)
            qualityScore -= 10
          }
        }

        // Apply pricing impact
        if (rule.impactOnPricing && rule.pricingMultiplier) {
          if (passed && rule.ruleType === "PASS") {
            pricingMultiplier *= rule.pricingMultiplier
          } else if (!passed && rule.ruleType === "FAIL") {
            pricingMultiplier *= (1 / rule.pricingMultiplier)
          }
        }
      }
    }

    const rejected = qualityScore < 50
    const passed = issues.length === 0 && qualityScore >= 80

    return {
      passed,
      rejected,
      qualityStatus: rejected ? "rejected" : passed ? "accepted" : "pending",
      issues,
      qualityScore: Math.max(0, qualityScore),
      pricingMultiplier: Math.max(0.1, Math.min(2.0, pricingMultiplier)),
    }
  }

  /**
   * Evaluate threshold condition
   */
  private static evaluateThreshold(
    value: number,
    threshold: number,
    operator: string
  ): boolean {
    switch (operator) {
      case ">":
        return value > threshold
      case "<":
        return value < threshold
      case ">=":
        return value >= threshold
      case "<=":
        return value <= threshold
      case "==":
        return Math.abs(value - threshold) < 0.001
      case "!=":
        return Math.abs(value - threshold) >= 0.001
      default:
        return true
    }
  }
}
