/**
 * YDEN HarvestPlus Lookup Data
 * Pre-loaded standardized data for dairy products, fertilizers, and pesticides
 */

// Dairy Products
export {
  MILK_GRADES,
  DAIRY_QUALITY_PARAMETERS,
  DAIRY_INPUTS,
  DAIRY_PRODUCTS,
  COLLECTION_PERIOD_TYPES,
  COLLECTION_PERIODS,
  MILK_COLLECTION_SHIFTS,
  MILK_REJECTION_REASONS,
  PAYMENT_DEDUCTION_TYPES,
  getMilkGrade,
  calculateMilkPrice,
  getQualityParameter,
  validateQualityValue,
} from "./dairy-products"

export type {
  MilkGrade,
  QualityParameter,
  DairyInputCategory,
  DairyInputItem,
  DairyProduct,
  CollectionPeriodType,
} from "./dairy-products"

// Fertilizers
export {
  FERTILIZER_CATEGORIES,
  COMMON_FERTILIZERS,
  CROP_FERTILIZER_RECOMMENDATIONS,
  getFertilizersByCategory,
  getSubsidizedFertilizers,
  getFertilizerRecommendation,
  parseFertilizerNPK,
  calculateNutrientApplication,
} from "./fertilizers"

export type {
  FertilizerCategory,
  Fertilizer,
  FertilizerApplication,
} from "./fertilizers"

// Pesticides
export {
  PESTICIDE_CATEGORIES,
  WHO_HAZARD_CLASSES,
  APPROVED_PESTICIDES,
  BANNED_PESTICIDES,
  getPesticidesByCategory,
  getPesticidesByHazardClass,
  getSafePesticides,
  getHazardClass,
  getPesticidesForCrop,
  getPesticidesForPest,
  calculatePHIDate,
  calculateREIEndTime,
  isPesticideBanned,
} from "./pesticides"

export type {
  PesticideCategory,
  WHOHazardClass,
  Pesticide,
} from "./pesticides"

// Glossary (Kinyarwanda translations)
export {
  GLOSSARY,
  searchGlossary,
  getTermsByCategory,
  getKinyarwandaTerm,
  getEnglishTerm,
} from "./glossary"

export type { GlossaryTerm } from "./glossary"
