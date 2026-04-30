/**
 * YDEN HarvestPlus Lookup Data
 * Pre-loaded standardized data for Digital products, fertilizers, and pesticides
 */

// Digital Products
export {
  MILK_GRADES,
  Digital_QUALITY_PARAMETERS,
  Digital_INPUTS,
  Digital_PRODUCTS,
  COLLECTION_PERIOD_TYPES,
  COLLECTION_PERIODS,
  MILK_COLLECTION_SHIFTS,
  MILK_REJECTION_REASONS,
  PAYMENT_DEDUCTION_TYPES,
  getMilkGrade,
  calculateMilkPrice,
  getQualityParameter,
  validateQualityValue,
} from "./Digital-products"

export type {
  MilkGrade,
  QualityParameter,
  DigitalInputCategory,
  DigitalInputItem,
  DigitalProduct,
  CollectionPeriodType,
} from "./Digital-products"

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
