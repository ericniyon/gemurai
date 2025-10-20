"use client"

import { useState, useEffect } from "react"
import { MapPin, Filter, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// Rwanda districts data
const RWANDA_DISTRICTS = [
  "Gasabo",
  "Kicukiro", 
  "Nyarugenge",
  "Nyagatare",
  "Musanze",
  "Burera",
  "Gakenke",
  "Gicumbi",
  "Rulindo",
  "Huye",
  "Kamonyi",
  "Muhanga",
  "Nyanza",
  "Ruhango",
  "Gisagara",
  "Nyamagabe",
  "Nyaruguru",
  "Karongi",
  "Rubavu",
  "Rusizi",
  "Nyamasheke",
  "Ngororero",
  "Nyabihu",
  "Rutsiro",
  "Kayonza",
  "Rwamagana",
  "Ngoma",
  "Kirehe",
  "Bugesera"
] as const

interface DistrictFilterProps {
  selectedDistricts: string[]
  onDistrictsChange: (districts: string[]) => void
  className?: string
}

export function DistrictFilter({ 
  selectedDistricts, 
  onDistrictsChange, 
  className = "" 
}: DistrictFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [tempSelectedDistricts, setTempSelectedDistricts] = useState<string[]>(selectedDistricts)

  // Update temp selection when prop changes
  useEffect(() => {
    setTempSelectedDistricts(selectedDistricts)
  }, [selectedDistricts])

  // Filter districts based on search term
  const filteredDistricts = RWANDA_DISTRICTS.filter(district =>
    district.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDistrictToggle = (district: string) => {
    const newSelection = tempSelectedDistricts.includes(district)
      ? tempSelectedDistricts.filter(d => d !== district)
      : [...tempSelectedDistricts, district]
    
    setTempSelectedDistricts(newSelection)
  }

  const handleApply = () => {
    onDistrictsChange(tempSelectedDistricts)
    setIsOpen(false)
  }

  const handleClear = () => {
    setTempSelectedDistricts([])
    onDistrictsChange([])
    setIsOpen(false)
  }

  const handleSelectAll = () => {
    setTempSelectedDistricts([...RWANDA_DISTRICTS])
  }

  const handleSelectNone = () => {
    setTempSelectedDistricts([])
  }

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 px-3 text-sm font-medium"
          >
            <MapPin className="h-4 w-4 mr-2" />
            <Filter className="h-4 w-4 mr-1" />
            Districts
            {selectedDistricts.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {selectedDistricts.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Filter by District</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search districts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="h-7 text-xs"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectNone}
                className="h-7 text-xs"
              >
                Select None
              </Button>
            </div>

            <Separator className="mb-3" />

            {/* Districts list */}
            <ScrollArea className="h-64">
              <div className="space-y-1">
                {filteredDistricts.map((district) => (
                  <div
                    key={district}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handleDistrictToggle(district)}
                  >
                    <input
                      type="checkbox"
                      checked={tempSelectedDistricts.includes(district)}
                      onChange={() => handleDistrictToggle(district)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label className="text-sm font-normal cursor-pointer flex-1">
                      {district}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Selected districts summary */}
            {tempSelectedDistricts.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-xs text-gray-600 mb-2">
                  Selected: {tempSelectedDistricts.length} district(s)
                </div>
                <div className="flex flex-wrap gap-1">
                  {tempSelectedDistricts.slice(0, 3).map((district) => (
                    <Badge key={district} variant="secondary" className="text-xs">
                      {district}
                    </Badge>
                  ))}
                  {tempSelectedDistricts.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{tempSelectedDistricts.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="h-8 text-xs"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                className="h-8 text-xs"
              >
                Apply Filter
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected districts display */}
      {selectedDistricts.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedDistricts.map((district) => (
            <Badge
              key={district}
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-gray-200"
              onClick={() => {
                const newSelection = selectedDistricts.filter(d => d !== district)
                onDistrictsChange(newSelection)
              }}
            >
              {district}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// Utility function to extract district from application form data
export function extractDistrictFromApplication(application: any): string {
  if (!application?.formData) return ""
  
  const formData = application.formData
  
  // Try different possible field names for district
  const possibleFields = [
    'district',
    'District',
    'DISTRICT',
    'location.district',
    'address.district',
    'q11.district',
    'location',
    'address'
  ]
  
  for (const field of possibleFields) {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      if (formData[parent] && typeof formData[parent] === 'object') {
        const value = formData[parent][child]
        if (value && typeof value === 'string' && value.trim()) {
          return value.trim()
        }
      }
    } else {
      const value = formData[field]
      if (value && typeof value === 'string' && value.trim()) {
        return value.trim()
      }
    }
  }
  
  return ""
}

// Utility function to check if application matches district filter
export function applicationMatchesDistrictFilter(
  application: any, 
  selectedDistricts: string[]
): boolean {
  if (selectedDistricts.length === 0) return true
  
  const applicationDistrict = extractDistrictFromApplication(application)
  if (!applicationDistrict) return false
  
  return selectedDistricts.some(district => 
    applicationDistrict.toLowerCase().includes(district.toLowerCase()) ||
    district.toLowerCase().includes(applicationDistrict.toLowerCase())
  )
}
