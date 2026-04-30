import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/token"
import { Digital_INPUTS } from "@/lib/data/dairy-products"
import { COMMON_FERTILIZERS, FERTILIZER_CATEGORIES } from "@/lib/data/fertilizers"
import { APPROVED_PESTICIDES, PESTICIDE_CATEGORIES, WHO_HAZARD_CLASSES } from "@/lib/data/pesticides"

interface SeedResult {
  category: string
  itemsCreated: number
  itemsSkipped: number
  errors: string[]
}

async function seedDigitalInputs(commodityId: string): Promise<SeedResult> {
  const result: SeedResult = {
    category: "Digital",
    itemsCreated: 0,
    itemsSkipped: 0,
    errors: [],
  }

  for (const category of Digital_INPUTS) {
    for (const item of category.items) {
      try {
        const existing = await prisma.input_catalog.findFirst({
          where: {
            commodityId,
            name: item.name,
            category: category.code,
          },
        })

        if (existing) {
          result.itemsSkipped++
          continue
        }

        await prisma.input_catalog.create({
          data: {
            commodityId,
            name: item.name,
            category: category.code,
            unit: item.unit,
            description: item.description || `${category.name}: ${item.name}`,
            isActive: true,
          },
        })
        result.itemsCreated++
      } catch (error) {
        result.errors.push(`Failed to create ${item.name}: ${error}`)
      }
    }
  }

  return result
}

async function seedFertilizers(commodityId: string): Promise<SeedResult> {
  const result: SeedResult = {
    category: "fertilizers",
    itemsCreated: 0,
    itemsSkipped: 0,
    errors: [],
  }

  for (const fertilizer of COMMON_FERTILIZERS) {
    try {
      const existing = await prisma.input_catalog.findFirst({
        where: {
          commodityId,
          name: fertilizer.name,
          category: "fertilizer",
        },
      })

      if (existing) {
        result.itemsSkipped++
        continue
      }

      const categoryInfo = FERTILIZER_CATEGORIES.find(c => c.code === fertilizer.category)
      const description = [
        fertilizer.description,
        `NPK: ${fertilizer.npk}`,
        `Application Rate: ${fertilizer.applicationRate}`,
        `Timing: ${fertilizer.timing}`,
        fertilizer.subsidized ? "RAB Subsidized" : null,
      ].filter(Boolean).join(". ")

      await prisma.input_catalog.create({
        data: {
          commodityId,
          name: fertilizer.name,
          category: "fertilizer",
          unit: fertilizer.unit,
          description,
          isActive: true,
        },
      })
      result.itemsCreated++
    } catch (error) {
      result.errors.push(`Failed to create ${fertilizer.name}: ${error}`)
    }
  }

  return result
}

async function seedPesticides(commodityId: string): Promise<SeedResult> {
  const result: SeedResult = {
    category: "pesticides",
    itemsCreated: 0,
    itemsSkipped: 0,
    errors: [],
  }

  for (const pesticide of APPROVED_PESTICIDES) {
    if (pesticide.registrationStatus === "banned") continue

    try {
      const existing = await prisma.input_catalog.findFirst({
        where: {
          commodityId,
          name: pesticide.name,
          category: "pesticide",
        },
      })

      if (existing) {
        result.itemsSkipped++
        continue
      }

      const categoryInfo = PESTICIDE_CATEGORIES.find(c => c.code === pesticide.category)
      const hazardInfo = WHO_HAZARD_CLASSES.find(h => h.class === pesticide.hazardClass)
      
      const description = [
        `${categoryInfo?.name || pesticide.category} - ${pesticide.activeIngredient}`,
        `WHO Hazard Class: ${hazardInfo?.label || pesticide.hazardClass}`,
        `Formulation: ${pesticide.formulation}`,
        `PHI: ${pesticide.phi} days`,
        `REI: ${pesticide.rei} hours`,
        `Suitable crops: ${pesticide.suitableCrops.slice(0, 3).join(", ")}`,
        pesticide.registrationStatus === "restricted" ? "RESTRICTED USE" : null,
      ].filter(Boolean).join(". ")

      await prisma.input_catalog.create({
        data: {
          commodityId,
          name: pesticide.name,
          category: "pesticide",
          unit: "units",
          description,
          isActive: pesticide.registrationStatus === "registered",
        },
      })
      result.itemsCreated++
    } catch (error) {
      result.errors.push(`Failed to create ${pesticide.name}: ${error}`)
    }
  }

  return result
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization required" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]
    const decoded = await verifyAuthToken(token)
    
    if (!decoded || !["ADMIN", "SUPER_ADMIN"].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { commodityId, categories } = body

    if (!commodityId) {
      return NextResponse.json(
        { success: false, error: "commodityId is required" },
        { status: 400 }
      )
    }

    const commodity = await prisma.commodities.findUnique({
      where: { id: commodityId },
      include: { category: true },
    })

    if (!commodity) {
      return NextResponse.json(
        { success: false, error: "Commodity not found" },
        { status: 404 }
      )
    }

    const results: SeedResult[] = []
    const categoriesToSeed = categories || ["Digital", "fertilizers", "pesticides"]

    if (categoriesToSeed.includes("Digital")) {
      const DigitalResult = await seedDigitalInputs(commodityId)
      results.push(DigitalResult)
    }

    if (categoriesToSeed.includes("fertilizers")) {
      const fertilizerResult = await seedFertilizers(commodityId)
      results.push(fertilizerResult)
    }

    if (categoriesToSeed.includes("pesticides")) {
      const pesticideResult = await seedPesticides(commodityId)
      results.push(pesticideResult)
    }

    const totalCreated = results.reduce((sum, r) => sum + r.itemsCreated, 0)
    const totalSkipped = results.reduce((sum, r) => sum + r.itemsSkipped, 0)
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)

    return NextResponse.json({
      success: true,
      message: `Seeded ${totalCreated} items for commodity "${commodity.name}"`,
      data: {
        commodityId,
        commodityName: commodity.name,
        categoryName: commodity.category?.name,
        results,
        summary: {
          totalCreated,
          totalSkipped,
          totalErrors,
        },
      },
    })
  } catch (error) {
    console.error("Seed lookup data error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to seed lookup data" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization required" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]
    const decoded = await verifyAuthToken(token)
    
    if (!decoded || !["ADMIN", "SUPER_ADMIN"].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      )
    }

    const DigitalCount = Digital_INPUTS.reduce((sum, cat) => sum + cat.items.length, 0)
    const fertilizerCount = COMMON_FERTILIZERS.length
    const pesticideCount = APPROVED_PESTICIDES.filter(p => p.registrationStatus !== "banned").length

    return NextResponse.json({
      success: true,
      data: {
        availableLookupData: {
          Digital: {
            categories: Digital_INPUTS.map(cat => ({
              code: cat.code,
              name: cat.name,
              itemCount: cat.items.length,
            })),
            totalItems: DigitalCount,
          },
          fertilizers: {
            categories: FERTILIZER_CATEGORIES.map(cat => ({
              code: cat.code,
              name: cat.name,
              itemCount: COMMON_FERTILIZERS.filter(f => f.category === cat.code).length,
            })),
            totalItems: fertilizerCount,
          },
          pesticides: {
            categories: PESTICIDE_CATEGORIES.map(cat => ({
              code: cat.code,
              name: cat.name,
              itemCount: APPROVED_PESTICIDES.filter(p => p.category === cat.code && p.registrationStatus !== "banned").length,
            })),
            hazardClasses: WHO_HAZARD_CLASSES.map(h => ({
              class: h.class,
              label: h.label,
              color: h.color,
            })),
            totalItems: pesticideCount,
          },
        },
        totalAvailable: DigitalCount + fertilizerCount + pesticideCount,
      },
    })
  } catch (error) {
    console.error("Get lookup data info error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to get lookup data info" },
      { status: 500 }
    )
  }
}
