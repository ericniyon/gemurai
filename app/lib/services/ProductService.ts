import { prisma } from "@/lib/database"
import { Product, Prisma } from "@prisma/client"
import { AuthUser } from "@/lib/auth"

// Default product images mapping
const getDefaultProductImage = (productName: string, category: string): string => {
  const name = productName.toLowerCase()
  const cat = category.toLowerCase()
  
  // Map based on product name
  if (name.includes('bleach') || name.includes('cleaning')) {
    return '/img/Bleach_Household.png'
  }
  if (name.includes('oil') || name.includes('cooking')) {
    return '/img/Cooking_Oil_Vegetable.png'
  }
  if (name.includes('sugar') || name.includes('sweet')) {
    return '/img/Sugar_White_Refined.png'
  }
  if (name.includes('salt')) {
    return '/img/Salt_Iodized.png'
  }
  if (name.includes('toothpaste') || name.includes('dental')) {
    return '/img/Toothpaste_Fresh_Mint.png'
  }
  if (name.includes('toilet') || name.includes('paper')) {
    return '/img/Toilet_Paper_Soft.png'
  }
  if (name.includes('rice')) {
    return '/img/Rice_Premium_Quality.png'
  }
  if (name.includes('soap') || name.includes('wash')) {
    return '/img/Soap_Bar_Antibacterial.png'
  }
  if (name.includes('detergent') || name.includes('omo')) {
    return '/img/OMO_Detergent_Powder.png'
  }
  if (name.includes('condom') || name.includes('protection')) {
    return '/img/Condom_Premium.png'
  }
  
  // Map based on category
  if (cat.includes('household') || cat.includes('cleaning')) {
    return '/img/Bleach_Household.png'
  }
  if (cat.includes('cooking') || cat.includes('food')) {
    return '/img/Cooking_Oil_Vegetable.png'
  }
  if (cat.includes('personal') || cat.includes('hygiene')) {
    return '/img/Toothpaste_Fresh_Mint.png'
  }
  if (cat.includes('health') || cat.includes('medical')) {
    return '/img/Condom_Premium.png'
  }
  
  // Default fallback
  return '/img/Cooking_Oil_Vegetable.png'
}

// Helper function to get product images
const getProductImages = (product: any): string[] => {
  // If product has images, use them
  if (product.images && product.images.length > 0) {
    return product.images
  }
  
  // If product has a single image, use it
  if (product.image) {
    return [product.image]
  }
  
  // Generate default images based on product
  const defaultImage = getDefaultProductImage(product.name, product.category)
  return [defaultImage]
}

export class ProductService {
  static async getProducts(user: AuthUser) {
    try {
      const filter: any = {}
      
      // If user is EMPLOYER, only show their products
      if (user.role === "EMPLOYER") {
        filter.sellerId = user.id
      }

      const products = await prisma.product.findMany({
        where: filter,
        orderBy: { createdAt: "desc" },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return products.map(product => ({
        ...product,
        image: product.image ? 
          (product.image.startsWith('/') ? product.image : `/uploads/${product.image}`)
          : getDefaultProductImage(product.name, product.category),
        images: getProductImages(product),
        status: product.status || "active" as const
      }))
    } catch (error) {
      console.error("Error in ProductService.getProducts:", error)
      throw error
    }
  }

  static async getProductById(id: string, user: AuthUser) {
    try {
      const filter: any = { id }
      
      // If user is EMPLOYER, only allow viewing their products
      if (user.role === "EMPLOYER") {
        filter.sellerId = user.id
      }

      const product = await prisma.product.findFirst({
        where: filter,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!product) return null

      return {
        ...product,
        image: product.image ? 
          (product.image.startsWith('/') ? product.image : `/uploads/${product.image}`)
          : getDefaultProductImage(product.name, product.category),
        images: getProductImages(product),
        status: product.status || "active" as const
      }
    } catch (error) {
      console.error("Error in ProductService.getProductById:", error)
      throw error
    }
  }

  static async createProduct(data: any, user: AuthUser) {
    try {
      // Verify user is an employer
      if (user.role !== "EMPLOYER") {
        throw new Error("Unauthorized: Only employers can create products")
      }

      // Verify user exists in database and has correct role
      const dbUser = await prisma.user.findUnique({
        where: { 
          id: user.id,
          role: "EMPLOYER",
          isActive: true
        }
      })

      if (!dbUser) {
        throw new Error("User not found or not authorized as employer")
      }

      // Add required permissions if they don't exist
      if (!user.permissions.includes("products.create")) {
        user.permissions.push("products.create")
      }

      // Ensure image paths are properly formatted
      if (typeof data.image === 'string' && !data.image.startsWith('/')) {
        data.image = `/uploads/${data.image}`
      }
      if (Array.isArray(data.images)) {
        data.images = data.images.map(img => 
          typeof img === 'string' && !img.startsWith('/') ? `/uploads/${img}` : img
        )
      }

      // Create the product with proper data
      const product = await prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          businessPrice: data.businessPrice ? parseFloat(data.businessPrice) : null,
          category: data.category,
          stock: parseInt(data.stock) || 0,
          commission: parseFloat(data.commission) || 0,
          status: data.status || "active",
          isActive: true,
          sellerId: dbUser.id, // Use the verified user ID
          image: data.image,
          images: data.images || [],
          subcategory: data.subcategory,
          manufacturer: data.manufacturer,
          countryOfOrigin: data.countryOfOrigin,
          warrantyInfo: data.warrantyInfo,
          minOrderQuantity: parseInt(data.minOrderQuantity) || 1,
          maxOrderQuantity: data.maxOrderQuantity ? parseInt(data.maxOrderQuantity) : null,
          shippingWeight: data.shippingWeight ? parseFloat(data.shippingWeight) : null,
          isFragile: data.isFragile === 'true' || data.isFragile === true,
          requiresSpecialHandling: data.requiresSpecialHandling === 'true' || data.requiresSpecialHandling === true,
          certifications: data.certifications ? (Array.isArray(data.certifications) ? data.certifications : []) : []
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return {
        ...product,
        image: product.image ? 
          (product.image.startsWith('/') ? product.image : `/uploads/${product.image}`)
          : getDefaultProductImage(product.name, product.category),
        images: getProductImages(product)
      }
    } catch (error) {
      console.error("Error in ProductService.createProduct:", error)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("A product with this name already exists")
        }
      }
      throw error
    }
  }

  static async updateProduct(id: string, data: any, user: AuthUser) {
    try {
      // Verify user exists in database and has correct role
      const dbUser = await prisma.user.findUnique({
        where: { 
          id: user.id,
          isActive: true
        }
      })

      if (!dbUser) {
        throw new Error("User not found")
      }

      // For EMPLOYER role, verify they own the product
      if (dbUser.role === "EMPLOYER") {
        const product = await prisma.product.findUnique({
          where: { id },
          select: { sellerId: true }
        })

        if (!product || product.sellerId !== dbUser.id) {
          throw new Error("Unauthorized: You can only edit your own products")
        }
      }

      // For non-EMPLOYER roles, verify they have edit permission
      if (dbUser.role !== "EMPLOYER" && !dbUser.permissions?.includes("products.edit")) {
        throw new Error("Unauthorized: Missing products.edit permission")
      }

      // Ensure image paths are properly formatted
      if (typeof data.image === 'string' && !data.image.startsWith('/')) {
        data.image = `/uploads/${data.image}`
      }
      if (Array.isArray(data.images)) {
        data.images = data.images.map(img => 
          typeof img === 'string' && !img.startsWith('/') ? `/uploads/${img}` : img
        )
      }

      // Parse numeric values
      const updateData = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        businessPrice: data.businessPrice ? parseFloat(data.businessPrice) : null,
        category: data.category,
        stock: parseInt(data.stock) || 0,
        commission: parseFloat(data.commission) || 0,
        status: data.status || "active",
        image: data.image,
        images: data.images || [],
        subcategory: data.subcategory,
        manufacturer: data.manufacturer,
        countryOfOrigin: data.countryOfOrigin,
        warrantyInfo: data.warrantyInfo,
        minOrderQuantity: parseInt(data.minOrderQuantity) || 1,
        maxOrderQuantity: data.maxOrderQuantity ? parseInt(data.maxOrderQuantity) : null,
        shippingWeight: data.shippingWeight ? parseFloat(data.shippingWeight) : null,
        isFragile: data.isFragile === 'true' || data.isFragile === true,
        requiresSpecialHandling: data.requiresSpecialHandling === 'true' || data.requiresSpecialHandling === true,
        certifications: data.certifications ? (Array.isArray(data.certifications) ? data.certifications : []) : [],
        isActive: true,
        updatedAt: new Date()
      }

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return {
        ...product,
        image: product.image ? 
          (product.image.startsWith('/') ? product.image : `/uploads/${product.image}`)
          : getDefaultProductImage(product.name, product.category),
        images: getProductImages(product),
        status: product.status || "active" as const
      }
    } catch (error) {
      console.error("Error in ProductService.updateProduct:", error)
      throw error
    }
  }

  static async deleteProduct(id: string, user: AuthUser) {
    try {
      // Verify user has permission to delete products
      if (!user.permissions?.includes("products.delete")) {
        throw new Error("Unauthorized: Missing products.delete permission")
      }

      // For EMPLOYER role, verify they own the product
      if (user.role === "EMPLOYER") {
        const product = await prisma.product.findUnique({
          where: { id },
          select: { sellerId: true }
        })

        if (!product || product.sellerId !== user.id) {
          throw new Error("Unauthorized: You can only delete your own products")
        }
      }

      await prisma.product.delete({
        where: { id }
      })
    } catch (error) {
      console.error("Error in ProductService.deleteProduct:", error)
      throw error
    }
  }
} 