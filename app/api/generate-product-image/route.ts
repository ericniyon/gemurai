import { NextRequest, NextResponse } from "next/server"
import { readdir } from "fs/promises"
import { join } from "path"

// Product-specific image mapping
const productImageMap: Record<string, string> = {
  "Condom - Premium": "/img/Condom_Premium.png",
  "Bleach - Household": "/img/Bleach_Household.png",
  "Cooking Oil - Vegetable": "/img/Cooking_Oil_Vegetable.png",
  "Sugar - White Refined": "/img/Sugar_White_Refined.png",
  "Salt - Iodized": "/img/Salt_Iodized.png",
  "Toothpaste - Fresh Mint": "/img/Toothpaste_Fresh_Mint.png",
  "Toilet Paper - Soft": "/img/Toilet_Paper_Soft.png",
  "Rice - Premium Quality": "/img/Rice_Premium_Quality.png",
  "Soap Bar - Antibacterial": "/img/Soap_Bar_Antibacterial.png",
  "OMO Detergent - Powder": "/img/OMO_Detergent_Powder.png",
  "OMO Detergent Powder": "/img/OMO_Detergent_Powder.png",
  "OMO Detergent": "/img/OMO_Detergent_Powder.png",
  // Add more mappings as needed
}

// Fallback images for products without specific images
const fallbackImages = [
  "/img/WhatsApp Image 2025-08-06 at 11.28.40 (2).jpeg",
  "/img/WhatsApp Image 2025-08-06 at 11.28.40 (1).jpeg",
  "/img/WhatsApp Image 2025-08-06 at 11.28.40.jpeg",
  "/img/WhatsApp Image 2025-08-06 at 11.28.39 (1).jpeg",
  "/img/WhatsApp Image 2025-08-06 at 11.28.39.jpeg"
]

// Product image generation using product-specific images
const generateProductImage = (productName: string, category: string) => {
  // First, try to find an exact match
  if (productImageMap[productName]) {
    return {
      success: true,
      imageUrl: productImageMap[productName],
      source: "product-specific",
      category,
      productName,
      matchType: "exact"
    }
  }

  // Try to find a partial match (case-insensitive)
  const normalizedProductName = productName.toLowerCase()
  for (const [key, imagePath] of Object.entries(productImageMap)) {
    if (normalizedProductName.includes(key.toLowerCase()) || 
        key.toLowerCase().includes(normalizedProductName)) {
      return {
        success: true,
        imageUrl: imagePath,
        source: "product-specific",
        category,
        productName,
        matchType: "partial",
        matchedKey: key
      }
    }
  }

  // Use fallback images with hash-based selection
  const hash = productName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const imageIndex = Math.abs(hash) % fallbackImages.length
  const selectedImage = fallbackImages[imageIndex]
  
  return {
    success: true,
    imageUrl: selectedImage,
    source: "fallback",
    category,
    productName,
    imageIndex,
    matchType: "fallback"
  }
}

// Search for real product images (external fallback)
const searchProductImage = async (searchTerm: string) => {
  try {
    // Use a simple image search approach
    const searchQuery = encodeURIComponent(searchTerm)
    
    // Try different image search approaches
    const imageUrls = [
      `https://source.unsplash.com/400x300/?${searchQuery}`,
      `https://picsum.photos/400/300?random=${Date.now()}`,
      `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodeURIComponent(searchTerm)}`
    ]
    
    return {
      success: true,
      imageUrl: imageUrls[0], // Use Unsplash source
      source: "external-search",
      searchTerm,
      fallbacks: imageUrls.slice(1)
    }
  } catch (error) {
    console.error("Error searching for product image:", error)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { productName, category } = await req.json()

    if (!productName) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      )
    }

    // Use product-specific images as primary source
    const productResult = generateProductImage(productName, category)
    
    if (productResult && productResult.imageUrl) {
      return NextResponse.json(productResult)
    }

    // Fallback to external search if local images fail
    const searchResult = await searchProductImage(productName)
    
    if (searchResult && searchResult.imageUrl) {
      return NextResponse.json(searchResult)
    }

    // Final fallback to placeholder
    const fallbackUrl = `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodeURIComponent(productName || "Product")}`
    
    return NextResponse.json({
      success: true,
      imageUrl: fallbackUrl,
      source: "placeholder",
      productName
    })

  } catch (error) {
    console.error("Error generating product image:", error)
    
    // Return a fallback placeholder
    const { productName } = await req.json()
    const fallbackUrl = `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodeURIComponent(productName || "Product")}`
    
    return NextResponse.json({
      success: true,
      imageUrl: fallbackUrl,
      source: "fallback",
      error: error instanceof Error ? error.message : "Failed to generate image"
    })
  }
} 