"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, ShoppingCart, FileText, PackageOpen, Warehouse as WarehouseIcon, Layers, Pill } from "lucide-react";
import Swal from "sweetalert2";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function PharmacyPage() {
  const [tab, setTab] = useState("inventory");
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isSaleOpen, setIsSaleOpen] = useState(false);
  const [invTab, setInvTab] = useState("warehouses")
  const [products, setProducts] = useState<Array<{ 
    id: string; 
    name: string; 
    description?: string; 
    drugCategory?: string; 
    dosageForm?: string; 
    strength?: string; 
    activeIngredient?: string; 
    requiresPrescription: boolean; 
    controlledSubstance: boolean; 
    price: number; 
    pharmacyWarehouse?: { name: string; city?: string; country?: string }; 
    stockQuantities?: Array<{ 
      quantity: number; 
      availableQuantity: number;
      location?: { name: string; code?: string }; 
      warehouse?: { name: string } 
    }> 
  }>>([])
  const [warehouses, setWarehouses] = useState<Array<{ id: string; name: string; code: string; address?: string; city?: string; country?: string; isActive: boolean; isMain: boolean; createdAt: string; updatedAt: string }>>([])
  const [zones, setZones] = useState<Array<{ id: string; name: string; code?: string; warehouseId?: string }>>([])
  const [purchases, setPurchases] = useState<Array<{ 
    id: string; 
    productId: string; 
    quantity: number; 
    unitPrice?: number; 
    date: string; 
    createdAt: string; 
    state: string;
    product: { id: string; name: string; price: number }; 
    warehouse?: { id: string; name: string }; 
    createdByUser: { id: string; name: string; email: string } 
  }>>([])
  const [sales, setSales] = useState<Array<{ 
    id: string; 
    date: string; 
    productName: string; 
    productId: string; 
    quantitySold: number; 
    unitPrice: number; 
    totalPrice: number; 
    warehouse: string; 
    location: string; 
    recordedBy: string; 
    recordedByEmail: string; 
    createdAt: string; 
  }>>([])
  const [isCreateWarehouseOpen, setIsCreateWarehouseOpen] = useState(false)
  const [isEditWarehouseOpen, setIsEditWarehouseOpen] = useState(false)
  const [isCreateZoneOpen, setIsCreateZoneOpen] = useState(false)
  const [isEditZoneOpen, setIsEditZoneOpen] = useState(false)
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<{ id: string; name: string; code: string; address?: string; city?: string; country?: string } | null>(null)
  const [selectedZone, setSelectedZone] = useState<{ id: string; name: string; code?: string; warehouseId?: string } | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [createWarehouseForm, setCreateWarehouseForm] = useState({ name: "", code: "", address: "", city: "", country: "Rwanda" })
  const [editWarehouseForm, setEditWarehouseForm] = useState({ name: "", code: "", address: "", city: "", country: "Rwanda" })
  const [createZoneForm, setCreateZoneForm] = useState({ warehouseId: "", name: "", code: "" })
  const [editZoneForm, setEditZoneForm] = useState({ warehouseId: "", name: "", code: "" })
  const [createProductForm, setCreateProductForm] = useState({
    name: "",
    description: "",
    pharmacyWarehouseId: "",
    locationId: "",
    pricePerUnit: "",
    coopDiscountPercent: "",
    category: "",
    dosageForm: "",
    strength: "",
    activeIngredient: "",
    requiresPrescription: false,
    controlledSubstance: false
  })
  const [editProductForm, setEditProductForm] = useState({
    name: "",
    description: "",
    pharmacyWarehouseId: "",
    locationId: "",
    pricePerUnit: "",
    coopDiscountPercent: "",
    category: "",
    dosageForm: "",
    strength: "",
    activeIngredient: "",
    requiresPrescription: false,
    controlledSubstance: false
  })
  const filteredZones = React.useMemo(() => {
    if (!createProductForm.pharmacyWarehouseId) return zones
    return zones.filter(z => z.warehouseId === createProductForm.pharmacyWarehouseId)
  }, [zones, createProductForm.pharmacyWarehouseId])
  const [purchaseForm, setPurchaseForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    medicineName: "",
    quantityReceived: "",
    expiryDate: "",
    pricePerUnit: "",
    totalPrice: "0",
    recordedBy: "",
    paymentMethod: "cash"
  });

  const [saleForm, setSaleForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    customerName: "",
    medicineSold: "",
    quantitySold: "",
    pricePerUnit: "",
    totalPrice: "0",
    discount: "0",
    paymentMethod: "cash",
    customerLocation: "",
    phoneNumber: "",
    isCooperativeMember: false
  });

  const recalcTotal = (qtyStr: string, priceStr: string) => {
    const qty = parseFloat(qtyStr || "0");
    const price = parseFloat(priceStr || "0");
    const total = isNaN(qty) || isNaN(price) ? 0 : qty * price;
    return total.toString();
  };

  const recalcSaleTotal = (qtyStr: string, priceStr: string, discountStr: string, isCooperativeMember: boolean) => {
    const qty = parseFloat(qtyStr || "0");
    const price = parseFloat(priceStr || "0");
    const discount = parseFloat(discountStr || "0");
    
    if (isNaN(qty) || isNaN(price)) return "0";
    
    const subtotal = qty * price;
    const discountAmount = isCooperativeMember && !isNaN(discount) ? (subtotal * discount / 100) : 0;
    const total = subtotal - discountAmount;
    
    return total.toString();
  };

  const todayIso = new Date().toISOString().slice(0, 10);

  const [isSavingPurchase, setIsSavingPurchase] = useState(false)
  const [isSavingSale, setIsSavingSale] = useState(false)

  const handleSavePurchase = async () => {
    // Basic validation
    if (!purchaseForm.medicineName.trim()) {
      toast.error("Medicine Name is required");
      return;
    }
    if (!purchaseForm.quantityReceived || isNaN(parseFloat(purchaseForm.quantityReceived))) {
      toast.error("Quantity Received is required");
      return;
    }
    if (!purchaseForm.pricePerUnit || isNaN(parseFloat(purchaseForm.pricePerUnit))) {
      toast.error("Price per Unit is required");
      return;
    }
    if (!purchaseForm.expiryDate) {
      toast.error("Expiry Date is required");
      return;
    }
    if (purchaseForm.expiryDate < todayIso) {
      toast.error("Expiry Date cannot be in the past");
      return;
    }

    try {
      setIsSavingPurchase(true)
      // Transform the form data to match API expectations
      const purchaseData = {
        date: purchaseForm.date,
        productId: purchaseForm.medicineName, // medicineName contains the product ID
        quantityReceived: purchaseForm.quantityReceived,
        expiryDate: purchaseForm.expiryDate,
        pricePerUnit: purchaseForm.pricePerUnit,
        totalPrice: purchaseForm.totalPrice,
        recordedBy: purchaseForm.recordedBy,
        paymentMethod: purchaseForm.paymentMethod,
        warehouseId: null // TODO: Add warehouse selection if needed
      }
      
      const res = await fetch('/api/v1/pharmacy/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save purchase')
      }
      toast.success('Purchase saved')
      setIsPurchaseOpen(false)
      
      // Refresh all inventory data
      await refreshInventoryData()
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : 'Failed to save purchase')
    } finally {
      setIsSavingPurchase(false)
    }
  };

  const handleSaveSale = async () => {
    // Basic validation
    if (!saleForm.customerName.trim()) {
      toast.error("Customer Name is required");
      return;
    }
    if (!saleForm.medicineSold.trim()) {
      toast.error("Medicine Sold is required");
      return;
    }
    if (!saleForm.quantitySold || isNaN(parseFloat(saleForm.quantitySold))) {
      toast.error("Quantity Sold is required");
      return;
    }
    if (!saleForm.pricePerUnit || isNaN(parseFloat(saleForm.pricePerUnit))) {
      toast.error("Price per Unit is required");
      return;
    }
    if (!saleForm.customerLocation.trim()) {
      toast.error("Customer Location is required");
      return;
    }
    if (!saleForm.phoneNumber.trim()) {
      toast.error("Phone Number is required");
      return;
    }

    setIsSavingSale(true);
    try {
      const saleData = {
        date: saleForm.date,
        customerName: saleForm.customerName,
        productId: saleForm.medicineSold, // medicineSold contains the product ID
        quantitySold: parseFloat(saleForm.quantitySold),
        pricePerUnit: parseFloat(saleForm.pricePerUnit),
        totalPrice: parseFloat(saleForm.totalPrice),
        discount: parseFloat(saleForm.discount),
        paymentMethod: saleForm.paymentMethod,
        customerLocation: saleForm.customerLocation,
        phoneNumber: saleForm.phoneNumber,
        isCooperativeMember: saleForm.isCooperativeMember
      };
      
      const auth = { 'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}` }
      const res = await fetch('/api/v1/pharmacy/sales', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...auth
        },
        body: JSON.stringify(saleData)
      });
      
      const result = await res.json();
      
      if (result.success) {
        toast.success('Sale recorded successfully!');
        setIsSaleOpen(false);
        // Reset form
        setSaleForm({
          date: new Date().toISOString().slice(0, 10),
          customerName: "",
          medicineSold: "",
          quantitySold: "",
          pricePerUnit: "",
          totalPrice: "0",
          discount: "0",
          paymentMethod: "cash",
          customerLocation: "",
          phoneNumber: "",
          isCooperativeMember: false
        });
        
        // Refresh all inventory data
        await refreshInventoryData()
      } else {
        toast.error(result.error || 'Failed to save sale');
      }
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : 'Failed to save sale')
    } finally {
      setIsSavingSale(false)
    }
  };

  // Function to ensure Main warehouse exists
  const ensureMainWarehouse = async () => {
    try {
      const auth = { 'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}` }
      const response = await fetch('/api/v1/inventory/warehouses', { headers: auth })
      const data = await response.json()
      
      if (data.success && data.data) {
        const mainWarehouse = data.data.find((w: any) => w.isMain)
        if (!mainWarehouse) {
          // Create Main warehouse if it doesn't exist
          const mainWarehouseData = {
            name: "Main Warehouse",
            code: "MAIN-WH-001",
            address: "Main Storage Facility",
            city: "Kigali",
            country: "Rwanda",
            isMain: true
          }
          
          const createResponse = await fetch('/api/v1/inventory/warehouses', {
            method: 'POST',
            headers: { ...auth, 'Content-Type': 'application/json' },
            body: JSON.stringify(mainWarehouseData)
          })
          
          if (createResponse.ok) {
            console.log('Main warehouse created successfully')
          }
        }
      }
    } catch (error) {
      console.error('Error ensuring main warehouse:', error)
    }
  }

  React.useEffect(() => {
    // Load products and warehouses (minimal)
    const fetchData = async () => {
      try {
        // First ensure Main warehouse exists
        await ensureMainWarehouse()
        
        const auth = { 'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}` }
        const [prodRes, whRes, locRes, purchasesRes, salesRes] = await Promise.all([
          fetch('/api/v1/inventory/products', { headers: auth }),
          fetch('/api/v1/inventory/warehouses', { headers: auth }),
          fetch('/api/v1/inventory/locations', { headers: auth }),
          fetch('/api/v1/pharmacy/purchases', { headers: auth }),
          fetch('/api/v1/pharmacy/sales', { headers: auth })
        ])
        const prodData = await prodRes.json()
        const whList = await whRes.json()
        const locList = await locRes.json()
        const purchasesData = await purchasesRes.json()
        const salesData = await salesRes.json()
        
        if (prodData.success && prodData.data) {
          setProducts(prodData.data)
        }
        if (locList.data) {
          const mappedZones = (locList.data || []).map((z: any) => ({ id: z.id, name: z.name, code: z.code, warehouseId: z.warehouseId }))
          setZones(mappedZones)
        }
        if (whList.data) {
          const mappedWh = (whList.data || []).map((w: any) => ({ 
            id: w.id, 
            name: w.name, 
            code: w.code,
            address: w.address,
            city: w.city, 
            country: w.country,
            isActive: w.isActive,
            isMain: w.isMain,
            createdAt: w.createdAt,
            updatedAt: w.updatedAt
          }))
          setWarehouses(mappedWh)
        }
        if (purchasesData.success && purchasesData.data) {
          setPurchases(purchasesData.data)
        }
        if (salesData.success && salesData.data) {
          setSales(salesData.data)
        }
      } catch (e) {
        console.error('Failed to load products/warehouses', e)
      }
    }
    fetchData()
  }, [])

  // Function to refresh all inventory data
  const refreshInventoryData = async () => {
    try {
      const auth = { 'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}` }
      const [prodRes, whRes, locRes, purchasesRes, salesRes] = await Promise.all([
        fetch('/api/v1/inventory/products', { headers: auth }),
        fetch('/api/v1/inventory/warehouses', { headers: auth }),
        fetch('/api/v1/inventory/locations', { headers: auth }),
        fetch('/api/v1/pharmacy/purchases', { headers: auth }),
        fetch('/api/v1/pharmacy/sales', { headers: auth })
      ])
      
      const prodData = await prodRes.json()
      const whList = await whRes.json()
      const locList = await locRes.json()
      const purchasesData = await purchasesRes.json()
      const salesData = await salesRes.json()
      
      if (prodData.success && prodData.data) {
        setProducts(prodData.data)
      }
      if (locList.data) {
        const mappedZones = (locList.data || []).map((z: any) => ({ id: z.id, name: z.name, code: z.code, warehouseId: z.warehouseId }))
        setZones(mappedZones)
      }
      if (whList.data) {
        const mappedWh = (whList.data || []).map((w: any) => ({ 
          id: w.id, 
          name: w.name, 
          code: w.code,
          address: w.address,
          city: w.city, 
          country: w.country,
          isActive: w.isActive,
          isMain: w.isMain,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt
        }))
        setWarehouses(mappedWh)
      }
      if (purchasesData.success && purchasesData.data) {
        setPurchases(purchasesData.data)
      }
      if (salesData.success && salesData.data) {
        setSales(salesData.data)
      }
    } catch (error) {
      console.error('Failed to refresh inventory data:', error)
    }
  }

  const generateWarehouseCode = (name?: string) => {
    const base = (name || 'WH').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'WH'
    const ts = Date.now().toString().slice(-5)
    return `WH-${base}-${ts}`
  }

  const generateZoneCode = (name?: string) => {
    const base = (name || 'ZN').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'ZN'
    const ts = Date.now().toString().slice(-4)
    return `ZN-${base}-${ts}`
  }

  React.useEffect(() => {
    if (isCreateWarehouseOpen) {
      setCreateWarehouseForm(prev => ({ ...prev, code: generateWarehouseCode(prev.name) }))
    }
  }, [isCreateWarehouseOpen])

  React.useEffect(() => {
    if (isCreateZoneOpen) {
      setCreateZoneForm(prev => ({ ...prev, code: generateZoneCode(prev.name) }))
    }
  }, [isCreateZoneOpen])

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}`
  })

  const swalLoading = (title: string) => {
    Swal.fire({ title, allowOutsideClick: false, allowEscapeKey: false, didOpen: () => Swal.showLoading(), showConfirmButton: false })
  }

  const swalSuccess = async (title: string, text?: string) => {
    await Swal.fire({ title, text, icon: 'success', timer: 1400, showConfirmButton: false })
  }

  const swalError = async (title: string, text?: string) => {
    await Swal.fire({ title, text, icon: 'error' })
  }

  const openEditWarehouse = (warehouse: any) => {
    setSelectedWarehouse(warehouse)
    setEditWarehouseForm({
      name: warehouse.name,
      code: warehouse.code,
      address: warehouse.address || "",
      city: warehouse.city || "",
      country: warehouse.country || "Rwanda"
    })
    setIsEditWarehouseOpen(true)
  }

  const handleDeleteWarehouse = async (warehouse: any) => {
    const result = await Swal.fire({
      title: 'Delete Warehouse',
      text: `Are you sure you want to delete "${warehouse.name}"? This will also delete all zones, products, and related data in this warehouse. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete everything!',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await swalLoading('Deleting warehouse...')
        const res = await fetch(`/api/v1/inventory/warehouses/${warehouse.id}`, { 
          method: 'DELETE', 
          headers: authHeaders() 
        })
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete warehouse')
        
        // Refresh warehouses list
        const whRes = await fetch('/api/v1/inventory/warehouses', { headers: authHeaders() })
        const whData = await whRes.json()
        if (whData.success && whData.data) {
          setWarehouses(whData.data)
        }
        
        await swalSuccess('Warehouse and all related data deleted')
      } catch (e: any) {
        console.error(e)
        await swalError('Failed', e?.message || 'Could not delete warehouse')
      }
    }
  }

  const openEditZone = (zone: any) => {
    setSelectedZone(zone)
    setEditZoneForm({
      warehouseId: zone.warehouseId || "",
      name: zone.name,
      code: zone.code || ""
    })
    setIsEditZoneOpen(true)
  }

  const handleDeleteZone = async (zone: any) => {
    const result = await Swal.fire({
      title: 'Delete Zone',
      text: `Are you sure you want to delete "${zone.name}"? This will also delete all products and related data in this zone. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete everything!',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await swalLoading('Deleting zone...')
        const res = await fetch(`/api/v1/inventory/locations/${zone.id}`, { 
          method: 'DELETE', 
          headers: authHeaders() 
        })
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete zone')
        
        // Refresh zones list
        const locRes = await fetch('/api/v1/inventory/locations', { headers: authHeaders() })
        const locData = await locRes.json()
        if (locData.success && locData.data) {
          const mappedZones = (locData.data || []).map((z: any) => ({ id: z.id, name: z.name, code: z.code, warehouseId: z.warehouseId }))
          setZones(mappedZones)
        }
        
        await swalSuccess('Zone and all related data deleted')
      } catch (e: any) {
        console.error(e)
        await swalError('Failed', e?.message || 'Could not delete zone')
      }
    }
  }

  const openEditProduct = (product: any) => {
    setSelectedProduct(product)
    setEditProductForm({
      name: product.name || "",
      description: product.description || "",
      pharmacyWarehouseId: product.pharmacyWarehouseId || "",
      locationId: product.locationId || "",
      pricePerUnit: product.price?.toString() || "", // Use 'price' instead of 'pricePerUnit'
      coopDiscountPercent: product.coopDiscountPercent?.toString() || "",
      category: product.category || "",
      dosageForm: product.dosageForm || "",
      strength: product.strength || "",
      activeIngredient: product.activeIngredient || "",
      requiresPrescription: product.requiresPrescription || false,
      controlledSubstance: product.controlledSubstance || false
    })
    setIsEditProductOpen(true)
  }

  const handleDeleteProduct = async (product: any) => {
    const result = await Swal.fire({
      title: 'Delete Product',
      text: `Are you sure you want to delete "${product.name}"? This will also delete all related stock data. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete everything!',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await swalLoading('Deleting product...')
        const res = await fetch(`/api/v1/inventory/products/${product.id}`, { 
          method: 'DELETE', 
          headers: authHeaders() 
        })
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete product')
        
        // Refresh products list
        const prodRes = await fetch('/api/v1/inventory/products', { headers: authHeaders() })
        const prodData = await prodRes.json()
        if (prodData.success && prodData.data) {
          setProducts(prodData.data)
        }
        
        await swalSuccess('Product and all related data deleted')
      } catch (e: any) {
        console.error(e)
        await swalError('Failed', e?.message || 'Could not delete product')
      }
    }
  }

  const submitEditProduct = async () => {
    if (!selectedProduct) return
    
    // Validate required fields
    if (!editProductForm.name?.trim()) {
      await swalError('Validation Error', 'Product name is required')
      return
    }
    
    if (!editProductForm.pricePerUnit || editProductForm.pricePerUnit === '' || isNaN(Number(editProductForm.pricePerUnit)) || Number(editProductForm.pricePerUnit) < 0) {
      await swalError('Validation Error', 'Valid price per unit is required')
      return
    }
    
    try {
      await swalLoading('Updating product...')
      const res = await fetch(`/api/v1/inventory/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(editProductForm)
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update product')
      
      // Refresh products list
      const prodRes = await fetch('/api/v1/inventory/products', { headers: authHeaders() })
      const prodData = await prodRes.json()
      if (prodData.success && prodData.data) {
        setProducts(prodData.data)
      }
      
      setIsEditProductOpen(false)
      setSelectedProduct(null)
      await swalSuccess('Product updated successfully')
    } catch (e: any) {
      console.error(e)
      await swalError('Failed', e?.message || 'Could not update product')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white">
      {/* Hero/Header */}
      <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Pharmacy Inventory</h1>
              <p className="text-purple-100 mt-2">Buying Medicines and Medicine Sold</p>
            </div>
            
            <div className="hidden md:flex gap-2">
              <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                Quick Actions
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-10">
        <Card className="bg-white/90 backdrop-blur border border-gray-200 shadow-xl rounded-xl">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-gray-900">Pharmacy Inventory</CardTitle>
            <CardDescription className="text-gray-500">Record purchases and sales of medicines</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={setTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-gray-50 border border-gray-200 rounded-lg p-1">
                <TabsTrigger value="inventory" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-md px-4 py-2 order-1">
                  <WarehouseIcon className="h-4 w-4" /> Inventory
                </TabsTrigger>
                <TabsTrigger value="purchases" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-md px-4 py-2 order-2">
                  <ShoppingCart className="h-4 w-4" /> Buying Medicines
                </TabsTrigger>
                <TabsTrigger value="sales" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-md px-4 py-2 order-3">
                  <FileText className="h-4 w-4" /> Medicine Sold
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                {tab === 'purchases' ? (
                  <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-sm" onClick={() => setIsPurchaseOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> New Purchase
                  </Button>
                ) : tab === 'sales' ? (
                  <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-sm" onClick={() => setIsSaleOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> New Sale
                  </Button>
                ) : null}
              </div>
            </div>

            <TabsContent value="purchases">
              <div className="space-y-4">
                <div className="text-sm text-gray-500">Recent purchases will appear here.</div>
                
                {purchases.length > 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded By</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {purchases.map((purchase) => (
                            <tr key={purchase.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(purchase.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {purchase.product.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {purchase.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {purchase.unitPrice ? `Frw ${purchase.unitPrice.toLocaleString()}` : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {purchase.unitPrice ? `Frw ${(purchase.quantity * purchase.unitPrice).toLocaleString()}` : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {purchase.createdByUser.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  {purchase.state}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 bg-gray-50/70">
                    <PackageOpen className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                    <div className="font-medium text-gray-700">No purchases yet</div>
                    <div className="text-sm">Click "New Purchase" to add one.</div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="sales">
              <div className="space-y-4">
                {sales && sales.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Product</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Quantity</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Unit Price</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Total</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Location</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Recorded By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {sales.map((sale) => (
                            <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3 text-sm text-gray-700">
                                {new Date(sale.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-700 font-medium">
                                {sale.productName}
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-700">
                                {sale.quantitySold.toLocaleString()}
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-700">
                                {sale.unitPrice ? `Frw ${sale.unitPrice.toLocaleString()}` : 'N/A'}
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-700 font-medium">
                                {sale.totalPrice ? `Frw ${sale.totalPrice.toLocaleString()}` : 'N/A'}
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-700">
                                {sale.warehouse} - {sale.location}
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-700">
                                {sale.recordedBy}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 bg-gray-50/70">
                    <PackageOpen className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                    <div className="font-medium text-gray-700">No sales yet</div>
                    <div className="text-sm">Click "New Sale" to add one.</div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="inventory">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsCreateWarehouseOpen(true)} className="flex items-center gap-2 border-purple-200 hover:bg-purple-50 shadow-sm">
                      <WarehouseIcon className="h-4 w-4" /> Create Warehouse
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateZoneOpen(true)} className="flex items-center gap-2 border-purple-200 hover:bg-purple-50 shadow-sm">
                      <Layers className="h-4 w-4" /> Create Zone
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateProductOpen(true)} className="flex items-center gap-2 border-purple-200 hover:bg-purple-50 shadow-sm">
                      <Pill className="h-4 w-4" /> Create Product
                    </Button>
                    <Button variant="outline" onClick={refreshInventoryData} className="flex items-center gap-2 border-blue-200 hover:bg-blue-50 shadow-sm">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </Button>
                  </div>
                  <div>
                    <Tabs value={invTab} onValueChange={setInvTab}>
                      <TabsList className="bg-white border border-gray-200 rounded-md">
                        <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
                        <TabsTrigger value="zones">Zones</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
                <div className="mt-4">
                  {invTab === 'warehouses' && (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                      <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">City</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Country</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {warehouses.map(w => (
                            <tr key={w.id} className="hover:bg-gray-50/70">
                              <td className="px-6 py-3 font-medium text-gray-900">{w.name}</td>
                              <td className="px-6 py-3 text-gray-700">{w.city || '-'}</td>
                              <td className="px-6 py-3 text-gray-700">{w.country || '-'}</td>
                              <td className="px-6 py-3 text-[11px] text-gray-500">{w.id.slice(-6)}</td>
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditWarehouse(w)}
                                    className="h-7 px-2 text-xs"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteWarehouse(w)}
                                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {warehouses.length === 0 && (
                            <tr><td className="px-6 py-8 text-sm text-gray-500" colSpan={5}>No warehouses yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {invTab === 'zones' && (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                      <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Code</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Warehouse</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {zones.map(z => (
                            <tr key={z.id} className="hover:bg-gray-50/70">
                              <td className="px-6 py-3 font-medium text-gray-900">{z.name}</td>
                              <td className="px-6 py-3 text-gray-700">{z.code}</td>
                              <td className="px-6 py-3 text-gray-700">{warehouses.find(w => w.id === z.warehouseId)?.name || '-'}</td>
                              <td className="px-6 py-3 text-[11px] text-gray-500">{z.id.slice(-6)}</td>
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditZone(z)}
                                    className="h-7 px-2 text-xs"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteZone(z)}
                                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {zones.length === 0 && (
                            <tr><td className="px-6 py-8 text-sm text-gray-500" colSpan={5}>No zones yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {invTab === 'products' && (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                      <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Warehouse</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Zone</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Stock Quantity</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {products.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50/70">
                              <td className="px-6 py-3 font-medium text-gray-900">{p.name}</td>
                              <td className="px-6 py-3 text-gray-700">{p.drugCategory || '-'}</td>
                              <td className="px-6 py-3 text-gray-700">{p.price ? `${p.price.toLocaleString()} Frw` : '-'}</td>
                              <td className="px-6 py-3 text-gray-700">{p.pharmacyWarehouse?.name || '-'}</td>
                              <td className="px-6 py-3 text-gray-700">
                                {p.stockQuantities && p.stockQuantities.length > 0 
                                  ? p.stockQuantities.map((sq, index) => (
                                      <span key={index}>
                                        {sq.location?.name || '-'}
                                        {index < (p.stockQuantities?.length || 0) - 1 && ', '}
                                      </span>
                                    ))
                                  : '-'
                                }
                              </td>
                              <td className="px-6 py-3 text-gray-700">
                                {p.stockQuantities && p.stockQuantities.length > 0 
                                  ? p.stockQuantities.reduce((total, sq) => total + sq.quantity, 0).toLocaleString()
                                  : '0'
                                }
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditProduct(p)}
                                    className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteProduct(p)}
                                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {products.length === 0 && (
                            <tr><td className="px-6 py-8 text-sm text-gray-500" colSpan={7}>No products yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>

      {/* New Purchase Dialog */}
      <Dialog open={isPurchaseOpen} onOpenChange={setIsPurchaseOpen}>
        <DialogContent className="max-w-2xl bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle>Record Medicine Purchase</DialogTitle>
            <DialogDescription>Enter purchase details</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={purchaseForm.date}
                onChange={(e) => setPurchaseForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Medicine Name</Label>
              <Select
                value={purchaseForm.medicineName}
                onValueChange={(v) => setPurchaseForm(prev => ({ ...prev, medicineName: v, productId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select medicine" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity Received (Liters/Kg)</Label>
              <Input
                type="number"
                placeholder="0"
                value={purchaseForm.quantityReceived}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => {
                  const raw = e.target.value
                  const sanitized = raw && !raw.startsWith('0.') ? raw.replace(/^0+(?=\d)/, '') : raw
                  const total = recalcTotal(sanitized, purchaseForm.pricePerUnit)
                  setPurchaseForm(prev => ({ ...prev, quantityReceived: sanitized, totalPrice: total }))
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={purchaseForm.expiryDate}
                onChange={(e) => setPurchaseForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                min={todayIso}
              />
            </div>
            <div className="space-y-2">
              <Label>Price per Unit</Label>
              <Input
                type="number"
                placeholder="0"
                value={purchaseForm.pricePerUnit}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => {
                  const raw = e.target.value
                  const sanitized = raw && !raw.startsWith('0.') ? raw.replace(/^0+(?=\d)/, '') : raw
                  const total = recalcTotal(purchaseForm.quantityReceived, sanitized)
                  setPurchaseForm(prev => ({ ...prev, pricePerUnit: sanitized, totalPrice: total }))
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Total Price</Label>
              <Input value={purchaseForm.totalPrice} readOnly disabled />
            </div>
            {/* Warehouse removed per request */}
            <div className="space-y-2">
              <Label>Recorded By</Label>
              <Input
                placeholder="User name"
                value={purchaseForm.recordedBy}
                onChange={(e) => setPurchaseForm(prev => ({ ...prev, recordedBy: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment method</Label>
              <Select value={purchaseForm.paymentMethod} onValueChange={(v) => setPurchaseForm(prev => ({ ...prev, paymentMethod: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="credit">Supplier Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPurchaseOpen(false)} disabled={isSavingPurchase}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSavePurchase} disabled={isSavingPurchase}>
              {isSavingPurchase ? 'Saving...' : 'Save Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Sale Dialog */}
      <Dialog open={isSaleOpen} onOpenChange={setIsSaleOpen}>
        <DialogContent className="max-w-4xl bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle>Record Medicine Sale</DialogTitle>
            <DialogDescription>Enter customer and medicine sale details</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={saleForm.date}
                onChange={(e) => setSaleForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                placeholder="Enter customer name"
                value={saleForm.customerName}
                onChange={(e) => setSaleForm(prev => ({ ...prev, customerName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Medicine Sold</Label>
              <Select
                value={saleForm.medicineSold}
                onValueChange={(v) => {
                  const selectedProduct = products.find(p => p.id === v);
                  const price = selectedProduct?.price?.toString() || "";
                  const total = recalcSaleTotal(saleForm.quantitySold, price, saleForm.discount, saleForm.isCooperativeMember);
                  setSaleForm(prev => ({ 
                    ...prev, 
                    medicineSold: v, 
                    pricePerUnit: price,
                    totalPrice: total
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select medicine" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity Sold (Liters/Kg)</Label>
              <Input
                type="number"
                placeholder="0"
                value={saleForm.quantitySold}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => {
                  const raw = e.target.value
                  const sanitized = raw && !raw.startsWith('0.') ? raw.replace(/^0+(?=\d)/, '') : raw
                  const total = recalcSaleTotal(sanitized, saleForm.pricePerUnit, saleForm.discount, saleForm.isCooperativeMember)
                  setSaleForm(prev => ({ ...prev, quantitySold: sanitized, totalPrice: total }))
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Price per Unit (Frw)</Label>
              <Input
                type="number"
                placeholder="0"
                value={saleForm.pricePerUnit}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Total Price (Frw)</Label>
              <Input
                type="number"
                placeholder="0"
                value={saleForm.totalPrice}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Discount % (Applicable only for cooperative member)</Label>
              <Input
                type="number"
                placeholder="0"
                value={saleForm.discount}
                disabled={!saleForm.isCooperativeMember}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => {
                  const raw = e.target.value
                  const sanitized = raw && !raw.startsWith('0.') ? raw.replace(/^0+(?=\d)/, '') : raw
                  const total = recalcSaleTotal(saleForm.quantitySold, saleForm.pricePerUnit, sanitized, saleForm.isCooperativeMember)
                  setSaleForm(prev => ({ ...prev, discount: sanitized, totalPrice: total }))
                }}
              />
              {!saleForm.isCooperativeMember && (
                <p className="text-xs text-gray-500">Enable cooperative member to apply discount</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={saleForm.paymentMethod}
                onValueChange={(v) => setSaleForm(prev => ({ ...prev, paymentMethod: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Customer Location</Label>
              <Input
                placeholder="Enter customer location"
                value={saleForm.customerLocation}
                onChange={(e) => setSaleForm(prev => ({ ...prev, customerLocation: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                placeholder="Enter phone number"
                value={saleForm.phoneNumber}
                onChange={(e) => setSaleForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Are you Cooperative Member?</Label>
              <Select
                value={saleForm.isCooperativeMember ? "yes" : "no"}
                onValueChange={(v) => {
                  const isMember = v === "yes";
                  const total = recalcSaleTotal(saleForm.quantitySold, saleForm.pricePerUnit, saleForm.discount, isMember);
                  setSaleForm(prev => ({ 
                    ...prev, 
                    isCooperativeMember: isMember,
                    totalPrice: total
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaleOpen(false)} disabled={isSavingSale}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveSale} disabled={isSavingSale}>
              {isSavingSale ? 'Saving...' : 'Save Sale'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Warehouse Dialog */}
      <Dialog open={isCreateWarehouseOpen} onOpenChange={setIsCreateWarehouseOpen}>
        <DialogContent className="max-w-lg bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle>Create Warehouse</DialogTitle>
            <DialogDescription>Name, code and location</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={createWarehouseForm.name} onChange={(e) => {
                const name = e.target.value
                setCreateWarehouseForm({ ...createWarehouseForm, name, code: generateWarehouseCode(name) })
              }} />
            </div>
            <div className="space-y-1">
              <Label>Code</Label>
              <Input value={createWarehouseForm.code} readOnly disabled />
            </div>
            <div className="space-y-1">
              <Label>Address</Label>
              <Input value={createWarehouseForm.address} onChange={(e) => setCreateWarehouseForm({ ...createWarehouseForm, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>City</Label>
                <Input value={createWarehouseForm.city} onChange={(e) => setCreateWarehouseForm({ ...createWarehouseForm, city: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Country</Label>
                <Input value={createWarehouseForm.country} onChange={(e) => setCreateWarehouseForm({ ...createWarehouseForm, country: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateWarehouseOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-sm" onClick={async () => {
              try {
                if (!createWarehouseForm.name.trim()) {
                  await swalError('Validation', 'Warehouse name is required')
                  return
                }
                if (!createWarehouseForm.code.trim()) {
                  await swalError('Validation', 'Warehouse code is required')
                  return
                }
                await swalLoading('Creating warehouse...')
                const res = await fetch('/api/v1/inventory/warehouses', { method: 'POST', headers: authHeaders(), body: JSON.stringify(createWarehouseForm) })
                const data = await res.json()
                if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create warehouse')
                // Refresh all inventory data
                await refreshInventoryData()
                setIsCreateWarehouseOpen(false)
                await swalSuccess('Warehouse created')
              } catch (e: any) {
                console.error(e)
                await swalError('Failed', e?.message || 'Could not create warehouse')
              }
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Warehouse Dialog */}
      <Dialog open={isEditWarehouseOpen} onOpenChange={setIsEditWarehouseOpen}>
        <DialogContent className="max-w-lg bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle>Edit Warehouse</DialogTitle>
            <DialogDescription>Update warehouse information</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={editWarehouseForm.name} onChange={(e) => setEditWarehouseForm({ ...editWarehouseForm, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Code</Label>
              <Input value={editWarehouseForm.code} readOnly disabled />
            </div>
            <div className="space-y-1">
              <Label>Address</Label>
              <Input value={editWarehouseForm.address} onChange={(e) => setEditWarehouseForm({ ...editWarehouseForm, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>City</Label>
                <Input value={editWarehouseForm.city} onChange={(e) => setEditWarehouseForm({ ...editWarehouseForm, city: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Country</Label>
                <Input value={editWarehouseForm.country} onChange={(e) => setEditWarehouseForm({ ...editWarehouseForm, country: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditWarehouseOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              try {
                if (!editWarehouseForm.name.trim()) {
                  await swalError('Validation', 'Warehouse name is required')
                  return
                }
                await swalLoading('Updating warehouse...')
                const res = await fetch(`/api/v1/inventory/warehouses/${selectedWarehouse?.id}`, { 
                  method: 'PUT', 
                  headers: authHeaders(), 
                  body: JSON.stringify(editWarehouseForm) 
                })
                const data = await res.json()
                if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update warehouse')
                
                // Refresh warehouses list
                const whRes = await fetch('/api/v1/inventory/warehouses', { headers: authHeaders() })
                const whData = await whRes.json()
                if (whData.success && whData.data) {
                  setWarehouses(whData.data)
                }
                
                setIsEditWarehouseOpen(false)
                await swalSuccess('Warehouse updated')
              } catch (e: any) {
                console.error(e)
                await swalError('Failed', e?.message || 'Could not update warehouse')
              }
            }}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Zone Dialog */}
      <Dialog open={isCreateZoneOpen} onOpenChange={setIsCreateZoneOpen}>
        <DialogContent className="max-w-lg bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle>Create Zone</DialogTitle>
            <DialogDescription>Attach to a warehouse</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Warehouse</Label>
              <Select value={createZoneForm.warehouseId} onValueChange={(v) => setCreateZoneForm({ ...createZoneForm, warehouseId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={createZoneForm.name} onChange={(e) => {
                const name = e.target.value
                setCreateZoneForm({ ...createZoneForm, name, code: generateZoneCode(name) })
              }} />
            </div>
            <div className="space-y-1">
              <Label>Code</Label>
              <Input value={createZoneForm.code} readOnly disabled />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateZoneOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              try {
                if (!createZoneForm.warehouseId) {
                  await swalError('Validation', 'Please select a warehouse')
                  return
                }
                if (!createZoneForm.name.trim()) {
                  await swalError('Validation', 'Zone name is required')
                  return
                }
                await swalLoading('Creating zone...')
                const res = await fetch('/api/v1/inventory/locations', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ ...createZoneForm }) })
                const data = await res.json()
                if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create zone')
                // Refresh all inventory data
                await refreshInventoryData()
                setIsCreateZoneOpen(false)
                await swalSuccess('Zone created')
              } catch (e: any) {
                console.error(e)
                await swalError('Failed', e?.message || 'Could not create zone')
              }
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Zone Dialog */}
      <Dialog open={isEditZoneOpen} onOpenChange={setIsEditZoneOpen}>
        <DialogContent className="max-w-lg bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle>Edit Zone</DialogTitle>
            <DialogDescription>Update zone information</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Warehouse</Label>
              <Select value={editZoneForm.warehouseId} onValueChange={(v) => setEditZoneForm({ ...editZoneForm, warehouseId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={editZoneForm.name} onChange={(e) => {
                const name = e.target.value
                setEditZoneForm({ ...editZoneForm, name, code: generateZoneCode(name) })
              }} />
            </div>
            <div className="space-y-1">
              <Label>Code</Label>
              <Input value={editZoneForm.code} readOnly disabled />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditZoneOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              try {
                if (!editZoneForm.warehouseId) {
                  await swalError('Validation', 'Please select a warehouse')
                  return
                }
                if (!editZoneForm.name.trim()) {
                  await swalError('Validation', 'Zone name is required')
                  return
                }
                await swalLoading('Updating zone...')
                const res = await fetch(`/api/v1/inventory/locations/${selectedZone?.id}`, { 
                  method: 'PUT', 
                  headers: authHeaders(), 
                  body: JSON.stringify(editZoneForm) 
                })
                const data = await res.json()
                if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update zone')
                
                // Refresh zones list
                const locRes = await fetch('/api/v1/inventory/locations', { headers: authHeaders() })
                const locData = await locRes.json()
                if (locData.success && locData.data) {
                  const mappedZones = (locData.data || []).map((z: any) => ({ id: z.id, name: z.name, code: z.code, warehouseId: z.warehouseId }))
                  setZones(mappedZones)
                }
                
                setIsEditZoneOpen(false)
                await swalSuccess('Zone updated')
              } catch (e: any) {
                console.error(e)
                await swalError('Failed', e?.message || 'Could not update zone')
              }
            }}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl flex flex-col">
          <DialogHeader className="text-center pb-6 flex-shrink-0">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">Edit Product</DialogTitle>
            <DialogDescription className="text-gray-600">Update product information and settings</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Product Name <span className="text-red-500">*</span></Label>
                    <Input
                      value={editProductForm.name}
                      onChange={(e) => setEditProductForm({...editProductForm, name: e.target.value})}
                      placeholder="Enter product name"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Category</Label>
                    <Select value={editProductForm.category} onValueChange={(value) => setEditProductForm({...editProductForm, category: value})}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANTIBIOTIC">Antibiotic</SelectItem>
                        <SelectItem value="PAINKILLER">Painkiller</SelectItem>
                        <SelectItem value="VITAMIN">Vitamin</SelectItem>
                        <SelectItem value="SUPPLEMENT">Supplement</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <textarea
                    value={editProductForm.description}
                    onChange={(e) => setEditProductForm({...editProductForm, description: e.target.value})}
                    placeholder="Enter product description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">Product Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Dosage Form</Label>
                    <Input
                      value={editProductForm.dosageForm}
                      onChange={(e) => setEditProductForm({...editProductForm, dosageForm: e.target.value})}
                      placeholder="e.g., Tablet, Syrup"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Strength</Label>
                    <Input
                      value={editProductForm.strength}
                      onChange={(e) => setEditProductForm({...editProductForm, strength: e.target.value})}
                      placeholder="e.g., 500mg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Active Ingredient</Label>
                    <Input
                      value={editProductForm.activeIngredient}
                      onChange={(e) => setEditProductForm({...editProductForm, activeIngredient: e.target.value})}
                      placeholder="e.g., Paracetamol"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Discounts */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">Pricing & Discounts</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Price per Unit (Frw) <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      value={editProductForm.pricePerUnit}
                      onChange={(e) => {
                        const value = e.target.value.replace(/^0+/, '') || '0'
                        setEditProductForm({...editProductForm, pricePerUnit: value})
                      }}
                      placeholder="0"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500">💡 Enter the price per unit in Rwandan Francs</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Discount % (cooperative members)</Label>
                    <Input
                      type="number"
                      value={editProductForm.coopDiscountPercent}
                      onChange={(e) => {
                        const value = e.target.value.replace(/^0+/, '') || '0'
                        setEditProductForm({...editProductForm, coopDiscountPercent: value})
                      }}
                      placeholder="0"
                      min="0"
                      max="100"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500">🏪 Discount percentage for cooperative members (0-100%)</p>
                  </div>
                </div>
              </div>

              {/* Requirements & Restrictions */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">Requirements & Restrictions</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requiresPrescription"
                      checked={editProductForm.requiresPrescription}
                      onChange={(e) => setEditProductForm({...editProductForm, requiresPrescription: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="requiresPrescription" className="text-sm font-medium text-gray-700">
                      Requires Prescription
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="controlledSubstance"
                      checked={editProductForm.controlledSubstance}
                      onChange={(e) => setEditProductForm({...editProductForm, controlledSubstance: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="controlledSubstance" className="text-sm font-medium text-gray-700">
                      Controlled Substance
                    </Label>
                  </div>
                </div>
              </div>

              {/* Location Assignment */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">Location Assignment</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Assign to Warehouse (optional)</Label>
                    <Select value={editProductForm.pharmacyWarehouseId} onValueChange={(value) => setEditProductForm({...editProductForm, pharmacyWarehouseId: value, locationId: ""})}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map(w => (
                          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {editProductForm.pharmacyWarehouseId && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Assign to Zone (optional)</Label>
                      <Select value={editProductForm.locationId} onValueChange={(value) => setEditProductForm({...editProductForm, locationId: value})}>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select zone" />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.filter(z => z.warehouseId === editProductForm.pharmacyWarehouseId).map(z => (
                            <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-shrink-0 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={() => setIsEditProductOpen(false)} className="px-6">
              Cancel
            </Button>
            <Button onClick={submitEditProduct} className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Product Dialog */}
      <Dialog open={isCreateProductOpen} onOpenChange={setIsCreateProductOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl flex flex-col">
          <DialogHeader className="text-center pb-6 flex-shrink-0">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">Create New Product</DialogTitle>
            <DialogDescription className="text-gray-600">Add a new pharmacy product to your inventory</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-8">
              {/* Basic Information Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-emerald-600">*</span>
                      Product Name
                    </Label>
                    <Input 
                      value={createProductForm.name} 
                      onChange={(e) => setCreateProductForm({ ...createProductForm, name: e.target.value })}
                      placeholder="e.g., Amoxicillin 500mg"
                      className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <Input 
                      value={createProductForm.description} 
                      onChange={(e) => setCreateProductForm({ ...createProductForm, description: e.target.value })}
                      placeholder="Brief description of the product"
                      className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Product Details Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Product Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Category</Label>
                    <Select value={createProductForm.category} onValueChange={(v) => setCreateProductForm({ ...createProductForm, category: v })}>
                      <SelectTrigger className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANTIBIOTIC">🦠 Antibiotic</SelectItem>
                        <SelectItem value="ANALGESIC">💊 Analgesic</SelectItem>
                        <SelectItem value="ANTIPARASITIC">🐛 Antiparasitic</SelectItem>
                        <SelectItem value="VITAMIN">🥬 Vitamin</SelectItem>
                        <SelectItem value="OTHER">📦 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Dosage Form</Label>
                    <Input 
                      placeholder="Tablet, Injection, Syrup" 
                      value={createProductForm.dosageForm} 
                      onChange={(e) => setCreateProductForm({ ...createProductForm, dosageForm: e.target.value })}
                      className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Strength</Label>
                    <Input 
                      placeholder="500mg, 10%" 
                      value={createProductForm.strength} 
                      onChange={(e) => setCreateProductForm({ ...createProductForm, strength: e.target.value })}
                      className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Active Ingredient</Label>
                    <Input 
                      placeholder="e.g., Amoxicillin" 
                      value={createProductForm.activeIngredient} 
                      onChange={(e) => setCreateProductForm({ ...createProductForm, activeIngredient: e.target.value })}
                      className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Pricing & Discounts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-emerald-600">*</span>
                      Price per Unit (Frw)
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={createProductForm.pricePerUnit}
                        onFocus={(e) => e.currentTarget.select()}
                        onChange={(e) => {
                          const raw = e.target.value
                          const sanitized = raw && !raw.startsWith('0.') ? raw.replace(/^0+(?=\d)/, '') : raw
                          setCreateProductForm({ ...createProductForm, pricePerUnit: sanitized })
                        }}
                        className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pl-8"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">₣</div>
                    </div>
                    <p className="text-xs text-gray-500">Enter the price per unit in Rwandan Francs</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Discount % (cooperative members)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        max="100"
                        value={createProductForm.coopDiscountPercent}
                        onFocus={(e) => e.currentTarget.select()}
                        onChange={(e) => {
                          const raw = e.target.value
                          const sanitized = raw && !raw.startsWith('0.') ? raw.replace(/^0+(?=\d)/, '') : raw
                          let num = parseFloat(sanitized)
                          if (isNaN(num)) num = 0
                          if (num < 0) num = 0
                          if (num > 100) num = 100
                          setCreateProductForm({ ...createProductForm, coopDiscountPercent: num.toString() })
                        }}
                        className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pr-8"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">%</div>
                    </div>
                    <p className="text-xs text-gray-500">Discount applied only for cooperative members (0-100%)</p>
                  </div>
                </div>
              </div>

              {/* Requirements Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Requirements & Restrictions
                </h3>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={createProductForm.requiresPrescription} 
                      onChange={(e) => setCreateProductForm({ ...createProductForm, requiresPrescription: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Requires Prescription</span>
                      <span className="text-xs text-gray-500">(Doctor's prescription needed)</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={createProductForm.controlledSubstance} 
                      onChange={(e) => setCreateProductForm({ ...createProductForm, controlledSubstance: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Controlled Substance</span>
                      <span className="text-xs text-gray-500">(Special regulations apply)</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Location Assignment Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Location Assignment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Assign to Warehouse</Label>
                    <Select value={createProductForm.pharmacyWarehouseId} onValueChange={(v) => setCreateProductForm({ ...createProductForm, pharmacyWarehouseId: v, locationId: "" })}>
                      <SelectTrigger className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                        <SelectValue placeholder="Select warehouse (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map(w => (
                          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Assign to Zone</Label>
                    <Select value={createProductForm.locationId} onValueChange={(v) => setCreateProductForm({ ...createProductForm, locationId: v })}>
                      <SelectTrigger disabled={!createProductForm.pharmacyWarehouseId} className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                        <SelectValue placeholder={createProductForm.pharmacyWarehouseId ? "Select zone (optional)" : "Select warehouse first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {(createProductForm.pharmacyWarehouseId ? zones.filter(z => z.warehouseId === createProductForm.pharmacyWarehouseId) : []).map(z => (
                          <SelectItem key={z.id} value={z.id}>{z.name}{z.code ? ` (${z.code})` : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!createProductForm.pharmacyWarehouseId && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="text-yellow-500">⚠</span>
                        Choose a warehouse to see available zones
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-gray-100 flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={() => setIsCreateProductOpen(false)}
              className="h-11 px-6 border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                try {
                  if (!createProductForm.name.trim()) {
                    await swalError('Validation', 'Product name is required')
                    return
                  }
                  if (!createProductForm.pricePerUnit || isNaN(parseFloat(createProductForm.pricePerUnit))) {
                    await swalError('Validation', 'Valid price per unit is required')
                    return
                  }
                  swalLoading('Creating product...')
                  
                  // Auto-assign to Main warehouse if no warehouse is selected
                  let productData = { ...createProductForm }
                  if (!productData.pharmacyWarehouseId) {
                    const mainWarehouse = warehouses.find(w => w.isMain)
                    if (mainWarehouse) {
                      productData.pharmacyWarehouseId = mainWarehouse.id
                      console.log('Auto-assigning product to Main warehouse:', mainWarehouse.name)
                    }
                  }
                  
                  console.log('Sending product data:', productData)
                  const res = await fetch('/api/v1/inventory/products', { method: 'POST', headers: authHeaders(), body: JSON.stringify(productData) })
                  const data = await res.json()
                  console.log('Product creation response:', data)
                  if (!res.ok || !data.success) {
                    const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error || 'Failed to create product'
                    throw new Error(errorMsg)
                  }
                  // Refresh all inventory data
                  await refreshInventoryData()
                  setIsCreateProductOpen(false)
                  await swalSuccess('Product created')
                } catch (e:any) { console.error(e); await swalError('Failed', e?.message || 'Could not create product') }
              }} 
              className="h-11 px-8 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
