"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface ThemeSwitchProps {
  className?: string
}

export function ThemeSwitch({ className }: ThemeSwitchProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Switch disabled />
  }

  const isDark = theme === "dark"

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="space-y-0.5">
        <Label>Dark Mode</Label>
        <p className="text-sm text-muted-foreground">Switch to dark theme</p>
      </div>
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
    </div>
  )
} 