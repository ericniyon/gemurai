interface AuthTranslation {
  login: {
    title: string
    subtitle: string
    emailLabel: string
    emailPlaceholder: string
    passwordLabel: string
    passwordPlaceholder: string
    rememberMe: string
    forgotPassword: string
    loginButton: string
    noAccount: string
    signupLink: string
  }
  register: {
    title: string
    subtitle: string
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    passwordLabel: string
    passwordPlaceholder: string
    confirmPasswordLabel: string
    confirmPasswordPlaceholder: string
    roleLabel: string
    roles: {
      dcc: string
      business: string
      individual: string
    }
    termsText: string
    termsLink: string
    privacyLink: string
    registerButton: string
    hasAccount: string
    loginLink: string
  }
  forgotPassword: {
    title: string
    subtitle: string
    emailLabel: string
    emailPlaceholder: string
    submitButton: string
    backToLogin: string
  }
  resetPassword: {
    title: string
    subtitle: string
    passwordLabel: string
    passwordPlaceholder: string
    confirmPasswordLabel: string
    confirmPasswordPlaceholder: string
    submitButton: string
    backToLogin: string
  }
  setPassword: {
    title: string
    subtitle: string
    passwordLabel: string
    passwordPlaceholder: string
    confirmPasswordLabel: string
    confirmPasswordPlaceholder: string
    submitButton: string
  }
}

interface LoginTranslation {
  welcome: {
    title: string
    subtitle: string
  }
  mission: {
    title: string
    content: string
  }
  vision: {
    title: string
    content: string
  }
  features: {
    learn: {
      title: string
      subtitle: string
    }
    earn: {
      title: string
      subtitle: string
    }
  }
  form: {
    tabs: {
      login: string
      quickLogin: string
    }
    title: string
    subtitle: string
    loginMethod: {
      email: string
      phone: string
    }
    email: {
      label: string
      placeholder: string
    }
    phone: {
      label: string
      placeholder: string
    }
    password: {
      label: string
      placeholder: string
    }
    buttons: {
      login: string
      loggingIn: string
      forgotPassword: string
      noAccount: string
      register: string
    }
    quickLogin: {
      title: string
      subtitle: string
      admin: {
        title: string
        subtitle: string
      }
      employer: {
        title: string
        subtitle: string
      }
      dcc: {
        title: string
        subtitle: string
      }
      consumer: {
        title: string
        subtitle: string
      }
    }
    errors: {
      invalidCredentials: string
      serverError: string
      missingFields: string
      missingEmail: string
      missingPhone: string
      missingPassword: string
      invalidEmail: string
      invalidPhone: string
    }
  }
}

interface RegisterTranslation {
  hero: {
    title: string
    subtitle: string
    values: {
      innovation: {
        title: string
        description: string
      }
      impact: {
        title: string
        description: string
      }
      inclusion: {
        title: string
        description: string
      }
    }
  }
  form: {
    title: string
    subtitle: string
    tabs: {
      individual: string
      company: string
    }
    fullName: {
      label: string
      placeholder: string
    }
    companyName: {
      label: string
      placeholder: string
    }
    contactName: {
      label: string
      placeholder: string
    }
    tinNumber: {
      label: string
      placeholder: string
    }
    email: {
      label: string
      placeholder: string
    }
    phone: {
      label: string
      placeholder: string
    }
    password: {
      label: string
      placeholder: string
    }
    confirmPassword: {
      label: string
      placeholder: string
    }
    buttons: {
      register: string
      registering: string
    }
    validation: {
      missingFields: {
        title: string
        description: string
      }
      passwordTooShort: {
        title: string
        description: string
      }
      passwordMismatch: {
        title: string
        description: string
      }
      success: {
        title: string
        description: string
      }
      error: {
        title: string
        description: string
      }
    }
    login: {
      text: string
      link: string
    }
  }
}

interface ForgotPasswordTranslation {
  hero: {
    title: string
    subtitle: string
    features: {
      secure: {
        title: string
        description: string
      }
      protection: {
        title: string
        description: string
      }
      support: {
        title: string
        description: string
      }
    }
    help: {
      title: string
      description: string
      email: string
    }
  }
  form: {
    email: {
      title: string
      subtitle: string
      field: {
        label: string
        placeholder: string
      }
      buttons: {
        submit: string
        submitting: string
      }
    }
    sent: {
      title: string
      subtitle: string
      message: string
      spamNote: string
      tryDifferent: string
    }
    validation: {
      missingEmail: {
        title: string
        description: string
      }
      success: {
        title: string
        description: string
      }
      error: {
        title: string
        description: string
      }
    }
    login: {
      text: string
      link: string
    }
  }
}

export const authTranslations: Record<string, AuthTranslation> = {
  en: {
    login: {
      title: "Welcome Back",
      subtitle: "Sign in to your account to continue",
      emailLabel: "Email",
      emailPlaceholder: "Enter your email",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      loginButton: "Sign In",
      noAccount: "Don't have an account?",
      signupLink: "Sign up"
    },
    register: {
      title: "Create Account",
      subtitle: "Sign up for your account to Apply to become a DCC",
      nameLabel: "Full Name",
      namePlaceholder: "Enter your full name",
      emailLabel: "Email",
      emailPlaceholder: "Enter your email",
      passwordLabel: "Password",
      passwordPlaceholder: "Create a password",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "Confirm your password",
      roleLabel: "I am registering as",
      roles: {
        dcc: "Digital Community Champion",
        business: "Business",
        individual: "Individual"
      },
      termsText: "By registering, you agree to our",
      termsLink: "Terms of Service",
      privacyLink: "Privacy Policy",
      registerButton: "Create Account",
      hasAccount: "Already have an account?",
      loginLink: "Sign in"
    },
    forgotPassword: {
      title: "Forgot Password",
      subtitle: "Enter your email to reset your password",
      emailLabel: "Email",
      emailPlaceholder: "Enter your email",
      submitButton: "Send Reset Link",
      backToLogin: "Back to login"
    },
    resetPassword: {
      title: "Reset Password",
      subtitle: "Create a new password for your account",
      passwordLabel: "New Password",
      passwordPlaceholder: "Enter new password",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "Confirm new password",
      submitButton: "Reset Password",
      backToLogin: "Back to login"
    },
    setPassword: {
      title: "Set Password",
      subtitle: "Create a password for your account",
      passwordLabel: "Password",
      passwordPlaceholder: "Create a password",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "Confirm your password",
      submitButton: "Set Password"
    }
  },
  rw: {
    login: {
      title: "Murakaza Neza",
      subtitle: "Injira mu konte yawe gukomeza",
      emailLabel: "Imeyili",
      emailPlaceholder: "Andika imeyili yawe",
      passwordLabel: "Ijambo ry'ibanga",
      passwordPlaceholder: "Andika ijambo ry'ibanga",
      rememberMe: "Unyibuke",
      forgotPassword: "Wibagiwe ijambo ry'ibanga?",
      loginButton: "Injira",
      noAccount: "Nta konte ufite?",
      signupLink: "Iyandikishe"
    },
    register: {
      title: "Kora Konte",
      subtitle: "Iyandikishe kugira ngo utangire",
      nameLabel: "Amazina Yombi",
      namePlaceholder: "Andika amazina yawe yombi",
      emailLabel: "Imeyili",
      emailPlaceholder: "Andika imeyili yawe",
      passwordLabel: "Ijambo ry'ibanga",
      passwordPlaceholder: "Kora ijambo ry'ibanga",
      confirmPasswordLabel: "Emeza Ijambo ry'ibanga",
      confirmPasswordPlaceholder: "Emeza ijambo ry'ibanga ryawe",
      roleLabel: "Ndiyandikisha nka",
      roles: {
        dcc: "Umuyobozi w'Ikoranabuhanga mu Muryango",
        business: "Ubucuruzi",
        individual: "Umuntu ku giti cye"
      },
      termsText: "Mu kwiyandikisha, wemera",
      termsLink: "Amabwiriza",
      privacyLink: "Politiki y'Ibanga",
      registerButton: "Kora Konte",
      hasAccount: "Usanzwe ufite konte?",
      loginLink: "Injira"
    },
    forgotPassword: {
      title: "Kwibagirwa Ijambo ry'Ibanga",
      subtitle: "Andika imeyili yawe kugira ngo usubize ijambo ry'ibanga",
      emailLabel: "Imeyili",
      emailPlaceholder: "Andika imeyili yawe",
      submitButton: "Ohereza Umubare wo Gusubiza",
      backToLogin: "Garuka ku kwinjira"
    },
    resetPassword: {
      title: "Gusubiza Ijambo ry'Ibanga",
      subtitle: "Kora ijambo ry'ibanga rishya rya konte yawe",
      passwordLabel: "Ijambo ry'Ibanga Rishya",
      passwordPlaceholder: "Andika ijambo ry'ibanga rishya",
      confirmPasswordLabel: "Emeza Ijambo ry'Ibanga",
      confirmPasswordPlaceholder: "Emeza ijambo ry'ibanga rishya",
      submitButton: "Gusubiza Ijambo ry'Ibanga",
      backToLogin: "Garuka ku kwinjira"
    },
    setPassword: {
      title: "Gushyiraho Ijambo ry'Ibanga",
      subtitle: "Kora ijambo ry'ibanga rya konte yawe",
      passwordLabel: "Ijambo ry'Ibanga",
      passwordPlaceholder: "Kora ijambo ry'ibanga",
      confirmPasswordLabel: "Emeza Ijambo ry'Ibanga",
      confirmPasswordPlaceholder: "Emeza ijambo ry'ibanga ryawe",
      submitButton: "Gushyiraho Ijambo ry'Ibanga"
    }
  }
}

export const loginTranslations: Record<string, LoginTranslation> = {
  en: {
    welcome: {
      title: "Welcome Back",
      subtitle: "Sign in to your account to continue"
    },
    mission: {
      title: "Our Mission",
      content: "To bridge the digital divide by empowering communities with technology, skills, and economic opportunities across Rwanda."
    },
    vision: {
      title: "Our Vision",
      content: "A digitally inclusive Rwanda where every community champion has access to technology and opportunities for growth."
    },
    features: {
      learn: {
        title: "Learn",
        subtitle: "Digital Skills Training"
      },
      earn: {
        title: "Earn",
        subtitle: "Job Opportunities"
      }
    },
    form: {
      tabs: {
        login: "Login",
        quickLogin: "Quick Login"
      },
      title: "Login to Your Account",
      subtitle: "Enter your email or phone and password to access your account",
      loginMethod: {
        email: "Email",
        phone: "Phone"
      },
      email: {
        label: "Email",
        placeholder: "Enter your email"
      },
      phone: {
        label: "Phone Number",
        placeholder: "Enter your phone number"
      },
      password: {
        label: "Password",
        placeholder: "Enter your password"
      },
      buttons: {
        login: "Login",
        loggingIn: "Logging in...",
        forgotPassword: "Forgot your password?",
        noAccount: "Don't have an account?",
        register: "Register"
      },
      quickLogin: {
        title: "Quick Login",
        subtitle: "Choose a test account to login quickly",
        admin: {
          title: "Admin",
          subtitle: "Administrator"
        },
        employer: {
          title: "Employer",
          subtitle: "Job Creator"
        },
        dcc: {
          title: "DCC",
          subtitle: "Digital Community Champion"
        },
        consumer: {
          title: "Consumer",
          subtitle: "Community Member"
        }
      },
      errors: {
        invalidCredentials: "Invalid email/phone or password",
        serverError: "An error occurred. Please try again later.",
        missingFields: "Please fill in all required fields",
        missingEmail: "Please enter your email address",
        missingPhone: "Please enter your phone number",
        missingPassword: "Please enter your password",
        invalidEmail: "Please enter a valid email address",
        invalidPhone: "Please enter a valid phone number"
      }
    }
  },
  fr: {
    welcome: {
      title: "Bienvenue",
      subtitle: "Connectez-vous à votre compte pour continuer"
    },
    mission: {
      title: "Notre Mission",
      content: "Combler la fracture numérique en donnant aux communautés les moyens d'accéder à la technologie, aux compétences et aux opportunités économiques à travers le Rwanda."
    },
    vision: {
      title: "Notre Vision",
      content: "Un Rwanda numériquement inclusif où chaque champion communautaire a accès à la technologie et aux opportunités de croissance."
    },
    features: {
      learn: {
        title: "Apprendre",
        subtitle: "Formation Numérique"
      },
      earn: {
        title: "Gagner",
        subtitle: "Opportunités d'Emploi"
      }
    },
    form: {
      tabs: {
        login: "Connexion",
        quickLogin: "Connexion Rapide"
      },
      title: "Connectez-vous à Votre Compte",
      subtitle: "Entrez votre email ou téléphone et mot de passe pour accéder à votre compte",
      loginMethod: {
        email: "Email",
        phone: "Téléphone"
      },
      email: {
        label: "Email",
        placeholder: "Entrez votre email"
      },
      phone: {
        label: "Numéro de Téléphone",
        placeholder: "Entrez votre numéro de téléphone"
      },
      password: {
        label: "Mot de passe",
        placeholder: "Entrez votre mot de passe"
      },
      buttons: {
        login: "Se Connecter",
        loggingIn: "Connexion en cours...",
        forgotPassword: "Mot de passe oublié ?",
        noAccount: "Vous n'avez pas de compte ?",
        register: "Inscrivez-vous"
      },
      quickLogin: {
        title: "Connexion Rapide",
        subtitle: "Choisissez un compte test pour vous connecter rapidement",
        admin: {
          title: "Administrateur",
          subtitle: "Administrator"
        },
        employer: {
          title: "Employeur",
          subtitle: "Job Creator"
        },
        dcc: {
          title: "DCC",
          subtitle: "Digital Community Champion"
        },
        consumer: {
          title: "Consommateur",
          subtitle: "Community Member"
        }
      },
      errors: {
        invalidCredentials: "Email/téléphone ou mot de passe incorrect",
        serverError: "Erreur lors de la connexion. Veuillez réessayer plus tard.",
        missingFields: "Veuillez remplir tous les champs requis",
        missingEmail: "Veuillez entrer votre adresse email",
        missingPhone: "Veuillez entrer votre numéro de téléphone",
        missingPassword: "Veuillez entrer votre mot de passe",
        invalidEmail: "Veuillez entrer une adresse email valide",
        invalidPhone: "Veuillez entrer un numéro de téléphone valide"
      }
    }
  },
  rw: {
    welcome: {
      title: "Murakaza Neza",
      subtitle: "Injira mu konte yawe gukomeza"
    },
    mission: {
      title: "Intego Yacu",
      content: "Gufasha abaturage kugera ku ikoranabuhanga, ubumenyi n'amahirwe y'ubukungu mu Rwanda hose."
    },
    vision: {
      title: "Icyerekezo Cyacu",
      content: "U Rwanda rufite ikoranabuhanga rihuriweho n'abaturage bose, aho buri muhuzabikorwa w'abaturage agera ku ikoranabuhanga n'amahirwe yo gukura."
    },
    features: {
      learn: {
        title: "Kwiga",
        subtitle: "Amahugurwa y'Ikoranabuhanga"
      },
      earn: {
        title: "Kwinjiza",
        subtitle: "Amahirwe y'Akazi"
      }
    },
    form: {
      tabs: {
        login: "Kwinjira",
        quickLogin: "Kwinjira Vuba"
      },
      title: "Injira muri Konti Yawe",
      subtitle: "Andika imeyili cyangwa telefoni na password yawe kugira ngo ubone konti yawe",
      loginMethod: {
        email: "Imeyili",
        phone: "Telefoni"
      },
      email: {
        label: "Imeyili",
        placeholder: "Andika imeyili yawe"
      },
      phone: {
        label: "Numero ya Telefoni",
        placeholder: "Andika numero ya telefoni yawe"
      },
      password: {
        label: "Ijambo ry'ibanga",
        placeholder: "Andika ijambo ry'ibanga"
      },
      buttons: {
        login: "Injira",
        loggingIn: "Urimo kwinjira...",
        forgotPassword: "Wibagiwe ijambo ry'ibanga?",
        noAccount: "Usanzwe ufite konti?",
        register: "Iyandikishe"
      },
      quickLogin: {
        title: "Kwinjira Vuba",
        subtitle: "Hitamo konti y'igerageza kugira ngo winjire vuba",
        admin: {
          title: "Umuyobozi",
          subtitle: "Abayobozi b'Abaturage"
        },
        employer: {
          title: "Umukoresha",
          subtitle: "Abaremyi b'Imirimo"
        },
        dcc: {
          title: "DCC",
          subtitle: "Abayobozi b'Abaturage"
        },
        consumer: {
          title: "Umukiriya",
          subtitle: "Abakiriya"
        }
      },
      errors: {
        invalidCredentials: "Imeyili/telefoni cyangwa ijambo ry'ibanga cyangwa",
        serverError: "Ikibazo kwinjira. Nyamuneka ongera ugerageze.",
        missingFields: "Nyamuneka uzuza amakuru yose asabwa",
        missingEmail: "Nyamuneka andika imeyili yawe",
        missingPhone: "Nyamuneka andika numero ya telefoni yawe",
        missingPassword: "Nyamuneka andika ijambo ry'ibanga ryawe",
        invalidEmail: "Nyamuneka andika imeyili yemewe",
        invalidPhone: "Nyamuneka andika numero ya telefoni yemewe"
      }
    }
  }
}

export const registerTranslations: Record<string, RegisterTranslation> = {
  en: {
    hero: {
      title: "Join Our Community",
      subtitle: "Create your account and start your journey with us",
      values: {
        innovation: {
          title: "Innovation",
          description: "We embrace cutting-edge technology to drive positive change"
        },
        impact: {
          title: "Impact",
          description: "Make a real difference in your community"
        },
        inclusion: {
          title: "Inclusion",
          description: "Everyone is welcome to participate and contribute"
        }
      }
    },
    form: {
      title: "Create Account",
      subtitle: "Enter your details to Apply to become a DCC",
      tabs: {
        individual: "Individual",
        company: "Company"
      },
      fullName: {
        label: "Full Name",
        placeholder: "Enter your full name"
      },
      companyName: {
        label: "Company Name",
        placeholder: "Enter your company name"
      },
      contactName: {
        label: "Contact Name",
        placeholder: "Enter your contact name"
      },
      tinNumber: {
        label: "TIN Number",
        placeholder: "Enter your TIN number"
      },
      email: {
        label: "Email",
        placeholder: "Enter your email"
      },
      phone: {
        label: "Phone",
        placeholder: "Enter your phone number"
      },
      password: {
        label: "Password",
        placeholder: "Create a password"
      },
      confirmPassword: {
        label: "Confirm Password",
        placeholder: "Confirm your password"
      },
      buttons: {
        register: "Create Account",
        registering: "Creating Account..."
      },
      validation: {
        missingFields: {
          title: "Missing Information",
          description: "Please fill in all required fields"
        },
        passwordTooShort: {
          title: "Password Too Short",
          description: "Password must be at least 6 characters long"
        },
        passwordMismatch: {
          title: "Passwords Don't Match",
          description: "Please make sure your passwords match"
        },
        success: {
          title: "Registration Successful",
          description: "Your account has been created successfully"
        },
        error: {
          title: "Registration Failed",
          description: "An error occurred during registration. Please try again."
        }
      },
      login: {
        text: "Already have an account?",
        link: "Log in"
      }
    }
  },
  fr: {
    hero: {
      title: "Rejoignez la Communauté HarvestPlus",
      subtitle: "Faites partie du voyage de transformation numérique du Rwanda",
      values: {
        innovation: {
          title: "Innovation",
          description: "Utiliser des technologies de pointe pour créer des solutions qui stimulent le développement communautaire et la croissance économique."
        },
        impact: {
          title: "Impact",
          description: "Créer un changement positif mesurable dans les communautés grâce à l'alphabétisation numérique et l'autonomisation économique."
        },
        inclusion: {
          title: "Inclusion",
          description: "Assurer un accès égal aux opportunités numériques pour tous les Rwandais, indépendamment de leur origine."
        }
      }
    },
    form: {
      title: "Créez Votre Compte",
      subtitle: "Choisissez votre rôle et remplissez vos informations ci-dessous",
      tabs: {
        individual: "Individuel",
        company: "Entreprise"
      },
      fullName: {
        label: "Nom Complet",
        placeholder: "Entrez votre nom complet"
      },
      companyName: {
        label: "Nom de l'Entreprise",
        placeholder: "Entrez le nom de votre entreprise"
      },
      contactName: {
        label: "Nom de Contact",
        placeholder: "Entrez votre nom de contact"
      },
      tinNumber: {
        label: "Numéro TIN",
        placeholder: "Entrez votre numéro TIN"
      },
      email: {
        label: "Adresse Email",
        placeholder: "Entrez votre adresse email"
      },
      phone: {
        label: "Numéro de Téléphone",
        placeholder: "Entrez votre numéro de téléphone"
      },
      password: {
        label: "Mot de Passe",
        placeholder: "Créez un mot de passe"
      },
      confirmPassword: {
        label: "Confirmer le Mot de Passe",
        placeholder: "Confirmez votre mot de passe"
      },
      buttons: {
        register: "Créer un Compte",
        registering: "Création du Compte..."
      },
      validation: {
        missingFields: {
          title: "Informations Manquantes",
          description: "Veuillez remplir tous les champs requis."
        },
        passwordTooShort: {
          title: "Mot de Passe Trop Court",
          description: "Le mot de passe doit contenir au moins 6 caractères."
        },
        passwordMismatch: {
          title: "Les Mots de Passe Ne Correspondent Pas",
          description: "Veuillez vous assurer que vos mots de passe correspondent."
        },
        success: {
          title: "Compte Créé avec Succès !",
          description: "Bienvenue sur la Plateforme HarvestPlus. Vous pouvez maintenant accéder à votre tableau de bord."
        },
        error: {
          title: "Échec de l'Inscription",
          description: "Une erreur s'est produite. Veuillez réessayer."
        }
      },
      login: {
        text: "Vous avez déjà un compte ?",
        link: "Connectez-vous"
      }
    }
  },
  rw: {
    hero: {
      title: "Ifatanye n'Umuryango Wacu",
      subtitle: "Fungura konti yawe utangire urugendo rwawe natwe",
      values: {
        innovation: {
          title: "Ikoranabuhanga",
          description: "Dukoresha ikoranabuhanga rishya mu kuzana impinduka nziza"
        },
        impact: {
          title: "Ingaruka",
          description: "Gira uruhare mu iterambere ry'umuryango wawe"
        },
        inclusion: {
          title: "Kubahiriza bose",
          description: "Buri wese yemerewe kugira uruhare no gutanga umusanzu"
        }
      }
    },
    form: {
      title: "Fungura Konti",
      subtitle: "Andika amakuru yawe kugirango utangire",
      tabs: {
        individual: "Umuntu",
        company: "Umukoresha"
      },
      fullName: {
        label: "Amazina Yombi",
        placeholder: "Andika amazina yawe yombi"
      },
      companyName: {
        label: "Amazina Y'umukozi",
        placeholder: "Andika amazina yawe y'umukozi"
      },
      contactName: {
        label: "Amazina Y'umukiriya",
        placeholder: "Andika amazina yawe y'umukiriya"
      },
      tinNumber: {
        label: "Numero TIN",
        placeholder: "Andika numero yawe ya TIN"
      },
      email: {
        label: "Imeyili",
        placeholder: "Andika imeyili yawe"
      },
      phone: {
        label: "Telefoni",
        placeholder: "Andika numero ya telefoni"
      },
      password: {
        label: "Ijambo ry'ibanga",
        placeholder: "Shyiramo ijambo ry'ibanga"
      },
      confirmPassword: {
        label: "Emeza Ijambo ry'ibanga",
        placeholder: "Emeza ijambo ry'ibanga"
      },
      buttons: {
        register: "Fungura Konti",
        registering: "Konti Irafungurwa..."
      },
      validation: {
        missingFields: {
          title: "Amakuru Abuze",
          description: "Nyamuneka uzuza amakuru yose asabwa"
        },
        passwordTooShort: {
          title: "Ijambo ry'ibanga Rigufi",
          description: "Ijambo ry'ibanga rigomba kuba rifite inyuguti 6 byibuze"
        },
        passwordMismatch: {
          title: "Amagambo y'ibanga Ntahura",
          description: "Nyamuneka reba neza ko amagambo y'ibanga ahura"
        },
        success: {
          title: "Kwiyandikisha Byagenze Neza",
          description: "Konti yawe yafunguwe neza"
        },
        error: {
          title: "Kwiyandikisha Ntibyagenze Neza",
          description: "Habaye ikibazo mu gufungura konti. Nyamuneka ongera ugerageze."
        }
      },
      login: {
        text: "Usanzwe ufite konti?",
        link: "Injira"
      }
    }
  }
}

export const forgotPasswordTranslations: Record<string, ForgotPasswordTranslation> = {
  en: {
    hero: {
      title: "Secure Account Recovery",
      subtitle: "Your security is our priority. We'll help you regain access safely.",
      features: {
        secure: {
          title: "Secure Process",
          description: "Our password reset process uses industry-standard security measures to protect your account."
        },
        protection: {
          title: "Data Protection",
          description: "Your personal information and account data remain encrypted and protected throughout the process."
        },
              support: {
        title: "SMS Support",
        description: "Receive reset instructions via SMS for convenient and secure account recovery."
      }
      },
              help: {
          title: "Need Help?",
          description: "If you're having trouble accessing your account, our support team is here to help.",
          phone: "+250 123 456 789"
        }
    },
    form: {
      phone: {
        title: "Reset Password",
        subtitle: "Enter your phone number to receive reset instructions",
        field: {
          label: "Phone Number",
          placeholder: "Enter your phone number"
        },
        buttons: {
          submit: "Send Reset Code",
          submitting: "Sending Reset Code..."
        }
      },
      sent: {
        title: "Check Your Phone",
        subtitle: "We've sent password reset instructions to your phone",
        message: "We've sent an SMS to {phone} with instructions to reset your password.",
        smsNote: "If you don't receive the SMS, please check your phone number and try again.",
        tryDifferent: "Try Different Phone Number",
        verifyButton: "Enter OTP Code"
      },
      verify: {
        title: "Verify OTP",
        subtitle: "Enter the 4-digit code sent to your phone",
        field: {
          label: "OTP Code",
                      placeholder: "Enter 4-digit code"
        },
        buttons: {
          submit: "Verify OTP",
          submitting: "Verifying..."
        },
        backToSent: "Back to SMS Sent"
      },
      validation: {
        missingPhone: {
          title: "Missing Information",
          description: "Please enter your phone number."
        },
        missingOTP: {
          title: "Missing OTP",
          description: "Please enter the OTP code sent to your phone."
        },
        success: {
          title: "Reset SMS Sent!",
          description: "Check your phone for password reset instructions."
        },
        otpSuccess: {
          title: "OTP Verified!",
          description: "Your OTP has been verified successfully."
        },
        otpError: {
          title: "Invalid OTP",
          description: "The OTP code is invalid or has expired. Please try again."
        },
        error: {
          title: "Error",
          description: "Failed to send reset code. Please try again."
        }
      },
      login: {
        text: "Remember your password?",
        link: "Sign in"
      }
    }
  },
  fr: {
    hero: {
      title: "Récupération Sécurisée du Compte",
      subtitle: "Votre sécurité est notre priorité. Nous vous aiderons à récupérer l'accès en toute sécurité.",
      features: {
        secure: {
          title: "Processus Sécurisé",
          description: "Notre processus de réinitialisation utilise des mesures de sécurité standard pour protéger votre compte."
        },
        protection: {
          title: "Protection des Données",
          description: "Vos informations personnelles et les données de votre compte restent cryptées et protégées tout au long du processus."
        },
        support: {
          title: "Support SMS",
          description: "Recevez les instructions de réinitialisation par SMS pour une récupération pratique et sécurisée."
        }
      },
              help: {
          title: "Besoin d'Aide ?",
          description: "Si vous avez des difficultés à accéder à votre compte, notre équipe de support est là pour vous aider.",
          phone: "+250 123 456 789"
        }
    },
    form: {
      phone: {
        title: "Réinitialiser le Mot de Passe",
        subtitle: "Entrez votre numéro de téléphone pour recevoir les instructions",
        field: {
          label: "Numéro de Téléphone",
          placeholder: "Entrez votre numéro de téléphone"
        },
        buttons: {
          submit: "Envoyer le Code",
          submitting: "Envoi du Code..."
        }
      },
      sent: {
        title: "Vérifiez Votre Téléphone",
        subtitle: "Nous avons envoyé les instructions de réinitialisation à votre téléphone",
        message: "Nous avons envoyé un SMS à {phone} avec les instructions pour réinitialiser votre mot de passe.",
        smsNote: "Si vous ne recevez pas le SMS, veuillez vérifier votre numéro de téléphone et réessayer.",
        tryDifferent: "Essayer un Autre Numéro",
        verifyButton: "Entrer le Code OTP"
      },
      verify: {
        title: "Vérifier OTP",
                  subtitle: "Entrez le code à 4 chiffres envoyé à votre téléphone",
        field: {
          label: "Code OTP",
                      placeholder: "Entrez le code à 4 chiffres"
        },
        buttons: {
          submit: "Vérifier OTP",
          submitting: "Vérification..."
        },
        backToSent: "Retour au SMS Envoyé"
      },
      validation: {
        missingPhone: {
          title: "Information Manquante",
          description: "Veuillez entrer votre numéro de téléphone."
        },
        missingOTP: {
          title: "OTP Manquant",
          description: "Veuillez entrer le code OTP envoyé à votre téléphone."
        },
        success: {
          title: "SMS de Réinitialisation Envoyé !",
          description: "Vérifiez votre téléphone pour les instructions de réinitialisation."
        },
        otpSuccess: {
          title: "OTP Vérifié !",
          description: "Votre OTP a été vérifié avec succès."
        },
        otpError: {
          title: "OTP Invalide",
          description: "Le code OTP est invalide ou a expiré. Veuillez réessayer."
        },
        error: {
          title: "Erreur",
          description: "Échec de l'envoi du code. Veuillez réessayer."
        }
      },
      login: {
        text: "Vous vous souvenez de votre mot de passe ?",
        link: "Connectez-vous"
      }
    }
  },
  rw: {
    hero: {
      title: "Gusubiza Konti Yawe",
      subtitle: "Umutekano wawe ni ryo shingiro ryacu. Tuzagufasha kongera kugera kuri konti yawe mu mutekano.",
      features: {
        secure: {
          title: "Uburyo Bwizewe",
          description: "Uburyo bwacu bwo gusubiza ijambo ry'ibanga bukoresha uburyo bw'umutekano bwemewe ku isi bwo kurinda konti yawe."
        },
        protection: {
          title: "Kurinda Amakuru",
          description: "Amakuru yawe bwite n'aya konti yawe akomeza kuba muri mudasobwa kandi arindwa mu gihe cyose cy'iyi gahunda."
        },
        support: {
          title: "Ubufasha SMS",
          description: "Wakira amabwiriza yo gusubiza konti yawe kuri SMS ku buryo bworoshye kandi bwizewe."
        }
      },
              help: {
          title: "Ukeneye Ubufasha?",
          description: "Niba ufite ibibazo mu kugera kuri konti yawe, ikipe yacu y'ubufasha iri hano kugufasha.",
          phone: "+250 123 456 789"
        }
    },
    form: {
      phone: {
        title: "Gusubiza Ijambo ry'Ibanga",
        subtitle: "Andika telefoni yawe kugira ngo wakire amabwiriza",
        field: {
          label: "Telefoni",
          placeholder: "Andika telefoni yawe"
        },
        buttons: {
          submit: "Ohereza Kode",
          submitting: "Kohereza Kode..."
        }
      },
      sent: {
        title: "Reba Telefoni Yawe",
        subtitle: "Twohereje amabwiriza yo gusubiza ijambo ry'ibanga kuri telefoni yawe",
        message: "Twohereje SMS kuri {phone} ifite amabwiriza yo gusubiza ijambo ry'ibanga ryawe.",
        smsNote: "Niba utabona SMS mu telefoni yawe, nyamuneka reba neza telefoni yawe hanyuma ongera ugerageze.",
        tryDifferent: "Gerageza Indi Telefoni",
        verifyButton: "Andika Kode OTP"
      },
      verify: {
        title: "Gerageza OTP",
        subtitle: "Andika kode y'inyuguti 6 yoherejwe kuri telefoni yawe",
        field: {
          label: "Kode OTP",
          placeholder: "Andika kode y'inyuguti 6"
        },
        buttons: {
          submit: "Gerageza OTP",
          submitting: "Gerageza..."
        },
        backToSent: "Subira ku SMS Yoherejwe"
      },
      validation: {
        missingPhone: {
          title: "Amakuru Abura",
          description: "Nyamuneka andika telefoni yawe."
        },
        missingOTP: {
          title: "OTP Abura",
          description: "Nyamuneka andika kode OTP yoherejwe kuri telefoni yawe."
        },
        success: {
          title: "SMS Yoherejwe!",
          description: "Reba telefoni yawe kugira ngo ubone amabwiriza."
        },
        otpSuccess: {
          title: "OTP Yemewe!",
          description: "OTP yawe yemewe neza."
        },
        otpError: {
          title: "OTP Ntibyemewe",
          description: "Kode OTP ntibyemewe cyangwa yarangiye. Nyamuneka ongera ugerageze."
        },
        error: {
          title: "Ikibazo",
          description: "Ntibyakunze kohereza kode. Nyamuneka ongera ugerageze."
        }
      },
      login: {
        text: "Wibuka ijambo ryawe ry'ibanga?",
        link: "Injira"
      }
    }
  }
} 