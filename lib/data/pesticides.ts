/**
 * Pesticides Lookup Tables
 * Based on WHO Hazard Classification and Rwanda Agriculture Board (RAB) approved list
 * Reference: WHO Recommended Classification of Pesticides by Hazard (2019)
 */

export interface PesticideCategory {
  code: string
  name: string
  nameKinyarwanda?: string
  description: string
  targetPests: string[]
  icon?: string
}

export const PESTICIDE_CATEGORIES: PesticideCategory[] = [
  {
    code: "H",
    name: "Herbicide",
    nameKinyarwanda: "Imiti y'ibyatsi bibi",
    description: "Chemicals used to control unwanted plants (weeds) in crop fields",
    targetPests: ["Annual weeds", "Perennial weeds", "Grasses", "Broadleaf weeds"],
    icon: "Leaf",
  },
  {
    code: "I",
    name: "Insecticide",
    nameKinyarwanda: "Imiti y'udukoko",
    description: "Chemicals used to control insect pests that damage crops",
    targetPests: ["Aphids", "Caterpillars", "Beetles", "Borers", "Mites", "Thrips"],
    icon: "Bug",
  },
  {
    code: "F",
    name: "Fungicide",
    nameKinyarwanda: "Imiti y'indwara z'ibihingwa",
    description: "Chemicals used to control fungal diseases in plants",
    targetPests: ["Blight", "Rust", "Mildew", "Rot", "Anthracnose"],
    icon: "Cloud",
  },
  {
    code: "N",
    name: "Nematicide",
    nameKinyarwanda: "Imiti y'inzoka z'imizi",
    description: "Chemicals used to control plant-parasitic nematodes in soil",
    targetPests: ["Root-knot nematodes", "Cyst nematodes", "Lesion nematodes"],
    icon: "Worm",
  },
  {
    code: "R",
    name: "Rodenticide",
    nameKinyarwanda: "Imiti y'imbeba",
    description: "Chemicals used to control rodent pests in fields and storage",
    targetPests: ["Rats", "Mice", "Moles"],
    icon: "Rat",
  },
  {
    code: "M",
    name: "Molluscicide",
    nameKinyarwanda: "Imiti y'inyereri",
    description: "Chemicals used to control slugs and snails",
    targetPests: ["Slugs", "Snails"],
    icon: "Shell",
  },
  {
    code: "A",
    name: "Acaricide",
    nameKinyarwanda: "Imiti y'inzuki n'ibigeragezo",
    description: "Chemicals used to control mites and ticks",
    targetPests: ["Spider mites", "Red mites", "Ticks"],
    icon: "Spider",
  },
  {
    code: "B",
    name: "Bactericide",
    nameKinyarwanda: "Imiti ya bagiteri",
    description: "Chemicals used to control bacterial diseases in plants",
    targetPests: ["Bacterial wilt", "Bacterial blight", "Fire blight"],
    icon: "Microscope",
  },
]

export interface WHOHazardClass {
  class: string
  label: string
  labelKinyarwanda?: string
  description: string
  color: string
  colorHex: string
  ld50Range: string // mg/kg body weight (oral, rat)
  ppeRequired: string[]
  storageRequirements: string
  disposalMethod: string
}

export const WHO_HAZARD_CLASSES: WHOHazardClass[] = [
  {
    class: "Ia",
    label: "Extremely Hazardous",
    labelKinyarwanda: "Bitera akaga gakomeye cyane",
    description: "Highly toxic. Can be fatal with minimal exposure. Restricted use only.",
    color: "red",
    colorHex: "#DC2626",
    ld50Range: "<5 mg/kg",
    ppeRequired: ["Full chemical suit", "Respirator with organic vapor cartridge", "Chemical-resistant gloves", "Face shield", "Rubber boots"],
    storageRequirements: "Locked storage, separate building, warning signs required",
    disposalMethod: "Return to supplier or licensed hazardous waste facility",
  },
  {
    class: "Ib",
    label: "Highly Hazardous",
    labelKinyarwanda: "Bitera akaga gakomeye",
    description: "Very toxic. Serious health risk with exposure. Professional use recommended.",
    color: "red",
    colorHex: "#DC2626",
    ld50Range: "5-50 mg/kg",
    ppeRequired: ["Chemical-resistant coverall", "Respirator", "Chemical gloves", "Safety goggles", "Rubber boots"],
    storageRequirements: "Locked storage, away from food and feed, warning signs",
    disposalMethod: "Return to supplier or licensed facility",
  },
  {
    class: "II",
    label: "Moderately Hazardous",
    labelKinyarwanda: "Bitera akaga ko hagati",
    description: "Moderately toxic. Can cause harm with prolonged or repeated exposure.",
    color: "yellow",
    colorHex: "#F59E0B",
    ld50Range: "50-2000 mg/kg",
    ppeRequired: ["Long-sleeved shirt and pants", "Chemical-resistant gloves", "Safety goggles or face shield", "Hat"],
    storageRequirements: "Secure storage, away from food, labeled shelves",
    disposalMethod: "Triple rinse containers, dispose at approved site",
  },
  {
    class: "III",
    label: "Slightly Hazardous",
    labelKinyarwanda: "Bitera akaga gake",
    description: "Low toxicity. Safe when used according to label instructions.",
    color: "blue",
    colorHex: "#3B82F6",
    ld50Range: ">2000 mg/kg",
    ppeRequired: ["Long-sleeved shirt", "Pants", "Gloves", "Closed shoes"],
    storageRequirements: "Secure storage, away from children and food",
    disposalMethod: "Triple rinse, puncture and dispose in approved waste",
  },
  {
    class: "U",
    label: "Unlikely to Present Acute Hazard",
    labelKinyarwanda: "Ntibishobora gutera akaga",
    description: "Minimal toxicity risk in normal use. Safest category for general use.",
    color: "green",
    colorHex: "#22C55E",
    ld50Range: ">5000 mg/kg",
    ppeRequired: ["Basic work clothes", "Gloves recommended"],
    storageRequirements: "General storage, keep away from food",
    disposalMethod: "Rinse and dispose in regular waste",
  },
]

export interface Pesticide {
  name: string
  activeIngredient: string
  category: string // H, I, F, etc.
  hazardClass: string // Ia, Ib, II, III, U
  formulation: string
  targetPests: string[]
  suitableCrops: string[]
  applicationMethod: string
  applicationRate: string
  phi: number // Pre-Harvest Interval in days
  rei: number // Restricted Entry Interval in hours
  mrl?: number // Maximum Residue Limit mg/kg
  description?: string
  precautions: string[]
  firstAid: string[]
  registrationStatus: "registered" | "restricted" | "banned"
}

export const APPROVED_PESTICIDES: Pesticide[] = [
  // Herbicides
  {
    name: "Roundup",
    activeIngredient: "Glyphosate 360g/L",
    category: "H",
    hazardClass: "III",
    formulation: "SL (Soluble Liquid)",
    targetPests: ["Annual weeds", "Perennial weeds", "Grasses"],
    suitableCrops: ["Maize", "Coffee", "Tea", "Bananas", "Orchards"],
    applicationMethod: "Foliar spray (directed spray, avoid crop contact)",
    applicationRate: "2-4 L/ha",
    phi: 7,
    rei: 4,
    description: "Non-selective systemic herbicide. Effective on most weeds. Use as directed spray only.",
    precautions: ["Avoid spray drift to crops", "Do not apply in windy conditions", "Keep away from water sources"],
    firstAid: ["If swallowed: rinse mouth, do not induce vomiting, seek medical attention", "If in eyes: rinse with water for 15 minutes"],
    registrationStatus: "registered",
  },
  {
    name: "Gramoxone",
    activeIngredient: "Paraquat 200g/L",
    category: "H",
    hazardClass: "II",
    formulation: "SL (Soluble Liquid)",
    targetPests: ["Annual weeds", "Grasses"],
    suitableCrops: ["Coffee", "Tea", "Bananas", "Orchards"],
    applicationMethod: "Directed spray to weeds",
    applicationRate: "2-3 L/ha",
    phi: 1,
    rei: 24,
    description: "Fast-acting contact herbicide. Does not translocate. Effective for quick knockdown.",
    precautions: ["Highly toxic if ingested", "Wear full PPE", "No antidote available", "Keep locked"],
    firstAid: ["If swallowed: seek immediate medical attention - EMERGENCY", "Do not induce vomiting", "Give activated charcoal if available"],
    registrationStatus: "restricted",
  },
  {
    name: "2,4-D Amine",
    activeIngredient: "2,4-D amine 720g/L",
    category: "H",
    hazardClass: "II",
    formulation: "SL (Soluble Liquid)",
    targetPests: ["Broadleaf weeds"],
    suitableCrops: ["Maize", "Rice", "Wheat", "Sugarcane", "Pastures"],
    applicationMethod: "Post-emergence foliar spray",
    applicationRate: "1-2 L/ha",
    phi: 14,
    rei: 12,
    description: "Selective herbicide for broadleaf weed control in cereals and grass crops.",
    precautions: ["Avoid drift to sensitive crops (beans, vegetables)", "Do not apply near water", "Temperature-sensitive volatility"],
    firstAid: ["If swallowed: drink water, seek medical attention", "If on skin: wash with soap and water"],
    registrationStatus: "registered",
  },

  // Insecticides
  {
    name: "Dursban/Lorsban",
    activeIngredient: "Chlorpyrifos 480g/L",
    category: "I",
    hazardClass: "II",
    formulation: "EC (Emulsifiable Concentrate)",
    targetPests: ["Stem borers", "Aphids", "Cutworms", "Termites"],
    suitableCrops: ["Maize", "Rice", "Vegetables", "Coffee", "Bananas"],
    applicationMethod: "Foliar spray or soil drench",
    applicationRate: "1-2 L/ha",
    phi: 21,
    rei: 24,
    description: "Broad-spectrum organophosphate insecticide. Effective against soil and foliar pests.",
    precautions: ["Toxic to bees - do not apply during flowering", "Toxic to fish - avoid water contamination", "Wear respiratory protection"],
    firstAid: ["If poisoned: remove from exposure", "Give atropine if available (medical personnel only)", "Seek immediate medical attention"],
    registrationStatus: "registered",
  },
  {
    name: "Karate",
    activeIngredient: "Lambda-cyhalothrin 50g/L",
    category: "I",
    hazardClass: "II",
    formulation: "EC (Emulsifiable Concentrate)",
    targetPests: ["Aphids", "Caterpillars", "Beetles", "Thrips", "Whiteflies"],
    suitableCrops: ["Vegetables", "Maize", "Beans", "Cotton", "Coffee"],
    applicationMethod: "Foliar spray",
    applicationRate: "0.5-1 L/ha",
    phi: 14,
    rei: 12,
    description: "Pyrethroid insecticide with quick knockdown and residual activity.",
    precautions: ["Toxic to fish and aquatic organisms", "Toxic to bees", "May cause skin sensitization"],
    firstAid: ["If on skin: wash thoroughly with soap and water", "If inhaled: move to fresh air", "Seek medical attention if symptoms persist"],
    registrationStatus: "registered",
  },
  {
    name: "Actara",
    activeIngredient: "Thiamethoxam 250g/kg",
    category: "I",
    hazardClass: "III",
    formulation: "WG (Water Dispersible Granules)",
    targetPests: ["Aphids", "Whiteflies", "Thrips", "Leafhoppers"],
    suitableCrops: ["Tomatoes", "Potatoes", "Beans", "Coffee", "Vegetables"],
    applicationMethod: "Foliar spray or soil drench",
    applicationRate: "100-200 g/ha",
    phi: 14,
    rei: 4,
    description: "Systemic neonicotinoid insecticide with translaminar activity.",
    precautions: ["Toxic to bees - do not apply during flowering", "Do not apply more than twice per season"],
    firstAid: ["If swallowed: rinse mouth, drink water", "Seek medical attention if symptoms occur"],
    registrationStatus: "registered",
  },
  {
    name: "Dipterex/Dylox",
    activeIngredient: "Trichlorfon 800g/kg",
    category: "I",
    hazardClass: "II",
    formulation: "SP (Soluble Powder)",
    targetPests: ["Caterpillars", "Stem borers", "Fruit flies"],
    suitableCrops: ["Vegetables", "Fruits", "Maize", "Rice"],
    applicationMethod: "Foliar spray",
    applicationRate: "1-2 kg/ha",
    phi: 7,
    rei: 12,
    description: "Organophosphate insecticide effective against chewing insects.",
    precautions: ["Cholinesterase inhibitor", "Wear protective equipment", "Avoid inhalation"],
    firstAid: ["If poisoned: administer atropine (medical personnel)", "Seek immediate medical attention"],
    registrationStatus: "registered",
  },

  // Fungicides
  {
    name: "Ridomil Gold",
    activeIngredient: "Mefenoxam 40g/kg + Mancozeb 640g/kg",
    category: "F",
    hazardClass: "III",
    formulation: "WP (Wettable Powder)",
    targetPests: ["Late blight", "Downy mildew", "Root rot"],
    suitableCrops: ["Potatoes", "Tomatoes", "Onions", "Grapes", "Cucurbits"],
    applicationMethod: "Foliar spray",
    applicationRate: "2.5 kg/ha",
    phi: 14,
    rei: 4,
    description: "Systemic and contact fungicide for oomycete diseases. Gold standard for blight control.",
    precautions: ["Do not apply more than 3 times per season", "Alternate with other fungicides to prevent resistance"],
    firstAid: ["If swallowed: drink water, seek medical attention", "If in eyes: rinse for 15 minutes"],
    registrationStatus: "registered",
  },
  {
    name: "Dithane M-45",
    activeIngredient: "Mancozeb 800g/kg",
    category: "F",
    hazardClass: "U",
    formulation: "WP (Wettable Powder)",
    targetPests: ["Early blight", "Late blight", "Anthracnose", "Leaf spots"],
    suitableCrops: ["Potatoes", "Tomatoes", "Beans", "Bananas", "Coffee"],
    applicationMethod: "Foliar spray",
    applicationRate: "2-2.5 kg/ha",
    phi: 7,
    rei: 4,
    description: "Broad-spectrum contact fungicide. Preventive application essential.",
    precautions: ["Contains manganese - do not overapply", "May cause skin sensitization in some individuals"],
    firstAid: ["If swallowed: drink water", "If on skin: wash with soap and water"],
    registrationStatus: "registered",
  },
  {
    name: "Score",
    activeIngredient: "Difenoconazole 250g/L",
    category: "F",
    hazardClass: "III",
    formulation: "EC (Emulsifiable Concentrate)",
    targetPests: ["Powdery mildew", "Rust", "Leaf spots", "Scab"],
    suitableCrops: ["Vegetables", "Fruits", "Cereals", "Coffee"],
    applicationMethod: "Foliar spray",
    applicationRate: "0.3-0.5 L/ha",
    phi: 14,
    rei: 4,
    description: "Systemic triazole fungicide with protective, curative, and eradicant activity.",
    precautions: ["May affect liver function with prolonged exposure", "Rotate with other fungicide groups"],
    firstAid: ["If swallowed: seek medical attention", "If on skin: wash thoroughly"],
    registrationStatus: "registered",
  },
  {
    name: "Copper Oxychloride",
    activeIngredient: "Copper Oxychloride 850g/kg",
    category: "F",
    hazardClass: "III",
    formulation: "WP (Wettable Powder)",
    targetPests: ["Bacterial diseases", "Fungal leaf spots", "Downy mildew"],
    suitableCrops: ["Coffee", "Tomatoes", "Potatoes", "Citrus", "Vegetables"],
    applicationMethod: "Foliar spray",
    applicationRate: "2-3 kg/ha",
    phi: 7,
    rei: 4,
    description: "Protective copper-based fungicide/bactericide. Organic-approved.",
    precautions: ["Avoid copper accumulation in soil", "Phytotoxic in cool, wet conditions"],
    firstAid: ["If swallowed: drink milk or water", "If in eyes: rinse thoroughly"],
    registrationStatus: "registered",
  },

  // Rodenticides
  {
    name: "Zinc Phosphide",
    activeIngredient: "Zinc Phosphide 800g/kg",
    category: "R",
    hazardClass: "Ib",
    formulation: "Powder bait",
    targetPests: ["Field rats", "Mice"],
    suitableCrops: ["Rice", "Maize", "Sugarcane", "Storage facilities"],
    applicationMethod: "Bait placement in burrows or bait stations",
    applicationRate: "5-10 g per bait point",
    phi: 0,
    rei: 24,
    description: "Acute rodenticide. Fast-acting, single-dose effectiveness.",
    precautions: ["Highly toxic to humans and animals", "Use bait stations only", "Remove dead rodents promptly", "Keep away from children"],
    firstAid: ["EMERGENCY - seek immediate medical attention", "Do not induce vomiting", "Give oxygen if breathing difficulty"],
    registrationStatus: "restricted",
  },
  {
    name: "Brodifacoum",
    activeIngredient: "Brodifacoum 0.05g/kg",
    category: "R",
    hazardClass: "Ib",
    formulation: "Bait blocks",
    targetPests: ["Rats", "Mice"],
    suitableCrops: ["Storage facilities", "Warehouses"],
    applicationMethod: "Bait stations",
    applicationRate: "20-40 g per station",
    phi: 0,
    rei: 0,
    description: "Second-generation anticoagulant rodenticide. Effective against resistant rodents.",
    precautions: ["Keep in tamper-resistant bait stations", "Toxic to wildlife", "No antidote readily available"],
    firstAid: ["Seek medical attention - Vitamin K1 treatment required", "Hospitalization may be necessary"],
    registrationStatus: "restricted",
  },

  // Biological/Low-risk options
  {
    name: "Bt (Bacillus thuringiensis)",
    activeIngredient: "Bacillus thuringiensis var. kurstaki",
    category: "I",
    hazardClass: "U",
    formulation: "WP (Wettable Powder)",
    targetPests: ["Caterpillars", "Armyworms", "Diamondback moth"],
    suitableCrops: ["Vegetables", "Maize", "Cotton", "All crops"],
    applicationMethod: "Foliar spray",
    applicationRate: "0.5-1 kg/ha",
    phi: 0,
    rei: 0,
    description: "Biological insecticide safe for humans, beneficial insects, and environment.",
    precautions: ["Apply in evening for best results", "Reapply after rain", "Works slowly (2-3 days)"],
    firstAid: ["Non-toxic - no specific first aid required", "Wash if skin irritation occurs"],
    registrationStatus: "registered",
  },
  {
    name: "Neem Oil",
    activeIngredient: "Azadirachtin 0.3%",
    category: "I",
    hazardClass: "U",
    formulation: "EC (Emulsifiable Concentrate)",
    targetPests: ["Aphids", "Mites", "Whiteflies", "Caterpillars"],
    suitableCrops: ["Vegetables", "Fruits", "Ornamentals", "All crops"],
    applicationMethod: "Foliar spray",
    applicationRate: "2-5 mL/L water",
    phi: 1,
    rei: 0,
    description: "Botanical insecticide with repellent, antifeedant, and growth-regulating properties.",
    precautions: ["May cause leaf burn in hot conditions", "Apply in morning or evening"],
    firstAid: ["Non-toxic - wash with water if eye or skin irritation"],
    registrationStatus: "registered",
  },
  {
    name: "Trichoderma",
    activeIngredient: "Trichoderma harzianum",
    category: "F",
    hazardClass: "U",
    formulation: "WP (Wettable Powder)",
    targetPests: ["Root rot", "Damping off", "Fusarium", "Soil-borne diseases"],
    suitableCrops: ["Vegetables", "Fruits", "Ornamentals", "All crops"],
    applicationMethod: "Soil drench or seed treatment",
    applicationRate: "2-4 g/L water",
    phi: 0,
    rei: 0,
    description: "Beneficial fungus that protects plants from soil-borne pathogens.",
    precautions: ["Do not mix with chemical fungicides", "Apply to moist soil", "Store in cool place"],
    firstAid: ["Non-toxic - no specific first aid required"],
    registrationStatus: "registered",
  },
]

export const BANNED_PESTICIDES = [
  { name: "DDT", reason: "Persistent organic pollutant, environmental accumulation", bannedYear: 2006 },
  { name: "Endosulfan", reason: "Highly toxic, environmental persistence", bannedYear: 2011 },
  { name: "Lindane", reason: "Carcinogenic, environmental persistence", bannedYear: 2009 },
  { name: "Carbofuran", reason: "Extremely toxic to birds and mammals", bannedYear: 2015 },
  { name: "Methyl Bromide", reason: "Ozone-depleting substance", bannedYear: 2015 },
  { name: "Monocrotophos", reason: "Highly toxic, frequent poisoning incidents", bannedYear: 2018 },
]

export function getPesticidesByCategory(categoryCode: string): Pesticide[] {
  return APPROVED_PESTICIDES.filter((p) => p.category === categoryCode)
}

export function getPesticidesByHazardClass(hazardClass: string): Pesticide[] {
  return APPROVED_PESTICIDES.filter((p) => p.hazardClass === hazardClass)
}

export function getSafePesticides(): Pesticide[] {
  return APPROVED_PESTICIDES.filter((p) => ["III", "U"].includes(p.hazardClass))
}

export function getHazardClass(classCode: string): WHOHazardClass | undefined {
  return WHO_HAZARD_CLASSES.find((h) => h.class === classCode)
}

export function getPesticidesForCrop(cropName: string): Pesticide[] {
  return APPROVED_PESTICIDES.filter((p) =>
    p.suitableCrops.some((c) => c.toLowerCase().includes(cropName.toLowerCase()))
  )
}

export function getPesticidesForPest(pestName: string): Pesticide[] {
  return APPROVED_PESTICIDES.filter((p) =>
    p.targetPests.some((t) => t.toLowerCase().includes(pestName.toLowerCase()))
  )
}

export function calculatePHIDate(applicationDate: Date, phi: number): Date {
  const harvestDate = new Date(applicationDate)
  harvestDate.setDate(harvestDate.getDate() + phi)
  return harvestDate
}

export function calculateREIEndTime(applicationTime: Date, rei: number): Date {
  const reentryTime = new Date(applicationTime)
  reentryTime.setHours(reentryTime.getHours() + rei)
  return reentryTime
}

export function isPesticideBanned(name: string): boolean {
  return BANNED_PESTICIDES.some((b) => b.name.toLowerCase() === name.toLowerCase())
}
