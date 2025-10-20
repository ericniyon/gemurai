"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { MapPin, ChevronRight, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DependentDropdownDBProps {
  onAddressChange: (address: {
    province?: string
    district?: string
    sector?: string
    cell?: string
    village?: string
  }) => void
  initialValues?: {
    province?: string
    district?: string
    sector?: string
    cell?: string
    village?: string
  }
  required?: boolean
  error?: boolean
  lang?: string
}

interface Option {
  id: string
  name: string
}

export default function DependentDropdownDB({
  onAddressChange,
  initialValues = {},
  required = false,
  error = false,
  lang = 'en'
}: DependentDropdownDBProps) {
  const [provinces, setProvinces] = useState<Option[]>([])
  const [districts, setDistricts] = useState<Option[]>([])
  const [sectors, setSectors] = useState<Option[]>([])
  const [cells, setCells] = useState<Option[]>([])
  const [villages, setVillages] = useState<Option[]>([])

  const [selectedProvince, setSelectedProvince] = useState(initialValues.province || "")
  const [selectedDistrict, setSelectedDistrict] = useState(initialValues.district || "")
  const [selectedSector, setSelectedSector] = useState(initialValues.sector || "")
  const [selectedCell, setSelectedCell] = useState(initialValues.cell || "")
  const [selectedVillage, setSelectedVillage] = useState(initialValues.village || "")

  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    sectors: false,
    cells: false,
    villages: false,
  })

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces()
  }, [])

  // Load dependent data when selections change
  useEffect(() => {
    if (selectedProvince) {
      loadDistricts(selectedProvince)
    } else {
      setDistricts([])
      setSectors([])
      setCells([])
      setVillages([])
    }
  }, [selectedProvince])

  useEffect(() => {
    if (selectedDistrict) {
      loadSectors(selectedDistrict)
    } else {
      setSectors([])
      setCells([])
      setVillages([])
    }
  }, [selectedDistrict])

  useEffect(() => {
    if (selectedSector) {
      loadCells(selectedSector)
    } else {
      setCells([])
      setVillages([])
    }
  }, [selectedSector])

  useEffect(() => {
    if (selectedCell) {
      loadVillages(selectedCell)
    } else {
      setVillages([])
    }
  }, [selectedCell])

  // Notify parent of address changes
  useEffect(() => {
    const currentAddress = {
      province: selectedProvince || undefined,
      district: selectedDistrict || undefined,
      sector: selectedSector || undefined,
      cell: selectedCell || undefined,
      village: selectedVillage || undefined,
    }
    onAddressChange(currentAddress)
  }, [selectedProvince, selectedDistrict, selectedSector, selectedCell, selectedVillage])

  const loadProvinces = async () => {
    setLoading((prev) => ({ ...prev, provinces: true }))
    try {
      const response = await fetch("/api/v1/rwanda-divisions?type=provinces")
      if (response.ok) {
        const data = await response.json()
        setProvinces(data)
      }
    } catch (error) {
      console.error("Error loading provinces:", error)
    } finally {
      setLoading((prev) => ({ ...prev, provinces: false }))
    }
  }

  const loadDistricts = async (provinceId: string) => {
    setLoading((prev) => ({ ...prev, districts: true }))
    try {
      const response = await fetch(`/api/v1/rwanda-divisions?type=districts&parentId=${provinceId}`)
      if (response.ok) {
        const data = await response.json()
        setDistricts(data)
      }
    } catch (error) {
      console.error("Error loading districts:", error)
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }))
    }
  }

  const loadSectors = async (districtId: string) => {
    setLoading((prev) => ({ ...prev, sectors: true }))
    try {
      const response = await fetch(`/api/v1/rwanda-divisions?type=sectors&parentId=${districtId}`)
      if (response.ok) {
        const data = await response.json()
        setSectors(data)
      }
    } catch (error) {
      console.error("Error loading sectors:", error)
    } finally {
      setLoading((prev) => ({ ...prev, sectors: false }))
    }
  }

  const loadCells = async (sectorId: string) => {
    setLoading((prev) => ({ ...prev, cells: true }))
    try {
      const response = await fetch(`/api/v1/rwanda-divisions?type=cells&parentId=${sectorId}`)
      if (response.ok) {
        const data = await response.json()
        setCells(data)
      }
    } catch (error) {
      console.error("Error loading cells:", error)
    } finally {
      setLoading((prev) => ({ ...prev, cells: false }))
    }
  }

  const loadVillages = async (cellId: string) => {
    setLoading((prev) => ({ ...prev, villages: true }))
    try {
      const response = await fetch(`/api/v1/rwanda-divisions?type=villages&parentId=${cellId}`)
      if (response.ok) {
        const data = await response.json()
        setVillages(data)
      }
    } catch (error) {
      console.error("Error loading villages:", error)
    } finally {
      setLoading((prev) => ({ ...prev, villages: false }))
    }
  }

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value)
    setSelectedDistrict("")
    setSelectedSector("")
    setSelectedCell("")
    setSelectedVillage("")
    // Clear dependent arrays
    setDistricts([])
    setSectors([])
    setCells([])
    setVillages([])
  }

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value)
    setSelectedSector("")
    setSelectedCell("")
    setSelectedVillage("")
    // Clear dependent arrays
    setSectors([])
    setCells([])
    setVillages([])
  }

  const handleSectorChange = (value: string) => {
    setSelectedSector(value)
    setSelectedCell("")
    setSelectedVillage("")
    // Clear dependent arrays
    setCells([])
    setVillages([])
  }

  const handleCellChange = (value: string) => {
    setSelectedCell(value)
    setSelectedVillage("")
    // Clear dependent arrays
    setVillages([])
  }

  const handleVillageChange = (value: string) => {
    setSelectedVillage(value)
  }

  return (
    <div className="space-y-6">
      {/* Header with Icon */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <div className="p-2 bg-blue-50 rounded-lg">
          <MapPin className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Address Information</h3>
          <p className="text-sm text-gray-600">Please provide your complete address details</p>
        </div>
      </div>

      {/* Address Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Province */}
        <div className="space-y-2">
          <Label htmlFor="province" className="text-sm font-medium flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              1
            </span>
            Province {required && <span className="text-red-500">*</span>}
            {loading.provinces && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          </Label>
          <Select value={selectedProvince} onValueChange={handleProvinceChange} disabled={loading.provinces}>
            <SelectTrigger
              className={`transition-all duration-200 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            >
              <SelectValue placeholder={loading.provinces ? "Loading..." : "Select Province"} />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province.id} value={province.id}>
                  {lang === 'rw' 
                    ? province.id === 'eastern' 
                      ? "Intara y'Iburasirazuba" 
                      : "Amajyaruguru"
                    : province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District */}
        <div className="space-y-2">
          <Label htmlFor="district" className="text-sm font-medium flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              2
            </span>
            District {required && <span className="text-red-500">*</span>}
            {selectedProvince && <ChevronRight className="h-4 w-4 text-gray-400" />}
            {loading.districts && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          </Label>
          <Select
            value={selectedDistrict}
            onValueChange={handleDistrictChange}
            disabled={!selectedProvince || loading.districts}
          >
            <SelectTrigger
              className={`transition-all duration-200 ${
                !selectedProvince ? "opacity-50" : ""
              } ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            >
              <SelectValue
                placeholder={
                  !selectedProvince ? "Select Province first" : loading.districts ? "Loading..." : "Select District"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sector */}
        <div className="space-y-2">
          <Label htmlFor="sector" className="text-sm font-medium flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              3
            </span>
            Sector {required && <span className="text-red-500">*</span>}
            {selectedDistrict && <ChevronRight className="h-4 w-4 text-gray-400" />}
            {loading.sectors && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          </Label>
          <Select
            value={selectedSector}
            onValueChange={handleSectorChange}
            disabled={!selectedDistrict || loading.sectors}
          >
            <SelectTrigger
              className={`transition-all duration-200 ${
                !selectedDistrict ? "opacity-50" : ""
              } ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            >
              <SelectValue
                placeholder={
                  !selectedDistrict ? "Select District first" : loading.sectors ? "Loading..." : "Select Sector"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cell */}
        <div className="space-y-2">
          <Label htmlFor="cell" className="text-sm font-medium flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              4
            </span>
            Cell {required && <span className="text-red-500">*</span>}
            {selectedSector && <ChevronRight className="h-4 w-4 text-gray-400" />}
            {loading.cells && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          </Label>
          <Select value={selectedCell} onValueChange={handleCellChange} disabled={!selectedSector || loading.cells}>
            <SelectTrigger
              className={`transition-all duration-200 ${
                !selectedSector ? "opacity-50" : ""
              } ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            >
              <SelectValue
                placeholder={!selectedSector ? "Select Sector first" : loading.cells ? "Loading..." : "Select Cell"}
              />
            </SelectTrigger>
            <SelectContent>
              {cells.map((cell) => (
                <SelectItem key={cell.id} value={cell.id}>
                  {cell.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Village - Full Width */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="village" className="text-sm font-medium flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              5
            </span>
            Village {required && <span className="text-red-500">*</span>}
            {selectedCell && <ChevronRight className="h-4 w-4 text-gray-400" />}
            {loading.villages && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          </Label>
          <Select
            value={selectedVillage}
            onValueChange={handleVillageChange}
            disabled={!selectedCell || loading.villages}
          >
            <SelectTrigger
              className={`transition-all duration-200 ${
                !selectedCell ? "opacity-50" : ""
              } ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            >
              <SelectValue
                placeholder={!selectedCell ? "Select Cell first" : loading.villages ? "Loading..." : "Select Village"}
              />
            </SelectTrigger>
            <SelectContent>
              {villages.map((village) => (
                <SelectItem key={village.id} value={village.id}>
                  {village.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Address Summary */}
      {(selectedProvince || selectedDistrict || selectedSector || selectedCell || selectedVillage) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Address Summary
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            {selectedVillage && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Complete Address:</span>
                <span className="text-gray-800">
                  {[
                    villages.find((v) => v.id === selectedVillage)?.name,
                    cells.find((c) => c.id === selectedCell)?.name,
                    sectors.find((s) => s.id === selectedSector)?.name,
                    districts.find((d) => d.id === selectedDistrict)?.name,
                    provinces.find((p) => p.id === selectedProvince)?.name,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
              {selectedProvince && (
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-xs text-gray-500">Province</div>
                  <div className="font-medium text-xs">{provinces.find((p) => p.id === selectedProvince)?.name}</div>
                </div>
              )}
              {selectedDistrict && (
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-xs text-gray-500">District</div>
                  <div className="font-medium text-xs">{districts.find((d) => d.id === selectedDistrict)?.name}</div>
                </div>
              )}
              {selectedSector && (
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-xs text-gray-500">Sector</div>
                  <div className="font-medium text-xs">{sectors.find((s) => s.id === selectedSector)?.name}</div>
                </div>
              )}
              {selectedCell && (
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-xs text-gray-500">Cell</div>
                  <div className="font-medium text-xs">{cells.find((c) => c.id === selectedCell)?.name}</div>
                </div>
              )}
              {selectedVillage && (
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-xs text-gray-500">Village</div>
                  <div className="font-medium text-xs">{villages.find((v) => v.id === selectedVillage)?.name}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
