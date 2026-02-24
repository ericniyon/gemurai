"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from "react-joyride"

export type TourId = 
  | "mcc-dashboard"
  | "farmer-registration"
  | "commodity-collection"
  | "input-catalog"

interface TourState {
  isRunning: boolean
  currentTour: TourId | null
  stepIndex: number
}

interface TourContextValue {
  state: TourState
  startTour: (tourId: TourId) => void
  stopTour: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (index: number) => void
  markTourComplete: (tourId: TourId) => void
  isTourComplete: (tourId: TourId) => boolean
  registerTourSteps: (tourId: TourId, steps: Step[]) => void
}

const TourContext = createContext<TourContextValue | null>(null)

const TOUR_STORAGE_PREFIX = "yden_tour_completed_"

const defaultTourStyles = {
  options: {
    arrowColor: "hsl(var(--popover))",
    backgroundColor: "hsl(var(--popover))",
    overlayColor: "rgba(0, 0, 0, 0.5)",
    primaryColor: "hsl(var(--primary))",
    textColor: "hsl(var(--popover-foreground))",
    zIndex: 10000,
  },
  buttonNext: {
    backgroundColor: "hsl(var(--primary))",
    color: "hsl(var(--primary-foreground))",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: 500,
  },
  buttonBack: {
    color: "hsl(var(--muted-foreground))",
    marginRight: "8px",
  },
  buttonSkip: {
    color: "hsl(var(--muted-foreground))",
  },
  tooltip: {
    borderRadius: "8px",
    padding: "16px",
  },
  tooltipContent: {
    padding: "8px 0",
  },
  tooltipTitle: {
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "8px",
  },
  spotlight: {
    borderRadius: "8px",
  },
}

interface TourProviderProps {
  children: ReactNode
}

export function TourProvider({ children }: TourProviderProps) {
  const [state, setState] = useState<TourState>({
    isRunning: false,
    currentTour: null,
    stepIndex: 0,
  })

  const [tourSteps, setTourSteps] = useState<Record<TourId, Step[]>>({
    "mcc-dashboard": [],
    "farmer-registration": [],
    "commodity-collection": [],
    "input-catalog": [],
  })

  const registerTourSteps = useCallback((tourId: TourId, steps: Step[]) => {
    setTourSteps((prev) => ({
      ...prev,
      [tourId]: steps,
    }))
  }, [])

  const startTour = useCallback((tourId: TourId) => {
    setState({
      isRunning: true,
      currentTour: tourId,
      stepIndex: 0,
    })
  }, [])

  const stopTour = useCallback(() => {
    setState({
      isRunning: false,
      currentTour: null,
      stepIndex: 0,
    })
  }, [])

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      stepIndex: prev.stepIndex + 1,
    }))
  }, [])

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      stepIndex: Math.max(0, prev.stepIndex - 1),
    }))
  }, [])

  const goToStep = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      stepIndex: index,
    }))
  }, [])

  const markTourComplete = useCallback((tourId: TourId) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`${TOUR_STORAGE_PREFIX}${tourId}`, "true")
    }
  }, [])

  const isTourComplete = useCallback((tourId: TourId): boolean => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(`${TOUR_STORAGE_PREFIX}${tourId}`) === "true"
  }, [])

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, action, index, type } = data

      if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
        if (state.currentTour) {
          markTourComplete(state.currentTour)
        }
        stopTour()
        return
      }

      if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
        if (action === ACTIONS.NEXT) {
          nextStep()
        } else if (action === ACTIONS.PREV) {
          prevStep()
        }
      }

      if (action === ACTIONS.CLOSE) {
        stopTour()
      }
    },
    [state.currentTour, markTourComplete, stopTour, nextStep, prevStep]
  )

  const currentSteps = state.currentTour ? tourSteps[state.currentTour] : []

  return (
    <TourContext.Provider
      value={{
        state,
        startTour,
        stopTour,
        nextStep,
        prevStep,
        goToStep,
        markTourComplete,
        isTourComplete,
        registerTourSteps,
      }}
    >
      {children}
      <Joyride
        steps={currentSteps}
        run={state.isRunning}
        stepIndex={state.stepIndex}
        continuous
        showProgress
        showSkipButton
        hideCloseButton={false}
        disableOverlayClose
        disableScrolling={false}
        spotlightClicks
        styles={defaultTourStyles}
        callback={handleJoyrideCallback}
        locale={{
          back: "Back",
          close: "Close",
          last: "Finish",
          next: "Next",
          skip: "Skip Tour",
        }}
      />
    </TourContext.Provider>
  )
}

export function useTourContext() {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error("useTourContext must be used within a TourProvider")
  }
  return context
}
