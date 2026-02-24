"use client"

import { useState } from "react"
import { useDemoMode } from "@/lib/demo/DemoModeContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FlaskConical, X, RefreshCw, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface DemoModeBannerProps {
  className?: string
}

export function DemoModeBanner({ className }: DemoModeBannerProps) {
  const { isDemoMode, disableDemoMode, resetDemoData } = useDemoMode()
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  if (!isDemoMode) return null

  return (
    <>
      <div
        className={cn(
          "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white px-4 py-2 flex items-center justify-between gap-4 shadow-md",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 animate-pulse" />
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 font-semibold">
              DEMO MODE
            </Badge>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <Info className="h-4 w-4" />
            <span>You&apos;re exploring with sample data. Changes won&apos;t affect real records.</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowResetConfirm(true)}
            className="text-white hover:bg-white/20 hover:text-white h-8 px-3"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Reset Demo</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExitConfirm(true)}
            className="text-white hover:bg-white/20 hover:text-white h-8 px-3"
          >
            <X className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Exit Demo</span>
          </Button>
        </div>
      </div>

      {/* Exit Demo Confirmation */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Demo Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              You will return to working with real data. Any changes you made in demo mode will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay in Demo</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                disableDemoMode()
                setShowExitConfirm(false)
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Exit Demo Mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Demo Confirmation */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Demo Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore all sample data to its original state. Any demo changes you made will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetDemoData()
                setShowResetConfirm(false)
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Reset Demo Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
