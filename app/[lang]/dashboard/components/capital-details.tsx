import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Package, DollarSign, Wallet, ShoppingBag, Archive } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface CapitalDetailsProps {
  isOpen: boolean
  onClose: () => void
  data: {
    float: number
    stock: {
      total: number
      digital: number
      physical: number
    }
    earnings: number
  }
}

export function CapitalDetails({ isOpen, onClose, data }: CapitalDetailsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-500" />
            Business Capital Analysis
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of your capital distribution and product inventory
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Float Card */}
          <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Wallet className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-lg">Available Capital</h3>
                </div>
                <span className="text-2xl font-bold text-blue-600">{formatCurrency(data.float)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Liquid capital available for operations and investments
              </p>
            </CardContent>
          </Card>

          {/* Digital Products */}
          <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-lg">Digital Products</h3>
                </div>
                <span className="text-2xl font-bold text-purple-600">{formatCurrency(data.stock.digital)}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Stock Value Ratio</span>
                    <span>{Math.round((data.stock.digital / data.stock.total) * 100)}%</span>
                  </div>
                  <Progress value={(data.stock.digital / data.stock.total) * 100} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Digital products include e-books, courses, and digital services
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Physical Products */}
          <Card className="border-2 border-orange-100 hover:border-orange-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Archive className="h-5 w-5 text-orange-500" />
                  </div>
                  <h3 className="font-semibold text-lg">Physical Products</h3>
                </div>
                <span className="text-2xl font-bold text-orange-600">{formatCurrency(data.stock.physical)}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Stock Value Ratio</span>
                    <span>{Math.round((data.stock.physical / data.stock.total) * 100)}%</span>
                  </div>
                  <Progress value={(data.stock.physical / data.stock.total) * 100} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Physical products include hardware, printed materials, and tangible goods
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total Earnings */}
          <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-lg">Total Earnings</h3>
                </div>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(data.earnings)}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Return on Investment</span>
                    <span>{Math.round((data.earnings / (data.stock.total + data.float)) * 100)}%</span>
                  </div>
                  <Progress 
                    value={Math.min((data.earnings / (data.stock.total + data.float)) * 100, 100)} 
                    className="h-2" 
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Total revenue generated from both digital and physical product sales
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 