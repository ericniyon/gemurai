/**
 * Seed agricultural commodity categories and commodities.
 * Loads from scripts/commodity-categories.json when present (your format: name, unit_type, is_perishable, storage_type).
 * Run: npm run seed-commodities
 */
import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { prisma } from "@/lib/prisma"
import type { CommodityPricingMethod } from "@prisma/client"

const SEED_JSON_PATH = join(process.cwd(), "scripts", "commodity-categories.json")

type JsonCommodity = { name: string; unit_type: string; is_perishable: boolean; storage_type: string }
type JsonCategory = { name: string; description?: string; commodities: JsonCommodity[] }
type JsonSeed = { categories: JsonCategory[] }

function nameToCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "") || name.toUpperCase().replace(/\s/g, "_")
}

/** Map storage_type from JSON to DB (e.g. "lot" -> "warehouse"). */
function mapStorageType(s: string): string {
  const v = (s || "warehouse").toLowerCase()
  if (["tank", "bags", "silo", "warehouse", "cold_storage"].includes(v)) return v
  if (v === "lot") return "warehouse"
  return "warehouse"
}

/** Defaults for fields not in JSON: pricing and collection. */
function defaultsForCommodity(name: string, categoryName: string) {
  const n = name.toLowerCase()
  const isCoffee = n.includes("coffee")
  const isTea = n === "tea"
  return {
    pricingMethod: (isCoffee || isTea ? "GRADE_BASED" : "SPOT") as CommodityPricingMethod,
    defaultCollectionCenterType: isCoffee ? "coffee_washing_station" : "warehouse",
    defaultCollectionFrequency: isTea ? "daily" : "seasonal",
  }
}

async function main() {
  console.log("🌱 Seeding commodity categories and commodities...\n")

  if (!existsSync(SEED_JSON_PATH)) {
    console.error(`❌ Seed file not found: ${SEED_JSON_PATH}`)
    console.log("   Create scripts/commodity-categories.json with { \"categories\": [ { \"name\", \"description\", \"commodities\": [ { \"name\", \"unit_type\", \"is_perishable\", \"storage_type\" } ] } ] }")
    process.exit(1)
  }

  const raw = readFileSync(SEED_JSON_PATH, "utf-8")
  const seed: JsonSeed = JSON.parse(raw)
  if (!seed.categories?.length) {
    console.error("❌ No categories in JSON.")
    process.exit(1)
  }

  const categoryIds = new Map<string, string>()

  for (const cat of seed.categories) {
    const defaultStorage =
      cat.commodities?.[0]?.storage_type != null
        ? mapStorageType(cat.commodities[0].storage_type)
        : "warehouse"
    const created = await prisma.commodity_categories.upsert({
      where: { name: cat.name },
      update: {
        description: cat.description ?? undefined,
        defaultStorageType: defaultStorage,
      },
      create: {
        name: cat.name,
        description: cat.description ?? null,
        defaultStorageType: defaultStorage,
        status: "active",
      },
    })
    categoryIds.set(cat.name, created.id)
    console.log(`  Category: ${cat.name}`)
  }

  console.log(`\n✅ ${seed.categories.length} categories ready.\n`)
  console.log("📦 Seeding commodities...\n")

  let created = 0
  let updated = 0

  for (const cat of seed.categories) {
    const categoryId = categoryIds.get(cat.name)
    if (!categoryId || !cat.commodities?.length) continue

    for (const c of cat.commodities) {
      if (!c.name?.trim()) continue
      const code = nameToCode(c.name)
      const def = defaultsForCommodity(c.name, cat.name)
      const storageType = mapStorageType(c.storage_type)

      const data = {
        name: c.name.trim(),
        categoryId,
        unitOfMeasure: (c.unit_type || "kg").toLowerCase(),
        pricingMethod: def.pricingMethod,
        storageType,
        isPerishable: !!c.is_perishable,
        defaultCollectionCenterType: def.defaultCollectionCenterType,
        defaultCollectionFrequency: def.defaultCollectionFrequency,
        isActive: true,
      }

      const existing = await prisma.commodities.findUnique({ where: { code } })
      if (existing) {
        await prisma.commodities.update({ where: { code }, data })
        updated++
        console.log(`  Updated: ${c.name} (${code})`)
      } else {
        await prisma.commodities.create({ data: { ...data, code } })
        created++
        console.log(`  Created: ${c.name} (${code})`)
      }
    }
  }

  const total = seed.categories.reduce((acc, c) => acc + (c.commodities?.length ?? 0), 0)
  console.log(`\n✅ Commodities: ${created} created, ${updated} updated (${total} from JSON).`)
  console.log("\n🎉 Commodity seeding completed.")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
