import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DependentDropdownProps {
  value: {
    province?: string
    district?: string
    sector?: string
    cell?: string
    village?: string
  }
  onChange: (updates: { [key: string]: string }) => void
  error?: boolean | string
}

// This is a simplified version. In a real application, you would fetch this data from an API
const locationData = {
  provinces: ["Kigali City", "Northern Province", "Southern Province", "Eastern Province", "Western Province"],
  districts: {
    "Kigali City": ["Gasabo", "Kicukiro", "Nyarugenge"],
    "Northern Province": ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"],
    "Southern Province": ["Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango"],
    "Eastern Province": ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"],
    "Western Province": ["Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"],
  },
  // Add more detailed data for sectors, cells, and villages as needed
}

export function DependentDropdown({ value, onChange, error }: DependentDropdownProps) {
  const [districts, setDistricts] = useState<string[]>([])

  useEffect(() => {
    if (value.province) {
      setDistricts(locationData.districts[value.province] || [])
    }
  }, [value.province])

  const handleProvinceChange = (province: string) => {
    onChange({
      province,
      district: "",
      sector: "",
      cell: "",
      village: "",
    })
  }

  const handleDistrictChange = (district: string) => {
    onChange({
      ...value,
      district,
      sector: "",
      cell: "",
      village: "",
    })
  }

  const handleSectorChange = (sector: string) => {
    onChange({
      ...value,
      sector,
      cell: "",
      village: "",
    })
  }

  const handleCellChange = (cell: string) => {
    onChange({
      ...value,
      cell,
      village: "",
    })
  }

  const handleVillageChange = (village: string) => {
    onChange({
      ...value,
      village,
    })
  }

  const hasError = Boolean(error)

  const selectClasses = cn(
    "w-full min-w-[200px]",
    hasError && "border-red-500"
  )

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="space-y-2 w-full">
          <Label className="flex items-baseline gap-2">
            <span className="inline-flex items-center justify-center rounded-full bg-primary w-6 h-6 text-primary-foreground text-sm">1</span>
            <span>Province</span>
          </Label>
          <Select value={value.province} onValueChange={handleProvinceChange}>
            <SelectTrigger className={selectClasses}>
              <SelectValue placeholder="Select province" />
            </SelectTrigger>
            <SelectContent>
              {locationData.provinces.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 w-full">
          <Label className="flex items-baseline gap-2">
            <span className="inline-flex items-center justify-center rounded-full bg-primary w-6 h-6 text-primary-foreground text-sm">2</span>
            <span>District</span>
          </Label>
          <Select 
            value={value.district} 
            onValueChange={handleDistrictChange}
            disabled={!value.province}
          >
            <SelectTrigger className={selectClasses}>
              <SelectValue placeholder={value.province ? "Select district" : "Select province first"} />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 w-full">
          <Label className="flex items-baseline gap-2">
            <span className="inline-flex items-center justify-center rounded-full bg-primary w-6 h-6 text-primary-foreground text-sm">3</span>
            <span>Sector</span>
          </Label>
          <Select 
            value={value.sector} 
            onValueChange={handleSectorChange}
            disabled={!value.district}
          >
            <SelectTrigger className={selectClasses}>
              <SelectValue placeholder={value.district ? "Select sector" : "Select district first"} />
            </SelectTrigger>
            <SelectContent>
              {/* Add sector data based on selected district */}
              <SelectItem value="example-sector">Example Sector</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 w-full">
          <Label className="flex items-baseline gap-2">
            <span className="inline-flex items-center justify-center rounded-full bg-primary w-6 h-6 text-primary-foreground text-sm">4</span>
            <span>Cell</span>
          </Label>
          <Select 
            value={value.cell} 
            onValueChange={handleCellChange}
            disabled={!value.sector}
          >
            <SelectTrigger className={selectClasses}>
              <SelectValue placeholder={value.sector ? "Select cell" : "Select sector first"} />
            </SelectTrigger>
            <SelectContent>
              {/* Add cell data based on selected cell */}
              <SelectItem value="example-cell">Example Cell</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 w-full">
          <Label className="flex items-baseline gap-2">
            <span className="inline-flex items-center justify-center rounded-full bg-primary w-6 h-6 text-primary-foreground text-sm">5</span>
            <span>Village</span>
          </Label>
          <Select 
            value={value.village} 
            onValueChange={handleVillageChange}
            disabled={!value.cell}
          >
            <SelectTrigger className={selectClasses}>
              <SelectValue placeholder={value.cell ? "Select village" : "Select cell first"} />
            </SelectTrigger>
            <SelectContent>
              {/* Add village data based on selected cell */}
              <SelectItem value="example-village">Example Village</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
} 