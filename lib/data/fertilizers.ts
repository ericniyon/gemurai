/**
 * Fertilizers Lookup Tables
 * Based on IFDC (International Fertilizer Development Center) statistics
 * and Rwanda Agriculture Board (RAB) recommendations
 */

export interface FertilizerCategory {
  code: string
  name: string
  nameKinyarwanda?: string
  description: string
  primaryNutrient: string
  icon?: string
}

export const FERTILIZER_CATEGORIES: FertilizerCategory[] = [
  {
    code: "N",
    name: "Nitrogenous Fertilizers",
    nameKinyarwanda: "Ifumbire ya Azote",
    description: "Fertilizers primarily providing nitrogen for vegetative growth, leaf development, and protein synthesis",
    primaryNutrient: "Nitrogen (N)",
    icon: "Leaf",
  },
  {
    code: "P",
    name: "Phosphatic Fertilizers",
    nameKinyarwanda: "Ifumbire ya Fosifori",
    description: "Fertilizers providing phosphorus for root development, flowering, and energy transfer",
    primaryNutrient: "Phosphorus (P)",
    icon: "Flower",
  },
  {
    code: "K",
    name: "Potassic Fertilizers",
    nameKinyarwanda: "Ifumbire ya Potasiyumu",
    description: "Fertilizers providing potassium for disease resistance, water regulation, and fruit quality",
    primaryNutrient: "Potassium (K)",
    icon: "Shield",
  },
  {
    code: "NPK",
    name: "Compound/Complex Fertilizers",
    nameKinyarwanda: "Ifumbire ivanze",
    description: "Multi-nutrient fertilizers containing two or more primary nutrients in fixed ratios",
    primaryNutrient: "Multiple (N-P-K)",
    icon: "Boxes",
  },
  {
    code: "ORG",
    name: "Organic Fertilizers",
    nameKinyarwanda: "Ifumbire y'imborera",
    description: "Natural fertilizers from plant or animal sources that improve soil structure and fertility",
    primaryNutrient: "Various organic matter",
    icon: "Recycle",
  },
  {
    code: "MICRO",
    name: "Micronutrient Fertilizers",
    nameKinyarwanda: "Ifumbire y'uduce duto",
    description: "Fertilizers providing trace elements like zinc, boron, iron, and manganese",
    primaryNutrient: "Micronutrients",
    icon: "Microscope",
  },
  {
    code: "LIME",
    name: "Liming Materials",
    nameKinyarwanda: "Ifumbire y'ifurishi",
    description: "Materials used to correct soil acidity and provide calcium/magnesium",
    primaryNutrient: "Calcium (Ca), Magnesium (Mg)",
    icon: "Mountain",
  },
]

export interface Fertilizer {
  name: string
  nameKinyarwanda?: string
  category: string
  npk: string // N-P-K ratio
  nutrientContent: {
    n?: number // Nitrogen %
    p2o5?: number // Phosphorus pentoxide %
    k2o?: number // Potassium oxide %
    s?: number // Sulfur %
    ca?: number // Calcium %
    mg?: number // Magnesium %
    other?: string
  }
  unit: string
  applicationRate: string
  applicationMethod: string
  timing: string
  suitableCrops: string[]
  description?: string
  storageRequirements?: string
  subsidized?: boolean // RAB subsidy program
}

export const COMMON_FERTILIZERS: Fertilizer[] = [
  // Nitrogenous Fertilizers
  {
    name: "Urea (46-0-0)",
    nameKinyarwanda: "Yurea",
    category: "N",
    npk: "46-0-0",
    nutrientContent: { n: 46 },
    unit: "kg",
    applicationRate: "50-100 kg/ha",
    applicationMethod: "Broadcasting or side-dressing",
    timing: "Split application: at planting and 3-4 weeks after emergence",
    suitableCrops: ["Maize", "Rice", "Wheat", "Vegetables", "Tea"],
    description: "Most concentrated solid nitrogen fertilizer. Highly soluble and fast-acting.",
    storageRequirements: "Store in dry place, away from moisture",
    subsidized: true,
  },
  {
    name: "Ammonium Sulfate (21-0-0)",
    nameKinyarwanda: "Sulfate ya Amonyum",
    category: "N",
    npk: "21-0-0",
    nutrientContent: { n: 21, s: 24 },
    unit: "kg",
    applicationRate: "100-150 kg/ha",
    applicationMethod: "Broadcasting or banding",
    timing: "At planting or as top-dress",
    suitableCrops: ["Tea", "Coffee", "Potatoes", "Cabbage"],
    description: "Good for sulfur-deficient soils. Acidifying effect suitable for alkaline soils.",
    subsidized: false,
  },
  {
    name: "CAN (Calcium Ammonium Nitrate 27-0-0)",
    nameKinyarwanda: "CAN",
    category: "N",
    npk: "27-0-0",
    nutrientContent: { n: 27, ca: 8 },
    unit: "kg",
    applicationRate: "100-150 kg/ha",
    applicationMethod: "Side-dressing or top-dressing",
    timing: "3-4 weeks after planting",
    suitableCrops: ["Maize", "Wheat", "Vegetables", "Fruits"],
    description: "Less volatile than urea. Provides calcium and reduces soil acidity.",
    subsidized: true,
  },

  // Phosphatic Fertilizers
  {
    name: "DAP (18-46-0)",
    nameKinyarwanda: "DAP",
    category: "NPK",
    npk: "18-46-0",
    nutrientContent: { n: 18, p2o5: 46 },
    unit: "kg",
    applicationRate: "100-150 kg/ha",
    applicationMethod: "Banding or placement near seeds",
    timing: "At planting",
    suitableCrops: ["Maize", "Beans", "Potatoes", "Wheat", "Rice"],
    description: "Most widely used starter fertilizer in Rwanda. Excellent for establishing crops.",
    storageRequirements: "Store away from moisture and ammonium nitrate",
    subsidized: true,
  },
  {
    name: "TSP (Triple Super Phosphate 0-46-0)",
    nameKinyarwanda: "TSP",
    category: "P",
    npk: "0-46-0",
    nutrientContent: { p2o5: 46 },
    unit: "kg",
    applicationRate: "100-150 kg/ha",
    applicationMethod: "Banding or broadcasting",
    timing: "At planting",
    suitableCrops: ["Coffee", "Bananas", "Fruits", "Vegetables"],
    description: "High-analysis phosphate fertilizer for phosphorus-deficient soils.",
    subsidized: false,
  },
  {
    name: "SSP (Single Super Phosphate 0-18-0)",
    nameKinyarwanda: "SSP",
    category: "P",
    npk: "0-18-0",
    nutrientContent: { p2o5: 18, s: 12, ca: 20 },
    unit: "kg",
    applicationRate: "200-300 kg/ha",
    applicationMethod: "Broadcasting or banding",
    timing: "At planting",
    suitableCrops: ["Groundnuts", "Coffee", "Legumes"],
    description: "Provides phosphorus, sulfur, and calcium. Good for acidic soils.",
    subsidized: false,
  },

  // Potassic Fertilizers
  {
    name: "MOP (Muriate of Potash 0-0-60)",
    nameKinyarwanda: "MOP",
    category: "K",
    npk: "0-0-60",
    nutrientContent: { k2o: 60 },
    unit: "kg",
    applicationRate: "50-100 kg/ha",
    applicationMethod: "Broadcasting or banding",
    timing: "At planting or early growth",
    suitableCrops: ["Maize", "Potatoes", "Coffee", "Bananas", "Tea"],
    description: "Most common potassium fertilizer. Avoid for chloride-sensitive crops.",
    subsidized: true,
  },
  {
    name: "SOP (Sulfate of Potash 0-0-50)",
    nameKinyarwanda: "SOP",
    category: "K",
    npk: "0-0-50",
    nutrientContent: { k2o: 50, s: 18 },
    unit: "kg",
    applicationRate: "75-125 kg/ha",
    applicationMethod: "Broadcasting or fertigation",
    timing: "At planting or split application",
    suitableCrops: ["Potatoes", "Tomatoes", "Tobacco", "Fruits"],
    description: "Premium potassium source for chloride-sensitive crops. Provides sulfur.",
    subsidized: false,
  },

  // Compound/Complex Fertilizers
  {
    name: "NPK 17-17-17",
    nameKinyarwanda: "NPK 17-17-17",
    category: "NPK",
    npk: "17-17-17",
    nutrientContent: { n: 17, p2o5: 17, k2o: 17 },
    unit: "kg",
    applicationRate: "200-250 kg/ha",
    applicationMethod: "Broadcasting or banding",
    timing: "At planting",
    suitableCrops: ["Maize", "Vegetables", "Beans", "Potatoes"],
    description: "Balanced fertilizer for general crop production. Good starter fertilizer.",
    subsidized: true,
  },
  {
    name: "NPK 20-10-10",
    nameKinyarwanda: "NPK 20-10-10",
    category: "NPK",
    npk: "20-10-10",
    nutrientContent: { n: 20, p2o5: 10, k2o: 10 },
    unit: "kg",
    applicationRate: "200-250 kg/ha",
    applicationMethod: "Broadcasting",
    timing: "Early growth stage",
    suitableCrops: ["Maize", "Rice", "Sugarcane", "Grass"],
    description: "High-nitrogen compound for vegetative growth emphasis.",
    subsidized: false,
  },
  {
    name: "NPK 10-20-20",
    nameKinyarwanda: "NPK 10-20-20",
    category: "NPK",
    npk: "10-20-20",
    nutrientContent: { n: 10, p2o5: 20, k2o: 20 },
    unit: "kg",
    applicationRate: "200-250 kg/ha",
    applicationMethod: "Broadcasting or banding",
    timing: "At planting for root crops",
    suitableCrops: ["Potatoes", "Cassava", "Sweet Potatoes", "Carrots"],
    description: "Emphasis on P and K for root and tuber crops.",
    subsidized: false,
  },
  {
    name: "NPK 15-15-15",
    nameKinyarwanda: "NPK 15-15-15",
    category: "NPK",
    npk: "15-15-15",
    nutrientContent: { n: 15, p2o5: 15, k2o: 15 },
    unit: "kg",
    applicationRate: "250-300 kg/ha",
    applicationMethod: "Broadcasting",
    timing: "At planting",
    suitableCrops: ["General crops", "Vegetables", "Fruits"],
    description: "General purpose balanced fertilizer.",
    subsidized: true,
  },
  {
    name: "NPK 12-24-12",
    nameKinyarwanda: "NPK 12-24-12",
    category: "NPK",
    npk: "12-24-12",
    nutrientContent: { n: 12, p2o5: 24, k2o: 12 },
    unit: "kg",
    applicationRate: "200-250 kg/ha",
    applicationMethod: "Banding",
    timing: "At planting",
    suitableCrops: ["Beans", "Soybeans", "Groundnuts"],
    description: "High phosphorus for legume establishment and root development.",
    subsidized: false,
  },

  // Organic Fertilizers
  {
    name: "Compost",
    nameKinyarwanda: "Ifumbire y'imborera",
    category: "ORG",
    npk: "1-1-1",
    nutrientContent: { n: 1, p2o5: 1, k2o: 1, other: "Organic matter 40-60%" },
    unit: "kg",
    applicationRate: "5,000-10,000 kg/ha",
    applicationMethod: "Broadcasting and incorporation",
    timing: "Before planting",
    suitableCrops: ["All crops"],
    description: "Improves soil structure, water retention, and biological activity.",
    subsidized: false,
  },
  {
    name: "Farmyard Manure (FYM)",
    nameKinyarwanda: "Amase y'inka",
    category: "ORG",
    npk: "0.5-0.3-0.5",
    nutrientContent: { n: 0.5, p2o5: 0.3, k2o: 0.5, other: "Organic matter 20-30%" },
    unit: "kg",
    applicationRate: "10,000-20,000 kg/ha",
    applicationMethod: "Broadcasting and plowing in",
    timing: "2-4 weeks before planting",
    suitableCrops: ["All crops", "Vegetables", "Bananas"],
    description: "Well-decomposed cattle manure. Foundation of organic farming in Rwanda.",
    subsidized: false,
  },
  {
    name: "Poultry Manure",
    nameKinyarwanda: "Amase y'inkoko",
    category: "ORG",
    npk: "3-2.5-1.5",
    nutrientContent: { n: 3, p2o5: 2.5, k2o: 1.5 },
    unit: "kg",
    applicationRate: "2,000-5,000 kg/ha",
    applicationMethod: "Broadcasting",
    timing: "2-3 weeks before planting",
    suitableCrops: ["Vegetables", "Maize", "Beans"],
    description: "High-nutrient organic fertilizer. Must be well-composted before use.",
    subsidized: false,
  },
  {
    name: "Green Manure (Tithonia)",
    nameKinyarwanda: "Ifumbire y'ibiti bibisi",
    category: "ORG",
    npk: "3.5-0.4-4",
    nutrientContent: { n: 3.5, p2o5: 0.4, k2o: 4 },
    unit: "kg",
    applicationRate: "5,000-10,000 kg/ha fresh weight",
    applicationMethod: "Incorporation before planting",
    timing: "2 weeks before planting",
    suitableCrops: ["Vegetables", "Maize", "Beans"],
    description: "Cut and incorporate Tithonia diversifolia leaves as green manure.",
    subsidized: false,
  },

  // Micronutrient Fertilizers
  {
    name: "Zinc Sulfate",
    nameKinyarwanda: "Zenke Sulfate",
    category: "MICRO",
    npk: "0-0-0",
    nutrientContent: { other: "Zn 35%, S 17%" },
    unit: "kg",
    applicationRate: "10-25 kg/ha",
    applicationMethod: "Broadcasting or foliar spray",
    timing: "At planting or early growth",
    suitableCrops: ["Maize", "Rice", "Beans", "Citrus"],
    description: "Corrects zinc deficiency common in Rwanda's acidic soils.",
    subsidized: false,
  },
  {
    name: "Borax",
    nameKinyarwanda: "Boraksi",
    category: "MICRO",
    npk: "0-0-0",
    nutrientContent: { other: "B 11%" },
    unit: "kg",
    applicationRate: "5-10 kg/ha",
    applicationMethod: "Broadcasting or foliar",
    timing: "At planting",
    suitableCrops: ["Coffee", "Sunflower", "Cabbage", "Cauliflower"],
    description: "Essential for flowering and fruit set. Careful dosing required.",
    subsidized: false,
  },

  // Liming Materials
  {
    name: "Agricultural Lime (CaCO3)",
    nameKinyarwanda: "Ifurishi",
    category: "LIME",
    npk: "0-0-0",
    nutrientContent: { ca: 40 },
    unit: "kg",
    applicationRate: "1,000-4,000 kg/ha (based on soil test)",
    applicationMethod: "Broadcasting and incorporation",
    timing: "1-3 months before planting",
    suitableCrops: ["All crops on acidic soils"],
    description: "Raises soil pH and provides calcium. Essential for Rwanda's acidic soils.",
    subsidized: true,
  },
  {
    name: "Dolomite Lime",
    nameKinyarwanda: "Ifurishi ya Dolomite",
    category: "LIME",
    npk: "0-0-0",
    nutrientContent: { ca: 22, mg: 12 },
    unit: "kg",
    applicationRate: "1,000-3,000 kg/ha",
    applicationMethod: "Broadcasting",
    timing: "Before planting season",
    suitableCrops: ["All crops"],
    description: "Provides calcium and magnesium while correcting soil acidity.",
    subsidized: false,
  },
]

export interface FertilizerApplication {
  cropName: string
  recommendedFertilizers: {
    fertilizer: string
    rate: string
    timing: string
    notes?: string
  }[]
}

export const CROP_FERTILIZER_RECOMMENDATIONS: FertilizerApplication[] = [
  {
    cropName: "Maize",
    recommendedFertilizers: [
      { fertilizer: "DAP (18-46-0)", rate: "100-150 kg/ha", timing: "At planting", notes: "Apply in furrows 5cm below seed" },
      { fertilizer: "Urea (46-0-0)", rate: "50-100 kg/ha", timing: "Top-dress at knee height", notes: "Split application recommended" },
      { fertilizer: "MOP (0-0-60)", rate: "50 kg/ha", timing: "At planting", notes: "For potassium-deficient soils" },
    ],
  },
  {
    cropName: "Beans",
    recommendedFertilizers: [
      { fertilizer: "DAP (18-46-0)", rate: "100 kg/ha", timing: "At planting", notes: "Legumes fix nitrogen, minimal N needed" },
      { fertilizer: "NPK 12-24-12", rate: "150 kg/ha", timing: "At planting", notes: "Alternative to DAP" },
    ],
  },
  {
    cropName: "Irish Potatoes",
    recommendedFertilizers: [
      { fertilizer: "NPK 17-17-17", rate: "300-400 kg/ha", timing: "At planting", notes: "Apply in ridges" },
      { fertilizer: "Urea (46-0-0)", rate: "50 kg/ha", timing: "Hilling stage", notes: "Side-dress application" },
      { fertilizer: "MOP (0-0-60)", rate: "100 kg/ha", timing: "At planting", notes: "Important for tuber quality" },
    ],
  },
  {
    cropName: "Coffee",
    recommendedFertilizers: [
      { fertilizer: "NPK 17-17-17", rate: "200-300 g/tree", timing: "Start of rains", notes: "Split into 2-3 applications" },
      { fertilizer: "Urea (46-0-0)", rate: "50-100 g/tree", timing: "During growth flush", notes: "Ring application around tree" },
      { fertilizer: "Agricultural Lime", rate: "500 g/tree", timing: "Every 2-3 years", notes: "For pH correction" },
    ],
  },
  {
    cropName: "Tea",
    recommendedFertilizers: [
      { fertilizer: "NPK 25-5-5", rate: "300-400 kg/ha/year", timing: "Split 3-4 times", notes: "High N requirement" },
      { fertilizer: "Ammonium Sulfate", rate: "200-300 kg/ha", timing: "After each plucking round", notes: "Provides N and S" },
    ],
  },
  {
    cropName: "Rice",
    recommendedFertilizers: [
      { fertilizer: "DAP (18-46-0)", rate: "100 kg/ha", timing: "At transplanting", notes: "Basal application" },
      { fertilizer: "Urea (46-0-0)", rate: "100-150 kg/ha", timing: "Split: tillering + panicle initiation", notes: "50% at tillering, 50% at PI" },
      { fertilizer: "MOP (0-0-60)", rate: "50 kg/ha", timing: "At transplanting", notes: "Basal application" },
    ],
  },
]

export function getFertilizersByCategory(categoryCode: string): Fertilizer[] {
  return COMMON_FERTILIZERS.filter((f) => f.category === categoryCode)
}

export function getSubsidizedFertilizers(): Fertilizer[] {
  return COMMON_FERTILIZERS.filter((f) => f.subsidized)
}

export function getFertilizerRecommendation(cropName: string): FertilizerApplication | undefined {
  return CROP_FERTILIZER_RECOMMENDATIONS.find(
    (r) => r.cropName.toLowerCase() === cropName.toLowerCase()
  )
}

export function parseFertilizerNPK(npk: string): { n: number; p: number; k: number } {
  const parts = npk.split("-").map((p) => parseFloat(p) || 0)
  return {
    n: parts[0] || 0,
    p: parts[1] || 0,
    k: parts[2] || 0,
  }
}

export function calculateNutrientApplication(
  fertilizer: Fertilizer,
  applicationRateKgPerHa: number
): { n: number; p2o5: number; k2o: number } {
  const content = fertilizer.nutrientContent
  return {
    n: ((content.n || 0) * applicationRateKgPerHa) / 100,
    p2o5: ((content.p2o5 || 0) * applicationRateKgPerHa) / 100,
    k2o: ((content.k2o || 0) * applicationRateKgPerHa) / 100,
  }
}
