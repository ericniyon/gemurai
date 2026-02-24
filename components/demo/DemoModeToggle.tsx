"use client"

import { useDemoMode } from "@/lib/demo/DemoModeContext"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FlaskConical, Users, Droplets, Calendar, Package } from "lucide-react"
import { useState } from "react"

interface DemoModeToggleProps {
  variant?: "button" | "switch" | "card"
  showDialog?: boolean
}

export function DemoModeToggle({ variant = "button", showDialog = true }: DemoModeToggleProps) {
  const { isDemoMode, enableDemoMode, disableDemoMode, demoData } = useDemoMode()
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    if (isDemoMode) {
      disableDemoMode()
    } else if (showDialog) {
      setIsOpen(true)
    } else {
      enableDemoMode()
    }
  }

  const handleEnableDemo = () => {
    enableDemoMode()
    setIsOpen(false)
  }

  if (variant === "switch") {
    return (
      <div className="flex items-center space-x-2">
        <Switch id="demo-mode" checked={isDemoMode} onCheckedChange={handleToggle} />
        <Label htmlFor="demo-mode" className="flex items-center gap-2 cursor-pointer">
          <FlaskConical className="h-4 w-4" />
          Demo Mode
        </Label>
      </div>
    )
  }

  if (variant === "card") {
    return (
      <>
        <Card
          className={`cursor-pointer transition-all duration-200 ${
            isDemoMode
              ? "border-amber-500 bg-amber-50 shadow-amber-100"
              : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
          }`}
          onClick={handleToggle}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FlaskConical className={`h-5 w-5 ${isDemoMode ? "text-amber-600" : "text-gray-500"}`} />
              Demo Mode
              {isDemoMode && (
                <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full ml-auto">ACTIVE</span>
              )}
            </CardTitle>
            <CardDescription>
              {isDemoMode
                ? "Exploring with sample data - changes won't affect real records"
                : "Try the system with pre-loaded sample data"}
            </CardDescription>
          </CardHeader>
          {isDemoMode && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{demoData.farmers.length} Farmers</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Droplets className="h-4 w-4" />
                  <span>{demoData.collections.length} Collections</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{demoData.seasonPlans.length} Season Plans</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="h-4 w-4" />
                  <span>{demoData.inputUsage.length} Input Logs</span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <DemoModeDialog open={isOpen} onOpenChange={setIsOpen} onConfirm={handleEnableDemo} />
      </>
    )
  }

  // Default button variant
  return (
    <>
      <Button
        variant={isDemoMode ? "default" : "outline"}
        size="sm"
        onClick={handleToggle}
        className={isDemoMode ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
      >
        <FlaskConical className="h-4 w-4 mr-2" />
        {isDemoMode ? "Exit Demo" : "Try Demo"}
      </Button>

      <DemoModeDialog open={isOpen} onOpenChange={setIsOpen} onConfirm={handleEnableDemo} />
    </>
  )
}

function DemoModeDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-amber-500" />
            Enter Demo Mode
          </DialogTitle>
          <DialogDescription>
            Explore the system safely with pre-loaded sample data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Demo mode lets you explore all features of the YDEN HarvestPlus platform without affecting any real data.
            Perfect for learning the system or training new users.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-amber-800">What&apos;s included in demo mode:</h4>
            <ul className="text-sm text-amber-700 space-y-2">
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                5 sample farmers with complete profiles
              </li>
              <li className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Sample milk collections with quality data
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Example season plans and input usage logs
              </li>
              <li className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Pre-loaded MCC statistics dashboard
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Any changes you make in demo mode (adding farmers, recording collections, etc.)
              will only be saved locally and won&apos;t affect your real database. You can reset to the original sample
              data at any time.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-amber-500 hover:bg-amber-600 text-white">
            <FlaskConical className="h-4 w-4 mr-2" />
            Start Demo Mode
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
