interface FormTranslation {
  label: string;
  placeholder: string;
  options?: string[];
  validation?: string;
  hint?: string;
  subFields?: {
    other: {
      label: string;
      placeholder: string;
      required: boolean;
    };
  };
}

interface FormSectionTranslation {
  title: string;
  description: string;
}

interface FormTranslations {
  sections: {
    personalInfo: FormSectionTranslation;
    contactAddress: FormSectionTranslation;
    educationSkills: FormSectionTranslation;
    workExperience: FormSectionTranslation;
    digitalAccess: FormSectionTranslation;
    livingEnvironment: FormSectionTranslation;
    documents: FormSectionTranslation;
    consent: FormSectionTranslation;
  };
  questions: {
    firstName: FormTranslation;
    lastName: FormTranslation;
    dateOfBirth: FormTranslation;
    gender: FormTranslation;
    nationalId: FormTranslation;
    maritalStatus: FormTranslation;
    disability: FormTranslation;
    disabilityType: FormTranslation;
    refugee: FormTranslation;
    refugeeCamp: FormTranslation;
    householdHead: FormTranslation;
    primaryProvider: FormTranslation;
    email: FormTranslation;
    phone: FormTranslation;
    alternatePhone: FormTranslation;
    preferredContact: FormTranslation;
    addressInfo: FormTranslation;
    province: FormTranslation;
    district: FormTranslation;
    sector: FormTranslation;
    cell: FormTranslation;
    village: FormTranslation;
    education: FormTranslation;
    schoolName: FormTranslation;
    fieldOfStudy: FormTranslation;
    skills: FormTranslation;
    otherSkills: FormTranslation;
    languages: FormTranslation;
    workExperience: FormTranslation;
    yearsExperience: FormTranslation;
    previousRoles: FormTranslation;
    otherEngagement: FormTranslation;
    healthcareExperience: FormTranslation;
    healthcareField: FormTranslation;
    otherHealthcareField: FormTranslation;
    previousWorkExperience: FormTranslation;
    motivation: FormTranslation;
    goals: FormTranslation;
    availability: FormTranslation;
    smartphoneAccess: FormTranslation;
    deviceOwner: FormTranslation;
    internetUsage: FormTranslation;
    appFamiliarity: FormTranslation;
    usedApps: FormTranslation;
    otherApps: FormTranslation;
    housingSituation: FormTranslation;
    utilities: FormTranslation;
    communityInvolvement: FormTranslation;
    communityActivities: FormTranslation;
    otherCommunityActivities: FormTranslation;
    communityConnection: FormTranslation;
    educationCertificate: FormTranslation;
    consent1: FormTranslation;
    consent2: FormTranslation;
    consent3: FormTranslation;
    healthcareBackground: FormTranslation;
    nationalIdCopy: FormTranslation;
    selfiePhoto: FormTranslation;
    nationalIdBack: FormTranslation;
  };
}

export const formServiceTranslations: Record<'en' | 'rw', FormTranslations> = {
  en: {
    sections: {
      personalInfo: {
        title: "Personal Information",
        description: "Please provide your personal details"
      },
      contactAddress: {
        title: "Contact & Address",
        description: "Contact information and address details"
      },
      educationSkills: {
        title: "Education & Skills",
        description: "Educational background and relevant skills"
      },
      workExperience: {
        title: "Work Experience",
        description: "Tell us about your work history and experience"
      },
      digitalAccess: {
        title: "Digital Access and Literacy",
        description: "Tell us about your access to digital devices and internet connectivity"
      },
      livingEnvironment: {
        title: "Living Environment & Community Connections",
        description: "Tell us about your living environment and community connections"
      },
      documents: {
        title: "Required Documents (To be filled by authorized personnel only)",
        description: "Required and optional document uploads"
      },
      consent: {
        title: "Consent & Declaration",
        description: "Please review and agree to the following statements before submitting your application"
      }
    },
    questions: {
      firstName: {
        label: "First Name",
        placeholder: "Enter your first name"
      },
      lastName: {
        label: "Last Name",
        placeholder: "Enter your last name"
      },
      dateOfBirth: {
        label: "Date of Birth",
        placeholder: "Select your date of birth"
      },
      gender: {
        label: "Gender",
        placeholder: "Select your gender",
        options: ["Male", "Female"]
      },
      nationalId: {
        label: "National ID Number",
        placeholder: "Enter your 16-digit National ID number",
        validation: "Please enter a valid 16-digit National ID number"
      },
      maritalStatus: {
        label: "Marital Status",
        placeholder: "Select your marital status",
        options: ["Single", "Married", "Divorced", "Widowed"]
      },
      disability: {
        label: "Do you have any disability?",
        placeholder: "Select your disability status",
        options: ["Yes", "No"]
      },
      disabilityType: {
        label: "Type of Disability",
        placeholder: "Select type of disability",
        options: ["Physical", "Visual", "Hearing", "Speech", "Mental", "Other"],
        subFields: {
          other: {
            label: "Please specify other disability",
            placeholder: "Describe your other disability",
            required: true
          }
        }
      },
      refugee: {
        label: "Are you a refugee?",
        placeholder: "Select your refugee status",
        options: ["Yes", "No"]
      },
      refugeeCamp: {
        label: "Do you live in a refugee camp?",
        placeholder: "Select your living situation",
        options: ["Yes", "No"]
      },
      householdHead: {
        label: "Are you the head of your household?",
        placeholder: "Select if you are the head of household",
        options: ["Yes", "No"]
      },
      primaryProvider: {
        label: "Are you the primary financial provider for your household?",
        placeholder: "Select if you are the primary provider",
        options: ["Yes", "No"]
      },
      email: {
        label: "Email (Optional)",
        placeholder: "Enter your email address"
      },
      phone: {
        label: "Phone Number",
        placeholder: "Enter your phone number (e.g., +250 787 283 351)",
        validation: "Please enter a valid Rwanda mobile number in format: +250 XXX XXX XXX",
        hint: "Enter number starting with +250 (e.g., +250 787 283 351)"
      },
      alternatePhone: {
        label: "Alternate Phone",
        placeholder: "Enter alternate phone number (e.g., +250 787 283 351)",
        validation: "Please enter a valid Rwanda mobile number in format: +250 XXX XXX XXX",
        hint: "Enter number starting with +250 (e.g., +250 787 283 351)"
      },
      preferredContact: {
        label: "Preferred Contact Method",
        placeholder: "Select preferred method",
        options: ["Phone Call", "SMS", "Email", "WhatsApp"]
      },
      addressInfo: {
        label: "",
        placeholder: "Select your location"
      },
      province: {
        label: "Province",
        placeholder: "Select your province",
        options: ["Eastern", "Northern Province"]
      },
      district: {
        label: "District",
        placeholder: "Select your district"
      },
      sector: {
        label: "Sector",
        placeholder: "Select your sector"
      },
      cell: {
        label: "Cell",
        placeholder: "Select your cell"
      },
      village: {
        label: "Village",
        placeholder: "Select your village"
      },
      education: {
        label: "Highest Level Completed",
        placeholder: "Select your highest level completed",
        options: ["O'level (S3)", "A level (S6)", "TVET Certificate"]
      },
      schoolName: {
        label: "Name of school where you completed your education",
        placeholder: "Enter your school name"
      },
      fieldOfStudy: {
        label: "Field of Study",
        placeholder: "e.g., Computer Science, Business"
      },
      skills: {
        label: "Skills (Select all that apply)",
        placeholder: "Select your skills",
        options: [
          "Computer Literacy",
          "Marketing",
          "Sales",
          "Customer Service",
          "Data Entry",
          "Social Media",
          "Photography",
          "Writing",
          "Translation",
          "Teaching",
          "Healthcare",
          "Agriculture",
          "Other"
        ]
      },
      otherSkills: {
        label: "Other skills you have",
        placeholder: "Please describe any other skills you have",
        validation: "Please keep your description under 500 characters"
      },
      languages: {
        label: "Languages (Select all that apply)",
        placeholder: "Select languages you know",
        options: ["Kinyarwanda", "English", "French", "Swahili"]
      },
      workExperience: {
        label: "Do you have any work experience?",
        placeholder: "Select your work experience",
        options: ["Yes", "No"]
      },
      yearsExperience: {
        label: "How many years of work experience do you have?",
        placeholder: "Select years of experience",
        options: ["Less than 1 year", "1-2 years", "3-5 years", "More than 5 years"]
      },
      previousRoles: {
        label: "Previous Roles",
        placeholder: "Select your previous roles",
        options: [
          "Mobile Money Agent (Airtel, MTN)",
          "Bank Agent",
          "Business Owner",
          "Small Business",
          "Temporary Worker",
          "Volunteer",
          "Other"
        ]
      },
      otherEngagement: {
        label: "Please specify your other role",
        placeholder: "Describe your other role"
      },
      healthcareExperience: {
        label: "Do you have any experience in healthcare?",
        placeholder: "Select your healthcare experience",
        options: ["Yes", "No"]
      },
      healthcareField: {
        label: "What type of healthcare experience do you have?",
        placeholder: "Select your healthcare field",
        options: [
          "Community Health Worker",
          "Nurse",
          "Doctor",
          "Pharmacist",
          "Other"
        ]
      },
      otherHealthcareField: {
        label: "Please specify your other healthcare experience",
        placeholder: "Describe your other healthcare experience"
      },
      previousWorkExperience: {
        label: "Previous Work Experience",
        placeholder: "Describe your previous work experience, including job titles, companies, and key responsibilities..."
      },
      motivation: {
        label: "Why do you want to join Gemurai?",
        placeholder: "Tell us about your motivation to become a Digital Community Champion..."
      },
      goals: {
        label: "What are your goals?",
        placeholder: "Describe your personal and professional goals..."
      },
      availability: {
        label: "Availability",
        placeholder: "Select your availability",
        options: [
          "Full-time",
          "Morning or Evening",
          "Flexible",
          "Weekends only"
        ]
      },
      smartphoneAccess: {
        label: "Do you have access to a smartphone?",
        placeholder: "Select your smartphone access status",
        options: ["Yes", "No"]
      },
      deviceOwner: {
        label: "If yes, who owns the device?",
        placeholder: "Select the owner of the smartphone",
        options: [
          "Myself",
          "Family member (Parent, Sibling, Relative)",
          "Friend",
          "Other"
        ]
      },
      internetUsage: {
        label: "How often do you use the internet?",
        placeholder: "Select your internet usage frequency",
        options: [
          "Daily",
          "Weekly",
          "Monthly",
          "Rarely",
          "Never"
        ]
      },
      appFamiliarity: {
        label: "Are you familiar with using mobile apps or online platforms?",
        placeholder: "Select your familiarity with mobile apps and online platforms",
        options: ["Yes", "No"]
      },
      usedApps: {
        label: "If yes, which applications?",
        placeholder: "Select all applications you use",
        options: [
          "Email (e.g., Gmail, Yahoo)",
          "Social media (e.g., WhatsApp, TikTok, Instagram, Facebook, X/Twitter)",
          "Mobile Money / Banking apps (e.g., MoMo, Airtel Money, Bank apps)",
          "Online Shopping (e.g., Vuba Vuba, Kikku, Ihaha)",
          "Educational/Learning apps (e.g., YouTube, Google)",
          "Other"
        ]
      },
      otherApps: {
        label: "Please specify other applications",
        placeholder: "Enter the other applications you use",
        validation: "Please keep your description under 200 characters"
      },
      housingSituation: {
        label: "What is your primary housing situation?",
        placeholder: "Select your housing situation",
        options: [
          "Own house",
          "Rent house/room",
          "Live with family/relatives/friend",
          "Informal settlements/temporary shelter",
          "Other"
        ]
      },
      utilities: {
        label: "Do you have consistent access to basic utilities at your residence (e.g., electricity, clean water, sanitation)?",
        placeholder: "Select your access to basic utilities",
        options: [
          "Yes",
          "No",
          "Partially"
        ]
      },
      communityInvolvement: {
        label: "Are you actively involved in any community initiatives?",
        placeholder: "Select your community involvement status",
        options: ["Yes", "No"]
      },
      communityActivities: {
        label: "If yes, which community activities/initiatives are you involved in?",
        placeholder: "Select all community activities that apply",
        options: [
          "Saving groups (ibimina, SACCO)",
          "Youth Volunteers",
          "Farmers group/cooperative",
          "Community work (Umuganda)",
          "Sports clubs/teams",
          "Art/Cultural groups",
          "Religious groups/activities",
          "Other"
        ]
      },
      otherCommunityActivities: {
        label: "Sobanura ibindi bikorwa byaho utuye witabira",
        placeholder: "Andika ibindi bikorwa by'umuryango witabira"
      },
      communityConnection: {
        label: "How well are you known in your community?",
        placeholder: "Select how well known you are",
        options: [
          "Not known",
          "Slightly known",
          "Well known",
          "Very well known"
        ]
      },
      educationCertificate: {
        label: "Education Certificate",
        placeholder: "Upload your education certificate (PDF, PNG, JPG up to 5MB)",
        validation: "Please upload a valid certificate (PDF, PNG, or JPG) up to 5MB"
      },
      selfiePhoto: {
        label: "Selfie Photo",
        placeholder: "Upload a clear selfie (PNG, JPG up to 5MB)",
        validation: "Please upload a clear selfie (PNG or JPG) up to 5MB"
      },
      consent1: {
        label: "I understand that if selected, I will receive training to sell health equipment and digital health services in the community",
        placeholder: "Agree to training and sales participation",
        options: ["Yes"],
        validation: "You must agree to receive training to proceed"
      },
      consent2: {
        label: "I agree that my personal information may be used for activities related to this project",
        placeholder: "Agree to data collection and usage",
        options: ["Yes"],
        validation: "You must agree to data usage to proceed"
      },
      consent3: {
        label: "I confirm that all information I have provided is true and reliable",
        placeholder: "Confirm information accuracy",
        options: ["Yes"],
        validation: "You must confirm your information is accurate to proceed"
      },
      healthcareBackground: {
        label: "Have you ever worked or studied in healthcare?",
        placeholder: "Select your healthcare background",
        options: ["Yes", "No"]
      },
      nationalIdCopy: {
        label: "Copy of National ID",
        placeholder: "Upload copy of national ID (PDF, PNG, JPG up to 5MB)",
        validation: "Please upload a valid copy (PDF, PNG, or JPG) up to 5MB"
      },
      nationalIdBack: {
        label: "National ID (Back Side)",
        placeholder: "Upload back side of national ID (PDF, PNG, JPG up to 5MB)",
        validation: "Please upload a valid back side (PDF, PNG, or JPG) up to 5MB"
      }
    }
  },
  rw: {
    sections: {
      personalInfo: {
        title: "Amakuru yawe",
        description: "Uzuza amakuru yawe bwite"
      },
      contactAddress: {
        title: "Aho ushobora kuboneka",
        description: "Aho ushobora kuboneka n'aho utuye"
      },
      educationSkills: {
        title: "Icyiciro cy'amashuri cyo hejuru warangije",
        description: "Amashuri wize n'ubumenyi ufite"
      },
      workExperience: {
        title: "Uburambe mu Kazi",
        description: "Tubwire ibyerekeye uburambe bwawe mu kazi"
      },
      digitalAccess: {
        title: "Kugera ku Ikoranabuhanga no kurikoresha",
        description: "Tubwire ibyerekeye uburyo ukoresha ikoranabuhanga"
      },
      livingEnvironment: {
        title: "Aho Utuye n'Imikoranire n'Abaturage",
        description: "Aho Utuye n'Imikoranire n'Abaturage"
      },
      documents: {
        title: "Inyandiko Zisabwa (Huzuzwa nubifitiye ububasha gusa)",
        description: "Ibyangombwa bisabwa"
      },
      consent: {
        title: "Kwemera no Kwiyemeza",
        description: "Kwemera no Kwiyemeza"
      }
    },
    questions: {
      firstName: {
        label: "Izina ry'umuryango",
        placeholder: "Andika izina ry'umuryango"
      },
      lastName: {
        label: "Andi mazina",
        placeholder: "Andika andi mazina",
        validation: "Andika andi mazina"
      },
      dateOfBirth: {
        label: "Itariki y'Amavuko",
        placeholder: "Hitamo itariki y'amavuko"
      },
      gender: {
        label: "Igitsina",
        placeholder: "Hitamo igitsina",
        options: ["Gabo", "Gore"]
      },
      nationalId: {
        label: "Nimero y'Indangamuntu",
        placeholder: "Andika nimero y'indangamuntu y'imibare 16",
        validation: "Nyamuneka andika nimero y'indangamuntu y'imibare 16 yemewe"
      },
      maritalStatus: {
        label: "Irangamimerere",
        placeholder: "Hitamo irangamimerere",
        options: ["Ingaragu", "Arubatse", "Baratandukanye", "Yarapfakaye"]
      },
      disability: {
        label: "Ese waba ufite ubumuga?",
        placeholder: "Hitamo niba ufite ubumuga",
        options: ["Yego", "Oya"]
      },
      disabilityType: {
        label: "Niba ari yego, ni ubuhe bw'ubumuga?",
        placeholder: "Hitamo ubwoko bw'ubumuga",
        options: ["Ubumuga bw'ingingo", "Kutumva", "Kutabona" ,"Kutavuga", "Mu mutwe", "Ibindi (sobanura)"],
        subFields: {
          other: {
            label: "Sobanura ubundi bumuga ufite",
            placeholder: "Andika ubundi bumuga ufite",
            required: true
          }
        }
      },
      refugee: {
        label: "Ese waba uri impunzi?",
        placeholder: "Hitamo niba uri impunzi",
        options: ["Yego", "Oya"]
      },
      refugeeCamp: {
        label: "Niba uri impuzi, waba utuye mu nkambi y'impunzi?",
        placeholder: "Hitamo aho utuye",
        options: ["Yego", "Oya"]
      },
      householdHead: {
        label: "Uri umuyobozi w'urugo?",
        placeholder: "Hitamo niba uri umutware w'urugo",
        options: ["Yego", "Oya"]
      },
      primaryProvider: {
        label: "Ni wowe ufite inshingano zo gutunga urugo?",
        placeholder: "Hitamo niba ari wowe utunze urugo",
        options: ["Yego", "Oya"]
      },
      email: {
        label: "Imeli (niba ihari)",
        placeholder: "Andika imeli yawe"
      },
      phone: {
        label: "Nomero ya telefoni igendanwa",
        placeholder: "Andika nomero ya telefoni (urugero: +250 787 283 351)",
        validation: "Andika nomero y'itelefone yemewe mu buryo: +250 XXX XXX XXX",
        hint: "Andika nomero itangira na +250 (urugero: +250 787 283 351)"
      },
      alternatePhone: {
        label: "Indi nomero ya telefoni igendanwa (niba ihari)",
        placeholder: "Andika indi nomero ya telefoni (urugero: +250 787 283 351)",
        validation: "Andika nomero y'itelefone yemewe mu buryo: +250 XXX XXX XXX",
        hint: "Andika nomero itangira na +250 (urugero: +250 787 283 351)"
      },
      preferredContact: {
        label: "Uburyo ushaka ko tuvugana",
        placeholder: "Hitamo uburyo ushaka ko tuvugana",
        options: ["Guhamagara kuri telefoni igendanwa", "Ubutumwa Bugufi(SMS)", "Imeli", "WhatsApp"]
      },
      addressInfo: {
        label: "",
        placeholder: "Hitamo aho utuye"
      },
      province: {
        label: "Intara",
        placeholder: "Hitamo intara",
        options: ["Uburasirazuba", "Amajyaruguru"]
      },
      district: {
        label: "Akarere",
        placeholder: "Hitamo akarere"
      },
      sector: {
        label: "Umurenge",
        placeholder: "Hitamo umurenge"
      },
      cell: {
        label: "Akagari",
        placeholder: "Hitamo akagari"
      },
      village: {
        label: "Umudugudu",
        placeholder: "Hitamo umudugudu"
      },
      education: {
        label: "Icyiciro cy'amashuri cyo hejuru warangije",
        placeholder: "Hitamo icyiciro cy'amashuri cyo hejuru warangije",
        options: ["Icyiciro cya mbere cy'amashuli yisumbuye(S3)", "Icyiciro cya kabiri cy'amashuli yisumbuye (S6)", "Imyuga n'ubumenyingiro"]
      },
      schoolName: {
        label: "Izina ry'ishuri warangirijemo",
        placeholder: "Andika izina ry'ishuri"
      },
      fieldOfStudy: {
        label: "Andika icyo wize",
        placeholder: "urugero: Ikoranabuhanga, Ubucuruzi"
      },
      skills: {
        label: "Ubumenyi ngiro (hitamo ibihuye)",
        placeholder: "Hitamo ubumenyi ufite",
        options: [
          "Ubumenyi bwa mudasobwa",
          "Kwamamaza hifashishijwe ikoranabuhanga",
          "Kugurisha",
          "Gutanga serivisi ku bakiriya",
          "Kwandika",
          "Gushyira amakuru muri mudasobwa",
          "Imbuga nkoranyambaga",
          "Gufotora",
          "Guhindura mu ndimi",
          "Kwigisha",
          "Kwita ku buzima",
          "Ubuhinzi",
          "Ibindi"
        ]
      },
      otherSkills: {
        label: "Ubindi bumenyi ufite",
        placeholder: "Andika ubundi bumenyi ufite",
        validation: "Nyamuneka ntirenze inyuguti 500"
      },
      languages: {
        label: "Hitamo indimi uzi",
        placeholder: "Hitamo indimi uzi",
        options: ["Kinyarwanda", "Icyongereza", "Igifaransa", "Igiswahili"]
      },
      workExperience: {
        label: "Waba warigeze ukora akazi?",
        placeholder: "Hitamo niba warigeze ukora",
        options: ["Yego", "Oya"]
      },
      yearsExperience: {
        label: "Niba ari yego, ufite imyaka ingahe y'uburambe mu kazi",
        placeholder: "Hitamo imyaka y'uburambe",
        options: ["Munsi y'umwaka 1", "Imyaka 1-2", "Imyaka 3-5", "Hejuru y'imyaka 5"]
      },
      previousRoles: {
        label: "Niba ari yego, ni ibihe wize/wakoze bijyanye muri ibi bikurikira?",
        placeholder: "Hitamo akazi wakoze mbere",
        options: [
          "Umu agenti wa Mobile Money(Airtel, MTN)",
          "Umu agenti wa Banki",
          "Ubucuruzi",
          "Ubucuruzi buciritse",
          "Umukozi w'igihe gito",
          "Umukorerabushake",
          "Akandi kazi"
        ]
      },
      otherEngagement: {
        label: "Sobanura akandi kazi wakoze",
        placeholder: "Andika akandi kazi wakoze"
      },
      healthcareExperience: {
        label: "Waba warigeze ukora mu bijyanye n'ubuzima?",
        placeholder: "Hitamo niba wakoze mu buzima",
        options: ["Yego", "Oya"]
      },
      healthcareField: {
        label: "Ni ubuhe bwoko bw'uburambe ufite mu buzima?",
        placeholder: "Hitamo icyiciro cy'ubuzima wakoreyemo",
        options: [
          "Umujyanama w'ubuzima",
          "Umuforomo",
          "Muganga",
          "Umucuruzi w'imiti",
          "Ibindi"
        ]
      },
      otherHealthcareField: {
        label: "Sobanura ubundi burambe ufite mu buzima",
        placeholder: "Sobanura ubundi burambe mu buzima"
      },
      previousWorkExperience: {
        label: "Mu magambo makcye,wa dusobanuraire imirimo wagiye ukora",
        placeholder: "Sobanura uburambe mu kazi, harimo imirimo, ibigo, n'inshingano z'ingenzi..."
      },
      motivation: {
        label: "Mu magambo macye wavuga  impamvu ushaka kwinjira muri uyu mushinga wa Gemurai?",
        placeholder: "Tubwire impamvu ushaka kuba Intumwa y'Ikoranabuhanga mu Muryango..."
      },
      goals: {
        label: "Ni iki wifuza kugeraho mu gihe uri muri uyu mushinga?",
        placeholder: "Sobanura intego zawe bwite n'iz'akazi..."
      },
      availability: {
        label: "Igihe uteganya kuboneka:",
        placeholder: "Hitamo igihe uboneka",
        options: [
          "Igihe cyose",
          "Igitondo cyangwa nimugoroba",
          "Bihindagurika",
          "Mu mpera z'icyumweru gusa"
        ]
      },
      smartphoneAccess: {
        label: "Ufite uburyo bwo gukoresha telefone igezweho (smartphone)?",
        placeholder: "Hitamo uko uhagaze kuri telefoni",
        options: ["Yego", "Oya"]
      },
      deviceOwner: {
        label: "Niba ari yego, ninde nyiri iyo telefoni?",
        placeholder: "Hitamo nyir'iyo telefoni",
        options: [
          "Ni iyanjye",
          "Uwo mu muryango (Umubyeyi, Musaza/Mushiki, Mwene wabo)",
          "Inshuti",
          "Undi"
        ]
      },
      internetUsage: {
        label: "Ni kangahe ukoresha murandasi (interineti)?",
        placeholder: "Hitamo uko ukoresha interineti",
        options: [
          "Buri munsi",
          "Buri cyumweru",
          "Buri kwezi",
          "Rimwe na rimwe",
          "Ntayo nkoresha"
        ]
      },
      appFamiliarity: {
        label: "Uzi gukoresha porogaramu za telefoni cyangwa interineti?",
        placeholder: "Hitamo uko uzi gukoresha porogaramu",
        options: ["Yego", "Oya"]
      },
      usedApps: {
        label: "Niba ari yego, ni izihe ukoresha?",
        placeholder: "Hitamo porogaramu ukoresha",
        options: [
          "Imeli",
          "Imbuga nkoranyambaga",
          "Mobile Money / Banki",
          "Kugura kuri murandasi",
          "Porogaramu z'amasomo",
          "Izindi"
        ]
      },
      otherApps: {
        label: "Sobanura izindi porogaramu",
        placeholder: "Andika izindi porogaramu ukoresha",
        validation: "Nyamuneka ntirenze inyuguti 200"
      },
      housingSituation: {
        label: "Uburyo utuye",
        placeholder: "Hitamo aho utuye",
        options: [
          "Inzu yanjye",
          "Ndakodesha",
          "Ndacumbitse (Inshuti)",
          "Mbana n'Umuryango"
        ]
      },
      utilities: {
        label: "Ufite ibikoresho by'ibanze aho utuye (urugero: amashanyarazi, amazi meza, isuku)?",
        placeholder: "Hitamo uko uhagaze ku bikoresho by'ibanze",
        options: ["Yego", "Oya", "Bimwe"]
      },
      communityInvolvement: {
        label: "Ese waba witabira cyangwa ugira  uruhare mu bikorwa rusange cg by'iterambere byaho utuye?",
        placeholder: "Hitamo uko witabira ibikorwa by'umuryango",
        options: ["Yego", "Oya"]
      },
      communityActivities: {
        label: "Niba ari yego, ni ibihe?",
        placeholder: "Hitamo ibikorwa by'umuryango witabira",
        options: [
          "Amatsinda yo kuzigama",
          "Urubyiruko rw'abakorerabushake",
          "Amatsinda y'abahinzi",
          "Umuganda",
          "Amakipe y'imikino",
          "Amatsinda y'umuco/ubugeni",
          "Amatorero y'iyobokamana",
          "Ni Ibindi"
        ]
      },
      otherCommunityActivities: {
        label: "Sobanura ibindi bikorwa byaho utuye witabira",
        placeholder: "Andika ibindi bikorwa by'umuryango witabira"
      },
      communityConnection: {
        label: "Waba uzwi gute aho utuye?",
        placeholder: "Waba uzwi gute aho utuye?",
        options: [
          "Ntibanzi",
          "Baranzi gake",
          "Baranzi bihagije",
          "Baranzi cyane"
        ]
      },
      educationCertificate: {
        label: "Fotokopi y'impamyabumenyi",
        placeholder: "Shyiramo fotokopi y'impamyabumenyi (PDF, PNG, JPG kugeza kuri MB 5)",
        validation: "Nyamuneka shyiramo fotokopi yemewe (PDF, PNG, cyangwa JPG) kugeza kuri MB 5"
      },
      selfiePhoto: {
        label: "Ifoto yawe (Selfie)",
        placeholder: "Shyiramo ifoto yawe isobanutse (PNG, JPG kugeza kuri MB 5)",
        validation: "Nyamuneka shyiramo ifoto isobanutse (PNG cyangwa JPG) kugeza kuri MB 5"
      },
      consent1: {
        label: "Ndamutse mpawe amahirwe yo kwinjira muri uyu mushinga, ndemera ko nzahugurwa mu bijyanye no kugurisha ibicuruzwa na serivisi z'ubuzima n'ibindi",
        placeholder: "Emera amahugurwa n'uruhare mu kugurisha",
        options: ["Yego"]
      },
      consent2: {
        label: "Ndemera ko amakuru yanjye akoreshwa mu bikorwa bijyanye n'uyu mushinga",
        placeholder: "Emera gukusanya no gukoresha amakuru",
        options: ["Yego"]
      },
      consent3: {
        label: "Ndemeza ko amakuru yose natanze ari ukuri kandi yizewe",
        placeholder: "Emeza ko amakuru ari ukuri",
        options: ["Yego"]
      },
      healthcareBackground: {
        label: "Wigeze ukora cyangwa wiga ibijyanye n'ubuzima?",
        placeholder: "Hitamo niba warigeze ukora cyangwa wiga ibijyanye n'ubuzima",
        options: ["Yego", "Oya"]
      },
      nationalIdCopy: {
        label: "Fotokopi y'indangamuntu",
        placeholder: "Shyiramo fotokopi y'indangamuntu (PDF, PNG, JPG kugeza kuri MB 5)",
        validation: "Nyamuneka shyiramo fotokopi yemewe (PDF, PNG, cyangwa JPG) kugeza kuri MB 5"
      },
      nationalIdBack: {
        label: "Indangamuntu (Impande y'inyuma)",
        placeholder: "Shyiramo impande y'inyuma y'indangamuntu (PDF, PNG, JPG kugeza kuri MB 5)",
        validation: "Nyamuneka shyiramo dosiye yemewe (PDF, PNG, cyangwa JPG) kugeza kuri MB 5"
      }
    }
  }
} 