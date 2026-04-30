/**
 * YDEN HarvestPlus Glossary
 * Kinyarwanda translations and definitions for agricultural terms
 * For localization and contextual help
 */

export interface GlossaryTerm {
  english: string
  kinyarwanda: string
  french?: string
  description: string
  category: "Digital" | "agriculture" | "finance" | "system" | "general"
}

export const GLOSSARY: GlossaryTerm[] = [
  // ============================================
  // Digital TERMS
  // ============================================
  {
    english: "Milk",
    kinyarwanda: "Amata",
    french: "Lait",
    description: "Liquid produced by cows for human consumption and Digital processing",
    category: "Digital",
  },
  {
    english: "Fermented Milk (Ikivuguto)",
    kinyarwanda: "Ikivuguto",
    french: "Lait fermenté",
    description: "Traditional Rwandan fermented milk, similar to yogurt. Naturally cultured with beneficial bacteria.",
    category: "Digital",
  },
  {
    english: "Cow",
    kinyarwanda: "Inka",
    french: "Vache",
    description: "Female cattle, especially one that has had a calf and is used for milk production",
    category: "Digital",
  },
  {
    english: "Calf",
    kinyarwanda: "Ikimasa",
    french: "Veau",
    description: "Young cow, especially under one year old",
    category: "Digital",
  },
  {
    english: "Herd",
    kinyarwanda: "Ubusho/Ishyamba ry'inka",
    french: "Troupeau",
    description: "Group of cattle kept together",
    category: "Digital",
  },
  {
    english: "Milking",
    kinyarwanda: "Gukama",
    french: "Traite",
    description: "Process of extracting milk from a cow",
    category: "Digital",
  },
  {
    english: "Udder",
    kinyarwanda: "Irembo",
    french: "Pis",
    description: "Mammary gland of a cow from which milk is extracted",
    category: "Digital",
  },
  {
    english: "Lactometer",
    kinyarwanda: "Igipimo cy'amata",
    french: "Lactomètre",
    description: "Device for measuring milk density to detect water adulteration",
    category: "Digital",
  },
  {
    english: "Milk Collection Center (MCC)",
    kinyarwanda: "Ikigo cy'amata",
    french: "Centre de collecte de lait",
    description: "Facility where farmers bring milk for aggregation, testing, and cooling",
    category: "Digital",
  },
  {
    english: "Butter",
    kinyarwanda: "Amavuta y'inka",
    french: "Beurre",
    description: "Digital product made from churning cream or milk",
    category: "Digital",
  },
  {
    english: "Ghee",
    kinyarwanda: "Amavuta atobuye",
    french: "Ghee",
    description: "Clarified butter with extended shelf life, used in cooking",
    category: "Digital",
  },
  {
    english: "Cheese",
    kinyarwanda: "Foromaje",
    french: "Fromage",
    description: "Digital product made from curdled milk",
    category: "Digital",
  },
  {
    english: "Yogurt",
    kinyarwanda: "Yogurt",
    french: "Yaourt",
    description: "Fermented milk product with live bacterial cultures",
    category: "Digital",
  },
  {
    english: "Cream",
    kinyarwanda: "Ireme ry'amata",
    french: "Crème",
    description: "Fat-rich portion of milk that rises to the surface",
    category: "Digital",
  },
  {
    english: "Powdered Milk",
    kinyarwanda: "Amata y'ubukungu",
    french: "Lait en poudre",
    description: "Dehydrated milk with long shelf life",
    category: "Digital",
  },
  {
    english: "Mastitis",
    kinyarwanda: "Indwara y'amabere",
    french: "Mammite",
    description: "Infection of the udder causing inflammation and affecting milk quality",
    category: "Digital",
  },

  // ============================================
  // AGRICULTURAL TERMS
  // ============================================
  {
    english: "Farmer",
    kinyarwanda: "Umuhinzi",
    french: "Agriculteur",
    description: "Person who cultivates land or raises animals for food production",
    category: "agriculture",
  },
  {
    english: "Farm",
    kinyarwanda: "Igishanga/Urugo",
    french: "Ferme",
    description: "Land used for agricultural production",
    category: "agriculture",
  },
  {
    english: "Crop",
    kinyarwanda: "Igihingwa",
    french: "Culture",
    description: "Plant cultivated for harvest",
    category: "agriculture",
  },
  {
    english: "Fertilizer",
    kinyarwanda: "Ifumbire",
    french: "Engrais",
    description: "Substance added to soil to improve plant growth",
    category: "agriculture",
  },
  {
    english: "Organic Fertilizer",
    kinyarwanda: "Ifumbire y'imborera",
    french: "Engrais organique",
    description: "Natural fertilizer from animal or plant matter (compost, manure)",
    category: "agriculture",
  },
  {
    english: "Chemical Fertilizer",
    kinyarwanda: "Ifumbire y'imiti",
    french: "Engrais chimique",
    description: "Manufactured fertilizer containing specific nutrient ratios (NPK)",
    category: "agriculture",
  },
  {
    english: "Pesticide",
    kinyarwanda: "Umuti w'ibyonnyi",
    french: "Pesticide",
    description: "Chemical substance used to kill pests and diseases",
    category: "agriculture",
  },
  {
    english: "Herbicide",
    kinyarwanda: "Umuti w'ibyatsi",
    french: "Herbicide",
    description: "Chemical to control weeds",
    category: "agriculture",
  },
  {
    english: "Insecticide",
    kinyarwanda: "Umuti w'udukoko",
    french: "Insecticide",
    description: "Chemical to kill insects",
    category: "agriculture",
  },
  {
    english: "Fungicide",
    kinyarwanda: "Umuti w'ibihumyo",
    french: "Fongicide",
    description: "Chemical to control fungal diseases",
    category: "agriculture",
  },
  {
    english: "Seeds",
    kinyarwanda: "Imbuto",
    french: "Semences",
    description: "Plant seeds for planting",
    category: "agriculture",
  },
  {
    english: "Harvest",
    kinyarwanda: "Gusarura",
    french: "Récolte",
    description: "Process of gathering mature crops",
    category: "agriculture",
  },
  {
    english: "Season A",
    kinyarwanda: "Igihembwe cya A",
    french: "Saison A",
    description: "Agricultural season from September to January (short rains)",
    category: "agriculture",
  },
  {
    english: "Season B",
    kinyarwanda: "Igihembwe cya B",
    french: "Saison B",
    description: "Agricultural season from February to June (long rains)",
    category: "agriculture",
  },
  {
    english: "Season C",
    kinyarwanda: "Igihembwe cya C",
    french: "Saison C",
    description: "Agricultural season from June to September (dry season, irrigated crops)",
    category: "agriculture",
  },
  {
    english: "Maize",
    kinyarwanda: "Ibigori",
    french: "Maïs",
    description: "Cereal crop, major staple food",
    category: "agriculture",
  },
  {
    english: "Beans",
    kinyarwanda: "Ibishyimbo",
    french: "Haricots",
    description: "Legume crop, major protein source",
    category: "agriculture",
  },
  {
    english: "Rice",
    kinyarwanda: "Umuceri",
    french: "Riz",
    description: "Cereal crop grown in wetlands",
    category: "agriculture",
  },
  {
    english: "Potato",
    kinyarwanda: "Ibirayi",
    french: "Pomme de terre",
    description: "Tuberous root vegetable",
    category: "agriculture",
  },
  {
    english: "Coffee",
    kinyarwanda: "Ikawa",
    french: "Café",
    description: "Major cash crop for export",
    category: "agriculture",
  },
  {
    english: "Tea",
    kinyarwanda: "Icyayi",
    french: "Thé",
    description: "Major cash crop for export",
    category: "agriculture",
  },

  // ============================================
  // FINANCE TERMS
  // ============================================
  {
    english: "Payment",
    kinyarwanda: "Kwishyura",
    french: "Paiement",
    description: "Money given in exchange for goods or services",
    category: "finance",
  },
  {
    english: "Advance",
    kinyarwanda: "Agahimbazamusyi/Ibibanza",
    french: "Avance",
    description: "Money paid before work is completed or goods delivered",
    category: "finance",
  },
  {
    english: "Deduction",
    kinyarwanda: "Ikurwaho",
    french: "Déduction",
    description: "Amount subtracted from payment (for loans, savings, inputs)",
    category: "finance",
  },
  {
    english: "Loan",
    kinyarwanda: "Inguzanyo",
    french: "Prêt",
    description: "Money borrowed to be repaid with interest",
    category: "finance",
  },
  {
    english: "Savings",
    kinyarwanda: "Ubwizigame",
    french: "Épargne",
    description: "Money set aside for future use",
    category: "finance",
  },
  {
    english: "Umugabane",
    kinyarwanda: "Umugabane",
    french: "Cotisation communautaire",
    description: "Community savings contribution, typically 5% of earnings",
    category: "finance",
  },
  {
    english: "Ejo Heza",
    kinyarwanda: "Ejo Heza",
    french: "Épargne à long terme",
    description: "National long-term savings scheme (typically 6% of earnings)",
    category: "finance",
  },
  {
    english: "Price per Liter",
    kinyarwanda: "Igiciro kuri litiro",
    french: "Prix par litre",
    description: "Amount paid for each liter of milk",
    category: "finance",
  },
  {
    english: "Mobile Money",
    kinyarwanda: "Amafaranga kuri telefone",
    french: "Argent mobile",
    description: "Electronic money transfer via mobile phone (MTN MoMo, Airtel Money)",
    category: "finance",
  },
  {
    english: "Bank Transfer",
    kinyarwanda: "Kohereza kuri banki",
    french: "Virement bancaire",
    description: "Money transfer to a bank account",
    category: "finance",
  },

  // ============================================
  // SYSTEM TERMS
  // ============================================
  {
    english: "Quinzenne",
    kinyarwanda: "Igice cy'ukwezi",
    french: "Quinzaine",
    description: "Bi-monthly period (15 days). Standard payment cycle in Rwanda's Digital sector.",
    category: "system",
  },
  {
    english: "Collection Period",
    kinyarwanda: "Igihe cyo gukusanya",
    french: "Période de collecte",
    description: "Time frame for milk collection (Period 1: 1st-15th, Period 2: 16th-end)",
    category: "system",
  },
  {
    english: "Morning Collection",
    kinyarwanda: "Gukusanya mu gitondo",
    french: "Collecte du matin",
    description: "Milk collection shift from 5:00 AM to 10:00 AM",
    category: "system",
  },
  {
    english: "Evening Collection",
    kinyarwanda: "Gukusanya nijoro",
    french: "Collecte du soir",
    description: "Milk collection shift from 4:00 PM to 7:00 PM",
    category: "system",
  },
  {
    english: "Farmer Code",
    kinyarwanda: "Kode y'umuhinzi",
    french: "Code agriculteur",
    description: "Unique identifier assigned to each registered farmer",
    category: "system",
  },
  {
    english: "NFC Card",
    kinyarwanda: "Ikarita NFC",
    french: "Carte NFC",
    description: "Contactless identification card for fast farmer identification",
    category: "system",
  },
  {
    english: "Quality Grade",
    kinyarwanda: "Urwego rw'ubwiza",
    french: "Grade de qualité",
    description: "Classification of milk quality (Grade A, B, C, or Rejected)",
    category: "system",
  },

  // ============================================
  // GENERAL TERMS
  // ============================================
  {
    english: "Cooperative",
    kinyarwanda: "Koperative",
    french: "Coopérative",
    description: "Organization owned and operated by farmers for mutual benefit",
    category: "general",
  },
  {
    english: "Member",
    kinyarwanda: "Umunyamuryango",
    french: "Membre",
    description: "Person who belongs to a cooperative or group",
    category: "general",
  },
  {
    english: "National ID",
    kinyarwanda: "Indangamuntu",
    french: "Carte d'identité nationale",
    description: "Official identification document (16-digit number in Rwanda)",
    category: "general",
  },
  {
    english: "District",
    kinyarwanda: "Akarere",
    french: "District",
    description: "Administrative division of Rwanda",
    category: "general",
  },
  {
    english: "Sector",
    kinyarwanda: "Umurenge",
    french: "Secteur",
    description: "Sub-division of a district",
    category: "general",
  },
  {
    english: "Cell",
    kinyarwanda: "Akagari",
    french: "Cellule",
    description: "Sub-division of a sector",
    category: "general",
  },
  {
    english: "Village",
    kinyarwanda: "Umudugudu",
    french: "Village",
    description: "Smallest administrative unit in Rwanda",
    category: "general",
  },
]

// Helper functions
export function searchGlossary(term: string): GlossaryTerm[] {
  const lowerTerm = term.toLowerCase()
  return GLOSSARY.filter(
    (entry) =>
      entry.english.toLowerCase().includes(lowerTerm) ||
      entry.kinyarwanda.toLowerCase().includes(lowerTerm) ||
      (entry.french && entry.french.toLowerCase().includes(lowerTerm)) ||
      entry.description.toLowerCase().includes(lowerTerm)
  )
}

export function getTermsByCategory(category: GlossaryTerm["category"]): GlossaryTerm[] {
  return GLOSSARY.filter((entry) => entry.category === category)
}

export function getKinyarwandaTerm(english: string): string | undefined {
  const entry = GLOSSARY.find(
    (e) => e.english.toLowerCase() === english.toLowerCase()
  )
  return entry?.kinyarwanda
}

export function getEnglishTerm(kinyarwanda: string): string | undefined {
  const entry = GLOSSARY.find(
    (e) => e.kinyarwanda.toLowerCase() === kinyarwanda.toLowerCase()
  )
  return entry?.english
}
