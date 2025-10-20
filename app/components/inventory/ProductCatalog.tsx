"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Package, Plus, Search, Edit, Trash2, MoreHorizontal, DollarSign, Package2, AlertCircle, Upload, X, Image as ImageIcon, ArrowUpDown, Loader2, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface Product {
  id: string
  name: string
  description?: string
  internalReference?: string
  category: string
  barcode?: string
  productType: string
  unitOfMeasure: string
  reorderPoint?: number
  isActive: boolean
  image?: string
  images?: string[]
  createdAt: string
  costPrice?: number
  price?: number
  commission?: number
  stock?: number
}

interface ProductCatalogProps {
  onRefresh?: () => void
}

export function ProductCatalog({ onRefresh }: ProductCatalogProps) {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>("")
  const [previewImageAlt, setPreviewImageAlt] = useState<string>("")
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    internalReference: "",
    category: "",
    barcode: "",
    productType: "PHYSICAL",
    unitOfMeasure: "Units",
    reorderPoint: "10",
    stock: "0",
    image: "",
    images: [] as string[],
    costPrice: "",
    price: "",
    businessPrice: "",
    commission: ""
  })

  // Calculate commission automatically
  const calculateCommission = (salesPrice: string, purchasePrice: string) => {
    const sales = parseFloat(salesPrice) || 0
    const purchase = parseFloat(purchasePrice) || 0
    const commission = Math.max(0, sales - purchase)
    return commission.toFixed(2)
  }

  const handlePriceChange = (field: 'costPrice' | 'price', value: string) => {
    const newFormData = { ...formData, [field]: value }
    
    // Auto-calculate commission when either price changes
    if (field === 'costPrice' || field === 'price') {
      const newCommission = calculateCommission(
        field === 'price' ? value : formData.price,
        field === 'costPrice' ? value : formData.costPrice
      )
      newFormData.commission = newCommission
    }
    
    setFormData(newFormData)
  }
  const { toast } = useToast()

  // Utility function to convert image URLs for production
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl || imageUrl.trim() === '') return null
    
    console.log('🖼️ getImageUrl called with:', imageUrl)
    
    // If it's already a full URL (including Cloudinary), return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      console.log('🖼️ Full URL detected, returning as is:', imageUrl)
      return imageUrl
    }
    
    // Check if this is a Cloudinary URL pattern (should not happen, but just in case)
    if (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com')) {
      console.log('🖼️ Cloudinary URL detected, returning as is:', imageUrl)
      return imageUrl
    }
    
    // For production, use the correct domain
    const isProduction = window.location.hostname === 'www.djyh.rw' || window.location.hostname === 'djyh.rw'
    const baseUrl = isProduction ? 'https://www.djyh.rw' : window.location.origin
    
    // For all relative URLs, make them absolute
    const finalUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    console.log('🖼️ Converted to full URL:', finalUrl)
    console.log('🖼️ Environment:', isProduction ? 'Production' : 'Development')
    console.log('🖼️ Base URL:', baseUrl)
    
    return finalUrl
  }

  const categories = ["Electronics", "Clothing", "Books", "Home & Garden", "Sports", "Toys", "Health", "Beauty", "Food", "Other"]
  const productTypes = [
    { value: "PHYSICAL", label: "Physical Product" },
    { value: "DIGITAL", label: "Digital Product" },
    { value: "SERVICE", label: "Service" }
  ]

  const unitOfMeasureOptions = [
    "Units", "Pieces", "Kg", "g", "L", "mL", "Box", "Pack", "Set", "Meter", "cm", "mm", "Dozen", "Pair", "Roll", "Bottle", "Bag", "Carton", "Bundle", "Sheet", "Tube", "Tablet", "Capsule"
  ]

  const generateInternalReference = () => {
    // Generate a simple reference
    const timestamp = Date.now().toString().slice(-6)
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase()
    setFormData({ ...formData, internalReference: `SKU-${timestamp}-${randomStr}` })
  }

  const handleImageUpload = async (file: File) => {
    try {
      console.log('Uploading file:', file.name, file.size, file.type)
      
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const data = await response.json()
      console.log('Upload response:', data)
      
      if (data.success) {
        console.log('Upload successful, URL:', data.url)
        // Ensure the URL is properly formatted
        let imageUrl = data.url
        if (imageUrl && !imageUrl.startsWith('http')) {
          // If it's a relative URL, make sure it starts with /
          if (!imageUrl.startsWith('/')) {
            imageUrl = `/${imageUrl}`
          }
        }
        console.log('Final image URL:', imageUrl)
        return imageUrl
      } else {
        throw new Error(data.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      })
      return null
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('🖼️ Image change triggered, file:', file.name, 'Size:', file.size, 'Type:', file.type)

    const imageUrl = await handleImageUpload(file)
    console.log('📤 Image upload result:', imageUrl)
    
    if (imageUrl) {
      setFormData(prev => {
        const newData = {
        ...prev,
          image: imageUrl
        }
        console.log('✅ Updated formData with image:', newData)
        return newData
      })
    } else {
      console.error('❌ Failed to get image URL from upload')
    }
  }

  const handleMultipleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    console.log('🖼️ Multiple images change triggered, files:', files.map(f => f.name))

    const uploadPromises = files.map(file => handleImageUpload(file))
    const uploadedUrls = await Promise.all(uploadPromises)
    const successfulUrls = uploadedUrls.filter(url => url !== null) as string[]

    console.log('📤 Multiple images upload results:', successfulUrls)
    
    if (successfulUrls.length > 0) {
      setFormData(prev => {
        const newData = {
          ...prev,
          images: [...prev.images, ...successfulUrls]
        }
        console.log('✅ Updated formData with multiple images:', newData)
        return newData
      })
    } else {
      console.error('❌ Failed to upload any images')
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleImagePreview = (imageUrl: string, alt: string) => {
    setPreviewImage(imageUrl)
    setPreviewImageAlt(alt)
    setIsImagePreviewOpen(true)
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/v1/superadmin/products", { credentials: "include" })
      const data = await response.json()
      console.log('Fetched products data:', data)
      
      if (data.success) {
        const products = data.products || []
        console.log('Products with image data:', products.map(p => ({ 
          name: p.name, 
          image: p.image, 
          images: p.images 
        })))
        setProducts(products)
      } else {
        throw new Error(data.error || "Failed to fetch products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({ title: "Error", description: "Failed to fetch products", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    // Required fields validation
    if (!formData.name.trim()) {
      errors.name = "Product name is required"
    }
    
    if (!formData.internalReference.trim()) {
      errors.internalReference = "Internal reference is required"
    }
    
    if (!formData.category) {
      errors.category = "Category is required"
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      errors.stock = "Stock quantity must be 0 or greater"
    }
    
    // Price validation
    if (formData.price && parseFloat(formData.price) < 0) {
      errors.price = "Sales price cannot be negative"
    }
    
    if (formData.costPrice && parseFloat(formData.costPrice) < 0) {
      errors.costPrice = "Purchase price cannot be negative"
    }
    
    // Commission validation
    if (formData.price && formData.costPrice) {
      const salesPrice = parseFloat(formData.price)
      const purchasePrice = parseFloat(formData.costPrice)
      if (salesPrice < purchasePrice) {
        errors.commission = "Sales price should be greater than or equal to purchase price"
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateProduct = async () => {
    // Clear previous validation errors
    setValidationErrors({})
    
    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      // Debug logging
      console.log('Creating product with formData:', formData)
      console.log('Image field:', formData.image)
      
      // Handle image URL for API
      let imageUrlForApi = formData.image
      if (imageUrlForApi && (imageUrlForApi.startsWith('http://') || imageUrlForApi.startsWith('https://'))) {
        // Check if it's a Cloudinary URL - keep it as full URL
        if (imageUrlForApi.includes('cloudinary.com') || imageUrlForApi.includes('res.cloudinary.com')) {
          console.log('🖼️ Keeping Cloudinary URL as full URL:', imageUrlForApi)
        } else {
          // Convert other full URLs back to relative URL for API
          const url = new URL(imageUrlForApi)
          imageUrlForApi = url.pathname
          console.log('🔄 Converted full URL to relative for API:', imageUrlForApi)
        }
      }
      
      const productData = {
          ...formData,
          reorderPoint: formData.reorderPoint ? parseInt(formData.reorderPoint) : null,
          stock: formData.stock ? parseInt(formData.stock) : 0,
        image: imageUrlForApi,
        images: formData.images,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
          price: formData.price ? parseFloat(formData.price) : undefined,
          businessPrice: formData.businessPrice ? parseFloat(formData.businessPrice) : undefined,
          commission: formData.commission ? parseFloat(formData.commission) : undefined
      }
      
      console.log('Product data being sent:', productData)
      
      const response = await fetch("/api/v1/superadmin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
        credentials: "include"
      })

      const data = await response.json()
      if (data.success) {
        toast({ title: "Success", description: "Product created successfully" })
        fetchProducts()
        setIsCreateDialogOpen(false)
        resetForm()
        setValidationErrors({})
        onRefresh?.()
      } else {
        // Handle API validation errors
        if (data.errors && typeof data.errors === 'object') {
          setValidationErrors(data.errors)
          toast({
            title: "Validation Error",
            description: "Please fix the errors in the form",
            variant: "destructive",
          })
        } else {
          throw new Error(data.error || data.message || "Failed to create product")
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    try {
      setIsUpdating(true)
      
      // Debug logging
      console.log('🔄 Updating product with formData:', formData)
      console.log('🖼️ Image field in formData:', formData.image)
      console.log('🖼️ Image field type:', typeof formData.image)
      console.log('🖼️ Image field length:', formData.image?.length)
      
      // Handle image URL for API
      let imageUrlForApi = formData.image
      if (imageUrlForApi && (imageUrlForApi.startsWith('http://') || imageUrlForApi.startsWith('https://'))) {
        // Check if it's a Cloudinary URL - keep it as full URL
        if (imageUrlForApi.includes('cloudinary.com') || imageUrlForApi.includes('res.cloudinary.com')) {
          console.log('🖼️ Keeping Cloudinary URL as full URL:', imageUrlForApi)
        } else {
          // Convert other full URLs back to relative URL for API
          const url = new URL(imageUrlForApi)
          imageUrlForApi = url.pathname
          console.log('🔄 Converted full URL to relative for API:', imageUrlForApi)
        }
      }
      
      const productData = {
          ...formData,
          reorderPoint: formData.reorderPoint ? parseInt(formData.reorderPoint) : null,
          stock: formData.stock ? parseInt(formData.stock) : 0,
        image: imageUrlForApi,
        images: formData.images,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
          price: formData.price ? parseFloat(formData.price) : undefined,
          businessPrice: formData.businessPrice ? parseFloat(formData.businessPrice) : undefined,
          commission: formData.commission ? parseFloat(formData.commission) : undefined
      }
      
      console.log('📤 Product data being sent:', productData)
      console.log('🖼️ Image in productData:', productData.image)
      
      const response = await fetch(`/api/v1/superadmin/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
        credentials: "include"
      })

      const data = await response.json()
      console.log('📥 API response:', data)
      console.log('🖼️ Updated product image:', data.product?.image)
      
      if (data.success) {
        toast({ title: "Success", description: "Product updated successfully" })
        fetchProducts()
        setIsEditDialogOpen(false)
        setEditingProduct(null)
        resetForm()
        onRefresh?.()
      } else {
        throw new Error(data.error || "Failed to update product")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      setIsDeleting(true)
      console.log("Attempting to delete product:", productId)
      
      const response = await fetch(`/api/v1/superadmin/products/${productId}`, {
        method: "DELETE",
        credentials: "include"
      })

      console.log("Delete response status:", response.status)
      console.log("Delete response headers:", Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log("Delete response data:", data)
      
      if (data.success) {
        toast({ title: "Deleted", description: data.message || "Product deleted successfully" })
        fetchProducts()
        onRefresh?.()
      } else {
        throw new Error(data.error || "Failed to delete product")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setDeletingProduct(null)
    }
  }

  const handleEditProduct = (product: Product) => {
    console.log('✏️ Editing product:', product.name)
    console.log('🖼️ Product image field:', product.image)
    console.log('🖼️ Product image type:', typeof product.image)
    console.log('🖼️ Product image length:', product.image?.length)
    console.log('🖼️ Product images array:', product.images)
    
    setEditingProduct(product)
    
    // Calculate commission for existing products
    const calculatedCommission = calculateCommission(
      product.price?.toString() || "",
      product.costPrice?.toString() || ""
    )
    
    const formDataToSet = {
      name: product.name,
      description: product.description || "",
      internalReference: product.internalReference || "",
      category: product.category,
      barcode: product.barcode || "",
      productType: product.productType,
      unitOfMeasure: product.unitOfMeasure,
      reorderPoint: product.reorderPoint?.toString() || "10",
      stock: product.stock?.toString() || "0",
      image: product.image || "",
      images: product.images || [],
      costPrice: product.costPrice?.toString() || "",
      price: product.price?.toString() || "",
      commission: product.commission?.toString() || calculatedCommission
    }
    
    console.log('📝 Setting form data:', formDataToSet)
    console.log('🖼️ Image in form data to set:', formDataToSet.image)
    setFormData(formDataToSet)
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      internalReference: "",
      category: "",
      barcode: "",
      productType: "PHYSICAL",
      unitOfMeasure: "Units",
      reorderPoint: "10",
      stock: "0",
      image: "",
      images: [],
      costPrice: "",
      price: "",
      commission: ""
    })
    setValidationErrors({})
  }

  // Column definitions for the data table
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Product
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="space-y-1">
            <p className="font-semibold text-gray-900 text-base">{product.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">{product.barcode || "No barcode"}</p>
              {product.category && (
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50">
                  {product.category}
                </Badge>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const product = row.original
        // Get the best available image: main image first, then first image from images array
        const displayImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : null)
        
        // Debug logging to check image data
        console.log(`🖼️ Product: ${product.name}`)
        console.log(`  - Main Image: "${product.image}"`)
        console.log(`  - Images Array:`, product.images)
        console.log(`  - Display Image: "${displayImage}"`)
        
        const finalImageUrl = displayImage ? getImageUrl(displayImage) : null
        
        // Debug logging to check image data
        console.log(`🖼️ Product: ${product.name}`)
        console.log(`  - Original Image: "${displayImage}"`)
        console.log(`  - Final URL: "${finalImageUrl}"`)
        console.log(`  - Product image field: "${product.image}"`)
        console.log(`  - Product images array:`, product.images)
        console.log(`  - Has displayImage: ${!!displayImage}`)
        console.log(`  - Has finalImageUrl: ${!!finalImageUrl}`)
        
        // Test with a known working image
        if (product.name === "Sur'Eau Water Purifier - 150ml Bottle for Family Safety") {
          console.log(`🧪 Testing with known product: ${product.name}`)
          console.log(`🧪 Current image: "${product.image}"`)
          console.log(`🧪 Should show: ${product.image === '/uploads/test-image.jpg' ? 'BROKEN IMAGE (orange warning)' : 'UNKNOWN'}`)
        }
        
        return (
          <div className="flex items-center justify-center">
            {finalImageUrl ? (
              <div 
                className="h-20 w-20 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer group"
                onClick={() => handleImagePreview(finalImageUrl, product.name)}
                title="Click to view larger image"
              >
                <img
                  src={finalImageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  style={{ minWidth: '80px', minHeight: '80px' }}
                  onLoad={(e) => {
                    console.log(`✅ Image loaded successfully: ${finalImageUrl}`)
                    console.log(`Image element:`, e.target)
                  }}
                  onError={(e) => {
                    console.error(`❌ Failed to load image: ${finalImageUrl}`)
                    console.error(`Error event:`, e)
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.parentElement!.innerHTML = `
                      <div class="h-20 w-20 bg-orange-100 rounded-xl flex items-center justify-center border-2 border-orange-200" title="Image file not found">
                        <svg class="h-10 w-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                      </div>
                    `
                  }}
                />
              </div>
            ) : (
              <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-md border-2 border-blue-200" title="No image uploaded">
                <Package2 className="h-10 w-10 text-blue-600" />
              </div>
            )}
          </div>
        )
      },
    },

    {
      accessorKey: "costPrice",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Purchase Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const costPrice = row.getValue("costPrice") as number
        return (
          <div className="text-right">
            <span className="font-semibold text-gray-800 text-base">
              {costPrice !== undefined ? `${costPrice.toLocaleString()} RWF` : '-'}
            </span>
          </div>
        )
      },
    },

    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Sales Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const price = row.getValue("price") as number
        return (
          <div className="text-right">
            <span className="font-bold text-blue-700 text-base">
              {price !== undefined ? `${price.toLocaleString()} RWF` : '-'}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "commission",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Commission
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const commission = row.getValue("commission") as number
        const costPrice = row.original.costPrice as number
        const price = row.original.price as number
        
        // Calculate commission if not set or if it's 0 but we have prices
        let displayCommission = commission
        if (commission === undefined || commission === null || (commission === 0 && price && costPrice)) {
          if (price && costPrice) {
            displayCommission = Math.max(0, price - costPrice)
          } else {
            displayCommission = 0
          }
        }
        
        // Handle edge cases
        if (displayCommission === undefined || displayCommission === null) {
          displayCommission = 0
        }
        
        return (
          <div className="text-right">
            <span className="font-bold text-purple-700 text-base">
              {displayCommission > 0 ? `${displayCommission.toFixed(2)} RWF` : '0.00 RWF'}
            </span>
          </div>
        )
      },
    },

    {
      accessorKey: "stock",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Quantity
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const stock = row.getValue("stock") as number
        const unitOfMeasure = row.original.unitOfMeasure || "Units"
        const reorderPoint = row.original.reorderPoint || 10
        
        // Determine color and icon based on stock level
        let textColor = "text-green-600"
        let stockText = `${stock} ${unitOfMeasure}`
        let Icon = TrendingUp
        
        if (stock === 0) {
          textColor = "text-red-600"
          stockText = `Out of Stock (0 ${unitOfMeasure})`
          Icon = AlertTriangle
        } else if (stock <= reorderPoint) {
          textColor = "text-orange-600"
          stockText = `${stock} ${unitOfMeasure} (Low Stock)`
          Icon = TrendingDown
        }
        
        return (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              stock === 0 ? 'bg-red-100' : 
              stock <= reorderPoint ? 'bg-orange-100' : 'bg-green-100'
            }`}>
              <Icon className={`h-5 w-5 ${
                stock === 0 ? 'text-red-600' : 
                stock <= reorderPoint ? 'text-orange-600' : 'text-green-600'
              }`} />
            </div>
            <div className="text-left">
              <span className={`font-bold text-base ${
                stock === 0 ? 'text-red-700' : 
                stock <= reorderPoint ? 'text-orange-700' : 'text-green-700'
              }`}>
                {stock !== undefined && stock !== null ? stock : 0}
              </span>
              <p className="text-sm text-gray-500">{unitOfMeasure}</p>
              {stock <= reorderPoint && stock > 0 && (
                <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 bg-orange-50 mt-1">
                  Low Stock
                </Badge>
              )}
              {stock === 0 && (
                <Badge variant="outline" className="text-xs text-red-600 border-red-200 bg-red-50 mt-1">
                  Out of Stock
                </Badge>
              )}
            </div>
          </div>
        )
      },
    },

    ...(user?.role !== "BRANCH_MANAGER" ? [{
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-xl rounded-lg">
              <DropdownMenuItem 
                onClick={() => handleEditProduct(product)} 
                className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
              >
                <Edit className="mr-3 h-4 w-4" />
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => { setDeletingProduct(product); setIsDeleteDialogOpen(true) }}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer transition-colors duration-200"
              >
                <Trash2 className="mr-3 h-4 w-4" />
                Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }] : []),
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          {user?.role !== "BRANCH_MANAGER" && (
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white rounded-xl border-0">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="text-2xl font-bold text-gray-900">Create New Product</DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">Add a new product to your catalog with detailed information</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Package className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                      className={`h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors ${
                        validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    {validationErrors.name && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internalReference" className="text-sm font-medium text-gray-700">Internal Reference *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="internalReference"
                      value={formData.internalReference}
                      onChange={(e) => setFormData({ ...formData, internalReference: e.target.value })}
                      placeholder="Enter internal reference"
                      className={`h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors flex-1 ${
                        validationErrors.internalReference ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    <Button onClick={generateInternalReference} className="h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Generate SKU
                    </Button>
                  </div>
                  {validationErrors.internalReference && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.internalReference}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter product description"
                    rows={3}
                    className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Product Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Package2 className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className={`h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors ${
                        validationErrors.category ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.category && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.category}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productType" className="text-sm font-medium text-gray-700">Product Type</Label>
                    <Select value={formData.productType} onValueChange={(value) => setFormData({ ...formData, productType: value })}>
                      <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {productTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="barcode" className="text-sm font-medium text-gray-700">Barcode</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="Enter barcode"
                      className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitOfMeasure" className="text-sm font-medium text-gray-700">Unit of Measure</Label>
                    <Select value={formData.unitOfMeasure} onValueChange={value => setFormData({ ...formData, unitOfMeasure: value })}>
                      <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {unitOfMeasureOptions.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPrice" className="text-sm font-medium text-gray-700">Purchase Price</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={e => handlePriceChange('costPrice', e.target.value)}
                      placeholder="Enter purchase price in RWF"
                      className={`h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors ${
                        validationErrors.costPrice ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    {validationErrors.costPrice && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.costPrice}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium text-gray-700">Sales Price</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={e => handlePriceChange('price', e.target.value)}
                      placeholder="Enter sales price in RWF"
                      className={`h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors ${
                        validationErrors.price ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    {validationErrors.price && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.price}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessPrice" className="text-sm font-medium text-gray-700">Business Price</Label>
                    <Input
                      id="businessPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.businessPrice}
                      onChange={e => setFormData({ ...formData, businessPrice: e.target.value })}
                      placeholder="Enter business price in RWF (optional)"
                      className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commission" className="text-sm font-medium text-gray-700">
                      Commission (Auto-calculated)
                    </Label>
                    <Input
                      id="commission"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.commission}
                      onChange={e => setFormData({ ...formData, commission: e.target.value })}
                      placeholder="Auto-calculated: Sales Price - Purchase Price"
                      className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                      readOnly
                    />
                    <p className="text-xs text-gray-500">
                      Commission = Sales Price - Purchase Price
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock" className="text-sm font-medium text-gray-700">Initial Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="Enter initial stock quantity"
                      className={`h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors ${
                        validationErrors.stock ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    <p className="text-xs text-gray-500">
                      Set the initial stock quantity for this product
                    </p>
                    {validationErrors.stock && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.stock}</p>
                    )}
                  </div>
                </div>

                {/* Product Images Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <ImageIcon className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Main Image Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="image" className="text-sm font-medium text-gray-700">Main Product Image</Label>
                      <div className="flex items-center gap-4">
                        {formData.image && (
                          <div className="h-32 w-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <img
                              src={getImageUrl(formData.image) || ''}
                              alt="Product image preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error(`Failed to load image in create dialog: ${formData.image}`)
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.parentElement!.innerHTML = `
                                  <div class="h-32 w-32 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg class="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                  </div>
                                `
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('image')?.click()}
                              className="h-10"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {formData.image ? 'Change Main Image' : 'Upload Main Image'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                if (formData.image) {
                                  handleImagePreview(formData.image, 'Main Image')
                                }
                              }}
                              disabled={!formData.image}
                              className="h-10"
                            >
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            {formData.image && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormData({ ...formData, image: "" })}
                                className="h-10 text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">This will be the primary image displayed for the product</p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Images Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="multiple-images" className="text-sm font-medium text-gray-700">Additional Product Images</Label>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Input
                            id="multiple-images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleMultipleImagesChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('multiple-images')?.click()}
                            className="h-10"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Multiple Images
                          </Button>
                        </div>
                        
                        {/* Display uploaded additional images */}
                        {formData.images.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600">Uploaded additional images ({formData.images.length}):</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {formData.images.map((imageUrl, index) => (
                                <div key={index} className="relative group">
                                  <div className="h-24 w-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                    <img
                                      src={getImageUrl(imageUrl) || ''}
                                      alt={`Additional product image ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        console.error(`Failed to load additional image: ${imageUrl}`)
                                        const target = e.target as HTMLImageElement
                                        target.style.display = 'none'
                                        target.parentElement!.innerHTML = `
                                          <div class="h-24 w-24 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                          </div>
                                        `
                                      }}
                                    />
                                  </div>
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeImage(index)}
                                      className="h-6 w-6 p-0 bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleImagePreview(imageUrl, `Additional Image ${index + 1}`)}
                                      className="h-6 w-6 p-0 bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                                    >
                                      <ImageIcon className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500">Supported formats: JPEG, PNG, WebP, GIF (max 5MB per image)</p>
                        <p className="text-xs text-blue-600">
                          💡 You can upload multiple images to showcase different angles or features of your product
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="border-t border-gray-200 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateProduct}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Product'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Table */}
      <Card className="border-0 bg-white rounded-xl shadow-lg">
        <CardHeader className="border-b border-gray-100 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                Products ({products.length})
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">Manage your product catalog and inventory</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                {products.filter(p => p.isActive).length} Active
              </Badge>
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                {products.filter(p => (p.stock || 0) <= (p.reorderPoint || 10)).length} Low Stock
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable 
            columns={columns} 
            data={products} 
            searchKey="name"
            searchPlaceholder="Search products by name, description, barcode, or category..."
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white rounded-xl border-0">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">Edit Product</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">Update product information</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">Product Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-internalReference" className="text-sm font-medium text-gray-700">Internal Reference *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-internalReference"
                      value={formData.internalReference}
                      onChange={(e) => setFormData({ ...formData, internalReference: e.target.value })}
                      placeholder="Enter internal reference"
                      className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors flex-1"
                    />
                    <Button onClick={generateInternalReference} className="h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Generate SKU
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={3}
                  className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors resize-none"
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <ImageIcon className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Product Image</h3>
                </div>
                
                {/* Main Image */}
                <div className="space-y-2">
                  <Label htmlFor="edit-main-image" className="text-sm font-medium text-gray-700">Main Image</Label>
                  <div className="flex items-center gap-4">
                    {formData.image && (
                      <div className="h-32 w-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <img
                          src={getImageUrl(formData.image) || ''}
                          alt="Main product image"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`Failed to load image in edit dialog: ${formData.image}`)
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.parentElement!.innerHTML = `
                              <div class="h-32 w-32 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg class="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                              </div>
                            `
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Input
                          id="edit-main-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('edit-main-image')?.click()}
                          className="h-10"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {formData.image ? 'Change Image' : 'Upload Image'}
                        </Button>
                        {formData.image && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormData({ ...formData, image: "" })}
                            className="h-10 text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">This will be the primary image displayed for the product</p>
                    </div>
                  </div>
                </div>

                {/* Additional Images */}
                <div className="space-y-2">
                  <Label htmlFor="edit-multiple-images" className="text-sm font-medium text-gray-700">Additional Product Images</Label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        id="edit-multiple-images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMultipleImagesChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('edit-multiple-images')?.click()}
                        className="h-10"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Additional Images
                      </Button>
                    </div>
                    
                    {/* Display uploaded additional images */}
                    {formData.images.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">Additional images ({formData.images.length}):</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {formData.images.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <div className="h-24 w-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                <img
                                  src={getImageUrl(imageUrl) || ''}
                                  alt={`Additional product image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error(`Failed to load additional image: ${imageUrl}`)
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                    target.parentElement!.innerHTML = `
                                      <div class="h-24 w-24 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                      </div>
                                    `
                                  }}
                                />
                              </div>
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeImage(index)}
                                  className="h-6 w-6 p-0 bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleImagePreview(imageUrl, `Additional Image ${index + 1}`)}
                                  className="h-6 w-6 p-0 bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                                >
                                  <ImageIcon className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">Supported formats: JPEG, PNG, WebP, GIF (max 5MB per image)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Package2 className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category" className="text-sm font-medium text-gray-700">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-productType" className="text-sm font-medium text-gray-700">Product Type</Label>
                  <Select value={formData.productType} onValueChange={(value) => setFormData({ ...formData, productType: value })}>
                    <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {productTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-barcode" className="text-sm font-medium text-gray-700">Barcode</Label>
                  <Input
                    id="edit-barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Enter barcode"
                    className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-unitOfMeasure" className="text-sm font-medium text-gray-700">Unit of Measure</Label>
                  <Select value={formData.unitOfMeasure} onValueChange={value => setFormData({ ...formData, unitOfMeasure: value })}>
                    <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {unitOfMeasureOptions.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-costPrice" className="text-sm font-medium text-gray-700">Purchase Price</Label>
                  <Input
                    id="edit-costPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={e => handlePriceChange('costPrice', e.target.value)}
                    placeholder="Enter purchase price in RWF"
                    className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price" className="text-sm font-medium text-gray-700">Sales Price</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={e => handlePriceChange('price', e.target.value)}
                    placeholder="Enter sales price in RWF"
                    className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-commission" className="text-sm font-medium text-gray-700">
                    Commission (Auto-calculated)
                  </Label>
                  <Input
                    id="edit-commission"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.commission}
                    onChange={e => setFormData({ ...formData, commission: e.target.value })}
                    placeholder="Auto-calculated: Sales Price - Purchase Price"
                    className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                    readOnly
                  />
                  <p className="text-xs text-gray-500">
                    Commission = Sales Price - Purchase Price
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stock" className="text-sm font-medium text-gray-700">Stock Quantity</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="Enter stock quantity"
                    className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                  />
                  <p className="text-xs text-gray-500">
                    Current stock quantity for this product
                  </p>
                </div>
              </div>

              {/* Product Image Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <ImageIcon className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Product Image (Single Image)</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-image" className="text-sm font-medium text-gray-700">Current Image</Label>
                    <div className="flex items-center gap-4">
                      {formData.image && (
                        <div className="h-32 w-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                          <img
                            src={getImageUrl(formData.image) || ''}
                            alt="Product image preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(`Failed to load image in edit dialog: ${formData.image}`)
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              target.parentElement!.innerHTML = `
                                <div class="h-32 w-32 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <svg class="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                </div>
                              `
                            }}
                          />
                          {/* Hover overlay for image actions */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleImagePreview(formData.image, 'Current Image')}
                                className="bg-white text-black hover:bg-gray-100"
                              >
                                <ImageIcon className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setFormData({ ...formData, image: "" })}
                                className="bg-white text-red-600 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                      <Input
                        id="edit-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                            className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('edit-image')?.click()}
                            className="h-10"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                            {formData.image ? 'Change Image' : 'Upload Image'}
                      </Button>
                            <Button
                              type="button"
                            variant="outline"
                            onClick={() => {
                              if (formData.image) {
                                handleImagePreview(formData.image, 'Current Image')
                              }
                            }}
                            disabled={!formData.image}
                            className="h-10"
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Preview
                            </Button>
                          </div>
                        <p className="text-xs text-gray-500 mt-1">Supported formats: JPEG, PNG, WebP, GIF (max 5MB)</p>
                        <p className="text-xs text-blue-600 mt-1">
                          💡 Note: This updates the main image field. The images array field is not currently used.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-gray-200 pt-4">
                      <Button
                        type="button"
                        variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="mr-2"
                      >
              Cancel
            </Button>
                            <Button
                              type="button"
              onClick={handleUpdateProduct}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete
              {" "}
              <span className="font-medium text-gray-900">{deletingProduct?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => deletingProduct && handleDeleteProduct(deletingProduct.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <span className="inline-flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Preview Modal */}
      <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] bg-white rounded-xl border-0 p-0">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImagePreviewOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center min-h-[60vh] p-4">
              {previewImage ? (
                <img
                  src={getImageUrl(previewImage) || ''}
                  alt={previewImageAlt}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    console.error(`Failed to load image in preview: ${previewImage}`)
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.parentElement!.innerHTML = `
                      <div class="flex items-center justify-center h-64 w-full bg-gray-100 rounded-lg">
                        <div class="text-center">
                          <svg class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <p class="text-gray-500">Failed to load image</p>
                        </div>
                      </div>
                    `
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-64 w-full bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <Package2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No image to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 