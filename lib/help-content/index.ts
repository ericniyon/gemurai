/**
 * YDEN HarvestPlus Help Content
 * Contextual help tooltips and modal content for all form fields
 */

import type { HelpModalContent } from "@/components/onboarding/HelpModal"

export interface HelpEntry {
  tooltip: string
  modal?: HelpModalContent
}

export const HELP_CONTENT: Record<string, HelpEntry> = {
  // ============================================
  // FARMER REGISTRATION FIELDS
  // ============================================
  
  farmerCode: {
    tooltip: "Unique identifier assigned to each registered farmer for tracking collections and payments",
    modal: {
      title: "Farmer Code System",
      description: "Understanding the farmer identification system",
      content: "The farmer code is automatically generated when a new farmer is registered in the system. It provides a unique, easy-to-remember identifier that can be used for quick lookup during milk collection and payment processing.",
      examples: ["BUG-001234", "NYA-005678", "MUS-012345"],
      tips: [
        "Farmers should memorize their code for faster collection processing",
        "The prefix indicates the district (e.g., BUG = Bugesera, NYA = Nyagatare)",
        "Use the code lookup feature to quickly find farmers during collection",
      ],
    },
  },

  nationalId: {
    tooltip: "16-digit Rwanda National ID number for identity verification",
    modal: {
      title: "National ID Verification",
      description: "Why we collect national ID information",
      content: "The National ID (Indangamuntu) is required for farmer registration to ensure proper identification, prevent duplicate registrations, and comply with financial regulations for payments.",
      examples: ["1199012345678901"],
      tips: [
        "Enter all 16 digits without spaces or dashes",
        "The ID is used to verify identity during registration",
        "This information is kept confidential and secure",
      ],
      warnings: [
        "Ensure the ID number is entered correctly as it cannot be easily changed later",
        "Farmers must present their physical ID card for verification",
      ],
    },
  },

  nfcId: {
    tooltip: "NFC card/tag ID for contactless farmer identification at collection points",
    modal: {
      title: "NFC Identification System",
      description: "Contactless farmer identification",
      content: "The NFC (Near Field Communication) ID is linked to a physical card or tag that farmers can tap at collection points for instant identification. This speeds up the collection process and reduces errors.",
      tips: [
        "NFC cards should be issued after farmer registration",
        "Lost cards should be reported immediately for deactivation",
        "Each NFC ID is unique and cannot be duplicated",
      ],
    },
  },

  geoLocation: {
    tooltip: "GPS coordinates of the farmer's location for mapping and logistics planning",
    modal: {
      title: "GPS Location Capture",
      description: "Why we collect location data",
      content: "Capturing the farmer's GPS location helps with route planning for collection agents, distance calculations for transport costs, and mapping of the farmer network for better service delivery.",
      tips: [
        "Capture location at the farmer's homestead for accuracy",
        "Ensure GPS signal is strong (outdoor location preferred)",
        "Location can be updated if the farmer moves",
      ],
      warnings: [
        "Farmer consent is required before capturing location data",
        "Location data is used only for MCC operations and planning",
      ],
    },
  },

  herdSize: {
    tooltip: "Total number of dairy cattle owned by the farmer (milking and dry cows)",
    modal: {
      title: "Herd Size Information",
      description: "Recording cattle inventory",
      content: "Herd size helps estimate expected milk production capacity and plan collection logistics. It includes all dairy cattle owned by the farmer, including milking cows, dry cows, and heifers.",
      tips: [
        "Include both milking and non-milking dairy cattle",
        "Update this number when cattle are bought, sold, or calve",
        "This helps predict seasonal production patterns",
      ],
    },
  },

  paymentMethod: {
    tooltip: "Preferred method for receiving milk payments (Mobile Money, Bank, Cash, or iKOFI)",
    modal: {
      title: "Payment Methods",
      description: "Choose how you receive your payments",
      content: "Farmers can choose their preferred payment method for milk deliveries. Each method has different processing times and requirements.",
      tips: [
        "Mobile Money (MoMo) is the fastest - payments within 24 hours",
        "Bank transfers require a valid account number",
        "iKOFI wallet can be used for input purchases at the MCC",
        "Payment method can be changed at any time",
      ],
    },
  },

  cooperativeMember: {
    tooltip: "Whether the farmer is a member of a dairy cooperative",
    modal: {
      title: "Cooperative Membership",
      description: "Benefits of cooperative membership",
      content: "Dairy cooperative members often receive additional benefits such as better prices, access to inputs on credit, training opportunities, and collective bargaining power.",
      tips: [
        "Indicate the cooperative name if the farmer is a member",
        "Cooperative members may have different payment terms",
        "Some deductions (umugabane) apply to cooperative members",
      ],
    },
  },

  // ============================================
  // MILK COLLECTION FIELDS
  // ============================================

  deliveredBy: {
    tooltip: "Whether milk is delivered directly by the farmer or through a collection agent (Umucunda)",
    modal: {
      title: "Delivery Methods",
      description: "Direct farmer delivery vs Agent collection",
      content: "Milk can be delivered directly by farmers to the MCC, or collected by authorized agents (Abacunda) who aggregate milk from multiple farmers in remote areas.",
      tips: [
        "Direct delivery: Farmer brings milk to the MCC",
        "Agent delivery: Agent collects from farmer's location and delivers to MCC",
        "Agent commission is typically deducted from farmer payment",
        "Both delivery types undergo the same quality testing",
      ],
    },
  },

  collectionPeriod: {
    tooltip: "Bi-monthly payment period (1st-15th or 16th-end of month), also called 'quinzenne'",
    modal: {
      title: "Collection Periods (Quinzenne System)",
      description: "Understanding the bi-monthly payment system used in Rwanda",
      content: "Collections are organized into two periods per month for payment processing using the 'Quinzenne' system (from French 'quinzaine' meaning fortnight). Period 1 covers days 1-15, and Period 2 covers days 16 to end of month. This is the standard payment cycle used across Rwanda's dairy cooperatives.",
      tips: [
        "Period 1 (Quinzenne 1): Collections from 1st to 15th of the month",
        "Period 2 (Quinzenne 2): Collections from 16th to end of month",
        "Payments are typically processed 3-5 days after period ends",
        "This system is called 'Igice cy'ukwezi' in Kinyarwanda",
        "Check with your MCC for exact payment dates",
      ],
    },
  },

  quinzenne: {
    tooltip: "Quinzenne (French: quinzaine) means a 15-day/bi-monthly period, the standard payment cycle in Rwanda",
    modal: {
      title: "What is Quinzenne?",
      description: "Understanding the quinzenne payment system",
      content: "Quinzenne comes from the French word 'quinzaine' meaning a period of 15 days or a fortnight. In Rwanda's dairy sector, the quinzenne system divides each month into two collection and payment periods. This allows farmers to receive payments twice per month rather than waiting until month-end.",
      tips: [
        "Quinzenne 1: Day 1 to Day 15 of each month",
        "Quinzenne 2: Day 16 to end of month",
        "In Kinyarwanda: 'Igice cy'ukwezi' (half-month)",
        "Most MCCs and cooperatives use this standard system",
        "Payments are processed after each quinzenne closes",
      ],
      warnings: [
        "Collections from different quinzennes cannot be combined",
        "Ensure your period selection matches when the milk was collected",
      ],
    },
  },

  pricePerLiter: {
    tooltip: "Price paid per liter of milk (typical range: 200-350 RWF depending on quality grade)",
    modal: {
      title: "Milk Price Per Liter",
      description: "Understanding milk pricing in Rwanda",
      content: "The price per liter is determined by milk quality grade, market conditions, and MCC policies. Prices typically range from 200-350 RWF per liter for raw milk at farm gate.",
      examples: [
        "Grade A (Premium): 280-350 RWF/liter",
        "Grade B (Standard): 230-280 RWF/liter",
        "Grade C (Below Standard): 180-230 RWF/liter",
      ],
      tips: [
        "Base price is set by MCC management",
        "Quality grade affects final price (±15%)",
        "Seasonal variations may apply",
        "Check current MCC price list for accurate rates",
        "Bulk suppliers may receive volume bonuses",
      ],
      warnings: [
        "Price must be greater than 0 RWF",
        "Very high prices (>500 RWF) may indicate data entry error",
        "Rejected milk (failed quality tests) is not paid",
      ],
    },
  },

  quantity: {
    tooltip: "Amount collected in liters (milk) or kilograms (crops). Must be a positive number.",
    modal: {
      title: "Collection Quantity",
      description: "Recording accurate quantities",
      content: "Enter the exact amount of product collected. For milk, quantities are measured in liters. For crops and other commodities, quantities may be in kilograms or other units.",
      tips: [
        "Use calibrated measuring equipment for accuracy",
        "Round to one decimal place (e.g., 25.5 liters)",
        "Average daily delivery per cow: 5-15 liters",
        "Cross-check with farmer's estimate",
      ],
      warnings: [
        "Quantity must be greater than 0",
        "Unusually high quantities should be verified",
        "Ensure measuring equipment is properly calibrated",
      ],
    },
  },

  lactometerReading: {
    tooltip: "Milk density reading (26-32°L) - lower values may indicate water adulteration",
    modal: {
      title: "Lactometer Reading Guide",
      description: "Testing milk density for quality and adulteration",
      content: "The lactometer measures the specific gravity (density) of milk. Pure cow's milk at 20°C typically reads between 28-32°L. Lower readings suggest the milk may have been diluted with water.",
      tips: [
        "Normal range: 28-32°L at 20°C",
        "Below 28°L: Possible water adulteration",
        "Above 32°L: Possible removal of cream/fat",
        "Temperature affects readings - correct for temperature if needed",
      ],
      warnings: [
        "Readings below 26°L will result in milk rejection",
        "Repeated low readings may lead to farmer investigation",
      ],
    },
  },

  fatContent: {
    tooltip: "Butterfat percentage (3.0-6.0%) - affects milk grade and price",
    modal: {
      title: "Fat Content Testing",
      description: "Understanding milk fat percentage",
      content: "Fat content is measured using the Gerber method or electronic analyzer. It's a key determinant of milk quality and affects the price paid to farmers. Rwanda standard requires minimum 3.0% for Grade B milk.",
      tips: [
        "Grade A milk: >3.5% fat",
        "Grade B milk: 3.0-3.5% fat",
        "Below 3.0%: Below standard (Grade C)",
        "Fat content varies by breed, feed, and lactation stage",
      ],
    },
  },

  proteinContent: {
    tooltip: "Protein percentage (2.8-4.5%) - important for dairy product manufacturing",
    modal: {
      title: "Protein Content",
      description: "Milk protein quality parameter",
      content: "Protein content indicates the nutritional quality of milk and its suitability for processing into cheese, yogurt, and other dairy products. Higher protein content generally commands better prices.",
      tips: [
        "Normal range: 3.0-3.5% for cow's milk",
        "Higher protein improves cheese yield",
        "Protein levels affected by nutrition and genetics",
      ],
    },
  },

  antibioticTest: {
    tooltip: "Tests for antibiotic residues - positive results lead to immediate rejection",
    modal: {
      title: "Antibiotic Testing",
      description: "Why antibiotic-free milk is essential",
      content: "Milk containing antibiotic residues poses health risks to consumers and cannot be used for processing. The withdrawal period after treating a cow must be observed before resuming milk delivery.",
      tips: [
        "Observe withdrawal periods after treatment (check medicine label)",
        "Typical withdrawal: 72-96 hours for intramammary antibiotics",
        "Injectable antibiotics may require 7-14 days withdrawal",
        "Mark treated cows clearly to prevent accidental milking",
      ],
      warnings: [
        "Positive antibiotic test = immediate rejection of entire delivery",
        "Repeated violations may result in suspension",
        "Financial penalties may apply for contaminated batches",
      ],
    },
  },

  temperature: {
    tooltip: "Milk temperature at delivery (should be below 10°C for cold chain compliance)",
    modal: {
      title: "Milk Temperature Control",
      description: "Cold chain management",
      content: "Proper temperature control prevents bacterial growth and maintains milk quality. Fresh milk should be cooled to below 10°C within 2 hours of milking and maintained cold during transport.",
      tips: [
        "Target temperature: 4-8°C (optimal)",
        "Maximum acceptable: 10°C at delivery",
        "Above 15°C: Quality risk - may be rejected",
        "Use insulated containers for transport",
      ],
      warnings: [
        "High temperature accelerates bacterial growth",
        "Warm milk will sour quickly and affect payment",
      ],
    },
  },

  somaticCellCount: {
    tooltip: "SCC indicator of udder health - high counts suggest mastitis infection",
    modal: {
      title: "Somatic Cell Count (SCC)",
      description: "Understanding udder health indicators",
      content: "Somatic Cell Count measures the number of white blood cells in milk, which increase when the udder is fighting infection. High SCC indicates subclinical or clinical mastitis and reduces milk quality.",
      tips: [
        "Below 200,000: Healthy udder",
        "200,000-400,000: Borderline - monitor cow",
        "Above 400,000: Likely subclinical mastitis",
        "Above 750,000: Clinical mastitis - treat immediately",
      ],
      warnings: [
        "High SCC reduces milk shelf life",
        "Mastitic milk affects cheese and yogurt quality",
        "Identify and treat infected quarters promptly",
      ],
    },
  },

  // ============================================
  // DEDUCTION FIELDS
  // ============================================

  umugabane: {
    tooltip: "Community savings contribution (typically 5%) deducted from milk payments",
    modal: {
      title: "Umugabane (Community Savings)",
      description: "Traditional Rwandan savings practice",
      content: "Umugabane is a collective savings scheme where a portion of earnings is contributed to a community fund. Members can access these savings for emergencies, investments, or at predetermined intervals.",
      tips: [
        "Typical rate: 5% of milk payment",
        "Savings accumulate over time",
        "Can be withdrawn according to group rules",
        "Builds financial security for farmers",
      ],
    },
  },

  ejoHeza: {
    tooltip: "National long-term pension savings scheme contribution (6%)",
    modal: {
      title: "Ejo Heza Pension Scheme",
      description: "Rwanda's national long-term savings program",
      content: "Ejo Heza ('Better Tomorrow') is Rwanda's voluntary long-term savings scheme designed to provide retirement benefits and financial security. Contributions can be made through milk payment deductions.",
      tips: [
        "Standard contribution: 6% of payments",
        "Government may provide matching contributions",
        "Benefits available at retirement or in emergencies",
        "Contributions are tax-deductible",
      ],
    },
  },

  inguzanyo: {
    tooltip: "Loan repayment deduction for input credits or advances received",
    modal: {
      title: "Inguzanyo (Loan Repayment)",
      description: "Managing input credit repayments",
      content: "When farmers receive inputs (feed, veterinary products, equipment) on credit from the MCC or cooperative, the cost is deducted from future milk payments until the loan is fully repaid.",
      tips: [
        "Deduction continues until loan is cleared",
        "Check your balance regularly",
        "Interest rates vary by MCC/cooperative",
        "Early repayment may be possible",
      ],
    },
  },

  advances: {
    tooltip: "Cash advance given to farmer at collection, deducted from final payment",
    modal: {
      title: "Cash Advances",
      description: "Receiving advance payments",
      content: "Farmers may request cash advances at the time of milk delivery. These advances are recorded and deducted from the final payment at the end of the collection period.",
      tips: [
        "Advances are limited based on expected payment",
        "Maximum advance: typically 50% of estimated period earnings",
        "Frequent advances may attract a small fee",
        "Balance visible in farmer statement",
      ],
    },
  },

  agentAdvance: {
    tooltip: "Advance given to collection agent (Umucunda), handled separately from farmer payments",
    modal: {
      title: "Agent Advances",
      description: "Advances for collection agents",
      content: "Collection agents (Abacunda) may receive advances to facilitate their operations, including transport costs and farmer advances. These are tracked separately from farmer accounts.",
      tips: [
        "Agent advances are reconciled separately",
        "Commission is calculated after deducting advances",
        "Agents should keep accurate records",
      ],
    },
  },

  // ============================================
  // COMMODITY COLLECTION FIELDS
  // ============================================

  commodityType: {
    tooltip: "Category of agricultural product being collected (Dairy, Cereals, Cash Crops, etc.)",
    modal: {
      title: "Commodity Categories",
      description: "Types of products collected",
      content: "The MCC may collect various agricultural commodities beyond milk. Each category has specific quality parameters, storage requirements, and pricing methods.",
      tips: [
        "Dairy: Milk and milk products (Amata)",
        "Cereals: Maize, rice, wheat, sorghum (Ibinyampeke)",
        "Cash Crops: Coffee, tea, pyrethrum (Ibihingwa by'ubucuruzi)",
        "Pulses: Beans, soybeans, groundnuts (Imboga)",
      ],
    },
  },

  collectCommodity: {
    tooltip: "Record a delivery of agricultural products (milk, crops, etc.) from a farmer to the MCC",
    modal: {
      title: "What is 'Collect Commodity'?",
      description: "Understanding the commodity collection process",
      content: "Collecting a commodity means recording the receipt of agricultural products (milk, crops, coffee, etc.) from farmers at the MCC (Milk Collection Center) or aggregation point. This process involves identifying the farmer, measuring the quantity, testing quality, and calculating payment.",
      tips: [
        "Step 1: Identify the farmer (by code, NFC card, or name)",
        "Step 2: Select the type of commodity being delivered",
        "Step 3: Measure and record the quantity",
        "Step 4: Conduct quality tests and enter results",
        "Step 5: Record any advances or deductions",
        "Step 6: Confirm and save the collection record",
      ],
      warnings: [
        "Always verify farmer identity before recording collection",
        "Quality tests must be performed for each delivery",
        "Collection records cannot be easily modified after saving",
      ],
    },
  },

  inputUsage: {
    tooltip: "Record when farmers use agricultural inputs (fertilizers, pesticides, feed, medicines)",
    modal: {
      title: "Log Input Usage",
      description: "Tracking farm input applications",
      content: "Input usage logging tracks when farmers apply inputs like fertilizers, pesticides, animal feed, or veterinary medicines. This data helps with traceability, compliance, and advisory services.",
      tips: [
        "Select the farmer and their farm/field",
        "Choose the input from the pre-loaded catalog",
        "Enter the quantity used and application method",
        "Record the date of application",
        "For pesticides, note the pre-harvest interval (PHI)",
      ],
      warnings: [
        "Input usage affects product traceability",
        "Incorrect records may affect certification eligibility",
        "Ensure withdrawal periods are observed for animal treatments",
      ],
    },
  },

  seasonPlan: {
    tooltip: "Create a crop/livestock plan for a growing season with expected inputs and outputs",
    modal: {
      title: "Season Plans",
      description: "Planning agricultural activities",
      content: "A season plan outlines what a farmer intends to produce during a specific agricultural season, including expected acreage, inputs needed, and projected outputs. This helps MCCs forecast collections and plan input distribution.",
      tips: [
        "Select the season (Season A: Sep-Jan, Season B: Feb-Jun, Season C: Jun-Sep)",
        "Choose commodities to be produced",
        "Estimate expected quantities",
        "Plan required inputs (seeds, fertilizer, etc.)",
        "Set targets for quality and volume",
      ],
    },
  },

  qualityGrade: {
    tooltip: "Quality classification based on testing - affects pricing",
    modal: {
      title: "Quality Grading System",
      description: "How quality grades are determined",
      content: "Each commodity is graded based on specific quality parameters. The grade determines the price paid to the farmer, with higher grades receiving premium prices.",
      tips: [
        "Grade A: Premium quality, highest price",
        "Grade B: Standard quality, base price",
        "Grade C: Below standard, reduced price",
        "Rejected: Does not meet minimum standards",
      ],
    },
  },

  warehouse: {
    tooltip: "Storage facility where the commodity will be kept",
    modal: {
      title: "Warehouse Selection",
      description: "Choosing the right storage location",
      content: "Select the appropriate warehouse or storage location for the commodity being collected. Different commodities may require different storage conditions.",
      tips: [
        "Milk: Cold storage tanks",
        "Grains: Dry warehouses/silos",
        "Perishables: Cold storage rooms",
        "Check available capacity before collection",
      ],
    },
  },

  // ============================================
  // INPUT CATALOG FIELDS
  // ============================================

  inputCategory: {
    tooltip: "Type of farm input (Feed, Veterinary, Fertilizer, Seed, Pesticide, Equipment)",
    modal: {
      title: "Input Categories",
      description: "Types of farm inputs available",
      content: "Farm inputs are categorized to help farmers find what they need and to manage inventory effectively. Each category has specific storage and handling requirements.",
      tips: [
        "Feed: Animal nutrition products",
        "Veterinary: Medicines and health products",
        "Fertilizer: Soil nutrients and amendments",
        "Seed: Planting materials",
        "Pesticide: Crop protection chemicals",
        "Equipment: Tools and machinery",
      ],
    },
  },

  applicationRate: {
    tooltip: "Recommended amount of input to apply per unit area or animal",
    modal: {
      title: "Application Rates",
      description: "Using inputs correctly",
      content: "Application rates specify how much of an input should be used. Following recommended rates ensures effectiveness while avoiding waste or damage.",
      tips: [
        "Always follow label instructions",
        "Rates vary by crop/animal and condition",
        "Under-application may be ineffective",
        "Over-application can cause damage or residue issues",
      ],
    },
  },

  withdrawalPeriod: {
    tooltip: "Time to wait after using medicine before milk/meat can be sold",
    modal: {
      title: "Withdrawal Periods",
      description: "Food safety waiting times",
      content: "Withdrawal periods are mandatory waiting times after administering veterinary medicines before milk or meat from the treated animal can enter the food chain. This ensures consumer safety.",
      tips: [
        "Always check the product label for withdrawal period",
        "Mark treated animals clearly",
        "Keep records of all treatments",
        "Discard milk during withdrawal period",
      ],
      warnings: [
        "Selling milk/meat during withdrawal period is illegal",
        "Violations can result in penalties and product recalls",
      ],
    },
  },

  hazardClass: {
    tooltip: "WHO toxicity classification (Ia/Ib = Highly toxic, II = Moderately toxic, III/U = Low risk)",
    modal: {
      title: "WHO Hazard Classification",
      description: "Understanding pesticide toxicity levels",
      content: "The World Health Organization classifies pesticides by their acute toxicity to help users understand risks and take appropriate precautions.",
      tips: [
        "Class Ia/Ib (Red): Extremely/Highly hazardous - professional use only",
        "Class II (Yellow): Moderately hazardous - use with caution",
        "Class III (Blue): Slightly hazardous - safer for general use",
        "Class U (Green): Unlikely to cause harm - safest category",
      ],
      warnings: [
        "Always wear appropriate PPE for the hazard class",
        "Store pesticides according to hazard level",
        "Keep Ia/Ib products locked and labeled clearly",
      ],
    },
  },

  phi: {
    tooltip: "Pre-Harvest Interval - days to wait after spraying before harvesting",
    modal: {
      title: "Pre-Harvest Interval (PHI)",
      description: "Safe waiting periods before harvest",
      content: "The PHI is the minimum number of days that must pass between the last pesticide application and crop harvest. This allows residues to break down to safe levels.",
      tips: [
        "PHI varies by pesticide and crop",
        "Always check the product label",
        "Plan spray timing based on expected harvest date",
        "Keep spray records for traceability",
      ],
      warnings: [
        "Harvesting before PHI can result in unsafe residue levels",
        "Products may be rejected at market or export",
      ],
    },
  },

  // ============================================
  // AGENT (UMUCUNDA) FIELDS
  // ============================================

  agentCode: {
    tooltip: "Unique identifier for collection agent (Umucunda) in the system",
    modal: {
      title: "Agent Code System",
      description: "Collection agent identification",
      content: "Each collection agent (Umucunda) is assigned a unique code for tracking their collections, commissions, and performance. This code is used for all transactions.",
      tips: [
        "Agents should know their code for quick lookup",
        "Code is used to record all collections made by the agent",
        "Commission and advances are tracked by agent code",
      ],
    },
  },

  agentCommission: {
    tooltip: "Payment rate for agent per liter or kg collected from farmers",
    modal: {
      title: "Agent Commission Structure",
      description: "How agents are compensated",
      content: "Collection agents receive a commission based on the volume of product they collect and deliver to the MCC. Commission rates may vary by distance, product type, or volume.",
      tips: [
        "Commission is typically per liter or kg",
        "Rates may increase for remote areas",
        "Higher volumes may qualify for bonuses",
        "Commission is paid after deducting advances",
      ],
    },
  },
}

export function getHelpContent(key: string): HelpEntry | undefined {
  return HELP_CONTENT[key]
}

export function getTooltip(key: string): string {
  return HELP_CONTENT[key]?.tooltip ?? ""
}

export function getModalContent(key: string): HelpModalContent | undefined {
  return HELP_CONTENT[key]?.modal
}

export function getAllHelpKeys(): string[] {
  return Object.keys(HELP_CONTENT)
}
