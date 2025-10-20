// This is the updated implementation that uses the database API
// instead of localStorage

import { getApiUrl } from './config'

export interface ApplicationData {
  id: string
  phone: string
  email?: string  // Make email optional
  status: "TEMPORARY" | "SUBMITTED" | "UNDER_REVIEW" | "PENDING_DOCUMENTS" | "APPROVED" | "REJECTED"
  createdAt?: string
  updatedAt?: string
  formData: any
  currentStep: number
  notes?: string
  dccCreated: boolean
  autoCreatedAt?: string
  lastActivity?: string
}

// Convert database status to client status
const dbToClientStatus = (status: ApplicationData["status"]): string => {
  return status.toLowerCase().replace(/_/g, " ")
}

// Convert client status to database status
const clientToDbStatus = (status: string): ApplicationData["status"] => {
  return status.toUpperCase().replace(/ /g, "_") as ApplicationData["status"]
}

// Save application progress to storage
export const saveApplicationProgress = async (applicationData: ApplicationData): Promise<ApplicationData> => {
  try {
    // Convert status to match database enum
    let dbStatus = applicationData.status.toUpperCase()
    if (dbStatus === "AUTO_CREATED" || dbStatus === "TEMPORARY") {
      dbStatus = "TEMPORARY"
    } else if (dbStatus === "SUBMITTED") {
      dbStatus = "SUBMITTED"
    } else if (dbStatus === "UNDER_REVIEW") {
      dbStatus = "UNDER_REVIEW"
    } else if (dbStatus === "PENDING_DOCUMENTS") {
      dbStatus = "PENDING_DOCUMENTS"
    } else if (dbStatus === "APPROVED") {
      dbStatus = "APPROVED"
    } else if (dbStatus === "REJECTED") {
      dbStatus = "REJECTED"
    }

    // If status is SUBMITTED, save to database
    if (dbStatus === "SUBMITTED") {
      return await submitApplication(applicationData)
    }

    // Prepare the application data
    const savedApplication = {
      ...applicationData,
      status: dbStatus,
      updatedAt: new Date().toISOString()
    }

    // Save to local storage
    localStorage.setItem(`Gemurai_application_${applicationData.id}`, JSON.stringify(savedApplication))

    // Update session if it matches the application ID
    const sessionData = sessionStorage.getItem('Gemurai_application_session')
    if (sessionData) {
      const session = JSON.parse(sessionData)
      if (session.applicationId === applicationData.id) {
        session.formData = applicationData.formData
        session.currentStep = applicationData.currentStep
        session.lastActivity = new Date().toISOString()
        sessionStorage.setItem('Gemurai_application_session', JSON.stringify(session))
      }
    }

    return savedApplication
  } catch (error) {
    console.error("Failed to save application progress:", error)
    throw error
  }
}

// Submit application to database and clean up storage
export const submitApplication = async (applicationData: ApplicationData): Promise<ApplicationData> => {
  try {
    // Ensure required fields are present
    if (!applicationData.phone) {
      throw new Error("Phone number is required")
    }

    // Normalize the form data
    const formData = {
      ...applicationData.formData,
      phone: applicationData.phone,
      email: applicationData.email || undefined
    }

    // Prepare the request body
    const requestBody = {
      id: applicationData.id,
      phone: applicationData.phone,
      email: applicationData.email || undefined,
      status: "SUBMITTED",
      formData,
      currentStep: applicationData.currentStep || 1,
      notes: applicationData.notes || "",
      dccCreated: applicationData.dccCreated || false
    }

    // Submit to database using the configured API URL
    const response = await fetch('/api/v1/applications/submit', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }))
      console.error("Failed to submit application:", errorData)
      throw new Error(errorData.message || `Failed to submit application: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Failed to submit application")
    }

    // Clean up local storage and session storage
    localStorage.removeItem(`Gemurai_application_${applicationData.id}`)
    sessionStorage.removeItem('Gemurai_application_session')

    // Return the submitted application data
    return {
      ...applicationData,
      id: data.application.id,
      status: "SUBMITTED",
      createdAt: data.application.createdAt,
      updatedAt: data.application.updatedAt,
    }
  } catch (error) {
    console.error("Failed to submit application:", error)
    throw error
  }
}

// Auto create application
export const autoCreateApplication = async (
  formData: any,
  phone: string,
  email?: string,  // Make email optional
  currentStep: number = 1
): Promise<ApplicationData> => {
  try {
    const applicationId = `APP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    
    const applicationData: ApplicationData = {
      id: applicationId,
      phone,
      email,
      status: "TEMPORARY",
      formData: {
        ...formData,
        phone,
        email
      },
      currentStep,
      notes: "",
      dccCreated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      autoCreatedAt: new Date().toISOString()
    }

    // Save to local storage
    localStorage.setItem(`Gemurai_application_${applicationId}`, JSON.stringify(applicationData))

    return applicationData
  } catch (error) {
    console.error("Failed to auto-create application:", error)
    throw error
  }
}

// Get application by ID
export const getApplicationById = async (id: string): Promise<ApplicationData | null> => {
  try {
    // First check session storage
    const sessionData = sessionStorage.getItem('Gemurai_application_session')
    if (sessionData) {
      const session = JSON.parse(sessionData)
      if (session.applicationId === id) {
        return {
          id: session.applicationId,
          phone: session.formData?.q8 || "",
          email: session.formData?.q7,  // Make email optional
          status: "TEMPORARY",
          createdAt: session.lastActivity,
          updatedAt: session.lastActivity,
          formData: session.formData || {},
          currentStep: session.currentStep || 1,
          notes: "",
          dccCreated: false
        }
      }
    }

    // Then check local storage
    const localData = localStorage.getItem(`Gemurai_application_${id}`)
    if (localData) {
      const application = JSON.parse(localData)
      return {
        ...application,
        status: application.status.toLowerCase()
      }
    }

    // If not found in either storage, return null
    return null
  } catch (error) {
    console.error("Failed to get application by ID:", error)
    return null
  }
}

// Get application by phone number
export const getApplicationByPhone = async (phone: string): Promise<ApplicationData | null> => {
  try {
    // Clean phone number for comparison
    const cleanPhone = phone
      .replace(/\s/g, "")
      .replace(/^\+250/, "")
      .replace(/^0/, "")

    const response = await fetch(`/api/v1/applications/search?phone=${cleanPhone}`)

    if (!response.ok) {
      throw new Error("Failed to fetch application by phone")
    }

    const data = await response.json()

    if (!data.success || !data.data || data.data.length === 0) {
      return null
    }

    const application = data.data[0]

    // Convert database status to application status
    const appStatus = application.status.toLowerCase()

    return {
      id: application.id,
      phone: application.phone,
      email: application.email,
      status: appStatus,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      formData: application.formData,
      currentStep: application.currentStep,
      notes: application.notes,
      dccCreated: application.dccCreated,
    }
  } catch (error) {
    console.error("Failed to get application by phone:", error)
    return null
  }
}

// Get all applications by phone number
export const getAllApplicationsByPhone = async (phone: string): Promise<ApplicationData[]> => {
  try {
    // Clean phone number for comparison
    const cleanPhone = phone
      .replace(/\s/g, "")
      .replace(/^\+250/, "")
      .replace(/^0/, "")

    const response = await fetch(`/api/v1/applications/search?phone=${cleanPhone}`)

    if (!response.ok) {
      throw new Error("Failed to fetch applications by phone")
    }

    const data = await response.json()

    if (!data.success || !data.data) {
      return []
    }

    // Convert database status to application status for each application
    return data.data.map((application: any) => {
      const appStatus = application.status.toLowerCase()

      return {
        id: application.id,
        phone: application.phone,
        email: application.email,
        status: appStatus,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        formData: application.formData,
        currentStep: application.currentStep,
        notes: application.notes,
        dccCreated: application.dccCreated,
        lastActivity: application.lastActivity || application.updatedAt,
      }
    })
  } catch (error) {
    console.error("Failed to get applications by phone:", error)
    return []
  }
}

// Clean up old auto-created applications (older than 7 days)
export const cleanupOldAutoCreatedApplications = async (): Promise<void> => {
  // This would typically be a server-side operation
  // For now, we'll just log that it would happen
  console.log("Cleaning up old auto-created applications (would delete applications older than 7 days)")

  // In a real implementation, you would call an API endpoint:
  // try {
  //   await fetch('/api/v1/applications/cleanup', { method: 'POST' })
  // } catch (error) {
  //   console.error("Failed to clean up old applications:", error)
  // }
}

// Mark application as submitted
export const markApplicationAsSubmitted = async (id: string): Promise<void> => {
  try {
    const application = await getApplicationById(id)

    if (!application) {
      throw new Error("Application not found")
    }

    application.status = "SUBMITTED"
    await submitApplication(application)
  } catch (error) {
    console.error("Failed to mark application as submitted:", error)
    throw error
  }
}

// Update application status from auto_created to temporary when user actively saves
export const upgradeToTemporaryApplication = async (id: string): Promise<void> => {
  try {
    const application = await getApplicationById(id)

    if (!application || application.status !== "TEMPORARY") {
      return
    }

    application.status = "TEMPORARY"
    await saveApplicationProgress(application)
  } catch (error) {
    console.error("Failed to upgrade application to temporary:", error)
    throw error
  }
}

// Check if there are any saved applications
export const hasAnyApplications = async (): Promise<boolean> => {
  try {
    const response = await fetch(`/api/v1/applications/count`)

    if (!response.ok) {
      throw new Error("Failed to check for applications")
    }

    const data = await response.json()
    return data.success && data.count > 0
  } catch (error) {
    console.error("Failed to check for applications:", error)
    return false
  }
}

// Send application submission email
export const sendApplicationSubmissionEmail = async (email: string, name: string): Promise<{ success: boolean }> => {
  try {
    const response = await fetch('/api/email/application-submission', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        name,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to send application submission email")
    }

    const data = await response.json()
    return { success: data.success }
  } catch (error) {
    console.error("Failed to send application submission email:", error)
    return { success: false }
  }
}

// Get all applications for an employer
export const getAllApplicationsForEmployer = async (): Promise<ApplicationData[]> => {
  try {
    const response = await fetch(`/api/v1/applications?role=employer`)

    if (!response.ok) {
      throw new Error("Failed to fetch applications for employer")
    }

    const data = await response.json()

    if (!data.success || !data.data) {
      return []
    }

    // Convert database status to application status for each application
    return data.data.map((application: any) => {
      const appStatus = application.status.toLowerCase()

      return {
        id: application.id,
        phone: application.phone,
        email: application.email,
        status: appStatus,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        formData: application.formData,
        currentStep: application.currentStep,
        notes: application.notes,
        dccCreated: application.dccCreated,
        lastActivity: application.lastActivity || application.updatedAt,
        // Add employer-specific fields
        applicant: application.formData?.personalInfo || {
          name: application.formData?.name || "Unknown Applicant",
          email: application.email,
          phone: application.phone,
          location: application.formData?.location || "Unknown Location",
        },
        position: application.formData?.position || "DCC Applicant",
        submittedDate: new Date(application.createdAt).toLocaleDateString(),
        experience: application.formData?.experience || "Not specified",
        education: application.formData?.education || "Not specified",
        skills: application.formData?.skills || [],
        score: application.formData?.score || 0,
        documents: application.formData?.documents || [
          { name: "Application Form", status: "verified" },
          { name: "ID Document", status: "pending" },
          { name: "Proof of Address", status: "missing" },
        ],
      }
    })
  } catch (error) {
    console.error("Failed to get applications for employer:", error)
    return []
  }
}

// Update application status
export const updateApplicationStatus = async (id: string, newStatus: string): Promise<boolean> => {
  try {
    // Convert status to lowercase for API compatibility
    const status = newStatus.toLowerCase()
    
    // Validate status before sending
    const validStatuses = ["temporary", "submitted", "under_review", "pending_documents", "approved", "rejected"]
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status value")
    }

    const response = await fetch(`/api/v1/applications/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update status")
    }

    const data = await response.json()
    return data.success
  } catch (error: any) {
    console.error(`Failed to update application ${id} status to ${newStatus}:`, error)
    return false
  }
}
