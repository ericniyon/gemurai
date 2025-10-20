interface ApplicationTranslation {
  hero: {
    title: string
    subtitle: string
  }
  form: {
    personalInfo: {
      title: string
      subtitle: string
      nameLabel: string
      namePlaceholder: string
      emailLabel: string
      emailPlaceholder: string
      phoneLabel: string
      phonePlaceholder: string
      addressLabel: string
      addressPlaceholder: string
      provinceLabel: string
      districtLabel: string
    }
    experience: {
      title: string
      subtitle: string
      currentRole: string
      yearsExperience: string
      skills: string
      skillsPlaceholder: string
      languages: string
      languagesPlaceholder: string
    }
    community: {
      title: string
      subtitle: string
      involvement: string
      involvementPlaceholder: string
      impact: string
      impactPlaceholder: string
      motivation: string
      motivationPlaceholder: string
    }
    references: {
      title: string
      subtitle: string
      nameLabel: string
      relationshipLabel: string
      phoneLabel: string
      emailLabel: string
    }
    submit: {
      title: string
      subtitle: string
      agreement: string
      button: string
    }
  }
  status: {
    submitted: string
    underReview: string
    approved: string
    rejected: string
  }
}

export const applicationTranslations: Record<string, ApplicationTranslation> = {
  en: {
    hero: {
      title: "Become a Digital Community Champion",
      subtitle: "Join our network of community leaders driving digital transformation"
    },
    form: {
      personalInfo: {
        title: "Personal Information",
        subtitle: "Tell us about yourself",
        nameLabel: "Full Name",
        namePlaceholder: "Enter your full name",
        emailLabel: "Email Address",
        emailPlaceholder: "Enter your email address",
        phoneLabel: "Phone Number",
        phonePlaceholder: "Enter your phone number",
        addressLabel: "Physical Address",
        addressPlaceholder: "Enter your address",
        provinceLabel: "Province",
        districtLabel: "District"
      },
      experience: {
        title: "Experience & Skills",
        subtitle: "Tell us about your background",
        currentRole: "Current Role/Occupation",
        yearsExperience: "Years of Experience",
        skills: "Relevant Skills",
        skillsPlaceholder: "List your relevant skills",
        languages: "Languages Spoken",
        languagesPlaceholder: "List languages you speak"
      },
      community: {
        title: "Community Involvement",
        subtitle: "Tell us about your community work",
        involvement: "Current Community Involvement",
        involvementPlaceholder: "Describe your current community activities",
        impact: "Community Impact",
        impactPlaceholder: "Describe the impact you've made in your community",
        motivation: "Motivation",
        motivationPlaceholder: "Why do you want to become a Digital Community Champion?"
      },
      references: {
        title: "References",
        subtitle: "Provide two references from your community",
        nameLabel: "Reference Name",
        relationshipLabel: "Relationship",
        phoneLabel: "Phone Number",
        emailLabel: "Email Address"
      },
      submit: {
        title: "Submit Application",
        subtitle: "Review and submit your application",
        agreement: "I agree to the terms and conditions",
        button: "Submit Application"
      }
    },
    status: {
      submitted: "Application Submitted",
      underReview: "Under Review",
      approved: "Application Approved",
      rejected: "Application Rejected"
    }
  },
  rw: {
    hero: {
      title: "Ba Umuyobozi w'Ikoranabuhanga mu Muryango",
      subtitle: "Ifatanye n'urugaga rw'abayobozi b'imiryango bateza imbere ikoranabuhanga"
    },
    form: {
      personalInfo: {
        title: "Amakuru Yawe",
        subtitle: "Tubwire ibyawe",
        nameLabel: "Amazina Yombi",
        namePlaceholder: "Andika amazina yawe yombi",
        emailLabel: "Imeyili",
        emailPlaceholder: "Andika imeyili yawe",
        phoneLabel: "Telefoni",
        phonePlaceholder: "Andika numero ya telefoni yawe",
        addressLabel: "",
        addressPlaceholder: "Andika aho ubarizwa",
        provinceLabel: "Intara",
        districtLabel: "Akarere",
      },
      experience: {
        title: "Uburambe n'Ubumenyi",
        subtitle: "Tubwire ibijyanye n'uburambe bwawe",
        currentRole: "Umwuga wawe",
        yearsExperience: "Imyaka y'Uburambe",
        skills: "Ubumenyi Ufite",
        skillsPlaceholder: "Andika ubumenyi bwawe",
        languages: "Indimi Uvuga",
        languagesPlaceholder: "Andika indimi uvuga"
      },
      community: {
        title: "Ibikorwa mu Muryango",
        subtitle: "Tubwire ibikorwa ukora mu muryango",
        involvement: "Ibikorwa Ukora mu Muryango",
        involvementPlaceholder: "Sobanura ibikorwa ukora mu muryango",
        impact: "Akamaro ku Muryango",
        impactPlaceholder: "Sobanura akamaro wateje imbere mu muryango",
        motivation: "Impamvu",
        motivationPlaceholder: "Kuki ushaka kuba Umuyobozi w'Ikoranabuhanga mu Muryango?"
      },
      references: {
        title: "Abakwemeza",
        subtitle: "Tanga abakwemeza babiri bo mu muryango",
        nameLabel: "Izina ry'Umwemeza",
        relationshipLabel: "Isano",
        phoneLabel: "Telefoni",
        emailLabel: "Imeyili"
      },
      submit: {
        title: "Ohereza Ubusabe",
        subtitle: "Suzuma kandi wohereze ubusabe bwawe",
        agreement: "Nemeye amabwiriza n'amategeko",
        button: "Ohereza Ubusabe"
      }
    },
    status: {
      submitted: "Ubusabe Bwoherejwe",
      underReview: "Burimo Gusuzumwa",
      approved: "Ubusabe Bwemewe",
      rejected: "Ubusabe Bwanzwe"
    }
  }
} 