// Form configuration types
import { formServiceTranslations } from "./translations/form-service"

export interface FormQuestion {
  id: string
  type: string
  label: string
  placeholder: string
  required: boolean
  order: number
  options?: string[]
  dependsOn?: {
    questionId: string
    value: string
  }
  validation?: {
    pattern?: string
    message?: string
    maxSize?: number
    acceptedTypes?: string[]
    minSelected?: number
  }
  subFields?: {
    [key: string]: {
      label: string
      placeholder: string
      required: boolean
    }
  }
}

export interface FormSection {
  id: string
  title: string
  description: string
  order: number
  questions: FormQuestion[]
  dependsOn?: {
    questionId: string
    value: string
  }
}

export interface FormConfig {
  id: string
  title: string
  description: string
  sections: FormSection[]
  createdAt: string
  updatedAt: string
  isActive: boolean
}

/**
 * Map of question IDs to their labels for easy reference
 */
export const questionTitles: Record<string, string> = {
  q1: "First Name",
  q2: "Last Name",
  q3: "Date of Birth",
  q4: "Gender",
  q5: "National ID Number",
  q6: "Marital Status",
  q6a: "Disability Status",
  q6b: "Type of Disability",
  q7: "Refugee Status",
  q8: "Living in Refugee Camp",
  q8a: "Head of Household",
  q8b: "Primary Financial Provider",
  q9: "Email Address (Optional)",
  q10: "Phone Number",
  q10b: "Alternate Phone",
  q10c: "Preferred Contact",
  q11: "Province",
  q12: "District",
  q13: "Sector",
  q14: "Cell",
  q15: "Village",
  education: "Education Level",
  q17: "Field of Study",
  q18: "Current Employment Status",
  q19: "Current Occupation",
  q20: "Monthly Income Range",
  q21: "Computer Access",
  q22: "Internet Access",
  q23: "Digital Skills Level",
  q24: "Language Proficiency - Kinyarwanda",
  q25: "Language Proficiency - English",
  q26: "Language Proficiency - French",
  q27: "Language Proficiency - Swahili",
  q28: "Community Involvement",
  q29: "Leadership Experience",
  q30: "Digital Community Champion Interest",
  q31: "Time Commitment",
  q32: "Additional Information"
}

// Initial form configuration based on our existing form
export const defaultFormConfig: FormConfig = {
  id: "dcc-application-form",
  title: formServiceTranslations.en.sections.personalInfo.title,
  description: formServiceTranslations.en.sections.personalInfo.description,
  sections: [
    {
      id: "section-1",
      title: formServiceTranslations.en.sections.personalInfo.title,
      description: formServiceTranslations.en.sections.personalInfo.description,
      order: 1,
      questions: [
        {
          id: "q1",
          type: "text",
          label: formServiceTranslations.en.questions.firstName.label,
          placeholder: formServiceTranslations.en.questions.firstName.placeholder,
          required: true,
          order: 1,
        },
        {
          id: "q2",
          type: "text",
          label: formServiceTranslations.en.questions.lastName.label,
          placeholder: formServiceTranslations.en.questions.lastName.placeholder,
          required: true,
          order: 2,
        },
        {
          id: "q3",
          type: "date",
          label: formServiceTranslations.en.questions.dateOfBirth.label,
          placeholder: formServiceTranslations.en.questions.dateOfBirth.placeholder,
          required: true,
          order: 3,
        },
        {
          id: "q4",
          type: "radio",
          label: formServiceTranslations.en.questions.gender.label,
          placeholder: formServiceTranslations.en.questions.gender.placeholder,
          required: true,
          order: 4,
          options: formServiceTranslations.en.questions.gender.options,
        },
        {
          id: "q5",
          type: "text",
          label: formServiceTranslations.en.questions.nationalId.label,
          placeholder: formServiceTranslations.en.questions.nationalId.placeholder,
          required: true,
          order: 5,
          validation: {
            pattern: "^\\d{16}$",
            message: formServiceTranslations.en.questions.nationalId.validation
          }
        },
        {
          id: "q6",
          type: "select",
          label: formServiceTranslations.en.questions.maritalStatus.label,
          placeholder: formServiceTranslations.en.questions.maritalStatus.placeholder,
          required: true,
          order: 6,
          options: formServiceTranslations.en.questions.maritalStatus.options,
        },
        {
          id: "q6a",
          type: "radio",
          label: formServiceTranslations.en.questions.disability.label,
          placeholder: formServiceTranslations.en.questions.disability.placeholder,
          required: true,
          order: 7,
          options: formServiceTranslations.en.questions.disability.options,
        },
        {
          id: "q6b",
          type: "checkbox",
          label: formServiceTranslations.en.questions.disabilityType.label,
          placeholder: formServiceTranslations.en.questions.disabilityType.placeholder,
          required: false,
          order: 8,
          options: formServiceTranslations.en.questions.disabilityType.options,
          dependsOn: {
            questionId: "q6a",
            value: "Yes"
          },
          subFields: {
            other: {
              label: "Please specify other disability",
              placeholder: "Describe your disability",
              required: true
            }
          }
        },
        {
          id: "q7",
          type: "radio",
          label: formServiceTranslations.en.questions.refugee.label,
          placeholder: formServiceTranslations.en.questions.refugee.placeholder,
          required: true,
          order: 9,
          options: formServiceTranslations.en.questions.refugee.options,
        },
        {
          id: "q8",
          type: "radio",
          label: formServiceTranslations.en.questions.refugeeCamp.label,
          placeholder: formServiceTranslations.en.questions.refugeeCamp.placeholder,
          required: false,
          order: 10,
          options: formServiceTranslations.en.questions.refugeeCamp.options,
          dependsOn: {
            questionId: "q7",
            value: "Yes"
          },
        },
        {
          id: "q8a",
          type: "radio",
          label: formServiceTranslations.en.questions.householdHead.label,
          placeholder: formServiceTranslations.en.questions.householdHead.placeholder,
          required: true,
          order: 11,
          options: formServiceTranslations.en.questions.householdHead.options,
        },
        {
          id: "q8b",
          type: "radio",
          label: formServiceTranslations.en.questions.primaryProvider.label,
          placeholder: formServiceTranslations.en.questions.primaryProvider.placeholder,
          required: true,
          order: 12,
          options: formServiceTranslations.en.questions.primaryProvider.options,
        },
        {
          id: "q9",
          type: "email",
          label: formServiceTranslations.en.questions.email.label,
          placeholder: formServiceTranslations.en.questions.email.placeholder,
          required: false,
          order: 13,
        },
        {
          id: "q10",
          type: "phone",
          label: formServiceTranslations.en.questions.phone.label,
          placeholder: formServiceTranslations.en.questions.phone.placeholder,
          required: true,
          order: 14
        },
        {
          id: "q10b",
          type: "phone",
          label: formServiceTranslations.en.questions.alternatePhone.label,
          placeholder: formServiceTranslations.en.questions.alternatePhone.placeholder,
          required: false,
          order: 15
        },
        {
          id: "q10c",
          type: "radio",
          label: formServiceTranslations.en.questions.preferredContact.label,
          placeholder: formServiceTranslations.en.questions.preferredContact.placeholder,
          required: true,
          order: 16,
          options: formServiceTranslations.en.questions.preferredContact.options,
        },
        {
          id: "q11",
          type: "dependent-dropdown",
          label: formServiceTranslations.en.questions.addressInfo.label,
          placeholder: formServiceTranslations.en.questions.addressInfo.placeholder,
          required: true,
          order: 17,
        }
      ]
    },
    {
      id: "section-2",
      title: formServiceTranslations.en.sections.contactAddress.title,
      description: formServiceTranslations.en.sections.contactAddress.description,
      order: 2,
      questions: [
        {
          id: "q10b",
          type: "phone",
          label: formServiceTranslations.en.questions.alternatePhone.label,
          placeholder: formServiceTranslations.en.questions.alternatePhone.placeholder,
          required: false,
          order: 3,
        },
        {
          id: "q10c",
          type: "select",
          label: formServiceTranslations.en.questions.preferredContact.label,
          placeholder: formServiceTranslations.en.questions.preferredContact.placeholder,
          required: false,
          order: 4,
          options: formServiceTranslations.en.questions.preferredContact.options,
        },
        {
          id: "address",
          type: "dependent-dropdown",
          label: formServiceTranslations.en.questions.addressInfo.label,
          placeholder: formServiceTranslations.en.questions.addressInfo.placeholder,
          required: true,
          order: 5,
        }
      ],
    },
    {
      id: "section-3",
      title: formServiceTranslations.en.sections.educationSkills.title,
      description: formServiceTranslations.en.sections.educationSkills.description,
      order: 3,
      questions: [
        {
          id: "education",
          type: "select",
          label: formServiceTranslations.en.questions.education.label,
          placeholder: formServiceTranslations.en.questions.education.placeholder,
          required: true,
          order: 1,
          options: formServiceTranslations.en.questions.education.options,
        },
        {
          id: "schoolName",
          type: "text",
          label: formServiceTranslations.en.questions.schoolName.label,
          placeholder: formServiceTranslations.en.questions.schoolName.placeholder,
          required: true,
          order: 2,
        },
        {
          id: "fieldOfStudy",
          type: "text",
          label: formServiceTranslations.en.questions.fieldOfStudy.label,
          placeholder: formServiceTranslations.en.questions.fieldOfStudy.placeholder,
          required: true,
          order: 3,
        },
        {
          id: "skills",
          type: "checkbox",
          label: formServiceTranslations.en.questions.skills.label,
          placeholder: formServiceTranslations.en.questions.skills.placeholder,
          required: true,
          order: 4,
          options: formServiceTranslations.en.questions.skills.options,
        },
        {
          id: "otherSkills",
          type: "textarea",
          label: formServiceTranslations.en.questions.otherSkills.label,
          placeholder: formServiceTranslations.en.questions.otherSkills.placeholder,
          required: false,
          order: 5,
          validation: {
            message: formServiceTranslations.en.questions.otherSkills.validation
          },
          dependsOn: {
            questionId: "skills",
            value: "includes:Other"
          }
        },
        {
          id: "languages",
          type: "checkbox",
          label: formServiceTranslations.en.questions.languages.label,
          placeholder: formServiceTranslations.en.questions.languages.placeholder,
          required: true,
          order: 6,
          options: formServiceTranslations.en.questions.languages.options,
        }
      ]
    },
    {
      id: "section-4",
      title: formServiceTranslations.en.sections.workExperience.title,
      description: formServiceTranslations.en.sections.workExperience.description,
      order: 4,
      questions: [
        {
          id: "workExperience",
          type: "radio",
          label: formServiceTranslations.en.questions.workExperience.label,
          placeholder: formServiceTranslations.en.questions.workExperience.placeholder,
          required: true,
          order: 1,
          options: formServiceTranslations.en.questions.workExperience.options,
        },
        {
          id: "yearsExperience",
          type: "select",
          label: formServiceTranslations.en.questions.yearsExperience.label,
          placeholder: formServiceTranslations.en.questions.yearsExperience.placeholder,
          required: false,
          order: 2,
          options: formServiceTranslations.en.questions.yearsExperience.options,
          dependsOn: {
            questionId: "workExperience",
            value: "Yes"
          }
        },
        {
          id: "previousRoles",
          type: "checkbox",
          label: formServiceTranslations.en.questions.previousRoles.label,
          placeholder: formServiceTranslations.en.questions.previousRoles.placeholder,
          required: false,
          order: 3,
          options: formServiceTranslations.en.questions.previousRoles.options,
          dependsOn: {
            questionId: "workExperience",
            value: "Yes"
          }
        },
        {
          id: "otherEngagement",
          type: "textarea",
          label: formServiceTranslations.en.questions.otherEngagement.label,
          placeholder: formServiceTranslations.en.questions.otherEngagement.placeholder,
          required: false,
          order: 4,
          dependsOn: {
            questionId: "previousRoles",
            value: formServiceTranslations.en.questions.previousRoles.options?.includes('Other') ? "includes:Other" : "includes:Akandi kazi"
          }
        },
        {
          id: "previousWorkExperience",
          type: "textarea",
          label: formServiceTranslations.en.questions.previousWorkExperience.label,
          placeholder: formServiceTranslations.en.questions.previousWorkExperience.placeholder,
          required: false,
          order: 5,
          dependsOn: {
            questionId: "workExperience",
            value: "Yes"
          }
        },
        {
          id: "motivation",
          type: "textarea",
          label: formServiceTranslations.en.questions.motivation.label,
          placeholder: formServiceTranslations.en.questions.motivation.placeholder,
          required: true,
          order: 6
        },
        {
          id: "goals",
          type: "textarea",
          label: formServiceTranslations.en.questions.goals.label,
          placeholder: formServiceTranslations.en.questions.goals.placeholder,
          required: true,
          order: 7
        },
        {
          id: "healthcareBackground",
          type: "radio",
          label: formServiceTranslations.en.questions.healthcareBackground.label,
          placeholder: formServiceTranslations.en.questions.healthcareBackground.placeholder,
          required: true,
          order: 8,
          options: formServiceTranslations.en.questions.healthcareBackground.options
        },
        {
          id: "availability",
          type: "select",
          label: formServiceTranslations.en.questions.availability.label,
          placeholder: formServiceTranslations.en.questions.availability.placeholder,
          required: true,
          order: 9,
          options: formServiceTranslations.en.questions.availability.options
        }
      ]
    },
    {
      id: "section-5",
      title: formServiceTranslations.en.sections.digitalAccess.title,
      description: formServiceTranslations.en.sections.digitalAccess.description,
      order: 5,
      questions: [
        {
          id: "smartphoneAccess",
          type: "radio",
          label: formServiceTranslations.en.questions.smartphoneAccess.label,
          placeholder: formServiceTranslations.en.questions.smartphoneAccess.placeholder,
          required: true,
          order: 1,
          options: formServiceTranslations.en.questions.smartphoneAccess.options,
        },
        {
          id: "deviceOwner",
          type: "select",
          label: formServiceTranslations.en.questions.deviceOwner.label,
          placeholder: formServiceTranslations.en.questions.deviceOwner.placeholder,
          required: false,
          order: 2,
          options: formServiceTranslations.en.questions.deviceOwner.options,
          dependsOn: {
            questionId: "smartphoneAccess",
            value: "Yes"
          }
        },
        {
          id: "internetUsage",
          type: "select",
          label: formServiceTranslations.en.questions.internetUsage.label,
          placeholder: formServiceTranslations.en.questions.internetUsage.placeholder,
          required: true,
          order: 3,
          options: formServiceTranslations.en.questions.internetUsage.options,
        },
        {
          id: "appFamiliarity",
          type: "radio",
          label: formServiceTranslations.en.questions.appFamiliarity.label,
          placeholder: formServiceTranslations.en.questions.appFamiliarity.placeholder,
          required: true,
          order: 4,
          options: formServiceTranslations.en.questions.appFamiliarity.options,
        },
        {
          id: "usedApps",
          type: "checkbox",
          label: formServiceTranslations.en.questions.usedApps.label,
          placeholder: formServiceTranslations.en.questions.usedApps.placeholder,
          required: false,
          order: 5,
          options: formServiceTranslations.en.questions.usedApps.options,
          dependsOn: {
            questionId: "appFamiliarity",
            value: "Yes"
          }
        },
        {
          id: "otherApps",
          type: "textarea",
          label: formServiceTranslations.en.questions.otherApps.label,
          placeholder: formServiceTranslations.en.questions.otherApps.placeholder,
          required: false,
          order: 6,
          dependsOn: {
            questionId: "usedApps",
            value: "includes:Izindi"
          }
        }
      ]
    },
    {
      id: "section-6",
      title: formServiceTranslations.en.sections.livingEnvironment.title,
      description: formServiceTranslations.en.sections.livingEnvironment.description,
      order: 6,
      questions: [
        {
          id: "q36",
          type: "radio",
          label: formServiceTranslations.en.questions.housingSituation.label,
          placeholder: formServiceTranslations.en.questions.housingSituation.placeholder,
          required: true,
          order: 1,
          options: formServiceTranslations.en.questions.housingSituation.options
        },
        {
          id: "q37",
          type: "radio",
          label: formServiceTranslations.en.questions.communityInvolvement.label,
          placeholder: formServiceTranslations.en.questions.communityInvolvement.placeholder,
          required: true,
          order: 3,
          options: formServiceTranslations.en.questions.communityInvolvement.options
        },
        {
          id: "q38",
          type: "checkbox",
          label: formServiceTranslations.en.questions.communityActivities.label,
          placeholder: formServiceTranslations.en.questions.communityActivities.placeholder,
          required: false,
          order: 4,
          options: formServiceTranslations.en.questions.communityActivities.options,
          dependsOn: {
            questionId: "q37",
            value: "Yes"
          }
        },
        {
          id: "otherCommunityActivities",
          type: "textarea",
          label: formServiceTranslations.en.questions.otherCommunityActivities.label,
          placeholder: formServiceTranslations.en.questions.otherCommunityActivities.placeholder,
          required: false,
          order: 5,
          dependsOn: {
            questionId: "q38",
            value: "includes:Ni Ibindi"
          }
        },
        {
          id: "communityConnection",
          type: "radio",
          label: formServiceTranslations.en.questions.communityConnection.label,
          placeholder: formServiceTranslations.en.questions.communityConnection.placeholder,
          required: true,
          order: 6,
          options: formServiceTranslations.en.questions.communityConnection.options,
        },
      ],
    },
    {
      id: "section-7",
      title: formServiceTranslations.en.sections.documents.title,
      description: formServiceTranslations.en.sections.documents.description,
      order: 7,
      questions: [
        {
          id: "educationCertificate",
          type: "file",
          label: formServiceTranslations.en.questions.educationCertificate.label,
          placeholder: formServiceTranslations.en.questions.educationCertificate.placeholder,
          required: true,
          order: 1,
          validation: {
            maxSize: 5242880, // 5MB in bytes
            acceptedTypes: [".pdf", ".png", ".jpg", ".jpeg"],
            message: formServiceTranslations.en.questions.educationCertificate.validation
          }
        },
        {
          id: "nationalIdCopy",
          type: "file",
          label: formServiceTranslations.en.questions.nationalIdCopy.label,
          placeholder: formServiceTranslations.en.questions.nationalIdCopy.placeholder,
          required: true,
          order: 2,
          validation: {
            maxSize: 5242880, // 5MB in bytes
            acceptedTypes: [".pdf", ".png", ".jpg", ".jpeg"],
            message: formServiceTranslations.en.questions.nationalIdCopy.validation
          }
        }
      ],
    },
    {
      id: "section-8",
      title: formServiceTranslations.rw.sections.consent.title,
      description: formServiceTranslations.rw.sections.consent.description,
      order: 8,
      questions: [
        {
          id: "consent1",
          type: "checkbox",
          label: formServiceTranslations.rw.questions.consent1.label,
          placeholder: formServiceTranslations.rw.questions.consent1.placeholder,
          required: true,
          order: 1,
          options: formServiceTranslations.rw.questions.consent1.options,
          validation: {
            minSelected: 1,
            message: "Ugomba kwemera iyi ngingo kugira ngo ukomeze"
          }
        },
        {
          id: "consent2",
          type: "checkbox",
          label: formServiceTranslations.rw.questions.consent2.label,
          placeholder: formServiceTranslations.rw.questions.consent2.placeholder,
          required: true,
          order: 2,
          options: formServiceTranslations.rw.questions.consent2.options,
          validation: {
            minSelected: 1,
            message: "Ugomba kwemera iyi ngingo kugira ngo ukomeze"
          }
        },
        {
          id: "consent3",
          type: "checkbox",
          label: formServiceTranslations.rw.questions.consent3.label,
          placeholder: formServiceTranslations.rw.questions.consent3.placeholder,
          required: true,
          order: 3,
          options: formServiceTranslations.rw.questions.consent3.options,
          validation: {
            minSelected: 1,
            message: "Ugomba kwemera iyi ngingo kugira ngo ukomeze"
          }
        }
      ]
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true,
}

// Agent form configuration
export const agentFormConfig: FormConfig = {
  id: "agent-application-form",
  title: "Agent Application Form",
  description: "Application form for Agent registration",
  sections: [
    {
      id: "section-1",
      title: "Personal Information",
      description: "Basic personal details",
      order: 1,
      questions: [
        {
          id: "fullName",
          type: "text",
          label: "Full Name",
          placeholder: "Enter your full name",
          required: true,
          order: 1,
        },
        {
          id: "email",
          type: "email",
          label: "Email Address (Optional)",
          placeholder: "your.email@example.com",
          required: false,
          order: 2,
        },
        {
          id: "phone",
          type: "phone",
          label: "Phone Number",
          placeholder: "+250 7XX XXX XXX",
          required: true,
          order: 3,
        }
      ]
    },
    {
      id: "section-2",
      title: "Business Information",
      description: "Details about your business",
      order: 2,
      questions: [
        {
          id: "businessName",
          type: "text",
          label: "Business Name",
          placeholder: "Enter your business name",
          required: true,
          order: 1,
        },
        {
          id: "businessType",
          type: "text",
          label: "Business Type",
          placeholder: "Enter your business type",
          required: true,
          order: 2,
        },
        {
          id: "businessAddress",
          type: "text",
          label: "Business Address",
          placeholder: "Enter your business address",
          required: true,
          order: 3,
        }
      ]
    },
    {
      id: "section-3",
      title: "Experience & Skills",
      description: "Your professional background",
      order: 3,
      questions: [
        {
          id: "experience",
          type: "textarea",
          label: "Professional Experience",
          placeholder: "Describe your relevant professional experience",
          required: true,
          order: 1,
        },
        {
          id: "skills",
          type: "text",
          label: "Skills",
          placeholder: "Enter your skills (comma-separated)",
          required: true,
          order: 2,
        },
        {
          id: "education",
          type: "textarea",
          label: "Education",
          placeholder: "Describe your educational background",
          required: true,
          order: 3,
        }
      ]
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true
}

// Helper function to map question IDs to translation keys
function getQuestionKey(id: string): string {
  const questionMap: Record<string, string> = {
    'q1': 'firstName',
    'q2': 'lastName',
    'q3': 'dateOfBirth',
    'q4': 'gender',
    'q5': 'nationalId',
    'q6': 'maritalStatus',
    'q6a': 'disability',
    'q6b': 'disabilityType',
    'q7': 'refugee',
    'q8': 'refugeeCamp',
    'q8a': 'householdHead',
    'q8b': 'primaryProvider',
    'q9': 'email',
    'q10': 'phone',
    'q10b': 'alternatePhone',
    'q10c': 'preferredContact',
    'q11': 'province',
    'q12': 'district',
    'q13': 'sector',
    'q14': 'cell',
    'q15': 'village',
    'q19': 'education',
    'q19b': 'schoolName',
    'q20': 'fieldOfStudy',
    'q20a': 'skills',
    'q20b': 'otherSkills',
    'q21': 'languages',
    'q23': 'workExperience',
    'q23b': 'yearsExperience',
    'q24': 'previousRoles',
    'q24b': 'otherEngagement',
    'q24c': 'healthcareExperience',
    'q24d': 'healthcareField',
    'q24e': 'otherHealthcareField',
    'q25': 'previousWorkExperience',
    'q26': 'motivation',
    'q27': 'goals',
    'q28': 'availability',
    'q29': 'smartphoneAccess',
    'q30': 'deviceOwner',
    'q31': 'internetUsage',
    'q32': 'appFamiliarity',
    'q33': 'usedApps',
    'q34': 'otherApps',
    'q35': 'housingSituation',
    'q36': 'utilities',
    'q37': 'communityInvolvement',
    'q38': 'communityActivities',
    'q39': 'otherCommunityActivities',
    'q40': 'communityConnection',
    'q41': 'educationCertificate',
    'q42': 'consent1',
    'q43': 'consent2',
    'q44': 'consent3'
  }
  return questionMap[id] || id
}

// Get translations for a specific language
export function getFormTranslations(lang: string = 'en') {
  return formServiceTranslations[lang as keyof typeof formServiceTranslations] || formServiceTranslations.en
}

// Helper function to get translated dependency value
function getTranslatedDependencyValue(questionId: string, value: string, translations: any): string {
  // Handle special cases for includes: dependencies
  if (value.startsWith('includes:')) {
    const option = value.replace('includes:', '')
    if (option === 'Other') {
      return translations.questions[questionId]?.options?.includes('Ni Ibindi') ? 'includes:Ni Ibindi' : value
    }
    if (option === 'Ni Ibindi') {
      return translations.questions[questionId]?.options?.includes('Other') ? 'includes:Other' : value
    }
  }
  
  // Handle Yes/Yego cases
  if (value === 'Yes') {
    return translations.questions[questionId]?.options?.includes('Yego') ? 'Yego' : value
  }
  if (value === 'Yego') {
    return translations.questions[questionId]?.options?.includes('Yes') ? 'Yes' : value
  }
  
  return value
}

// Update getFormConfig to handle translations
export function getFormConfig(formId = "dcc-application-form", lang = "en"): FormConfig {
  const translations = formServiceTranslations[lang as keyof typeof formServiceTranslations]

  return {
    id: formId,
    title: translations.sections.consent.title,
    description: translations.sections.consent.description,
    sections: [
      {
        id: "section-1",
        title: translations.sections.personalInfo.title,
        description: translations.sections.personalInfo.description,
        order: 1,
        questions: [
          {
            id: "q1",
            type: "text",
            label: translations.questions.firstName.label,
            placeholder: translations.questions.firstName.placeholder,
            required: true,
            order: 1,
          },
          {
            id: "q2",
            type: "text",
            label: translations.questions.lastName.label,
            placeholder: translations.questions.lastName.placeholder,
            required: true,
            order: 2,
          },
          {
            id: "q3",
            type: "date",
            label: translations.questions.dateOfBirth.label,
            placeholder: translations.questions.dateOfBirth.placeholder,
            required: true,
            order: 3,
          },
          {
            id: "q4",
            type: "radio",
            label: translations.questions.gender.label,
            placeholder: translations.questions.gender.placeholder,
            required: true,
            order: 4,
            options: translations.questions.gender.options,
          },
          {
            id: "q5",
            type: "text",
            label: translations.questions.nationalId.label,
            placeholder: translations.questions.nationalId.placeholder,
            required: true,
            order: 5,
            validation: {
              pattern: "^\\d{16}$",
              message: translations.questions.nationalId.validation
            }
          },
          {
            id: "q6",
            type: "select",
            label: translations.questions.maritalStatus.label,
            placeholder: translations.questions.maritalStatus.placeholder,
            required: true,
            order: 6,
            options: translations.questions.maritalStatus.options,
          },
          {
            id: "q6a",
            type: "radio",
            label: translations.questions.disability.label,
            placeholder: translations.questions.disability.placeholder,
            required: true,
            order: 7,
            options: translations.questions.disability.options,
          },
          {
            id: "q6b",
            type: "checkbox",
            label: translations.questions.disabilityType.label,
            placeholder: translations.questions.disabilityType.placeholder,
            required: false,
            order: 8,
            options: translations.questions.disabilityType.options,
            dependsOn: {
              questionId: "q6a",
              value: "Yes"
            },
            subFields: {
              other: {
                label: translations.questions.disabilityType.subFields?.other.label || "Please specify other disability",
                placeholder: translations.questions.disabilityType.subFields?.other.placeholder || "Describe your other disability",
                required: true
              }
            }
          },
          {
            id: "q7",
            type: "radio",
            label: translations.questions.refugee.label,
            placeholder: translations.questions.refugee.placeholder,
            required: true,
            order: 9,
            options: translations.questions.refugee.options,
          },
          {
            id: "q8",
            type: "radio",
            label: translations.questions.refugeeCamp.label,
            placeholder: translations.questions.refugeeCamp.placeholder,
            required: false,
            order: 10,
            options: translations.questions.refugeeCamp.options,
            dependsOn: {
              questionId: "q7",
              value: "Yes"
            },
          },
          {
            id: "q8a",
            type: "radio",
            label: translations.questions.householdHead.label,
            placeholder: translations.questions.householdHead.placeholder,
            required: true,
            order: 11,
            options: translations.questions.householdHead.options,
          },
          {
            id: "q8b",
            type: "radio",
            label: translations.questions.primaryProvider.label,
            placeholder: translations.questions.primaryProvider.placeholder,
            required: true,
            order: 12,
            options: translations.questions.primaryProvider.options,
          },
        ]
      },
      {
        id: "section-2",
        title: translations.sections.contactAddress.title,
        description: translations.sections.contactAddress.description,
        order: 2,
        questions: [
          {
            id: "q9",
            type: "email",
            label: translations.questions.email.label,
            placeholder: translations.questions.email.placeholder,
            required: false,
            order: 1,
          },
          {
            id: "q10",
            type: "phone",
            label: translations.questions.phone.label,
            placeholder: translations.questions.phone.placeholder,
            required: true,
            order: 2,
          },
          {
            id: "q10b",
            type: "phone",
            label: translations.questions.alternatePhone.label,
            placeholder: translations.questions.alternatePhone.placeholder,
            required: false,
            order: 3,
          },
          {
            id: "q10c",
            type: "select",
            label: translations.questions.preferredContact.label,
            placeholder: translations.questions.preferredContact.placeholder,
            required: false,
            order: 4,
            options: translations.questions.preferredContact.options,
          },
          {
            id: "address",
            type: "dependent-dropdown",
            label: translations.questions.addressInfo.label,
            placeholder: translations.questions.addressInfo.placeholder,
            required: true,
            order: 5,
          }
        ]
      },
      {
        id: "section-3",
        title: translations.sections.educationSkills.title,
        description: translations.sections.educationSkills.description,
        order: 3,
        questions: [
          {
            id: "education",
            type: "select",
            label: translations.questions.education.label,
            placeholder: translations.questions.education.placeholder,
            required: true,
            order: 1,
            options: translations.questions.education.options,
          },
          {
            id: "schoolName",
            type: "text",
            label: translations.questions.schoolName.label,
            placeholder: translations.questions.schoolName.placeholder,
            required: true,
            order: 2,
          },
          {
            id: "fieldOfStudy",
            type: "text",
            label: translations.questions.fieldOfStudy.label,
            placeholder: translations.questions.fieldOfStudy.placeholder,
            required: true,
            order: 3,
          },
          {
            id: "skills",
            type: "checkbox",
            label: translations.questions.skills.label,
            placeholder: translations.questions.skills.placeholder,
            required: true,
            order: 4,
            options: translations.questions.skills.options,
          },
          {
            id: "otherSkills",
            type: "textarea",
            label: translations.questions.otherSkills.label,
            placeholder: translations.questions.otherSkills.placeholder,
            required: false,
            order: 5,
            validation: {
              message: translations.questions.otherSkills.validation
            },
            dependsOn: {
              questionId: "skills",
              value: "includes:Other"
            }
          },
          {
            id: "languages",
            type: "checkbox",
            label: translations.questions.languages.label,
            placeholder: translations.questions.languages.placeholder,
            required: true,
            order: 6,
            options: translations.questions.languages.options,
          }
        ]
      },
      {
        id: "section-4",
        title: translations.sections.workExperience.title,
        description: translations.sections.workExperience.description,
        order: 4,
        questions: [
          {
            id: "workExperience",
            type: "radio",
            label: translations.questions.workExperience.label,
            placeholder: translations.questions.workExperience.placeholder,
            required: true,
            order: 1,
            options: translations.questions.workExperience.options,
          },
          {
            id: "yearsExperience",
            type: "select",
            label: translations.questions.yearsExperience.label,
            placeholder: translations.questions.yearsExperience.placeholder,
            required: false,
            order: 2,
            options: translations.questions.yearsExperience.options,
            dependsOn: {
              questionId: "workExperience",
              value: "Yes"
            }
          },
          {
            id: "previousRoles",
            type: "checkbox",
            label: translations.questions.previousRoles.label,
            placeholder: translations.questions.previousRoles.placeholder,
            required: false,
            order: 3,
            options: translations.questions.previousRoles.options,
            dependsOn: {
              questionId: "workExperience",
              value: "Yes"
            }
          },
          {
            id: "otherEngagement",
            type: "textarea",
            label: translations.questions.otherEngagement.label,
            placeholder: translations.questions.otherEngagement.placeholder,
            required: false,
            order: 4,
            dependsOn: {
              questionId: "previousRoles",
              value: translations.questions.previousRoles.options?.includes('Other') ? "includes:Other" : "includes:Akandi kazi"
            }
          },
          {
            id: "previousWorkExperience",
            type: "textarea",
            label: translations.questions.previousWorkExperience.label,
            placeholder: translations.questions.previousWorkExperience.placeholder,
            required: false,
            order: 5,
            dependsOn: {
              questionId: "workExperience",
              value: "Yes"
            }
          },
          {
            id: "motivation",
            type: "textarea",
            label: translations.questions.motivation.label,
            placeholder: translations.questions.motivation.placeholder,
            required: true,
            order: 6
          },
          {
            id: "goals",
            type: "textarea",
            label: translations.questions.goals.label,
            placeholder: translations.questions.goals.placeholder,
            required: true,
            order: 7
          },
          {
            id: "healthcareBackground",
            type: "radio",
            label: translations.questions.healthcareBackground.label,
            placeholder: translations.questions.healthcareBackground.placeholder,
            required: true,
            order: 8,
            options: translations.questions.healthcareBackground.options
          },
          {
            id: "availability",
            type: "select",
            label: translations.questions.availability.label,
            placeholder: translations.questions.availability.placeholder,
            required: true,
            order: 9,
            options: translations.questions.availability.options
          }
        ]
      },
      {
        id: "section-5",
        title: translations.sections.digitalAccess.title,
        description: translations.sections.digitalAccess.description,
        order: 5,
        questions: [
          {
            id: "smartphoneAccess",
            type: "radio",
            label: translations.questions.smartphoneAccess.label,
            placeholder: translations.questions.smartphoneAccess.placeholder,
            required: true,
            order: 1,
            options: translations.questions.smartphoneAccess.options,
          },
          {
            id: "deviceOwner",
            type: "select",
            label: translations.questions.deviceOwner.label,
            placeholder: translations.questions.deviceOwner.placeholder,
            required: false,
            order: 2,
            options: translations.questions.deviceOwner.options,
            dependsOn: {
              questionId: "smartphoneAccess",
              value: "Yes"
            }
          },
          {
            id: "internetUsage",
            type: "select",
            label: translations.questions.internetUsage.label,
            placeholder: translations.questions.internetUsage.placeholder,
            required: true,
            order: 3,
            options: translations.questions.internetUsage.options,
          },
          {
            id: "appFamiliarity",
            type: "radio",
            label: translations.questions.appFamiliarity.label,
            placeholder: translations.questions.appFamiliarity.placeholder,
            required: true,
            order: 4,
            options: translations.questions.appFamiliarity.options,
          },
          {
            id: "usedApps",
            type: "checkbox",
            label: translations.questions.usedApps.label,
            placeholder: translations.questions.usedApps.placeholder,
            required: false,
            order: 5,
            options: translations.questions.usedApps.options,
            dependsOn: {
              questionId: "appFamiliarity",
              value: "Yes"
            }
          },
          {
            id: "otherApps",
            type: "textarea",
            label: translations.questions.otherApps.label,
            placeholder: translations.questions.otherApps.placeholder,
            required: false,
            order: 6,
            dependsOn: {
              questionId: "usedApps",
              value: "includes:Izindi"
            }
          }
        ]
      },
      {
        id: "section-6",
        title: translations.sections.livingEnvironment.title,
        description: translations.sections.livingEnvironment.description,
        order: 6,
        questions: [
          {
            id: "q36",
            type: "radio",
            label: translations.questions.housingSituation.label,
            placeholder: translations.questions.housingSituation.placeholder,
            required: true,
            order: 1,
            options: translations.questions.housingSituation.options
          },
          {
            id: "q37",
            type: "radio",
            label: translations.questions.communityInvolvement.label,
            placeholder: translations.questions.communityInvolvement.placeholder,
            required: true,
            order: 3,
            options: translations.questions.communityInvolvement.options
          },
          {
            id: "q38",
            type: "checkbox",
            label: translations.questions.communityActivities.label,
            placeholder: translations.questions.communityActivities.placeholder,
            required: false,
            order: 4,
            options: translations.questions.communityActivities.options,
            dependsOn: {
              questionId: "q37",
              value: "Yes"
            }
          },
          {
            id: "otherCommunityActivities",
            type: "textarea",
            label: translations.questions.otherCommunityActivities.label,
            placeholder: translations.questions.otherCommunityActivities.placeholder,
            required: false,
            order: 5,
            dependsOn: {
              questionId: "q38",
              value: "includes:Ni Ibindi"
            }
          },
          {
            id: "communityConnection",
            type: "radio",
            label: translations.questions.communityConnection.label,
            placeholder: translations.questions.communityConnection.placeholder,
            required: true,
            order: 6,
            options: translations.questions.communityConnection.options,
          },
        ],
      },
      {
        id: "section-7",
        title: translations.sections.documents.title,
        description: translations.sections.documents.description,
        order: 7,
        questions: [
          {
            id: "educationCertificate",
            type: "file",
            label: translations.questions.educationCertificate.label,
            placeholder: translations.questions.educationCertificate.placeholder,
            required: true,
            order: 1,
            validation: {
              maxSize: 5242880, // 5MB in bytes
              acceptedTypes: [".pdf", ".png", ".jpg", ".jpeg"],
              message: translations.questions.educationCertificate.validation
            }
          },
          {
            id: "nationalIdCopy",
            type: "file",
            label: translations.questions.nationalIdCopy.label,
            placeholder: translations.questions.nationalIdCopy.placeholder,
            required: true,
            order: 2,
            validation: {
              maxSize: 5242880, // 5MB in bytes
              acceptedTypes: [".pdf", ".png", ".jpg", ".jpeg"],
              message: translations.questions.nationalIdCopy.validation
            }
          },
          {
            id: "selfiePhoto",
            type: "file",
            label: translations.questions.selfiePhoto.label,
            placeholder: translations.questions.selfiePhoto.placeholder,
            required: true,
            order: 3,
            validation: {
              maxSize: 5242880, // 5MB in bytes
              acceptedTypes: [".png", ".jpg", ".jpeg"],
              message: translations.questions.selfiePhoto.validation
            }
          },
          {
            id: "nationalIdBack",
            type: "file",
            label: translations.questions.nationalIdBack.label,
            placeholder: translations.questions.nationalIdBack.placeholder,
            required: true,
            order: 4,
            validation: {
              maxSize: 5242880, // 5MB in bytes
              acceptedTypes: [".pdf", ".png", ".jpg", ".jpeg"],
              message: translations.questions.nationalIdBack.validation
            }
          }
        ],
      },
      {
        id: "section-8",
        title: translations.sections.consent.title,
        description: translations.sections.consent.description,
        order: 8,
        questions: [
          {
            id: "consent1",
            type: "checkbox",
            label: translations.questions.consent1.label,
            placeholder: translations.questions.consent1.placeholder,
            required: true,
            order: 1,
            options: translations.questions.consent1.options,
            validation: {
              minSelected: 1,
              message: translations.questions.consent1.validation
            }
          },
          {
            id: "consent2",
            type: "checkbox",
            label: translations.questions.consent2.label,
            placeholder: translations.questions.consent2.placeholder,
            required: true,
            order: 2,
            options: translations.questions.consent2.options,
            validation: {
              minSelected: 1,
              message: translations.questions.consent2.validation
            }
          },
          {
            id: "consent3",
            type: "checkbox",
            label: translations.questions.consent3.label,
            placeholder: translations.questions.consent3.placeholder,
            required: true,
            order: 3,
            options: translations.questions.consent3.options,
            validation: {
              minSelected: 1,
              message: translations.questions.consent3.validation
            }
          }
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  }
}

// Add a helper function to get translated question options
export function getTranslatedOptions(questionId: string, lang = "en"): string[] {
  const translations = formServiceTranslations[lang as keyof typeof formServiceTranslations] || formServiceTranslations.en;
  const question = translations.questions[questionId as keyof typeof translations.questions];
  return question?.options || [];
}

// Add a helper function to get translated question label
export function getTranslatedLabel(questionId: string, lang = "en"): string {
  const translations = formServiceTranslations[lang as keyof typeof formServiceTranslations] || formServiceTranslations.en;
  const question = translations.questions[questionId as keyof typeof translations.questions];
  return question?.label || "";
}

// Add a helper function to get translated question placeholder
export function getTranslatedPlaceholder(questionId: string, lang = "en"): string {
  const translations = formServiceTranslations[lang as keyof typeof formServiceTranslations] || formServiceTranslations.en;
  const question = translations.questions[questionId as keyof typeof translations.questions];
  return question?.placeholder || "";
}

export function saveFormConfig(formConfig: FormConfig, lang: string = 'en'): void {
  console.log("💾 Saving form config:", formConfig)

  if (typeof window === "undefined") {
    console.log("📝 Server-side rendering, skipping save")
    return
  }

  formConfig.updatedAt = new Date().toISOString()
  localStorage.setItem(`form_config_${formConfig.id}_${lang}`, JSON.stringify(formConfig))
  console.log("💾 Form config saved successfully")
}

export function getFormSectionByStep(step: number, lang: string = 'en'): FormSection | null {
  const config = getFormConfig(undefined, lang)
  return config.sections[step - 1] || null
}

export function getTotalSteps(lang: string = 'en'): number {
  const config = getFormConfig(undefined, lang)
  return config.sections.length
}

export function refreshFormConfig(lang: string = 'en'): FormConfig {
  if (typeof window === "undefined") {
    return getFormConfig(undefined, lang)
  }

  const storedConfig = localStorage.getItem(`form_config_dcc-application-form_${lang}`)
  if (!storedConfig) {
    // Save default config if none exists
    const config = getFormConfig(undefined, lang)
    saveFormConfig(config, lang)
    return config
  }

  try {
    return JSON.parse(storedConfig)
  } catch (error) {
    console.error("Error parsing form config:", error)
    return getFormConfig(undefined, lang)
  }
}

export function validateFormConfig(config: FormConfig): boolean {
  try {
    // Check required fields
    if (!config.id || !config.title || !config.sections) {
      return false
    }

    // Check sections structure
    if (!Array.isArray(config.sections)) {
      return false
    }

    // Validate each section
    for (const section of config.sections) {
      if (!section.id || !section.title || !section.questions || !Array.isArray(section.questions)) {
        return false
      }

      // Validate each question
      for (const question of section.questions) {
        if (!question.id || !question.type || !question.label) {
          return false
        }
      }
    }

    return true
  } catch (error) {
    console.error("Error validating form config:", error)
    return false
  }
}
