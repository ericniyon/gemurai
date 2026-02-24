/**
 * CSV Import/Export Utilities
 * For bulk data operations in YDEN HarvestPlus
 */

// ============================================
// CSV PARSING
// ============================================

export interface ParsedCSV<T = Record<string, string>> {
  headers: string[]
  rows: T[]
  errors: ParseError[]
  totalRows: number
  validRows: number
}

export interface ParseError {
  row: number
  column?: string
  message: string
  value?: string
}

export interface CSVParseOptions {
  delimiter?: string
  hasHeaders?: boolean
  skipEmptyRows?: boolean
  trimValues?: boolean
  requiredColumns?: string[]
  columnMapping?: Record<string, string>
}

export function parseCSV<T = Record<string, string>>(
  csvContent: string,
  options: CSVParseOptions = {}
): ParsedCSV<T> {
  const {
    delimiter = ",",
    hasHeaders = true,
    skipEmptyRows = true,
    trimValues = true,
    requiredColumns = [],
    columnMapping = {},
  } = options

  const errors: ParseError[] = []
  const lines = csvContent.split(/\r?\n/)

  if (lines.length === 0) {
    return { headers: [], rows: [], errors: [{ row: 0, message: "Empty file" }], totalRows: 0, validRows: 0 }
  }

  // Parse headers
  let headers: string[] = []
  let dataStartIndex = 0

  if (hasHeaders) {
    headers = parseCSVLine(lines[0], delimiter).map((h) => (trimValues ? h.trim() : h))
    dataStartIndex = 1

    // Apply column mapping
    headers = headers.map((h) => columnMapping[h] || h)

    // Check required columns
    for (const required of requiredColumns) {
      if (!headers.includes(required)) {
        errors.push({ row: 0, column: required, message: `Missing required column: ${required}` })
      }
    }
  }

  // Parse data rows
  const rows: T[] = []
  let totalRows = 0

  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i]

    // Skip empty rows
    if (skipEmptyRows && line.trim() === "") {
      continue
    }

    totalRows++
    const values = parseCSVLine(line, delimiter).map((v) => (trimValues ? v.trim() : v))

    // Create row object
    const row: Record<string, string> = {}
    if (hasHeaders) {
      headers.forEach((header, index) => {
        row[header] = values[index] || ""
      })
    } else {
      values.forEach((value, index) => {
        row[`column_${index}`] = value
      })
    }

    rows.push(row as T)
  }

  return {
    headers,
    rows,
    errors,
    totalRows,
    validRows: rows.length,
  }
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

// ============================================
// CSV GENERATION
// ============================================

export interface CSVGenerateOptions {
  delimiter?: string
  includeHeaders?: boolean
  columns?: string[]
  columnLabels?: Record<string, string>
  formatters?: Record<string, (value: unknown) => string>
}

export function generateCSV<T extends Record<string, unknown>>(
  data: T[],
  options: CSVGenerateOptions = {}
): string {
  const {
    delimiter = ",",
    includeHeaders = true,
    columns,
    columnLabels = {},
    formatters = {},
  } = options

  if (data.length === 0) {
    return ""
  }

  // Determine columns
  const allColumns = columns || Object.keys(data[0])

  const lines: string[] = []

  // Add headers
  if (includeHeaders) {
    const headerRow = allColumns.map((col) => escapeCSVValue(columnLabels[col] || col, delimiter))
    lines.push(headerRow.join(delimiter))
  }

  // Add data rows
  for (const row of data) {
    const values = allColumns.map((col) => {
      let value = row[col]

      // Apply formatter if exists
      if (formatters[col]) {
        value = formatters[col](value)
      }

      return escapeCSVValue(String(value ?? ""), delimiter)
    })

    lines.push(values.join(delimiter))
  }

  return lines.join("\n")
}

function escapeCSVValue(value: string, delimiter: string): string {
  if (value.includes(delimiter) || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// ============================================
// FILE DOWNLOAD
// ============================================

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function downloadExcel(data: Record<string, unknown>[], filename: string, sheetName: string = "Sheet1"): void {
  // Simple Excel XML format (works without external libraries)
  const xmlContent = generateExcelXML(data, sheetName)
  const blob = new Blob([xmlContent], { type: "application/vnd.ms-excel" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename.endsWith(".xls") ? filename : `${filename}.xls`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

function generateExcelXML(data: Record<string, unknown>[], sheetName: string): string {
  if (data.length === 0) return ""

  const columns = Object.keys(data[0])

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="${escapeXML(sheetName)}">
<Table>\n`

  // Headers
  xml += "<Row>\n"
  for (const col of columns) {
    xml += `<Cell><Data ss:Type="String">${escapeXML(col)}</Data></Cell>\n`
  }
  xml += "</Row>\n"

  // Data rows
  for (const row of data) {
    xml += "<Row>\n"
    for (const col of columns) {
      const value = row[col]
      const type = typeof value === "number" ? "Number" : "String"
      xml += `<Cell><Data ss:Type="${type}">${escapeXML(String(value ?? ""))}</Data></Cell>\n`
    }
    xml += "</Row>\n"
  }

  xml += `</Table>
</Worksheet>
</Workbook>`

  return xml
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

// ============================================
// FILE READING
// ============================================

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = (e) => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

// ============================================
// TEMPLATE GENERATORS
// ============================================

export interface TemplateColumn {
  name: string
  label: string
  description?: string
  required?: boolean
  example?: string
  type?: "string" | "number" | "date" | "boolean"
  options?: string[]
}

export function generateCSVTemplate(columns: TemplateColumn[], includeExampleRow: boolean = true): string {
  const headers = columns.map((col) => col.label || col.name)
  const lines = [headers.join(",")]

  if (includeExampleRow) {
    const examples = columns.map((col) => {
      if (col.example) return col.example
      if (col.options?.length) return col.options[0]
      if (col.type === "number") return "0"
      if (col.type === "date") return new Date().toISOString().slice(0, 10)
      if (col.type === "boolean") return "true"
      return ""
    })
    lines.push(examples.join(","))
  }

  return lines.join("\n")
}

// ============================================
// PREDEFINED TEMPLATES
// ============================================

export const FARMER_IMPORT_COLUMNS: TemplateColumn[] = [
  { name: "name", label: "Full Name", required: true, example: "Jean Baptiste Uwimana", type: "string" },
  { name: "phone", label: "Phone Number", required: true, example: "0788123456", type: "string" },
  { name: "nationalId", label: "National ID (16 digits)", required: true, example: "1198580012345601", type: "string" },
  { name: "village", label: "Village (Umudugudu)", required: true, example: "Rugarama", type: "string" },
  { name: "sector", label: "Sector (Umurenge)", required: true, example: "Karangazi", type: "string" },
  { name: "district", label: "District (Akarere)", required: true, example: "Nyagatare", type: "string" },
  { name: "herdSize", label: "Herd Size", required: false, example: "5", type: "number" },
  { name: "isCooperativeMember", label: "Cooperative Member (true/false)", required: false, example: "true", type: "boolean" },
  { name: "preferredPaymentMethod", label: "Payment Method", required: false, example: "mobile_money", options: ["mobile_money", "bank_transfer", "cash"] },
  { name: "mobileMoneyNumber", label: "Mobile Money Number", required: false, example: "0788123456", type: "string" },
]

export const COLLECTION_IMPORT_COLUMNS: TemplateColumn[] = [
  { name: "farmerCode", label: "Farmer Code", required: true, example: "NYA-001234", type: "string" },
  { name: "collectionDate", label: "Collection Date (YYYY-MM-DD)", required: true, example: "2024-02-15", type: "date" },
  { name: "shift", label: "Shift (AM/PM)", required: true, example: "AM", options: ["AM", "PM"] },
  { name: "quantity", label: "Quantity (Liters)", required: true, example: "12.5", type: "number" },
  { name: "pricePerLiter", label: "Price per Liter (RWF)", required: true, example: "280", type: "number" },
  { name: "qualityGrade", label: "Quality Grade (A/B/C)", required: false, example: "B", options: ["A", "B", "C"] },
  { name: "lactometerReading", label: "Lactometer Reading", required: false, example: "29", type: "number" },
  { name: "fatContent", label: "Fat Content (%)", required: false, example: "3.5", type: "number" },
  { name: "temperature", label: "Temperature (°C)", required: false, example: "8", type: "number" },
]

export const INPUT_USAGE_IMPORT_COLUMNS: TemplateColumn[] = [
  { name: "farmerCode", label: "Farmer Code", required: true, example: "NYA-001234", type: "string" },
  { name: "inputType", label: "Input Type", required: true, example: "fertilizer", options: ["fertilizer", "pesticide", "feed", "medicine"] },
  { name: "inputName", label: "Input Name", required: true, example: "NPK 17-17-17", type: "string" },
  { name: "quantity", label: "Quantity", required: true, example: "25", type: "number" },
  { name: "unit", label: "Unit", required: true, example: "kg", type: "string" },
  { name: "applicationDate", label: "Application Date (YYYY-MM-DD)", required: true, example: "2024-02-15", type: "date" },
  { name: "cropOrAnimal", label: "Crop/Animal", required: true, example: "Maize Field A", type: "string" },
  { name: "notes", label: "Notes", required: false, example: "First application", type: "string" },
]

export function getFarmerImportTemplate(): string {
  return generateCSVTemplate(FARMER_IMPORT_COLUMNS)
}

export function getCollectionImportTemplate(): string {
  return generateCSVTemplate(COLLECTION_IMPORT_COLUMNS)
}

export function getInputUsageImportTemplate(): string {
  return generateCSVTemplate(INPUT_USAGE_IMPORT_COLUMNS)
}
