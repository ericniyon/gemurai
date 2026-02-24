/**
 * Dairy Products Lookup Tables
 * Based on Rwanda National Dairy Strategy and industry standards
 */

export interface MilkGrade {
  code: string
  name: string
  description: string
  priceMultiplier: number
  minFat: number
  maxFat: number
  minProtein: number
  maxSCC: number // Somatic Cell Count per mL
}

export const MILK_GRADES: MilkGrade[] = [
  {
    code: "A",
    name: "Grade A (Premium)",
    description: "Premium quality milk with high fat content and low SCC, suitable for premium dairy products",
    priceMultiplier: 1.15,
    minFat: 3.5,
    maxFat: 6.0,
    minProtein: 3.2,
    maxSCC: 200000,
  },
  {
    code: "B",
    name: "Grade B (Standard)",
    description: "Standard quality milk meeting basic quality requirements for processing",
    priceMultiplier: 1.0,
    minFat: 3.0,
    maxFat: 3.5,
    minProtein: 2.9,
    maxSCC: 400000,
  },
  {
    code: "C",
    name: "Grade C (Below Standard)",
    description: "Below standard quality, may require additional processing or price adjustments",
    priceMultiplier: 0.85,
    minFat: 2.5,
    maxFat: 3.0,
    minProtein: 2.6,
    maxSCC: 750000,
  },
  {
    code: "R",
    name: "Rejected",
    description: "Does not meet minimum quality standards, rejected for collection",
    priceMultiplier: 0,
    minFat: 0,
    maxFat: 2.5,
    minProtein: 0,
    maxSCC: 1000000,
  },
]

export interface QualityParameter {
  field: string
  label: string
  labelKinyarwanda?: string
  min: number
  max: number
  unit: string
  helpText: string
  warningThresholds?: {
    low?: number
    high?: number
  }
  rejectThresholds?: {
    low?: number
    high?: number
  }
}

export const DAIRY_QUALITY_PARAMETERS: QualityParameter[] = [
  {
    field: "fat",
    label: "Fat Content",
    labelKinyarwanda: "Umubyibuho",
    min: 2.5,
    max: 6.0,
    unit: "%",
    helpText: "Butterfat percentage measured using Gerber method or electronic analyzer. Rwanda standard requires minimum 3.0% for Grade B milk.",
    warningThresholds: { low: 3.0 },
    rejectThresholds: { low: 2.5 },
  },
  {
    field: "protein",
    label: "Protein Content",
    labelKinyarwanda: "Poroteyine",
    min: 2.6,
    max: 4.5,
    unit: "%",
    helpText: "Total protein content including casein and whey proteins. Higher protein indicates better quality for cheese and yogurt production.",
    warningThresholds: { low: 2.9 },
    rejectThresholds: { low: 2.6 },
  },
  {
    field: "lactometerReading",
    label: "Lactometer Reading",
    labelKinyarwanda: "Igipimo cy'amata",
    min: 26,
    max: 32,
    unit: "°L",
    helpText: "Measures milk density to detect water adulteration. Normal range is 28-32°L at 20°C. Lower readings may indicate added water.",
    warningThresholds: { low: 28 },
    rejectThresholds: { low: 26 },
  },
  {
    field: "tempCelsius",
    label: "Temperature",
    labelKinyarwanda: "Ubushyuhe",
    min: 2,
    max: 10,
    unit: "°C",
    helpText: "Milk temperature at collection. Cold chain management requires milk to be below 10°C within 2 hours of milking.",
    warningThresholds: { high: 8 },
    rejectThresholds: { high: 15 },
  },
  {
    field: "somaticCellCount",
    label: "Somatic Cell Count (SCC)",
    labelKinyarwanda: "Selile",
    min: 0,
    max: 750000,
    unit: "cells/mL",
    helpText: "Indicator of udder health. High SCC (>400,000) suggests subclinical mastitis and reduces milk quality and shelf life.",
    warningThresholds: { high: 400000 },
    rejectThresholds: { high: 750000 },
  },
  {
    field: "antibioticTest",
    label: "Antibiotic Test",
    labelKinyarwanda: "Ibizamini by'imiti",
    min: 0,
    max: 1,
    unit: "pass/fail",
    helpText: "Tests for antibiotic residues. Positive results (presence of antibiotics) lead to rejection as per food safety regulations.",
    rejectThresholds: { high: 1 },
  },
  {
    field: "alcoholTest",
    label: "Alcohol Test",
    labelKinyarwanda: "Ikizamini cy'inzoga",
    min: 0,
    max: 1,
    unit: "pass/fail",
    helpText: "70% alcohol test for milk stability. Coagulation indicates high acidity or colostrum presence.",
    rejectThresholds: { high: 1 },
  },
  {
    field: "timeSinceMilkingHours",
    label: "Time Since Milking",
    labelKinyarwanda: "Igihe nyuma yo gukama",
    min: 0,
    max: 4,
    unit: "hours",
    helpText: "Time elapsed since milking. Fresh milk should reach MCC within 2-3 hours for optimal quality.",
    warningThresholds: { high: 3 },
    rejectThresholds: { high: 6 },
  },
  {
    field: "totalSolids",
    label: "Total Solids",
    labelKinyarwanda: "Ibintu byose bikomeye",
    min: 11.5,
    max: 14.5,
    unit: "%",
    helpText: "Sum of fat, protein, lactose, and minerals. Indicates overall milk composition and nutritional value.",
    warningThresholds: { low: 12.0 },
  },
  {
    field: "snf",
    label: "Solids Not Fat (SNF)",
    labelKinyarwanda: "Ibikomeye bidafite amavuta",
    min: 8.0,
    max: 9.5,
    unit: "%",
    helpText: "Total solids minus fat content. Rwanda standard requires minimum 8.5% SNF.",
    warningThresholds: { low: 8.5 },
    rejectThresholds: { low: 8.0 },
  },
  {
    field: "acidity",
    label: "Titratable Acidity",
    labelKinyarwanda: "Ubwumanzi",
    min: 0.12,
    max: 0.18,
    unit: "% LA",
    helpText: "Measured as lactic acid percentage. Fresh milk is 0.14-0.16%. Higher values indicate bacterial growth.",
    warningThresholds: { high: 0.17 },
    rejectThresholds: { high: 0.20 },
  },
  {
    field: "freezingPoint",
    label: "Freezing Point",
    labelKinyarwanda: "Aho amata agira urubura",
    min: -0.550,
    max: -0.530,
    unit: "°C",
    helpText: "Precise indicator of water adulteration. Pure milk freezes at -0.540°C. Values closer to 0°C indicate added water.",
    warningThresholds: { high: -0.530 },
    rejectThresholds: { high: -0.510 },
  },
]

export interface DairyInputCategory {
  code: string
  name: string
  nameKinyarwanda?: string
  description: string
  items: DairyInputItem[]
}

export interface DairyInputItem {
  name: string
  nameKinyarwanda?: string
  unit: string
  description?: string
  dosage?: string
  withdrawalPeriod?: string // For vet products
}

export const DAIRY_INPUTS: DairyInputCategory[] = [
  {
    code: "feed",
    name: "Animal Feed",
    nameKinyarwanda: "Ibiryo by'inka",
    description: "Commercial feeds and supplements for dairy cattle",
    items: [
      { name: "Dairy Meal", nameKinyarwanda: "Ibiribwa by'inka", unit: "kg", description: "Balanced concentrate feed for lactating cows", dosage: "2-4 kg per cow per day" },
      { name: "Hay (Rhodes Grass)", nameKinyarwanda: "Ubwatsi bwumye", unit: "kg", description: "Dried grass for roughage", dosage: "5-8 kg per cow per day" },
      { name: "Silage (Maize)", nameKinyarwanda: "Ubwatsi butewe", unit: "kg", description: "Fermented maize for energy", dosage: "15-25 kg per cow per day" },
      { name: "Dairy Concentrate", nameKinyarwanda: "Ibiryo bikomeye", unit: "kg", description: "High-energy supplement", dosage: "1-2 kg per 3L milk produced" },
      { name: "Molasses", nameKinyarwanda: "Umwunyu w'ikigori", unit: "liters", description: "Energy supplement and palatability enhancer", dosage: "0.5-1 kg per cow per day" },
      { name: "Wheat Bran", nameKinyarwanda: "Ubususa bw'ingano", unit: "kg", description: "By-product feed for energy and fiber", dosage: "1-3 kg per cow per day" },
      { name: "Cotton Seed Cake", nameKinyarwanda: "Ikondo ry'ipamba", unit: "kg", description: "Protein supplement", dosage: "1-2 kg per cow per day" },
      { name: "Sunflower Seed Cake", nameKinyarwanda: "Ikondo ry'ikaroti", unit: "kg", description: "Protein supplement", dosage: "1-2 kg per cow per day" },
      { name: "Napier Grass (Fresh)", nameKinyarwanda: "Ubwatsi bw'inkuru", unit: "kg", description: "Fresh cut grass for feeding", dosage: "30-50 kg per cow per day" },
    ],
  },
  {
    code: "minerals",
    name: "Mineral Supplements",
    nameKinyarwanda: "Minerari",
    description: "Mineral blocks and supplements for dairy cattle",
    items: [
      { name: "Mineral Block (Salt Lick)", nameKinyarwanda: "Ibuye ry'umunyu", unit: "kg", description: "Free-choice mineral supplementation" },
      { name: "Dairy Mineral Premix", nameKinyarwanda: "Minerari z'inka", unit: "kg", description: "Balanced mineral supplement powder", dosage: "50-100g per cow per day" },
      { name: "Calcium Supplement", nameKinyarwanda: "Kalusiyumu", unit: "kg", description: "For preventing milk fever", dosage: "As recommended by vet" },
      { name: "Phosphorus Supplement", nameKinyarwanda: "Fosifori", unit: "kg", description: "For bone health and milk production" },
      { name: "Magnesium Oxide", nameKinyarwanda: "Magnezyumu", unit: "kg", description: "For preventing grass tetany", dosage: "30-50g per cow per day" },
    ],
  },
  {
    code: "vet",
    name: "Veterinary Products",
    nameKinyarwanda: "Imiti y'amatungo",
    description: "Medicines and treatments for dairy cattle health",
    items: [
      { name: "Dewormer (Albendazole)", nameKinyarwanda: "Imiti y'inzoka", unit: "dose", description: "Internal parasite control", dosage: "7.5mg per kg body weight", withdrawalPeriod: "14 days milk" },
      { name: "Acaricide (Tick Control)", nameKinyarwanda: "Imiti y'inyenzi", unit: "liters", description: "External parasite control", withdrawalPeriod: "Check product label" },
      { name: "Mastitis Treatment (Intramammary)", nameKinyarwanda: "Imiti ya mastite", unit: "tube", description: "Antibiotic for udder infection", withdrawalPeriod: "72-96 hours milk" },
      { name: "Antibiotic Injectable (Oxytetracycline)", nameKinyarwanda: "Antibiyotike", unit: "mL", description: "For bacterial infections", withdrawalPeriod: "7-14 days milk" },
      { name: "Anti-inflammatory (Flunixin)", nameKinyarwanda: "Imiti y'kubyimba", unit: "mL", description: "Pain relief and fever reduction", withdrawalPeriod: "48 hours milk" },
      { name: "Vitamin ADE Injection", nameKinyarwanda: "Vitamini", unit: "mL", description: "Vitamin supplementation", withdrawalPeriod: "None" },
      { name: "Calcium Borogluconate", nameKinyarwanda: "Kalusiyumu", unit: "bottle", description: "For milk fever treatment", withdrawalPeriod: "None" },
      { name: "Oxytocin Injection", nameKinyarwanda: "Oksitosine", unit: "mL", description: "For milk letdown and reproductive use", withdrawalPeriod: "None" },
    ],
  },
  {
    code: "ai",
    name: "Artificial Insemination",
    nameKinyarwanda: "Gusemera bukoresheje ubuhanga",
    description: "AI supplies and reproductive services",
    items: [
      { name: "Semen Straw (Local Breed)", nameKinyarwanda: "Intanga z'isemeri", unit: "straw", description: "Frozen semen from local improved bulls" },
      { name: "Semen Straw (Friesian)", nameKinyarwanda: "Intanga za Friesian", unit: "straw", description: "Frozen semen from Friesian breed" },
      { name: "Semen Straw (Jersey)", nameKinyarwanda: "Intanga za Jersey", unit: "straw", description: "Frozen semen from Jersey breed" },
      { name: "Semen Straw (Crossbreed)", nameKinyarwanda: "Intanga z'imvange", unit: "straw", description: "Frozen semen for crossbreeding" },
      { name: "AI Kit (Sheath/Gloves)", nameKinyarwanda: "Ibikoresho byo gusemera", unit: "kit", description: "Disposable AI supplies" },
      { name: "Liquid Nitrogen", nameKinyarwanda: "Azote ikomeye", unit: "liters", description: "For semen storage" },
      { name: "Pregnancy Diagnosis", nameKinyarwanda: "Gusuzuma imbanzirizamutwe", unit: "service", description: "Rectal palpation or ultrasound" },
      { name: "Heat Synchronization Kit", nameKinyarwanda: "Gutuma inka igera", unit: "kit", description: "Hormonal treatment for estrus synchronization" },
    ],
  },
  {
    code: "equipment",
    name: "Dairy Equipment",
    nameKinyarwanda: "Ibikoresho by'amata",
    description: "Equipment for milking and milk handling",
    items: [
      { name: "Milking Bucket (Stainless)", nameKinyarwanda: "Indobo yo gukamiramo", unit: "piece", description: "20-liter stainless steel bucket" },
      { name: "Milk Can (Aluminum)", nameKinyarwanda: "Igikombe cy'amata", unit: "piece", description: "50-liter milk transport can" },
      { name: "Milk Strainer", nameKinyarwanda: "Ikiyungururo", unit: "piece", description: "For filtering milk" },
      { name: "Teat Dip Cup", nameKinyarwanda: "Igikombe cyo gukiza amabere", unit: "piece", description: "For post-milking teat disinfection" },
      { name: "Lactometer", nameKinyarwanda: "Igipimo cy'amata", unit: "piece", description: "For checking milk density" },
      { name: "Milk Cooling Tank", nameKinyarwanda: "Itangi rikonja amata", unit: "piece", description: "Bulk milk cooling equipment" },
      { name: "Milking Machine (Portable)", nameKinyarwanda: "Imashini yo gukama", unit: "piece", description: "Mechanical milking equipment" },
    ],
  },
  {
    code: "hygiene",
    name: "Hygiene Products",
    nameKinyarwanda: "Ibikoresho by'isuku",
    description: "Cleaning and sanitation products for dairy operations",
    items: [
      { name: "Teat Dip (Pre-milking)", nameKinyarwanda: "Isuku y'amabere", unit: "liters", description: "Pre-milking teat disinfectant" },
      { name: "Teat Dip (Post-milking)", nameKinyarwanda: "Isuku y'amabere nyuma yo gukama", unit: "liters", description: "Post-milking teat sealant" },
      { name: "Udder Wash", nameKinyarwanda: "Isuku y'irembo", unit: "liters", description: "Udder cleaning solution" },
      { name: "Dairy Detergent (Alkaline)", nameKinyarwanda: "Isabune", unit: "kg", description: "For cleaning milk equipment" },
      { name: "Dairy Sanitizer (Chlorine-based)", nameKinyarwanda: "Imiti isukura", unit: "liters", description: "Equipment sanitization" },
      { name: "Milking Towels (Disposable)", nameKinyarwanda: "Ibitambaro", unit: "pack", description: "Single-use udder towels" },
    ],
  },
]

/**
 * Dairy Products Lookup Table (Table 1)
 * Based on Rwanda National Dairy Strategy and local dairy processors
 * Reference: Masaka Farms profile, Rwanda National Dairy Strategy
 */
export interface DairyProduct {
  code: string
  name: string
  nameKinyarwanda: string
  description: string
  unitOfMeasure: string
  processingRequired: boolean
  storageType: "refrigerated" | "frozen" | "ambient"
  shelfLife: string
  defaultPriceRange: {
    min: number
    max: number
    currency: string
    unit: string
  }
}

export const DAIRY_PRODUCTS: DairyProduct[] = [
  {
    code: "RAW_MILK",
    name: "Fresh Milk (Raw)",
    nameKinyarwanda: "Amata mashya",
    description: "Liquid raw milk collected directly from farmers at MCC. Must be processed within 4 hours or refrigerated.",
    unitOfMeasure: "liters",
    processingRequired: false,
    storageType: "refrigerated",
    shelfLife: "24-48 hours (refrigerated)",
    defaultPriceRange: { min: 200, max: 350, currency: "RWF", unit: "per liter" },
  },
  {
    code: "PASTEURIZED_MILK",
    name: "Fresh Milk (Pasteurized)",
    nameKinyarwanda: "Amata yashyushiwe",
    description: "Heat-treated milk to kill pathogens. Can be consumed directly or used for further processing.",
    unitOfMeasure: "liters",
    processingRequired: true,
    storageType: "refrigerated",
    shelfLife: "7-14 days (refrigerated)",
    defaultPriceRange: { min: 400, max: 600, currency: "RWF", unit: "per liter" },
  },
  {
    code: "IKIVUGUTO",
    name: "Fermented Milk (Ikivuguto)",
    nameKinyarwanda: "Ikivuguto",
    description: "Traditional Rwandan fermented milk, similar to yogurt. Naturally cultured with beneficial bacteria. Widely consumed and culturally significant.",
    unitOfMeasure: "liters",
    processingRequired: true,
    storageType: "refrigerated",
    shelfLife: "7-10 days (refrigerated)",
    defaultPriceRange: { min: 500, max: 800, currency: "RWF", unit: "per liter" },
  },
  {
    code: "YOGURT",
    name: "Yogurt",
    nameKinyarwanda: "Yogurt",
    description: "Cultured milk product, flavored or plain. Produced by local dairy processors including Masaka Farms.",
    unitOfMeasure: "liters",
    processingRequired: true,
    storageType: "refrigerated",
    shelfLife: "14-21 days (refrigerated)",
    defaultPriceRange: { min: 800, max: 1500, currency: "RWF", unit: "per liter" },
  },
  {
    code: "FRESH_CREAM",
    name: "Fresh Cream",
    nameKinyarwanda: "Ireme ry'amata",
    description: "Cream skimmed from milk. Used in cooking, baking, and as coffee/tea accompaniment.",
    unitOfMeasure: "liters",
    processingRequired: true,
    storageType: "refrigerated",
    shelfLife: "7-10 days (refrigerated)",
    defaultPriceRange: { min: 2000, max: 4000, currency: "RWF", unit: "per liter" },
  },
  {
    code: "BUTTER",
    name: "Butter",
    nameKinyarwanda: "Amavuta y'inka",
    description: "Fat separated from cream or milk. Used for cooking, spreading, and baking.",
    unitOfMeasure: "kg",
    processingRequired: true,
    storageType: "refrigerated",
    shelfLife: "1-3 months (refrigerated)",
    defaultPriceRange: { min: 5000, max: 8000, currency: "RWF", unit: "per kg" },
  },
  {
    code: "GHEE",
    name: "Ghee (Clarified Butter)",
    nameKinyarwanda: "Amavuta atobuye",
    description: "Clarified butter with milk solids removed. Used in cooking and has extended shelf-stable storage.",
    unitOfMeasure: "kg",
    processingRequired: true,
    storageType: "ambient",
    shelfLife: "6-12 months (ambient)",
    defaultPriceRange: { min: 8000, max: 12000, currency: "RWF", unit: "per kg" },
  },
  {
    code: "MASCARPONE",
    name: "Mascarpone Cheese",
    nameKinyarwanda: "Foromaje ya Mascarpone",
    description: "Soft Italian-style cheese produced by Rwandan dairy processors. Used in desserts like tiramisu.",
    unitOfMeasure: "kg",
    processingRequired: true,
    storageType: "refrigerated",
    shelfLife: "14-21 days (refrigerated)",
    defaultPriceRange: { min: 10000, max: 15000, currency: "RWF", unit: "per kg" },
  },
  {
    code: "CHEESE",
    name: "Cheese (Various)",
    nameKinyarwanda: "Foromaje",
    description: "Various cheese types including fresh cheese, processed cheese, and aged varieties.",
    unitOfMeasure: "kg",
    processingRequired: true,
    storageType: "refrigerated",
    shelfLife: "Varies by type",
    defaultPriceRange: { min: 6000, max: 20000, currency: "RWF", unit: "per kg" },
  },
  {
    code: "POWDERED_MILK",
    name: "Powdered Milk",
    nameKinyarwanda: "Amata y'ubukungu",
    description: "Dehydrated milk product with extended shelf life. Requires special processing equipment.",
    unitOfMeasure: "kg",
    processingRequired: true,
    storageType: "ambient",
    shelfLife: "12-24 months (ambient, sealed)",
    defaultPriceRange: { min: 8000, max: 12000, currency: "RWF", unit: "per kg" },
  },
  {
    code: "UHT_MILK",
    name: "UHT Milk (Long-life)",
    nameKinyarwanda: "Amata atarashira",
    description: "Ultra-high temperature treated milk. Does not require refrigeration until opened.",
    unitOfMeasure: "liters",
    processingRequired: true,
    storageType: "ambient",
    shelfLife: "6-9 months (ambient, sealed)",
    defaultPriceRange: { min: 600, max: 900, currency: "RWF", unit: "per liter" },
  },
  {
    code: "WHEY",
    name: "Whey",
    nameKinyarwanda: "Amazi y'amata",
    description: "Liquid byproduct from cheese making. Used in animal feed or for whey protein production.",
    unitOfMeasure: "liters",
    processingRequired: false,
    storageType: "refrigerated",
    shelfLife: "2-3 days (refrigerated)",
    defaultPriceRange: { min: 50, max: 150, currency: "RWF", unit: "per liter" },
  },
]

/**
 * Collection Period Types (Quinzenne System)
 * Quinzenne (French origin) = bi-monthly/fortnightly period
 * This is the standard payment cycle used in Rwanda's dairy sector
 */
export interface CollectionPeriodType {
  code: string
  name: string
  nameKinyarwanda: string
  nameFrench: string
  description: string
  durationDays: number
  periodsPerMonth: number
}

export const COLLECTION_PERIOD_TYPES: CollectionPeriodType[] = [
  {
    code: "QUINZENNE",
    name: "Bi-monthly (Quinzenne)",
    nameKinyarwanda: "Igice cy'ukwezi",
    nameFrench: "Quinzaine",
    description: "Two collection/payment periods per month: 1st-15th and 16th-end. This is the standard system used in Rwanda's dairy cooperatives for organizing collections and processing farmer payments.",
    durationDays: 15,
    periodsPerMonth: 2,
  },
  {
    code: "MONTHLY",
    name: "Monthly",
    nameKinyarwanda: "Ukwezi",
    nameFrench: "Mensuel",
    description: "Single collection/payment period covering the entire month. Simpler but means longer wait for farmer payments.",
    durationDays: 30,
    periodsPerMonth: 1,
  },
  {
    code: "WEEKLY",
    name: "Weekly",
    nameKinyarwanda: "Icyumweru",
    nameFrench: "Hebdomadaire",
    description: "Weekly collection periods. More administrative work but faster payments to farmers.",
    durationDays: 7,
    periodsPerMonth: 4,
  },
]

export const COLLECTION_PERIODS = [
  { period: 1, startDay: 1, endDay: 15, label: "1st - 15th", labelKinyarwanda: "Kuva 1 kugeza 15" },
  { period: 2, startDay: 16, endDay: 31, label: "16th - End", labelKinyarwanda: "Kuva 16 kugeza impera" },
]

export const MILK_COLLECTION_SHIFTS = [
  { code: "AM", name: "Morning Collection", timeRange: "5:00 AM - 10:00 AM" },
  { code: "PM", name: "Evening Collection", timeRange: "4:00 PM - 7:00 PM" },
]

export const MILK_REJECTION_REASONS = [
  { code: "ADULTERATION", name: "Water Adulteration", description: "Lactometer reading below acceptable range" },
  { code: "ANTIBIOTICS", name: "Antibiotic Residues", description: "Positive antibiotic test" },
  { code: "ACIDITY", name: "High Acidity", description: "Milk has soured (acidity > 0.18%)" },
  { code: "FOREIGN_MATTER", name: "Foreign Matter", description: "Visible contamination or foreign particles" },
  { code: "OFF_FLAVOR", name: "Off-flavor/Odor", description: "Abnormal smell or taste" },
  { code: "MASTITIC", name: "Mastitic Milk", description: "High SCC or visible clots" },
  { code: "COLOSTRUM", name: "Colostrum", description: "Milk from recently calved cow" },
  { code: "TEMPERATURE", name: "Temperature Too High", description: "Milk above 15°C" },
  { code: "DIRTY_CONTAINER", name: "Dirty Container", description: "Unhygienic transport container" },
]

export const PAYMENT_DEDUCTION_TYPES = [
  { code: "UMUGABANE", name: "Umugabane", nameKinyarwanda: "Umugabane", description: "Community savings contribution", defaultPercentage: 5 },
  { code: "EJO_HEZA", name: "Ejo Heza", nameKinyarwanda: "Ejo Heza", description: "National long-term savings scheme", defaultPercentage: 6 },
  { code: "INGUZANYO", name: "Loan Repayment", nameKinyarwanda: "Inguzanyo", description: "Cooperative or input loan repayment", defaultPercentage: null },
  { code: "INPUTS", name: "Input Deduction", nameKinyarwanda: "Ibyaguzwe", description: "Deduction for purchased inputs", defaultPercentage: null },
  { code: "TRANSPORT", name: "Transport Fee", nameKinyarwanda: "Amafaranga y'ubwikorezi", description: "Milk transport charges", defaultPercentage: 2 },
  { code: "MEMBERSHIP", name: "Membership Fee", nameKinyarwanda: "Umusanzu w'umuryango", description: "Cooperative membership dues", defaultPercentage: null },
]

export function getMilkGrade(fatPercent: number, protein: number, scc: number): MilkGrade {
  for (const grade of MILK_GRADES) {
    if (
      fatPercent >= grade.minFat &&
      fatPercent <= grade.maxFat &&
      protein >= grade.minProtein &&
      scc <= grade.maxSCC
    ) {
      return grade
    }
  }
  return MILK_GRADES[MILK_GRADES.length - 1] // Return rejected grade
}

export function calculateMilkPrice(basePrice: number, grade: MilkGrade): number {
  return basePrice * grade.priceMultiplier
}

export function getQualityParameter(field: string): QualityParameter | undefined {
  return DAIRY_QUALITY_PARAMETERS.find((p) => p.field === field)
}

export function validateQualityValue(
  field: string,
  value: number
): { status: "pass" | "warning" | "reject"; message?: string } {
  const param = getQualityParameter(field)
  if (!param) return { status: "pass" }

  if (param.rejectThresholds) {
    if (param.rejectThresholds.low !== undefined && value < param.rejectThresholds.low) {
      return { status: "reject", message: `${param.label} below minimum (${param.rejectThresholds.low}${param.unit})` }
    }
    if (param.rejectThresholds.high !== undefined && value > param.rejectThresholds.high) {
      return { status: "reject", message: `${param.label} above maximum (${param.rejectThresholds.high}${param.unit})` }
    }
  }

  if (param.warningThresholds) {
    if (param.warningThresholds.low !== undefined && value < param.warningThresholds.low) {
      return { status: "warning", message: `${param.label} below recommended (${param.warningThresholds.low}${param.unit})` }
    }
    if (param.warningThresholds.high !== undefined && value > param.warningThresholds.high) {
      return { status: "warning", message: `${param.label} above recommended (${param.warningThresholds.high}${param.unit})` }
    }
  }

  return { status: "pass" }
}
