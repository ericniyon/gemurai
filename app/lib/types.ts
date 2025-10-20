export type UserRole = "dcc" | "employer" | "consumer" | "admin"

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  image?: string
  createdAt: Date
  updatedAt: Date
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  commission: number
  createdAt: Date
  updatedAt: Date
}

export type Order = {
  id: string
  userId: string
  products: {
    id: string
    quantity: number
    price: number
  }[]
  total: number
  status: "pending" | "processing" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

export type Job = {
  id: string
  title: string
  company: string
  location: string
  type: "full-time" | "part-time" | "contract"
  description: string
  requirements: string[]
  responsibilities: string[]
  salary: {
    min: number
    max: number
    currency: string
  }
  status: "draft" | "published" | "closed"
  createdAt: Date
  updatedAt: Date
}

export type Course = {
  id: string
  title: string
  description: string
  category: string
  level: "beginner" | "intermediate" | "advanced"
  duration: number
  lessons: {
    id: string
    title: string
    duration: number
    completed: boolean
  }[]
  progress: number
  createdAt: Date
  updatedAt: Date
}

export type Application = {
  id: string
  userId: string
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected"
  type: "dcc" | "job"
  documents: {
    id: string
    name: string
    url: string
    type: string
    status: "pending" | "verified" | "rejected"
  }[]
  createdAt: Date
  updatedAt: Date
} 