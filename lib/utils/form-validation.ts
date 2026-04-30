/**
 * YDEN HarvestPlus Form Validation Utilities
 * Real-time validation helpers with contextual feedback
 */

import { Digital_QUALITY_PARAMETERS, validateQualityValue } from "@/lib/data"

// ============================================
// PRICE VALIDATION
// ============================================

export interface PriceRange {
  min: number
  max: number
  typical: number
  currency: string
  unit: string
}

export const PRICE_RANGES: Record<string, PriceRange> = {
  // Milk prices in RWF per liter
  rawMilk: { min: 150, max: 400, typical: 280, currency: "RWF", unit: "per liter" },
  gradeA: { min: 280, max: 400, typical: 320, currency: "RWF", unit: "per liter" },
  gradeB: { min: 220, max: 300, typical: 260, currency: "RWF", unit: "per liter" },
  gradeC: { min: 150, max: 240, typical: 200, currency: "RWF", unit: "per liter" },
  
  // Processed Digital prices
  yogurt: { min: 800, max: 1500, typical: 1200, currency: "RWF", unit: "per liter" },
  ikivuguto: { min: 500, max: 900, typical: 700, currency: "RWF", unit: "per liter" },
  butter: { min: 5000, max: 9000, typical: 7000, currency: "RWF", unit: "per kg" },
  cheese: { min: 6000, max: 20000, typical: 12000, currency: "RWF", unit: "per kg" },
  
  // Crop prices (seasonal averages)
  maize: { min: 200, max: 400, typical: 300, currency: "RWF", unit: "per kg" },
  beans: { min: 400, max: 700, typical: 550, currency: "RWF", unit: "per kg" },
  rice: { min: 500, max: 900, typical: 700, currency: "RWF", unit: "per kg" },
  coffee: { min: 800, max: 1500, typical: 1200, currency: "RWF", unit: "per kg" },
}

export interface ValidationResult {
  isValid: boolean
  status: "valid" | "warning" | "error"
  message?: string
  suggestion?: string
}

export function validatePrice(
  price: number,
  productType: string = "rawMilk"
): ValidationResult {
  if (price === undefined || price === null || isNaN(price)) {
    return {
      isValid: false,
      status: "error",
      message: "Price is required",
    }
  }

  if (price <= 0) {
    return {
      isValid: false,
      status: "error",
      message: "Price must be greater than 0 RWF",
    }
  }

  const range = PRICE_RANGES[productType] || PRICE_RANGES.rawMilk

  if (price < range.min) {
    return {
      isValid: true,
      status: "warning",
      message: `Price seems low (typical: ${range.min}-${range.max} ${range.currency} ${range.unit})`,
      suggestion: `Typical price for this product is around ${range.typical} ${range.currency} ${range.unit}`,
    }
  }

  if (price > range.max) {
    return {
      isValid: true,
      status: "warning",
      message: `Price seems high (typical: ${range.min}-${range.max} ${range.currency} ${range.unit})`,
      suggestion: `Please verify this price is correct. Typical range is ${range.min}-${range.max} ${range.currency}`,
    }
  }

  return { isValid: true, status: "valid" }
}

// ============================================
// QUANTITY VALIDATION
// ============================================

export interface QuantityRange {
  min: number
  max: number
  typical: number
  unit: string
}

export const QUANTITY_RANGES: Record<string, QuantityRange> = {
  // Daily milk delivery per farmer (liters)
  dailyMilk: { min: 1, max: 200, typical: 15, unit: "liters" },
  // Single delivery (liters)
  singleMilkDelivery: { min: 0.5, max: 100, typical: 10, unit: "liters" },
  // Crop delivery (kg)
  cropDelivery: { min: 1, max: 5000, typical: 100, unit: "kg" },
}

export function validateQuantity(
  quantity: number,
  quantityType: string = "singleMilkDelivery"
): ValidationResult {
  if (quantity === undefined || quantity === null || isNaN(quantity)) {
    return {
      isValid: false,
      status: "error",
      message: "Quantity is required",
    }
  }

  if (quantity <= 0) {
    return {
      isValid: false,
      status: "error",
      message: "Quantity must be greater than 0",
    }
  }

  const range = QUANTITY_RANGES[quantityType] || QUANTITY_RANGES.singleMilkDelivery

  if (quantity < range.min) {
    return {
      isValid: false,
      status: "error",
      message: `Minimum quantity is ${range.min} ${range.unit}`,
    }
  }

  if (quantity > range.max) {
    return {
      isValid: true,
      status: "warning",
      message: `Quantity ${quantity} ${range.unit} is unusually high`,
      suggestion: `Please verify this amount. Typical delivery is around ${range.typical} ${range.unit}`,
    }
  }

  return { isValid: true, status: "valid" }
}

// ============================================
// MILK QUALITY VALIDATION
// ============================================

export function validateLactometerReading(value: number): ValidationResult {
  if (value === undefined || value === null || isNaN(value)) {
    return {
      isValid: false,
      status: "error",
      message: "Lactometer reading is required",
    }
  }

  if (value < 20 || value > 40) {
    return {
      isValid: false,
      status: "error",
      message: "Lactometer reading must be between 20°L and 40°L",
    }
  }

  if (value < 26) {
    return {
      isValid: false,
      status: "error",
      message: "Milk rejected: Lactometer reading below 26°L indicates possible water adulteration",
    }
  }

  if (value < 28) {
    return {
      isValid: true,
      status: "warning",
      message: "Warning: Lactometer reading below normal (28-32°L)",
      suggestion: "Consider retesting or investigating potential dilution",
    }
  }

  if (value > 32) {
    return {
      isValid: true,
      status: "warning",
      message: "Warning: Lactometer reading above normal (possible fat removal)",
      suggestion: "High reading may indicate cream was skimmed from milk",
    }
  }

  return { isValid: true, status: "valid" }
}

export function validateFatContent(value: number): ValidationResult {
  if (value === undefined || value === null || isNaN(value)) {
    return {
      isValid: false,
      status: "error",
      message: "Fat content is required",
    }
  }

  if (value < 0 || value > 10) {
    return {
      isValid: false,
      status: "error",
      message: "Fat content must be between 0% and 10%",
    }
  }

  if (value < 2.5) {
    return {
      isValid: true,
      status: "warning",
      message: "Low fat content may result in lower grade",
      suggestion: "Grade C or Rejected. Normal range: 3.0-6.0%",
    }
  }

  if (value >= 3.5) {
    return {
      isValid: true,
      status: "valid",
      message: "Premium fat content (Grade A eligible)",
    }
  }

  return { isValid: true, status: "valid" }
}

export function validateTemperature(value: number): ValidationResult {
  if (value === undefined || value === null || isNaN(value)) {
    return {
      isValid: false,
      status: "error",
      message: "Temperature is required",
    }
  }

  if (value < 0 || value > 50) {
    return {
      isValid: false,
      status: "error",
      message: "Temperature reading seems incorrect",
    }
  }

  if (value > 15) {
    return {
      isValid: false,
      status: "error",
      message: "Milk rejected: Temperature above 15°C",
      suggestion: "Milk should be cooled to below 10°C within 2 hours of milking",
    }
  }

  if (value > 10) {
    return {
      isValid: true,
      status: "warning",
      message: "Warning: Temperature above optimal (2-8°C)",
      suggestion: "Slightly warm milk - accept but prioritize for processing",
    }
  }

  if (value < 2) {
    return {
      isValid: true,
      status: "warning",
      message: "Note: Milk is near freezing point",
      suggestion: "Ensure proper storage to prevent freezing damage",
    }
  }

  return { isValid: true, status: "valid" }
}

// ============================================
// NATIONAL ID VALIDATION (Rwanda)
// ============================================

export function validateNationalId(id: string): ValidationResult {
  if (!id || id.trim() === "") {
    return {
      isValid: false,
      status: "error",
      message: "National ID is required",
    }
  }

  const cleaned = id.replace(/[\s-]/g, "")

  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      status: "error",
      message: "National ID must contain only numbers",
    }
  }

  if (cleaned.length !== 16) {
    return {
      isValid: false,
      status: "error",
      message: `National ID must be 16 digits (currently ${cleaned.length})`,
      suggestion: "Rwanda National ID format: 1 1990 12345 6789 01",
    }
  }

  const firstDigit = cleaned[0]
  if (firstDigit !== "1" && firstDigit !== "2" && firstDigit !== "3") {
    return {
      isValid: true,
      status: "warning",
      message: "National ID format may be incorrect",
      suggestion: "IDs typically start with 1, 2, or 3",
    }
  }

  return { isValid: true, status: "valid" }
}

// ============================================
// PHONE NUMBER VALIDATION (Rwanda)
// ============================================

export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone || phone.trim() === "") {
    return {
      isValid: false,
      status: "error",
      message: "Phone number is required",
    }
  }

  const cleaned = phone.replace(/[\s-()]/g, "")

  // Accept formats: 0788123456, +250788123456, 250788123456
  const rwandaRegex = /^(\+?250|0)?7[238]\d{7}$/

  if (!rwandaRegex.test(cleaned)) {
    return {
      isValid: false,
      status: "error",
      message: "Invalid Rwanda phone number format",
      suggestion: "Format: 078XXXXXXX, 072XXXXXXX, or 073XXXXXXX",
    }
  }

  return { isValid: true, status: "valid" }
}

// ============================================
// COMPREHENSIVE VALIDATION HELPER
// ============================================

export interface FieldValidation {
  field: string
  value: unknown
  type: "price" | "quantity" | "lactometer" | "fat" | "temperature" | "nationalId" | "phone" | "required"
  options?: Record<string, unknown>
}

export function validateField(validation: FieldValidation): ValidationResult {
  const { type, value, options } = validation

  switch (type) {
    case "price":
      return validatePrice(value as number, options?.productType as string)
    case "quantity":
      return validateQuantity(value as number, options?.quantityType as string)
    case "lactometer":
      return validateLactometerReading(value as number)
    case "fat":
      return validateFatContent(value as number)
    case "temperature":
      return validateTemperature(value as number)
    case "nationalId":
      return validateNationalId(value as string)
    case "phone":
      return validatePhoneNumber(value as string)
    case "required":
      if (value === undefined || value === null || value === "") {
        return {
          isValid: false,
          status: "error",
          message: `${validation.field} is required`,
        }
      }
      return { isValid: true, status: "valid" }
    default:
      return { isValid: true, status: "valid" }
  }
}

// ============================================
// SMART DEFAULTS
// ============================================

export interface SmartDefaults {
  pricePerLiter: number
  gradeA: number
  gradeB: number
  gradeC: number
  defaultPeriod: 1 | 2
  defaultShift: "AM" | "PM"
  defaultUnit: string
}

export function getSmartDefaults(currentDate: Date = new Date()): SmartDefaults {
  const day = currentDate.getDate()
  const hour = currentDate.getHours()

  return {
    pricePerLiter: 280, // Industry average base price
    gradeA: 320,
    gradeB: 260,
    gradeC: 200,
    defaultPeriod: day <= 15 ? 1 : 2,
    defaultShift: hour < 12 ? "AM" : "PM",
    defaultUnit: "liters",
  }
}

export function suggestPriceByGrade(grade: string, basePrice: number = 280): number {
  const multipliers: Record<string, number> = {
    A: 1.15,
    B: 1.0,
    C: 0.85,
    R: 0,
  }
  return Math.round(basePrice * (multipliers[grade] || 1.0))
}

export function getCurrentPeriod(): { period: 1 | 2; label: string; labelKinyarwanda: string } {
  const day = new Date().getDate()
  if (day <= 15) {
    return { period: 1, label: "1st - 15th (Quinzenne 1)", labelKinyarwanda: "Igice cya mbere cy'ukwezi" }
  }
  return { period: 2, label: "16th - End (Quinzenne 2)", labelKinyarwanda: "Igice cya kabiri cy'ukwezi" }
}

export function getCurrentShift(): { code: "AM" | "PM"; name: string; nameKinyarwanda: string } {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return { code: "AM", name: "Morning Collection", nameKinyarwanda: "Gukusanya mu gitondo" }
  }
  return { code: "PM", name: "Evening Collection", nameKinyarwanda: "Gukusanya nijoro" }
}
