import type { Application } from "./types"

// Transform database application to UI format
export const transformApplicationData = (dbApplication: {
  id: string
  email: string
  phone: string
  formData: Record<string, any>
  status: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    email: string
    role: string
  } | null
}): Application => {
  const formData = dbApplication.formData || {}

  // Extract name from various possible field combinations
  let applicantName = "Unknown Applicant"
  
  // Priority 1: User's name from user table
  if (dbApplication.user?.name) {
    applicantName = dbApplication.user.name
  }
  // Priority 2: Database format - q1 (first name) + q2 (last name)
  else if (formData.q1 && formData.q2) {
    applicantName = `${formData.q1} ${formData.q2}`.trim()
  }
  // Priority 3: Google Sheets format - First Name + Last Name
  else if (formData['First Name'] && formData['Last Name']) {
    applicantName = `${formData['First Name']} ${formData['Last Name']}`.trim()
  }
  // Priority 4: Google Sheets format - First Name + Lat Name (typo)
  else if (formData['First Name'] && formData['Lat Name']) {
    applicantName = `${formData['First Name']} ${formData['Lat Name']}`.trim()
  }
  // Priority 5: Direct firstName/lastName fields
  else if (formData.firstName && formData.lastName) {
    applicantName = `${formData.firstName} ${formData.lastName}`.trim()
  }
  // Priority 6: Single name fields
  else if (formData['Full Name']) {
    applicantName = formData['Full Name'].trim()
  }
  else if (formData['Applicant Name']) {
    applicantName = formData['Applicant Name'].trim()
  }
  else if (formData.name) {
    applicantName = formData.name.trim()
  }
  else if (formData.fullName) {
    applicantName = formData.fullName.trim()
  }
  // Priority 7: Just first name fields
  else if (formData.q1) {
    applicantName = formData.q1.trim()
  }
  else if (formData['First Name']) {
    applicantName = formData['First Name'].trim()
  }
  else if (formData.firstName) {
    applicantName = formData.firstName.trim()
  }

  // Extract location from various possible field combinations
  let location = "Unknown Location"
  if (formData.province && formData.district) {
    // Province and district from dependent dropdown
    location = `${formData.district}, ${formData.province}`
  } else if (formData.q11 && typeof formData.q11 === "object") {
    // Dependent dropdown object
    const locationObj = formData.q11
    if (locationObj.district && locationObj.province) {
      location = `${locationObj.district}, ${locationObj.province}`
    }
  } else if (formData.location) {
    // Direct location field
    location = formData.location
  } else if (formData.address) {
    // Address field
    location = formData.address
  }

  // Extract email - prefer user email, then form data, fallback to application email
  const email = dbApplication.user?.email || formData.q7 || formData.email || dbApplication.email || "No email provided"

  // Extract phone - prefer form data, fallback to application phone
  const phone = formData.q8 || formData.phone || dbApplication.phone || "No phone provided"

  // Extract education
  let education = "Not specified"
  if (formData.q17) {
    education = formData.q17 // Education level field
  } else if (formData.educationLevel) {
    education = formData.educationLevel
  } else if (formData.education) {
    education = formData.education
  }

  // Extract experience
  let experience = "Not specified"
  if (formData.q21 === "Yes" && formData.q23) {
    experience = formData.q23 // Previous work experience description
  } else if (formData.q22) {
    experience = formData.q22 // Current employment status
  } else if (formData.workExperience) {
    experience = formData.workExperience
  } else if (formData.experience) {
    experience = formData.experience
  }

  // Extract skills
  let skills: string[] = []
  if (formData.q19 && Array.isArray(formData.q19)) {
    skills = formData.q19 // Skills checkbox array
  } else if (formData.skills && Array.isArray(formData.skills)) {
    skills = formData.skills
  } else if (formData.technicalSkills && Array.isArray(formData.technicalSkills)) {
    skills = formData.technicalSkills
  } else if (typeof formData.q19 === "string") {
    skills = [formData.q19] // Single skill as string
  }

  // Extract languages
  let languages: string[] = []
  if (formData.q20 && Array.isArray(formData.q20)) {
    languages = formData.q20 // Languages checkbox array
  } else if (formData.languages && Array.isArray(formData.languages)) {
    languages = formData.languages
  }

  // Combine skills and languages
  const allSkills = [...skills, ...languages].filter(Boolean)

  // Extract motivation and goals
  const motivation = formData.q24 || formData.motivation || ""
  const goals = formData.q25 || formData.goals || ""
  const availability = formData.q26 || formData.availability || ""

  // Calculate a basic score based on completeness
  let score = 0
  if (applicantName !== "Unknown Applicant") score += 20
  if (email !== "No email provided") score += 15
  if (phone !== "No phone provided") score += 15
  if (education !== "Not specified") score += 10
  if (experience !== "Not specified") score += 15
  if (allSkills.length > 0) score += 10
  if (motivation) score += 10
  if (goals) score += 5

  // Determine document status based on application completeness
  const documents = [
    {
      name: "Application Form",
      status: (dbApplication.status === "SUBMITTED" ? "verified" : "pending") as 'verified' | 'pending' | 'missing',
    },
    {
      name: "National ID",
      status: (formData.q5 ? "verified" : "missing") as 'verified' | 'pending' | 'missing',
    },
    {
      name: "Education Certificate",
      status: (formData.q31 ? "verified" : "pending") as 'verified' | 'pending' | 'missing',
    },
  ]

  return {
    id: dbApplication.id,
    applicant: {
      name: applicantName,
      email,
      phone,
      location,
    },
    status: dbApplication.status,
    lastUpdated: new Date(dbApplication.updatedAt).toLocaleDateString(),
    submittedDate: new Date(dbApplication.createdAt).toLocaleDateString(),
    position: formData.q6 || "Not specified",
    score,
    documents,
    education,
    experience,
    skills: allSkills,
    motivation,
    goals,
    availability,
    formData,
  }
} 