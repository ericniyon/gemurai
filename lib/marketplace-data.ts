export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  commission: number
  category: string
  provider: string
  stock: number
  rating: number
  reviews: number
  image: string
  images?: string[]
  isNew?: boolean
  isPopular?: boolean
  tags?: string[]
}

export const products: Product[] = [
  {
    id: "1",
    name: "Mosquito Net (LLIN)",
    description: "Long-lasting insecticidal nets for malaria prevention. WHO approved and highly effective. Provides protection for up to 3 years.",
    price: 3500,
    originalPrice: 4000,
    commission: 350,
    category: "preventative",
    provider: "ADMIN",
    stock: 50,
    rating: 4.8,
    reviews: 124,
    image: "/images/products/mosquito-net.jpg",
    images: [
      "/images/products/mosquito-net-1.jpg",
      "/images/products/mosquito-net-2.jpg"
    ],
    isPopular: true,
    tags: ["malaria", "prevention", "WHO approved"]
  },
  {
    id: "2",
    name: "Water Purification Tablets",
    description: "Fast-acting water purification tablets. Safe drinking water in 30 minutes. Each tablet treats 1 liter of water.",
    price: 1200,
    commission: 120,
    category: "water",
    provider: "Aqua Safe",
    stock: 100,
    rating: 4.5,
    reviews: 89,
    image: "/images/products/water-tablets.jpg",
    isNew: true,
    tags: ["water", "purification", "emergency"]
  },
  {
    id: "3",
    name: "Contraceptive Pills",
    description: "Safe and effective oral contraceptives. 28-day pack with complete instructions. Approved by Rwanda FDA.",
    price: 2800,
    commission: 280,
    category: "reproductive",
    provider: "Family Health",
    stock: 30,
    rating: 4.7,
    reviews: 156,
    image: "/images/products/contraceptive.jpg",
    tags: ["family planning", "contraceptive", "health"]
  },
  {
    id: "4",
    name: "Oral Rehydration Salts",
    description: "WHO/UNICEF approved ORS for treating dehydration from diarrhea. Essential for every household.",
    price: 800,
    commission: 80,
    category: "preventative",
    provider: "ADMIN",
    stock: 75,
    rating: 4.6,
    reviews: 203,
    image: "/images/products/ors.jpg",
    isPopular: true,
    tags: ["dehydration", "diarrhea", "WHO approved"]
  },
  {
    id: "5",
    name: "Pregnancy Test Kit",
    description: "Accurate home pregnancy test with 99% accuracy. Results in 3 minutes. Easy to use with clear instructions.",
    price: 1500,
    commission: 150,
    category: "reproductive",
    provider: "Babyl Health",
    stock: 25,
    rating: 4.9,
    reviews: 87,
    image: "/images/products/pregnancy-test.jpg",
    tags: ["pregnancy", "test", "accurate"]
  },
  {
    id: "6",
    name: "First Aid Kit - Complete",
    description: "Comprehensive first aid kit with bandages, antiseptic, and emergency supplies. Essential for home and workplace.",
    price: 5500,
    originalPrice: 6500,
    commission: 550,
    category: "preventative",
    provider: "MedCare",
    stock: 15,
    rating: 4.4,
    reviews: 92,
    image: "/images/products/first-aid.jpg",
    isNew: true,
    tags: ["first aid", "emergency", "complete"]
  },
  {
    id: "7",
    name: "Hand Sanitizer - 500ml",
    description: "70% alcohol-based hand sanitizer. Kills 99.9% of germs. Made in Rwanda.",
    price: 2000,
    commission: 200,
    category: "preventative",
    provider: "Local Care",
    stock: 45,
    rating: 4.3,
    reviews: 67,
    image: "/images/products/sanitizer.jpg",
    tags: ["hygiene", "made in rwanda", "protection"]
  },
  {
    id: "8",
    name: "Blood Pressure Monitor",
    description: "Digital blood pressure monitor for home use. Accurate readings with memory function.",
    price: 15000,
    originalPrice: 18000,
    commission: 1500,
    category: "diagnostic",
    provider: "MedCare",
    stock: 10,
    rating: 4.7,
    reviews: 45,
    image: "/images/products/bp-monitor.jpg",
    isNew: true,
    tags: ["diagnostic", "blood pressure", "home care"]
  }
]

export const categories = [
  { id: "all", name: "All Products" },
  { id: "preventative", name: "Preventative Care" },
  { id: "water", name: "Water & Sanitation" },
  { id: "reproductive", name: "Reproductive Health" },
  { id: "diagnostic", name: "Diagnostic Tools" }
]

export const providers = [
  { id: "all", name: "All Providers" },
  { id: "ADMIN", name: "ADMIN" },
  { id: "Aqua Safe", name: "Aqua Safe Rwanda" },
  { id: "Family Health", name: "Family Health Rwanda" },
  { id: "Babyl Health", name: "Babyl Health" },
  { id: "MedCare", name: "MedCare Solutions" },
  { id: "Local Care", name: "Local Care Rwanda" }
] 