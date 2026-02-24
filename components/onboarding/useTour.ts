"use client"

import { useEffect, useCallback } from "react"
import { Step } from "react-joyride"
import { useTourContext, TourId } from "./TourProvider"

interface UseTourOptions {
  tourId: TourId
  steps: Step[]
  autoStart?: boolean
  onComplete?: () => void
}

export function useTour({ tourId, steps, autoStart = false, onComplete }: UseTourOptions) {
  const {
    state,
    startTour,
    stopTour,
    registerTourSteps,
    markTourComplete,
    isTourComplete,
  } = useTourContext()

  useEffect(() => {
    registerTourSteps(tourId, steps)
  }, [tourId, steps, registerTourSteps])

  useEffect(() => {
    if (autoStart && !isTourComplete(tourId)) {
      const timer = setTimeout(() => {
        startTour(tourId)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [autoStart, tourId, isTourComplete, startTour])

  useEffect(() => {
    if (state.currentTour === tourId && !state.isRunning && isTourComplete(tourId)) {
      onComplete?.()
    }
  }, [state.isRunning, state.currentTour, tourId, isTourComplete, onComplete])

  const start = useCallback(() => {
    startTour(tourId)
  }, [startTour, tourId])

  const stop = useCallback(() => {
    stopTour()
  }, [stopTour])

  const reset = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`yden_tour_completed_${tourId}`)
    }
  }, [tourId])

  const complete = useCallback(() => {
    markTourComplete(tourId)
    stopTour()
  }, [markTourComplete, tourId, stopTour])

  return {
    isRunning: state.isRunning && state.currentTour === tourId,
    currentStep: state.stepIndex,
    isComplete: isTourComplete(tourId),
    start,
    stop,
    reset,
    complete,
  }
}

export function createTourStep(
  target: string,
  title: string,
  content: string,
  options?: Partial<Step>
): Step {
  return {
    target,
    title,
    content,
    disableBeacon: true,
    ...options,
  }
}
