"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"
import {
  SAMPLE_FARMERS,
  SAMPLE_COLLECTIONS,
  SAMPLE_SEASON_PLANS,
  SAMPLE_INPUT_USAGE,
  SAMPLE_MCC_STATS,
  SampleFarmer,
  SampleCollection,
  SampleSeasonPlan,
  SampleInputUsage,
  SampleMCCStats,
  generateDemoId,
  isDemoId,
} from "./sample-data"

interface DemoModeState {
  isEnabled: boolean
  farmers: SampleFarmer[]
  collections: SampleCollection[]
  seasonPlans: SampleSeasonPlan[]
  inputUsage: SampleInputUsage[]
  mccStats: SampleMCCStats
}

interface DemoModeContextType {
  // State
  isDemoMode: boolean
  demoData: DemoModeState

  // Actions
  enableDemoMode: () => void
  disableDemoMode: () => void
  toggleDemoMode: () => void
  resetDemoData: () => void

  // Demo CRUD operations (won't affect real database)
  addDemoFarmer: (farmer: Omit<SampleFarmer, "id">) => SampleFarmer
  updateDemoFarmer: (id: string, updates: Partial<SampleFarmer>) => void
  deleteDemoFarmer: (id: string) => void

  addDemoCollection: (collection: Omit<SampleCollection, "id">) => SampleCollection
  updateDemoCollection: (id: string, updates: Partial<SampleCollection>) => void
  deleteDemoCollection: (id: string) => void

  addDemoSeasonPlan: (plan: Omit<SampleSeasonPlan, "id">) => SampleSeasonPlan
  addDemoInputUsage: (usage: Omit<SampleInputUsage, "id">) => SampleInputUsage

  // Utility
  isDemoId: (id: string) => boolean
}

const DemoModeContext = createContext<DemoModeContextType | null>(null)

const DEMO_MODE_STORAGE_KEY = "yden_demo_mode"
const DEMO_DATA_STORAGE_KEY = "yden_demo_data"

function getInitialDemoData(): DemoModeState {
  return {
    isEnabled: false,
    farmers: [...SAMPLE_FARMERS],
    collections: [...SAMPLE_COLLECTIONS],
    seasonPlans: [...SAMPLE_SEASON_PLANS],
    inputUsage: [...SAMPLE_INPUT_USAGE],
    mccStats: { ...SAMPLE_MCC_STATS },
  }
}

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [demoData, setDemoData] = useState<DemoModeState>(getInitialDemoData)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load demo state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedEnabled = localStorage.getItem(DEMO_MODE_STORAGE_KEY)
        const storedData = localStorage.getItem(DEMO_DATA_STORAGE_KEY)

        if (storedEnabled === "true") {
          const parsedData = storedData ? JSON.parse(storedData) : getInitialDemoData()
          setDemoData({
            ...parsedData,
            isEnabled: true,
          })
        }
      } catch (error) {
        console.error("Error loading demo mode state:", error)
      }
      setIsInitialized(true)
    }
  }, [])

  // Persist demo state to localStorage
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem(DEMO_MODE_STORAGE_KEY, demoData.isEnabled.toString())
      if (demoData.isEnabled) {
        localStorage.setItem(DEMO_DATA_STORAGE_KEY, JSON.stringify(demoData))
      }
    }
  }, [demoData, isInitialized])

  const enableDemoMode = useCallback(() => {
    setDemoData((prev) => ({ ...prev, isEnabled: true }))
  }, [])

  const disableDemoMode = useCallback(() => {
    setDemoData((prev) => ({ ...prev, isEnabled: false }))
  }, [])

  const toggleDemoMode = useCallback(() => {
    setDemoData((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))
  }, [])

  const resetDemoData = useCallback(() => {
    const initialData = getInitialDemoData()
    setDemoData({ ...initialData, isEnabled: true })
    if (typeof window !== "undefined") {
      localStorage.removeItem(DEMO_DATA_STORAGE_KEY)
    }
  }, [])

  // Demo CRUD for Farmers
  const addDemoFarmer = useCallback((farmer: Omit<SampleFarmer, "id">): SampleFarmer => {
    const newFarmer: SampleFarmer = {
      ...farmer,
      id: generateDemoId("farmer"),
    }
    setDemoData((prev) => ({
      ...prev,
      farmers: [...prev.farmers, newFarmer],
      mccStats: {
        ...prev.mccStats,
        totalFarmers: prev.mccStats.totalFarmers + 1,
      },
    }))
    return newFarmer
  }, [])

  const updateDemoFarmer = useCallback((id: string, updates: Partial<SampleFarmer>) => {
    setDemoData((prev) => ({
      ...prev,
      farmers: prev.farmers.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }))
  }, [])

  const deleteDemoFarmer = useCallback((id: string) => {
    setDemoData((prev) => ({
      ...prev,
      farmers: prev.farmers.filter((f) => f.id !== id),
      mccStats: {
        ...prev.mccStats,
        totalFarmers: Math.max(0, prev.mccStats.totalFarmers - 1),
      },
    }))
  }, [])

  // Demo CRUD for Collections
  const addDemoCollection = useCallback((collection: Omit<SampleCollection, "id">): SampleCollection => {
    const newCollection: SampleCollection = {
      ...collection,
      id: generateDemoId("coll"),
    }
    setDemoData((prev) => ({
      ...prev,
      collections: [...prev.collections, newCollection],
      mccStats: {
        ...prev.mccStats,
        todayCollections: prev.mccStats.todayCollections + 1,
        todayLiters: prev.mccStats.todayLiters + newCollection.quantity,
        periodCollections: prev.mccStats.periodCollections + 1,
        periodLiters: prev.mccStats.periodLiters + newCollection.quantity,
        periodRevenue: prev.mccStats.periodRevenue + newCollection.totalAmount,
      },
    }))
    return newCollection
  }, [])

  const updateDemoCollection = useCallback((id: string, updates: Partial<SampleCollection>) => {
    setDemoData((prev) => ({
      ...prev,
      collections: prev.collections.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }))
  }, [])

  const deleteDemoCollection = useCallback((id: string) => {
    setDemoData((prev) => {
      const collection = prev.collections.find((c) => c.id === id)
      return {
        ...prev,
        collections: prev.collections.filter((c) => c.id !== id),
        mccStats: collection
          ? {
              ...prev.mccStats,
              todayCollections: Math.max(0, prev.mccStats.todayCollections - 1),
              todayLiters: Math.max(0, prev.mccStats.todayLiters - collection.quantity),
            }
          : prev.mccStats,
      }
    })
  }, [])

  // Demo CRUD for Season Plans
  const addDemoSeasonPlan = useCallback((plan: Omit<SampleSeasonPlan, "id">): SampleSeasonPlan => {
    const newPlan: SampleSeasonPlan = {
      ...plan,
      id: generateDemoId("plan"),
    }
    setDemoData((prev) => ({
      ...prev,
      seasonPlans: [...prev.seasonPlans, newPlan],
    }))
    return newPlan
  }, [])

  // Demo CRUD for Input Usage
  const addDemoInputUsage = useCallback((usage: Omit<SampleInputUsage, "id">): SampleInputUsage => {
    const newUsage: SampleInputUsage = {
      ...usage,
      id: generateDemoId("input"),
    }
    setDemoData((prev) => ({
      ...prev,
      inputUsage: [...prev.inputUsage, newUsage],
    }))
    return newUsage
  }, [])

  const value: DemoModeContextType = {
    isDemoMode: demoData.isEnabled,
    demoData,
    enableDemoMode,
    disableDemoMode,
    toggleDemoMode,
    resetDemoData,
    addDemoFarmer,
    updateDemoFarmer,
    deleteDemoFarmer,
    addDemoCollection,
    updateDemoCollection,
    deleteDemoCollection,
    addDemoSeasonPlan,
    addDemoInputUsage,
    isDemoId,
  }

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>
}

export function useDemoMode() {
  const context = useContext(DemoModeContext)
  if (!context) {
    throw new Error("useDemoMode must be used within a DemoModeProvider")
  }
  return context
}

// Hook to use demo data or real API data based on demo mode
export function useDemoAwareData<T>(realData: T | undefined, demoData: T, isLoading: boolean = false) {
  const { isDemoMode } = useDemoMode()

  if (isDemoMode) {
    return {
      data: demoData,
      isLoading: false,
      isDemoData: true,
    }
  }

  return {
    data: realData,
    isLoading,
    isDemoData: false,
  }
}
