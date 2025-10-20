// DCC Storage Service - manages Digital Community Champions data

export interface DCCData {
  id: string
  name: string
  email: string
  phone: string
  location: string
  level: "Level A" | "Level B" | "Level C"
  rating: number
  totalSales: string
  monthlySales: string
  productsAvailable: number
  status: "active" | "inactive"
  joinDate: string
  lastActive: string
  avatar: string
  specialties: string[]
  performance: {
    salesTarget: number
    currentSales: number
    customerSatisfaction: number
    deliveryRate: number
  }
  recentActivity: Array<{
    type: "sale" | "delivery" | "training"
    description: string
    amount?: string
    time: string
  }>
  applicationId?: string // Link to original application
  approvedBy?: string
  approvedDate?: string
}

// Helper function to generate a unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Save DCC data to localStorage
export const saveDCCData = (dccData: DCCData): void => {
  if (typeof window === "undefined") return

  try {
    // Get existing DCCs
    const existingDCCsStr = localStorage.getItem("Gemurai_dccs") || "{}"
    const existingDCCs = JSON.parse(existingDCCsStr)

    // Update or add the DCC
    existingDCCs[dccData.id] = dccData

    // Save back to localStorage
    localStorage.setItem("Gemurai_dccs", JSON.stringify(existingDCCs))
  } catch (error) {
    console.error("Failed to save DCC data:", error)
    throw error
  }
}

// Convert approved application to DCC
export const createDCCFromApplication = (applicationData: any): DCCData => {
  const id = generateId()
  const now = new Date().toISOString()
  const joinDate = now.split("T")[0]

  // Generate initial performance metrics for new DCC
  const initialPerformance = {
    salesTarget: 25000, // Starting target for Level C
    currentSales: 0,
    customerSatisfaction: 100, // Start with perfect rating
    deliveryRate: 100,
  }

  // Determine specialties based on application data
  const specialties = determineSpecialties(applicationData)

  const dccData: DCCData = {
    id,
    name: applicationData.applicant.name,
    email: applicationData.applicant.email,
    phone: applicationData.applicant.phone,
    location: applicationData.applicant.location,
    level: "Level C", // All new DCCs start at Level C
    rating: 5.0, // Start with perfect rating
    totalSales: "RWF 0",
    monthlySales: "RWF 0",
    productsAvailable: 0,
    status: "active",
    joinDate,
    lastActive: "Just now",
    avatar: "/placeholder.svg?height=40&width=40",
    specialties,
    performance: initialPerformance,
    recentActivity: [
      {
        type: "training",
        description: "Completed DCC Onboarding Program",
        time: "Just now",
      },
      {
        type: "training",
        description: "Received Level C Certification",
        time: "Just now",
      },
    ],
    applicationId: applicationData.id,
    approvedBy: "System Admin",
    approvedDate: joinDate,
  }

  saveDCCData(dccData)
  return dccData
}

// Determine specialties based on application skills and experience
const determineSpecialties = (applicationData: any): string[] => {
  const skills = applicationData.skills || []
  const experience = applicationData.experience || ""
  const education = applicationData.education || ""

  const specialties: string[] = []

  // Map skills to specialties
  if (
    skills.some((skill: string) => skill.toLowerCase().includes("health") || skill.toLowerCase().includes("medical"))
  ) {
    specialties.push("Health Products")
  }

  if (
    skills.some(
      (skill: string) => skill.toLowerCase().includes("agriculture") || skill.toLowerCase().includes("farming"),
    )
  ) {
    specialties.push("Agricultural Tools")
  }

  if (skills.some((skill: string) => skill.toLowerCase().includes("solar") || skill.toLowerCase().includes("energy"))) {
    specialties.push("Solar Equipment")
  }

  if (
    skills.some(
      (skill: string) => skill.toLowerCase().includes("education") || skill.toLowerCase().includes("teaching"),
    )
  ) {
    specialties.push("Educational Materials")
  }

  if (
    skills.some(
      (skill: string) => skill.toLowerCase().includes("water") || skill.toLowerCase().includes("purification"),
    )
  ) {
    specialties.push("Water Purification")
  }

  // Check experience and education for additional specialties
  if (experience.toLowerCase().includes("sales") || experience.toLowerCase().includes("marketing")) {
    specialties.push("Sales & Marketing")
  }

  if (education.toLowerCase().includes("business") || education.toLowerCase().includes("commerce")) {
    specialties.push("Business Development")
  }

  // Default specialties if none found
  if (specialties.length === 0) {
    specialties.push("General Products", "Community Outreach")
  }

  // Limit to 3 specialties maximum
  return specialties.slice(0, 3)
}

// Get all DCCs
export const getAllDCCs = (): DCCData[] => {
  if (typeof window === "undefined") return []

  try {
    const dccsStr = localStorage.getItem("Gemurai_dccs")
    if (!dccsStr) return []

    const dccs = JSON.parse(dccsStr)
    return Object.values(dccs) as DCCData[]
  } catch (error) {
    console.error("Failed to get DCCs:", error)
    return []
  }
}

// Get DCC by ID
export const getDCCById = (id: string): DCCData | null => {
  if (typeof window === "undefined") return null

  try {
    const dccsStr = localStorage.getItem("Gemurai_dccs")
    if (!dccsStr) return null

    const dccs = JSON.parse(dccsStr)
    return dccs[id] || null
  } catch (error) {
    console.error("Failed to get DCC by ID:", error)
    return null
  }
}

// Update DCC data
export const updateDCCData = (id: string, updates: Partial<DCCData>): boolean => {
  if (typeof window === "undefined") return false

  try {
    const dccsStr = localStorage.getItem("Gemurai_dccs")
    if (!dccsStr) return false

    const dccs = JSON.parse(dccsStr)
    if (dccs[id]) {
      dccs[id] = { ...dccs[id], ...updates }
      localStorage.setItem("Gemurai_dccs", JSON.stringify(dccs))
      return true
    }
    return false
  } catch (error) {
    console.error("Failed to update DCC data:", error)
    return false
  }
}

// Check if application has already been converted to DCC
export const isDCCCreatedFromApplication = (applicationId: string): boolean => {
  if (typeof window === "undefined") return false

  try {
    const dccs = getAllDCCs()
    return dccs.some((dcc) => dcc.applicationId === applicationId)
  } catch (error) {
    console.error("Failed to check DCC creation status:", error)
    return false
  }
}

// Get DCC by application ID
export const getDCCByApplicationId = (applicationId: string): DCCData | null => {
  if (typeof window === "undefined") return null

  try {
    const dccs = getAllDCCs()
    return dccs.find((dcc) => dcc.applicationId === applicationId) || null
  } catch (error) {
    console.error("Failed to get DCC by application ID:", error)
    return null
  }
}
