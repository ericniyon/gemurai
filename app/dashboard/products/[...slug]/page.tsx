"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import ProductsPage from "../page"

export default function DynamicProductsPage() {
  const router = useRouter()

  useEffect(() => {
    // Any initialization logic can go here
  }, [])

  return <ProductsPage />
} 