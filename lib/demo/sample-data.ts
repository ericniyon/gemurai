/**
 * YDEN HarvestPlus Demo Mode Sample Data
 * Pre-populated data for exploring the system without affecting real data
 */

// Sample Farmers
export interface SampleFarmer {
  id: string
  name: string
  farmerCode: string
  phone: string
  nationalId: string
  village: string
  sector: string
  district: string
  herdSize: number
  isCooperativeMember: boolean
  preferredPaymentMethod: "mobile_money" | "bank_transfer" | "cash"
  mobileMoneyNumber?: string
  averageDailyMilk: number
  registeredDate: string
}

export const SAMPLE_FARMERS: SampleFarmer[] = [
  {
    id: "demo-farmer-001",
    name: "Jean Baptiste Uwimana",
    farmerCode: "NYA-001234",
    phone: "0788123456",
    nationalId: "1198580012345601",
    village: "Rugarama",
    sector: "Karangazi",
    district: "Nyagatare",
    herdSize: 5,
    isCooperativeMember: true,
    preferredPaymentMethod: "mobile_money",
    mobileMoneyNumber: "0788123456",
    averageDailyMilk: 25,
    registeredDate: "2024-01-15",
  },
  {
    id: "demo-farmer-002",
    name: "Marie Claire Mukamana",
    farmerCode: "NYA-001235",
    phone: "0722987654",
    nationalId: "1199080087654302",
    village: "Nyagatare",
    sector: "Nyagatare",
    district: "Nyagatare",
    herdSize: 3,
    isCooperativeMember: true,
    preferredPaymentMethod: "mobile_money",
    mobileMoneyNumber: "0722987654",
    averageDailyMilk: 15,
    registeredDate: "2024-02-20",
  },
  {
    id: "demo-farmer-003",
    name: "Emmanuel Habimana",
    farmerCode: "BUG-002001",
    phone: "0738456789",
    nationalId: "1197580045678903",
    village: "Mareba",
    sector: "Mareba",
    district: "Bugesera",
    herdSize: 8,
    isCooperativeMember: true,
    preferredPaymentMethod: "bank_transfer",
    averageDailyMilk: 40,
    registeredDate: "2023-11-10",
  },
  {
    id: "demo-farmer-004",
    name: "Jeannette Uwase",
    farmerCode: "BUG-002002",
    phone: "0788555666",
    nationalId: "1200580033445504",
    village: "Gashora",
    sector: "Gashora",
    district: "Bugesera",
    herdSize: 2,
    isCooperativeMember: false,
    preferredPaymentMethod: "cash",
    averageDailyMilk: 10,
    registeredDate: "2024-03-05",
  },
  {
    id: "demo-farmer-005",
    name: "Pierre Nshimiyimana",
    farmerCode: "MUS-003001",
    phone: "0728111222",
    nationalId: "1196580022334405",
    village: "Shyogwe",
    sector: "Shyogwe",
    district: "Muhanga",
    herdSize: 6,
    isCooperativeMember: true,
    preferredPaymentMethod: "mobile_money",
    mobileMoneyNumber: "0728111222",
    averageDailyMilk: 30,
    registeredDate: "2023-09-22",
  },
]

// Sample Collections
export interface SampleCollection {
  id: string
  farmerId: string
  farmerName: string
  farmerCode: string
  collectionDate: string
  period: 1 | 2
  shift: "AM" | "PM"
  quantity: number
  pricePerLiter: number
  totalAmount: number
  qualityGrade: "A" | "B" | "C"
  lactometerReading: number
  fatContent: number
  temperature: number
  status: "completed" | "pending"
}

export const SAMPLE_COLLECTIONS: SampleCollection[] = [
  {
    id: "demo-coll-001",
    farmerId: "demo-farmer-001",
    farmerName: "Jean Baptiste Uwimana",
    farmerCode: "NYA-001234",
    collectionDate: new Date().toISOString().slice(0, 10),
    period: new Date().getDate() <= 15 ? 1 : 2,
    shift: "AM",
    quantity: 12.5,
    pricePerLiter: 320,
    totalAmount: 4000,
    qualityGrade: "A",
    lactometerReading: 30,
    fatContent: 3.8,
    temperature: 6,
    status: "completed",
  },
  {
    id: "demo-coll-002",
    farmerId: "demo-farmer-002",
    farmerName: "Marie Claire Mukamana",
    farmerCode: "NYA-001235",
    collectionDate: new Date().toISOString().slice(0, 10),
    period: new Date().getDate() <= 15 ? 1 : 2,
    shift: "AM",
    quantity: 8.0,
    pricePerLiter: 280,
    totalAmount: 2240,
    qualityGrade: "B",
    lactometerReading: 29,
    fatContent: 3.2,
    temperature: 8,
    status: "completed",
  },
  {
    id: "demo-coll-003",
    farmerId: "demo-farmer-003",
    farmerName: "Emmanuel Habimana",
    farmerCode: "BUG-002001",
    collectionDate: new Date().toISOString().slice(0, 10),
    period: new Date().getDate() <= 15 ? 1 : 2,
    shift: "PM",
    quantity: 20.0,
    pricePerLiter: 300,
    totalAmount: 6000,
    qualityGrade: "B",
    lactometerReading: 28,
    fatContent: 3.1,
    temperature: 10,
    status: "pending",
  },
]

// Sample Season Plans
export interface SampleSeasonPlan {
  id: string
  farmerId: string
  farmerName: string
  season: "A" | "B" | "C"
  year: number
  commodityType: string
  expectedQuantity: number
  unit: string
  plannedInputs: Array<{
    inputName: string
    quantity: number
    unit: string
  }>
  status: "planned" | "in_progress" | "completed"
}

export const SAMPLE_SEASON_PLANS: SampleSeasonPlan[] = [
  {
    id: "demo-plan-001",
    farmerId: "demo-farmer-001",
    farmerName: "Jean Baptiste Uwimana",
    season: "B",
    year: 2024,
    commodityType: "Maize",
    expectedQuantity: 500,
    unit: "kg",
    plannedInputs: [
      { inputName: "NPK 17-17-17", quantity: 50, unit: "kg" },
      { inputName: "Urea", quantity: 25, unit: "kg" },
      { inputName: "Maize Seeds (Hybrid)", quantity: 10, unit: "kg" },
    ],
    status: "in_progress",
  },
  {
    id: "demo-plan-002",
    farmerId: "demo-farmer-002",
    farmerName: "Marie Claire Mukamana",
    season: "B",
    year: 2024,
    commodityType: "Beans",
    expectedQuantity: 200,
    unit: "kg",
    plannedInputs: [
      { inputName: "DAP", quantity: 30, unit: "kg" },
      { inputName: "Bean Seeds", quantity: 15, unit: "kg" },
    ],
    status: "planned",
  },
]

// Sample Input Usage Logs
export interface SampleInputUsage {
  id: string
  farmerId: string
  farmerName: string
  inputType: "fertilizer" | "pesticide" | "feed" | "medicine"
  inputName: string
  quantity: number
  unit: string
  applicationDate: string
  cropOrAnimal: string
  notes?: string
}

export const SAMPLE_INPUT_USAGE: SampleInputUsage[] = [
  {
    id: "demo-input-001",
    farmerId: "demo-farmer-001",
    farmerName: "Jean Baptiste Uwimana",
    inputType: "fertilizer",
    inputName: "NPK 17-17-17",
    quantity: 25,
    unit: "kg",
    applicationDate: "2024-02-15",
    cropOrAnimal: "Maize (Field A)",
    notes: "First application at planting",
  },
  {
    id: "demo-input-002",
    farmerId: "demo-farmer-001",
    farmerName: "Jean Baptiste Uwimana",
    inputType: "feed",
    inputName: "Dairy Meal",
    quantity: 50,
    unit: "kg",
    applicationDate: "2024-02-20",
    cropOrAnimal: "Dairy Herd",
  },
  {
    id: "demo-input-003",
    farmerId: "demo-farmer-003",
    farmerName: "Emmanuel Habimana",
    inputType: "pesticide",
    inputName: "Ridomil Gold (Mancozeb + Metalaxyl)",
    quantity: 2,
    unit: "kg",
    applicationDate: "2024-02-18",
    cropOrAnimal: "Potato Field",
    notes: "Applied for late blight prevention",
  },
]

// Sample MCC Summary Stats
export interface SampleMCCStats {
  totalFarmers: number
  activeFarmers: number
  todayCollections: number
  todayLiters: number
  periodCollections: number
  periodLiters: number
  periodRevenue: number
  averagePricePerLiter: number
  gradeAPercentage: number
  gradeBPercentage: number
  gradeCPercentage: number
}

export const SAMPLE_MCC_STATS: SampleMCCStats = {
  totalFarmers: 156,
  activeFarmers: 142,
  todayCollections: 89,
  todayLiters: 1245,
  periodCollections: 1023,
  periodLiters: 15670,
  periodRevenue: 4387600,
  averagePricePerLiter: 280,
  gradeAPercentage: 45,
  gradeBPercentage: 40,
  gradeCPercentage: 15,
}

// Helper to generate demo ID
export function generateDemoId(prefix: string): string {
  return `demo-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// Helper to check if an ID is a demo ID
export function isDemoId(id: string): boolean {
  return id.startsWith("demo-")
}
