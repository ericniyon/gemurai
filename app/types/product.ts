export type ProductStatus = "active" | "inactive" | "out_of_stock"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  commission: number
  category: string
  stock: number
  image: string
  status: ProductStatus
  isNew?: boolean
  isPopular?: boolean
  originalPrice?: number
  trackingNumber?: string
  rating: number
  reviews: number
  createdAt: string
  updatedAt: string
  provider?: string
}

export interface ProductFormData {
  name: string
  description: string
  price: string
  category: string
  stock: string
  image: File | null
  commission: string
  status: ProductStatus
  isNew?: boolean
  isPopular?: boolean
  originalPrice?: string
  provider?: string
} 