"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  Users, 
  ChevronRight, 
  ChevronDown,
  Building,
  TrendingUp,
  Eye,
  ArrowLeft
} from "lucide-react"
import { ApplicationWithRelations } from "@/types/application"
import { extractDistrictFromApplication } from "./district-filter"

// Rwanda provinces and their districts
const RWANDA_PROVINCES = {
  "Kigali City": {
    districts: ["Gasabo", "Kicukiro", "Nyarugenge"],
    color: "bg-blue-500",
    icon: "🏛️"
  },
  "Northern Province": {
    districts: ["Musanze", "Burera", "Gakenke", "Gicumbi", "Rulindo"],
    color: "bg-green-500", 
    icon: "🏔️"
  },
  "Southern Province": {
    districts: ["Huye", "Kamonyi", "Muhanga", "Nyanza", "Ruhango", "Gisagara", "Nyamagabe", "Nyaruguru"],
    color: "bg-purple-500",
    icon: "🌾"
  },
  "Eastern Province": {
    districts: ["Nyagatare", "Kayonza", "Rwamagana", "Ngoma", "Kirehe", "Bugesera"],
    color: "bg-orange-500",
    icon: "🌅"
  },
  "Western Province": {
    districts: ["Karongi", "Rubavu", "Rusizi", "Nyamasheke", "Ngororero", "Nyabihu", "Rutsiro"],
    color: "bg-red-500",
    icon: "🌊"
  }
} as const

interface ProvinceCardsProps {
  applications: ApplicationWithRelations[]
  onViewApplication: (applicationId: string) => void
  className?: string
  lang?: string
}

interface DistrictBreakdown {
  district: string
  applications: ApplicationWithRelations[]
  count: number
}

export function ProvinceCards({ 
  applications, 
  onViewApplication, 
  className = "",
  lang = "en"
}: ProvinceCardsProps) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  // Calculate province statistics
  const provinceStats = useMemo(() => {
    const stats: Record<string, {
      totalApplications: number
      districts: DistrictBreakdown[]
      totalDistricts: number
    }> = {}

    Object.entries(RWANDA_PROVINCES).forEach(([provinceName, provinceData]) => {
      const provinceApplications = applications.filter(app => {
        const district = extractDistrictFromApplication(app)
        return provinceData.districts.some(provinceDistrict => 
          district.toLowerCase().includes(provinceDistrict.toLowerCase()) ||
          provinceDistrict.toLowerCase().includes(district.toLowerCase())
        )
      })

      const districtBreakdown: DistrictBreakdown[] = provinceData.districts.map(districtName => {
        const districtApplications = provinceApplications.filter(app => {
          const appDistrict = extractDistrictFromApplication(app)
          return appDistrict.toLowerCase().includes(districtName.toLowerCase()) ||
                 districtName.toLowerCase().includes(appDistrict.toLowerCase())
        })
        
        return {
          district: districtName,
          applications: districtApplications,
          count: districtApplications.length
        }
      }).filter(d => d.count > 0) // Only show districts with applications

      stats[provinceName] = {
        totalApplications: provinceApplications.length,
        districts: districtBreakdown,
        totalDistricts: districtBreakdown.length
      }
    })

    return stats
  }, [applications])

  const toggleCardExpansion = (province: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(province)) {
      newExpanded.delete(province)
    } else {
      newExpanded.add(province)
    }
    setExpandedCards(newExpanded)
  }

  const handleProvinceClick = (province: string) => {
    if (selectedProvince === province) {
      setSelectedProvince(null)
    } else {
      setSelectedProvince(province)
    }
  }

  const handleDistrictClick = (district: string) => {
    // You could implement district-specific filtering here
    console.log(`Clicked on district: ${district}`)
  }

  const handleApplicationClick = (applicationId: string) => {
    onViewApplication(applicationId)
  }

  if (selectedProvince) {
    const provinceData = RWANDA_PROVINCES[selectedProvince as keyof typeof RWANDA_PROVINCES]
    const stats = provinceStats[selectedProvince]
    
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Back button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedProvince(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {lang === 'rw' ? 'Subira Inyuma' : 'Back to Provinces'}
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {provinceData.icon} {selectedProvince}
            </h2>
            <p className="text-sm text-muted-foreground">
              {lang === 'rw' 
                ? `${stats.totalApplications} ubwishingizi mu ${stats.totalDistricts} uturere`
                : `${stats.totalApplications} applications across ${stats.totalDistricts} districts`
              }
            </p>
          </div>
        </div>

        {/* Districts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.districts.map((districtData) => (
            <Card 
              key={districtData.district}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20"
              onClick={() => handleDistrictClick(districtData.district)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {districtData.district}
                  </CardTitle>
                  <Badge variant="secondary" className="text-sm">
                    {districtData.count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {lang === 'rw' 
                      ? `${districtData.count} ubwishingizi`
                      : `${districtData.count} applications`
                    }
                  </div>
                  
                  {/* Recent applications preview */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {lang === 'rw' ? 'Ubwishingizi Bwa Vuba:' : 'Recent Applications:'}
                    </p>
                    {districtData.applications.slice(0, 3).map((app) => (
                      <div 
                        key={app.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs hover:bg-muted transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApplicationClick(app.id)
                        }}
                      >
                        <span className="truncate">
                          {app.user?.name || app.formData?.['First Name'] || 'Unknown'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApplicationClick(app.id)
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {districtData.applications.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{districtData.applications.length - 3} {lang === 'rw' ? 'byinshi' : 'more'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {lang === 'rw' ? 'Ubwishingizi by\'Intara' : 'Applications by Province'}
        </h2>
        <p className="text-muted-foreground">
          {lang === 'rw' 
            ? 'Hitamo intara ureba ubwishingizi bw\'uturere twayo'
            : 'Select a province to view applications from its districts'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(RWANDA_PROVINCES).map(([provinceName, provinceData]) => {
          const stats = provinceStats[provinceName]
          const isExpanded = expandedCards.has(provinceName)
          
          return (
            <Card 
              key={provinceName}
              className={`hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${provinceData.color.replace('bg-', 'border-l-4 border-l-')} hover:border-primary/30`}
              onClick={() => handleProvinceClick(provinceName)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-foreground flex items-center gap-3">
                    <span className="text-2xl">{provinceData.icon}</span>
                    <span>{provinceName}</span>
                  </CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={`text-sm font-semibold ${provinceData.color} text-white`}
                  >
                    {stats.totalApplications}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Building className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {lang === 'rw' ? 'Uturere' : 'Districts'}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {stats.totalDistricts}
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {lang === 'rw' ? 'Ubwishingizi' : 'Applications'}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {stats.totalApplications}
                    </div>
                  </div>
                </div>

                {/* Districts preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {lang === 'rw' ? 'Uturere Dufite Ubwishingizi:' : 'Districts with Applications:'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleCardExpansion(provinceName)
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {isExpanded && (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {stats.districts.map((districtData) => (
                        <div 
                          key={districtData.district}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm hover:bg-muted transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {districtData.district}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {districtData.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {!isExpanded && stats.districts.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {stats.districts.slice(0, 3).map((districtData) => (
                        <Badge key={districtData.district} variant="outline" className="text-xs">
                          {districtData.district} ({districtData.count})
                        </Badge>
                      ))}
                      {stats.districts.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{stats.districts.length - 3} {lang === 'rw' ? 'byinshi' : 'more'}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Click to view message */}
                <div className="text-center pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Eye className="h-3 w-3" />
                    {lang === 'rw' ? 'Kanda urebe uturere' : 'Click to view districts'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary stats */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {Object.values(provinceStats).reduce((sum, stats) => sum + stats.totalApplications, 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                {lang === 'rw' ? 'Ubwishingizi Byose' : 'Total Applications'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {Object.values(provinceStats).reduce((sum, stats) => sum + stats.totalDistricts, 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                {lang === 'rw' ? 'Uturere Dufite Ubwishingizi' : 'Districts with Applications'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {Object.keys(RWANDA_PROVINCES).length}
              </div>
              <div className="text-sm text-muted-foreground">
                {lang === 'rw' ? 'Intara' : 'Provinces'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {Object.values(RWANDA_PROVINCES).reduce((sum, province) => sum + province.districts.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                {lang === 'rw' ? 'Uturere Byose' : 'Total Districts'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
