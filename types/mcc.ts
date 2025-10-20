export interface Farmer {
  id: string
  farmerNumber: number
  name: string
  phone?: string
  location?: string
  registrationDate: string
  status: 'active' | 'inactive' | 'suspended'
  totalMilkCollected: number
  totalAmountEarned: number
  lastCollectionDate?: string
}

export interface MilkCollection {
  id: string
  farmerId: string
  farmerName: string
  collectionDate: string
  period: number // 1-24 for bi-monthly periods
  dailyCollections: number[] // Array of 15 daily amounts
  totalLiters: number
  unitPrice: number
  totalAmount: number
  deductions: {
    // Product deductions (multiple products)
    products: Array<{
      id: string
      productId: string
      productName: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>
    // Others category
    others: {
      depannage: number // Maintenance
      essence: number   // Fuel
      umugabane: number // Share
      ejoHeza: number   // Savings
      inguzanyo: number // Loan
    }
  }
  advances: number
  totalDeductions: number
  netPayment: number
  status: 'pending' | 'approved' | 'paid' | 'completed'
  createdAt: string
  updatedAt: string
  farmer?: {
    id: string
    name: string
    phone?: string
  }
}

export interface MCCPeriod {
  id: string
  periodNumber: number
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'closed'
  totalFarmers: number
  totalMilkCollected: number
  totalAmount: number
  totalDeductions: number
  totalAdvances: number
  netPayments: number
  collections: MilkCollection[]
}

export interface MCCStats {
  totalFarmers: number
  activeFarmers: number
  totalMilkCollected: number
  totalAmountPaid: number
  totalDeductions: number
  averageMilkPerFarmer: number
  currentPeriod: number
  pendingPayments: number
  completedPeriods: number
}

export interface MCCSettings {
  unitPrice: number
  deductionRates: {
    depannage: number
    ibipande: number
    essence: number
    imiti: number
    umugabane: number
    inguzanyo: number
    ejoHeza: number
    ibicuba: number
    ibisarubeti: number
    impapuro: number
  }
  periodLength: number // days
  autoCalculateDeductions: boolean
  requireApproval: boolean
}

export interface MCCReport {
  id: string
  reportType: 'period' | 'farmer' | 'financial' | 'summary'
  periodId?: string
  farmerId?: string
  startDate: string
  endDate: string
  generatedAt: string
  data: any
  format: 'pdf' | 'excel' | 'csv'
}




