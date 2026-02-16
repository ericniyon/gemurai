/**
 * Seed Rwanda administrative divisions (Province -> District -> Sector -> Cell -> Village)
 * from rwanda.json (project root) or scripts/rwanda-administratives.json.
 *
 * JSON structure: { ProvinceName: { DistrictName: { SectorName: { CellName: ["Village1", ...] } } } }
 *
 * Run: npm run seed-rwanda-administratives
 * Or:  npx tsx scripts/seed-rwanda-administratives.ts
 *
 * Existing records are upserted by slug, so re-running is safe.
 * Full rwanda.json (5 provinces, all divisions) may take several minutes to complete.
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

type RwandaJson = Record<
  string,
  Record<
    string,
    Record<string, Record<string, string[]>>
  >
>;

const RWANDA_JSON_PATHS = [
  path.join(process.cwd(), "rwanda.json"),
  path.join(process.cwd(), "scripts", "rwanda-administratives.json"),
];

function slug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/['']/g, "")
    .replace(/[^\w\-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "") || "unnamed";
}

function uniqueSlug(base: string, existing: Set<string>): string {
  let s = base;
  let n = 0;
  while (existing.has(s)) {
    n++;
    s = `${base}_${n}`;
  }
  existing.add(s);
  return s;
}

async function main() {
  const jsonPath = RWANDA_JSON_PATHS.find((p) => fs.existsSync(p));
  if (!jsonPath) {
    console.error(
      "Missing Rwanda JSON. Add rwanda.json in project root or scripts/rwanda-administratives.json. " +
        "Structure: { ProvinceName: { DistrictName: { SectorName: { CellName: [\"Village1\", ...] } } } }"
    );
    process.exit(1);
  }

  console.log(`Reading from ${path.relative(process.cwd(), jsonPath)}...`);
  const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as RwandaJson;
  const provinceCount = Object.keys(raw).filter(
    (k) =>
      typeof raw[k] === "object" && raw[k] !== null && !Array.isArray(raw[k])
  ).length;
  console.log(
    `Seeding Rwanda administratives (${provinceCount} provinces)...`
  );

  for (const [provinceName, districts] of Object.entries(raw)) {
    if (
      typeof districts !== "object" ||
      districts === null ||
      Array.isArray(districts)
    ) {
      continue;
    }

    const provinceSlug = slug(provinceName);
    const province = await prisma.rwanda_province.upsert({
      where: { slug: provinceSlug },
      create: { name: provinceName, slug: provinceSlug },
      update: { name: provinceName },
    });
    console.log(`  Province: ${provinceName} (${province.id})`);

    for (const [districtName, sectors] of Object.entries(districts)) {
      if (
        typeof sectors !== "object" ||
        sectors === null ||
        Array.isArray(sectors)
      ) {
        continue;
      }

      const districtSlug = slug(districtName);
      const district = await prisma.rwanda_district.upsert({
        where: {
          provinceId_slug: { provinceId: province.id, slug: districtSlug },
        },
        create: {
          name: districtName,
          slug: districtSlug,
          provinceId: province.id,
        },
        update: { name: districtName },
      });

      for (const [sectorName, cells] of Object.entries(sectors)) {
        if (
          typeof cells !== "object" ||
          cells === null ||
          Array.isArray(cells)
        ) {
          continue;
        }

        const sectorSlug = slug(sectorName);
        const sector = await prisma.rwanda_sector.upsert({
          where: {
            districtId_slug: { districtId: district.id, slug: sectorSlug },
          },
          create: {
            name: sectorName,
            slug: sectorSlug,
            districtId: district.id,
          },
          update: { name: sectorName },
        });

        for (const [cellName, villageNames] of Object.entries(cells)) {
          if (!Array.isArray(villageNames)) continue;

          const cellSlug = slug(cellName);
          const cell = await prisma.rwanda_cell.upsert({
            where: {
              sectorId_slug: { sectorId: sector.id, slug: cellSlug },
            },
            create: {
              name: cellName,
              slug: cellSlug,
              sectorId: sector.id,
            },
            update: { name: cellName },
          });

          const cellVillageSlugs = new Set<string>();
          for (const villageName of villageNames) {
            const baseSlug = slug(villageName);
            const villageSlug = uniqueSlug(baseSlug, cellVillageSlugs);
            await prisma.rwanda_village.upsert({
              where: {
                cellId_slug: { cellId: cell.id, slug: villageSlug },
              },
              create: {
                name: villageName,
                slug: villageSlug,
                cellId: cell.id,
              },
              update: { name: villageName },
            });
          }
        }
      }
    }
  }

  const [provinces, districts, sectors, cells, villages] = await Promise.all([
    prisma.rwanda_province.count(),
    prisma.rwanda_district.count(),
    prisma.rwanda_sector.count(),
    prisma.rwanda_cell.count(),
    prisma.rwanda_village.count(),
  ]);
  console.log(
    `Done. Counts: ${provinces} provinces, ${districts} districts, ${sectors} sectors, ${cells} cells, ${villages} villages.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
