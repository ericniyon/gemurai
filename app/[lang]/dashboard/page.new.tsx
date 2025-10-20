"use client"

import { useState } from "react"
import { useParams } from "next/navigation"

// Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Custom Components
import { CapitalDetails } from "./components/capital-details"
import { KPIChart } from "./components/kpi-chart"

// Hooks
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

// Utils
import { cn } from "@/lib/utils"
import { dashboardTranslations } from "@/app/[lang]/translations/dashboard"

// Icons
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Bell,
  Users,
  Briefcase,
  Clock,
  LineChart
} from "lucide-react"

// Types
type BusinessMetrics = {
  stock: {
    total: number
    digital: number
    physical: number
    outOfStock: number
  }
  earnings: {
    total: number
    lastMonth: number
    growth: number
  }
  capital: {
    total: number
    available: number
    invested: number
  }
  sales: {
    total: number
    average: number
    target: number
  }
}

type EmployerMetrics = {
  employees: {
    total: number
    active: number
    onLeave: number
    newHires: number
    growth: number
  }
  jobs: {
    total: number
    active: number
    completed: number
    inProgress: number
  }
  productivity: {
    average: number
    target: number
    growth: number
  }
  retention: {
    rate: number
    improvement: number
    avgTenure: number
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const t = dashboardTranslations[lang]
  const { toast } = useToast()
  const [isCapitalDetailsOpen, setIsCapitalDetailsOpen] = useState(false)
  
  // Business metrics state
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    stock: {
      total: 10000,
      digital: 6000,
      physical: 4000,
      outOfStock: 150
    },
    earnings: {
      total: 25000,
      lastMonth: 20000,
      growth: 25
    },
    capital: {
      total: 50000,
      available: 30000,
      invested: 20000
    },
    sales: {
      total: 15000,
      average: 500,
      target: 20000
    }
  })

  // Employer metrics state
  const [employerMetrics, setEmployerMetrics] = useState<EmployerMetrics>({
    employees: {
      total: 150,
      active: 135,
      onLeave: 10,
      newHires: 5,
      growth: 15
    },
    jobs: {
      total: 200,
      active: 45,
      completed: 145,
      inProgress: 10
    },
    productivity: {
      average: 85,
      target: 90,
      growth: 5
    },
    retention: {
      rate: 92,
      improvement: 3,
      avgTenure: 2.5
    }
  })

  // Chart data for KPI visualization
  const [chartData] = useState({
    inventory: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      orders: [120, 150, 180, 220, 150, 180],
      sales: [2000000, 2500000, 3000000, 3500000, 2500000, 3000000],
      stockRatio: [2.1, 2.3, 2.5, 2.8, 2.4, 2.5],
      commission: [200000, 250000, 300000, 350000, 250000, 300000]
    },
    employer: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      employeeGrowth: [130, 135, 140, 142, 145, 150],
      productivity: [80, 82, 85, 83, 86, 85],
      retention: [88, 89, 90, 91, 92, 92],
      jobCompletion: [85, 87, 89, 90, 92, 93]
    }
  })

  // Add notification state
  const [notifications] = useState([
    {
      id: 1,
      title: "New Applications",
      message: "5 new job applications received",
      type: "success"
    },
    {
      id: 2,
      title: "Performance Review",
      message: "Quarterly reviews due in 2 weeks",
      type: "warning"
    }
  ])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Format percentage with + or - sign
  const formatPercentage = (value: number) => {
    return value >= 0 ? `+${value}%` : `${value}%`
  }

  if (!user) return null

  return (
    <div className="container py-6 space-y-8 animate-in fade-in-50">
      {/* Welcome Section with Quick Stats */}
      <div className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{t.title}</h1>
            <p className="text-blue-100">{t.subtitle}</p>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white">
              <Bell className="h-5 w-5 mr-2" />
              <span className="font-semibold">{notifications.length}</span>
            </Button>
          </div>
        </div>
        
        {/* Notification Panel */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {notification.type === "warning" ? (
                  <div className="bg-yellow-500/20 p-2 rounded-lg">
                    <Activity className="h-5 w-5 text-yellow-300" />
                  </div>
                ) : (
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-300" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-sm">{notification.title}</h3>
                  <p className="text-sm text-blue-100">{notification.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {user.role === "EMPLOYER" && (
        <>
          {/* Employer Analytics Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* ... analytics cards ... */}
          </div>

          {/* Performance Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <KPIChart 
              data={chartData.employer} 
              title="Employee Growth Trend" 
              metric="employeeGrowth"
              format="number"
            />
            <KPIChart 
              data={chartData.employer} 
              title="Productivity" 
              metric="productivity"
              format="percentage"
            />
          </div>

          {/* Additional Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <KPIChart 
              data={chartData.employer} 
              title="Retention Rate" 
              metric="retention"
              format="percentage"
            />
            <KPIChart 
              data={chartData.employer} 
              title="Job Completion Rate" 
              metric="jobCompletion"
              format="percentage"
            />
          </div>
        </>
      )}

      {user.role === "DCC" && (
        <>
          {/* Business Analytics Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* ... analytics cards ... */}
          </div>

          {/* KPI Charts */}
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Performance Analytics</h2>
              <p className="text-sm text-muted-foreground">Track your key performance indicators</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <KPIChart 
                data={chartData.inventory} 
                title="Sales Performance" 
                metric="sales"
                format="currency"
              />
              <KPIChart 
                data={chartData.inventory} 
                title="Stock Ratio" 
                metric="stockRatio"
                format="number"
              />
            </div>
          </div>

          {/* Capital Details Dialog */}
          <CapitalDetails
            isOpen={isCapitalDetailsOpen}
            onClose={() => setIsCapitalDetailsOpen(false)}
            data={{
              float: metrics.capital.available,
              stock: {
                total: metrics.stock.total,
                digital: metrics.stock.digital,
                physical: metrics.stock.physical
              },
              earnings: metrics.earnings.total
            }}
          />
        </>
      )}
    </div>
  )
} 