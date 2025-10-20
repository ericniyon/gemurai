export interface Product {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  images?: string[]
  category: string
  stock: number
  status: "active" | "inactive" | "out_of_stock"
  rating?: number
  reviews?: number
  provider?: string
  sellerId?: string
  isNew?: boolean
  isPopular?: boolean
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface WishlistItem {
  productId: string
  addedAt: string
}

export interface Order {
  id: string
  date: string
  status: "pending" | "processing" | "delivered" | "cancelled"
  total: number
  items: {
    productId: string
    quantity: number
    price: number
  }[]
  trackingNumber?: string
}

export interface ProductFormData {
  name: string
  description?: string
  price: string
  category: string
  stock: string
  image: File | null
  status: "active" | "inactive" | "out_of_stock"
  isNew?: boolean
  isPopular?: boolean
  provider?: string
} 