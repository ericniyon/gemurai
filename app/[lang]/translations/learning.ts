interface LearningTranslation {
  hero: {
    backToHome: string
    title: string
    subtitle: string
    searchPlaceholder: string
    startLearning: string
    badges: {
      skillBased: string
      certified: string
      selfPaced: string
    }
  }
  filters: {
    title: string
    categories: {
      all: string
      digital: string
      business: string
      health: string
      leadership: string
      community: string
    }
    level: {
      label: string
      all: string
      beginner: string
      intermediate: string
      advanced: string
    }
    duration: {
      label: string
      all: string
      short: string
      medium: string
      long: string
    }
  }
  course: {
    level: string
    duration: string
    lessons: string
    enrolled: string
    startCourse: string
    viewDetails: string
    certificate: string
    free: string
    progress: string
  }
  learning: {
    title: string
    subtitle: string
    nextLesson: string
    continue: string
    complete: string
    resources: string
    quiz: string
    discussion: string
  }
  stats: {
    learners: {
      value: string
      label: string
    }
    courses: {
      value: string
      label: string
    }
    certificates: {
      value: string
      label: string
    }
    rating: {
      value: string
      label: string
    }
  }
  featured: {
    title: string
    subtitle: string
    courses: {
      health: {
        duration: string
        badge: string
        title: string
        description: string
        shortDescription: string
        enrolled: string
        certificate: string
        progress: string
        percent: string
        details: string
        rating: string
        button: string
      }
      sales: {
        duration: string
        badge: string
        title: string
        description: string
        shortDescription: string
        enrolled: string
        certificate: string
        progress: string
        percent: string
        details: string
        rating: string
        button: string
      }
      leadership: {
        duration: string
        badge: string
        title: string
        description: string
        shortDescription: string
        enrolled: string
        certificate: string
        progress: string
        percent: string
        details: string
        rating: string
        button: string
      }
    }
  }
}

export const learningTranslations: Record<string, LearningTranslation> = {
  en: {
    hero: {
      backToHome: "Back to Home",
      title: "E-Learning Platform",
      subtitle: "Master essential skills with our comprehensive training courses. Learn at your own pace and earn certifications that advance your career.",
      searchPlaceholder: "Search courses...",
      startLearning: "Start Learning",
      badges: {
        skillBased: "Skill-Based Learning",
        certified: "Certified Courses",
        selfPaced: "Self-Paced"
      }
    },
    filters: {
      title: "Browse Courses",
      categories: {
        all: "All Categories",
        digital: "Digital Skills",
        business: "Business",
        health: "Health Education",
        leadership: "Leadership",
        community: "Community Development"
      },
      level: {
        label: "Difficulty Level",
        all: "All Levels",
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced"
      },
      duration: {
        label: "Course Duration",
        all: "All Durations",
        short: "Short (0-2 hours)",
        medium: "Medium (2-5 hours)",
        long: "Long (5+ hours)"
      }
    },
    course: {
      level: "Level",
      duration: "Duration",
      lessons: "Lessons",
      enrolled: "Students Enrolled",
      startCourse: "Start Course",
      viewDetails: "View Details",
      certificate: "Certificate Included",
      free: "Free",
      progress: "Progress"
    },
    learning: {
      title: "My Learning",
      subtitle: "Track your progress and continue learning",
      nextLesson: "Next Lesson",
      continue: "Continue Learning",
      complete: "Complete Course",
      resources: "Course Resources",
      quiz: "Take Quiz",
      discussion: "Join Discussion"
    },
    stats: {
      learners: {
        value: "8,500+",
        label: "Active Learners"
      },
      courses: {
        value: "25+",
        label: "Expert Courses"
      },
      certificates: {
        value: "5,200+",
        label: "Certificates Earned"
      },
      rating: {
        value: "4.8/5",
        label: "Average Rating"
      }
    },
    featured: {
      title: "Featured Courses",
      subtitle: "Start your learning journey with our most popular and highly-rated courses designed for Digital Community Champions.",
      courses: {
        health: {
          duration: "4 hours",
          badge: "Popular",
          title: "Health Products Basics",
          description: "Learn about essential health products and their benefits",
          shortDescription: "Master the fundamentals of health products, their uses, and how to effectively communicate their benefits to customers.",
          enrolled: "2,456 enrolled",
          certificate: "Certificate",
          progress: "Course Progress",
          percent: "0%",
          details: "Master the fundamentals of health products, their uses, and how to effectively communicate their benefits to customers.",
          rating: "4.9 (324 reviews)",
          button: "Start Course"
        },
        sales: {
          duration: "6 hours",
          badge: "New",
          title: "Sales Techniques",
          description: "Develop effective sales and communication skills",
          shortDescription: "Learn proven sales techniques, customer relationship management, and how to close deals effectively.",
          enrolled: "1,823 enrolled",
          certificate: "Certificate",
          progress: "Course Progress",
          percent: "0%",
          details: "Learn proven sales techniques, customer relationship management, and how to close deals effectively.",
          rating: "4.8 (256 reviews)",
          button: "Start Course"
        },
        leadership: {
          duration: "8 hours",
          badge: "Advanced",
          title: "Community Health Leadership",
          description: "Become a trusted health leader in your community",
          shortDescription: "Learn how to lead health initiatives and make a positive impact in your community.",
          enrolled: "1,245 enrolled",
          certificate: "Certificate",
          progress: "Course Progress",
          percent: "0%",
          details: "Learn how to lead health initiatives and make a positive impact in your community.",
          rating: "4.7 (198 reviews)",
          button: "Start Course"
        }
      }
    }
  },
  rw: {
    hero: {
      backToHome: "Subira ku Rugo",
      title: "Ihuriro ryo Kwiga kuri Interineti",
      subtitle: "Menya ubumenyi ngombwa binyuze mu masomo yacu yuzuye. Iga ku muvuduko wawe kandi ubone impamyabumenyi ziteza imbere umwuga wawe.",
      searchPlaceholder: "Shakisha amasomo...",
      startLearning: "Saba kujya mumushinga Kwiga",
      badges: {
        skillBased: "Kwiga bishingiye ku Bushobozi",
        certified: "Amasomo yemewe",
        selfPaced: "Ku Muvuduko Wawe"
      }
    },
    filters: {
      title: "Reba Amasomo",
      categories: {
        all: "Ibyiciro Byose",
        digital: "Ubumenyi bw'Ikoranabuhanga",
        business: "Ubucuruzi",
        health: "Uburezi bw'Ubuzima",
        leadership: "Ubuyobozi",
        community: "Guteza Imbere Umuryango"
      },
      level: {
        label: "Urwego",
        all: "Inzego Zose",
        beginner: "USaba kujya mumushinga",
        intermediate: "Hagati",
        advanced: "Hejuru"
      },
      duration: {
        label: "Igihe cy'Amasomo",
        all: "Igihe Cyose",
        short: "Gito (Amasaha 0-2)",
        medium: "Hagati (Amasaha 2-5)",
        long: "Kirekire (Amasaha 5+)"
      }
    },
    course: {
      level: "Urwego",
      duration: "Igihe",
      lessons: "Amasomo",
      enrolled: "Abanyeshuri Biyandikishije",
      startCourse: "Saba kujya mumushinga Isomo",
      viewDetails: "Reba Birambuye",
      certificate: "Harimo Icyemezo",
      free: "Ubuntu",
      progress: "Aho Ugeze"
    },
    learning: {
      title: "Kwiga Kwanjye",
      subtitle: "Kurikirana aho ugeze kandi ukomeze kwiga",
      nextLesson: "Isomo Rikurikira",
      continue: "Komeza Kwiga",
      complete: "Rangiza Isomo",
      resources: "Ibikoresho by'Isomo",
      quiz: "Kora Ikizamini",
      discussion: "Ifatanye mu Biganiro"
    },
    stats: {
      learners: {
        value: "8,500+",
        label: "Abanyeshuri Bakora"
      },
      courses: {
        value: "25+",
        label: "Amasomo y'Impuguke"
      },
      certificates: {
        value: "5,200+",
        label: "Impamyabumenyi Zatanzwe"
      },
      rating: {
        value: "4.8/5",
        label: "Impuzandengo y'Amanota"
      }
    },
    featured: {
      title: "Amasomo Yihariye",
      subtitle: "Saba kujya mumushinga urugendo rwo kwiga hamwe n'amasomo yacu akunda guhitwa kandi afite amanota menshi, yateguriwe Abahagarariye Ikoranabuhanga mu Miryango.",
      courses: {
        health: {
          duration: "Amasaha 4",
          badge: "Gikunda Guhitwa",
          title: "Ibanze ku Bikorwa by'Ubuzima",
          description: "Menya ibikorwa by'ingenzi by'ubuzima n'inyungu zabyo",
          shortDescription: "Menya ibanze ku bikorwa by'ubuzima, imikoreshereze yabyo, n'uko wayobora neza inyungu zabyo ku bakiriya.",
          enrolled: "2,456 banditse",
          certificate: "Impamyabumenyi",
          progress: "Intambwe mu Isomo",
          percent: "0%",
          details: "Menya ibanze ku bikorwa by'ubuzima, imikoreshereze yabyo, n'uko wayobora neza inyungu zabyo ku bakiriya.",
          rating: "4.9 (Ibitekerezo 324)",
          button: "Saba kujya mumushinga Isomo"
        },
        sales: {
          duration: "Amasaha 6",
          badge: "Rishya",
          title: "Uburyo bwo Kugurisha",
          description: "Menya uburyo bukora neza bwo kugurisha no gutumanaho",
          shortDescription: "Menya uburyo bwageragejwe bwo kugurisha, gucunga imikoranire n'abakiriya, no gusoza neza amasezerano.",
          enrolled: "1,823 banditse",
          certificate: "Impamyabumenyi",
          progress: "Intambwe mu Isomo",
          percent: "0%",
          details: "Menya uburyo bwageragejwe bwo kugurisha, gucunga imikoranire n'abakiriya, no gusoza neza amasezerano.",
          rating: "4.8 (Ibitekerezo 256)",
          button: "Saba kujya mumushinga Isomo"
        },
        leadership: {
          duration: "Amasaha 8",
          badge: "Ryimbitse",
          title: "Ubuyobozi bw'Ubuzima bw'Abaturage",
          description: "Ba umuyobozi w'ubuzima wizerwa mu muryango wawe",
          shortDescription: "Menya uko wayobora ibikorwa by'ubuzima no kugira ingaruka nziza mu muryango wawe.",
          enrolled: "1,245 banditse",
          certificate: "Impamyabumenyi",
          progress: "Intambwe mu Isomo",
          percent: "0%",
          details: "Menya uko wayobora ibikorwa by'ubuzima no kugira ingaruka nziza mu muryango wawe.",
          rating: "4.7 (Ibitekerezo 198)",
          button: "Saba kujya mumushinga Isomo"
        }
      }
    }
  },
  fr: {
    hero: {
      backToHome: "Retour à l'Accueil",
      title: "Plateforme d'E-Learning",
      subtitle: "Maîtrisez les compétences essentielles grâce à nos cours de formation complets. Apprenez à votre rythme et obtenez des certifications qui font progresser votre carrière.",
      searchPlaceholder: "Rechercher des cours...",
      startLearning: "Commencer à Apprendre",
      badges: {
        skillBased: "Apprentissage basé sur les Compétences",
        certified: "Cours Certifiés",
        selfPaced: "À votre Rythme"
      }
    },
    filters: {
      title: "Parcourir les Cours",
      categories: {
        all: "Toutes les Catégories",
        digital: "Compétences Numériques",
        business: "Affaires",
        health: "Éducation à la Santé",
        leadership: "Leadership",
        community: "Développement Communautaire"
      },
      level: {
        label: "Niveau de Difficulté",
        all: "Tous les Niveaux",
        beginner: "Débutant",
        intermediate: "Intermédiaire",
        advanced: "Avancé"
      },
      duration: {
        label: "Durée du Cours",
        all: "Toutes les Durées",
        short: "Court (0-2 heures)",
        medium: "Moyen (2-5 heures)",
        long: "Long (5+ heures)"
      }
    },
    course: {
      level: "Niveau",
      duration: "Durée",
      lessons: "Leçons",
      enrolled: "Étudiants Inscrits",
      startCourse: "Commencer le Cours",
      viewDetails: "Voir les Détails",
      certificate: "Certificat Inclus",
      free: "Gratuit",
      progress: "Progression"
    },
    learning: {
      title: "Mon Apprentissage",
      subtitle: "Suivez votre progression et continuez à apprendre",
      nextLesson: "Prochaine Leçon",
      continue: "Continuer l'Apprentissage",
      complete: "Terminer le Cours",
      resources: "Ressources du Cours",
      quiz: "Faire le Quiz",
      discussion: "Rejoindre la Discussion"
    },
    stats: {
      learners: {
        value: "8,500+",
        label: "Apprenants Actifs"
      },
      courses: {
        value: "25+",
        label: "Cours d'Experts"
      },
      certificates: {
        value: "5,200+",
        label: "Certificats Obtenus"
      },
      rating: {
        value: "4.8/5",
        label: "Note Moyenne"
      }
    },
    featured: {
      title: "Cours en Vedette",
      subtitle: "Commencez votre parcours d'apprentissage avec nos cours les plus populaires et les mieux notés, conçus pour les Champions Communautaires du Numérique.",
      courses: {
        health: {
          duration: "4 heures",
          badge: "Populaire",
          title: "Bases des Produits de Santé",
          description: "Apprenez les produits de santé essentiels et leurs avantages",
          shortDescription: "Maîtrisez les fondamentaux des produits de santé, leurs utilisations et comment communiquer efficacement leurs avantages aux clients.",
          enrolled: "2,456 inscrits",
          certificate: "Certificat",
          progress: "Progression du Cours",
          percent: "0%",
          details: "Maîtrisez les fondamentaux des produits de santé, leurs utilisations et comment communiquer efficacement leurs avantages aux clients.",
          rating: "4.9 (324 avis)",
          button: "Commencer le Cours"
        },
        sales: {
          duration: "6 heures",
          badge: "Nouveau",
          title: "Techniques de Vente",
          description: "Développez des compétences efficaces en vente et communication",
          shortDescription: "Apprenez des techniques de vente éprouvées, la gestion de la relation client et comment conclure efficacement des ventes.",
          enrolled: "1,823 inscrits",
          certificate: "Certificat",
          progress: "Progression du Cours",
          percent: "0%",
          details: "Apprenez des techniques de vente éprouvées, la gestion de la relation client et comment conclure efficacement des ventes.",
          rating: "4.8 (256 avis)",
          button: "Commencer le Cours"
        },
        leadership: {
          duration: "8 heures",
          badge: "Avancé",
          title: "Leadership en Santé Communautaire",
          description: "Devenez un leader de santé de confiance dans votre communauté",
          shortDescription: "Apprenez à diriger des initiatives de santé et à avoir un impact positif dans votre communauté.",
          enrolled: "1,245 inscrits",
          certificate: "Certificat",
          progress: "Progression du Cours",
          percent: "0%",
          details: "Apprenez à diriger des initiatives de santé et à avoir un impact positif dans votre communauté.",
          rating: "4.7 (198 avis)",
          button: "Commencer le Cours"
        }
      }
    }
  }
} 