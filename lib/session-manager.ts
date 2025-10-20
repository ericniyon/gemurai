import { safeLocalStorage } from "./browser-utils"

export interface SessionData {
  applicationId: string
  lastActivity: string
  expiresAt: string
  isActive: boolean
  formData?: any
  currentStep?: number
}

export interface ApplicationData {
  id: string
  status: string
  formData: any
  currentStep: number
  createdAt: string
  updatedAt: string
  notes?: string
  dccCreated?: boolean
  phone?: string
  email?: string
}

const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds
const SESSION_KEY = "Gemurai_application_session"
const APPLICATION_STORAGE_PREFIX = 'Gemurai_application_'
const FORM_STORAGE_KEY = 'Gemurai_form_progress'
const SUBMITTED_APPLICATIONS_KEY = 'submitted_applications'

export function createSession(applicationId: string, formData?: any, currentStep?: number): SessionData {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_DURATION)

  const session: SessionData = {
    applicationId,
    lastActivity: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isActive: true,
    formData,
    currentStep,
  }

  safeLocalStorage.setItem(SESSION_KEY, JSON.stringify(session))

  return session
}

export function getActiveSession(): SessionData | null {
  const stored = safeLocalStorage.getItem(SESSION_KEY)
  if (!stored) return null

  try {
    const session: SessionData = JSON.parse(stored)
    const now = new Date()
    const expiresAt = new Date(session.expiresAt)

    // Check if session is expired
    if (now > expiresAt || !session.isActive) {
      clearSession()
      return null
    }

    return session
  } catch (error) {
    clearSession()
    return null
  }
}

export function updateSessionActivity(applicationId: string, formData?: any, currentStep?: number): void {
  const session = getActiveSession()
  if (!session || session.applicationId !== applicationId) return

  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_DURATION)

  const updatedSession: SessionData = {
    ...session,
    lastActivity: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    formData: formData || session.formData,
    currentStep: currentStep || session.currentStep,
  }

  safeLocalStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession))
}

export function clearSession(): void {
  safeLocalStorage.removeItem(SESSION_KEY)
}

export function isSessionExpired(): boolean {
  const session = getActiveSession()
  return session === null
}

export function hasActiveSession(): boolean {
  return getActiveSession() !== null
}

export function getSessionTimeRemaining(): number {
  const session = getActiveSession()
  if (!session) return 0

  const now = new Date()
  const expiresAt = new Date(session.expiresAt)
  const remaining = expiresAt.getTime() - now.getTime()

  return Math.max(0, remaining)
}

export function getSessionFormData(): any | null {
  const session = getActiveSession()
  return session?.formData || null
}

export function getSessionCurrentStep(): number | null {
  const session = getActiveSession()
  return session?.currentStep || null
}

export function updateSessionFormData(formData: any): void {
  const session = getActiveSession()
  if (!session) return

  const updatedSession: SessionData = {
    ...session,
    formData,
  }

  safeLocalStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession))
}

export function updateSessionStep(currentStep: number): void {
  const session = getActiveSession()
  if (!session) return

  const updatedSession: SessionData = {
    ...session,
    currentStep,
  }

  safeLocalStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession))
}

export function cleanupApplicationStorage(applicationId?: string): void {
  try {
    // Remove form progress
    localStorage.removeItem(FORM_STORAGE_KEY)
    
    // Remove application data
    if (applicationId) {
      localStorage.removeItem(`${APPLICATION_STORAGE_PREFIX}${applicationId}`)
    }
    
    // Remove session data
    safeLocalStorage.removeItem(SESSION_KEY)
    
    // Clean up submitted applications list
    const submittedApps = localStorage.getItem(SUBMITTED_APPLICATIONS_KEY)
    if (submittedApps) {
      const apps = JSON.parse(submittedApps)
      if (applicationId) {
        // Remove specific application if ID provided
        const filtered = apps.filter((app: any) => app.id !== applicationId)
        localStorage.setItem(SUBMITTED_APPLICATIONS_KEY, JSON.stringify(filtered))
      } else {
        // Remove all if no ID provided
        localStorage.removeItem(SUBMITTED_APPLICATIONS_KEY)
      }
    }
    
    console.log('✨ Application storage cleaned up successfully')
  } catch (error) {
    console.error('Error cleaning up application storage:', error)
  }
}
