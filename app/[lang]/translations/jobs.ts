interface JobsTranslation {
  hero: {
    backToHome: string
    title: string
    subtitle: string
    badges: {
      growth: string
      matching: string
      employers: string
    }
  }
  stats: {
    jobs: {
      value: string
      label: string
    }
    companies: {
      value: string
      label: string
    }
    seekers: {
      value: string
      label: string
    }
    success: {
      value: string
      label: string
    }
  }
  search: {
    title: string
    input: {
      placeholder: string
    }
    category: {
      placeholder: string
      all: string
      healthcare: string
      sales: string
      education: string
      technology: string
    }
    location: {
      placeholder: string
      all: string
      kigali: string
      rubavu: string
      musanze: string
      huye: string
    }
    button: string
  }
  featured: {
    title: string
    job: {
      title: string
      company: string
      description: string
      location: string
      salary: string
      type: string
      positions: string
      badges: {
        new: string
        healthcare: string
        training: string
      }
      buttons: {
        view: string
        apply: string
      }
    }
  }
}

export const jobsTranslations: Record<string, JobsTranslation> = {
  en: {
    hero: {
      backToHome: "Back to Home",
      title: "Job Marketplace",
      subtitle: "Discover career opportunities that match your skills and aspirations. Connect with employers who value your expertise and commitment.",
      badges: {
        growth: "Career Growth",
        matching: "Skill Matching",
        employers: "Top Employers"
      }
    },
    stats: {
      jobs: {
        value: "1,250+",
        label: "Active Jobs"
      },
      companies: {
        value: "450+",
        label: "Partner Companies"
      },
      seekers: {
        value: "8,900+",
        label: "Job Seekers"
      },
      success: {
        value: "95%",
        label: "Success Rate"
      }
    },
    search: {
      title: "Find Your Perfect Job",
      input: {
        placeholder: "Search jobs by title, company, or keywords..."
      },
      category: {
        placeholder: "Category",
        all: "All Categories",
        healthcare: "Healthcare",
        sales: "Sales",
        education: "Education",
        technology: "Technology"
      },
      location: {
        placeholder: "Location",
        all: "All Locations",
        kigali: "Kigali",
        rubavu: "Rubavu",
        musanze: "Musanze",
        huye: "Huye"
      },
      button: "Search Jobs"
    },
    featured: {
      title: "Featured Opportunities",
      job: {
        title: "Community Health Assistant",
        company: "Kigali Health Center",
        description: "Support community health initiatives and provide basic health education to families in rural areas. Work directly with communities to improve health outcomes and promote preventive care.",
        location: "Kigali",
        salary: "RWF 80,000 - 120,000",
        type: "Full-time",
        positions: "5+ positions",
        badges: {
          new: "New",
          healthcare: "Healthcare",
          training: "Training Provided"
        },
        buttons: {
          view: "View Details",
          apply: "Apply Now"
        }
      }
    }
  },
  fr: {
    hero: {
      backToHome: "Retour à l'Accueil",
      title: "Place de Marché des Emplois",
      subtitle: "Découvrez des opportunités de carrière qui correspondent à vos compétences et à vos aspirations. Connectez-vous avec des employeurs qui valorisent votre expertise et votre engagement.",
      badges: {
        growth: "Évolution de Carrière",
        matching: "Correspondance des Compétences",
        employers: "Meilleurs Employeurs"
      }
    },
    stats: {
      jobs: {
        value: "1 250+",
        label: "Emplois Actifs"
      },
      companies: {
        value: "450+",
        label: "Entreprises Partenaires"
      },
      seekers: {
        value: "8 900+",
        label: "Chercheurs d'Emploi"
      },
      success: {
        value: "95%",
        label: "Taux de Réussite"
      }
    },
    search: {
      title: "Trouvez Votre Emploi Idéal",
      input: {
        placeholder: "Rechercher par titre, entreprise ou mots-clés..."
      },
      category: {
        placeholder: "Catégorie",
        all: "Toutes les Catégories",
        healthcare: "Santé",
        sales: "Ventes",
        education: "Éducation",
        technology: "Technologie"
      },
      location: {
        placeholder: "Lieu",
        all: "Tous les Lieux",
        kigali: "Kigali",
        rubavu: "Rubavu",
        musanze: "Musanze",
        huye: "Huye"
      },
      button: "Rechercher des Emplois"
    },
    featured: {
      title: "Opportunités en Vedette",
      job: {
        title: "Assistant de Santé Communautaire",
        company: "Centre de Santé de Kigali",
        description: "Soutenir les initiatives de santé communautaire et fournir une éducation sanitaire de base aux familles dans les zones rurales. Travailler directement avec les communautés pour améliorer les résultats de santé et promouvoir les soins préventifs.",
        location: "Kigali",
        salary: "RWF 80 000 - 120 000",
        type: "Temps Plein",
        positions: "5+ postes",
        badges: {
          new: "Nouveau",
          healthcare: "Santé",
          training: "Formation Fournie"
        },
        buttons: {
          view: "Voir les Détails",
          apply: "Postuler Maintenant"
        }
      }
    }
  },
  rw: {
    hero: {
      backToHome: "Subira ku Rugo",
      title: "Isoko ry'Akazi",
      subtitle: "Bona amahirwe y'akazi ahuje n'ubumenyi n'ibyo wifuza. Hura n'abakoresha bashima ubumenyi n'ubwitange byawe.",
      badges: {
        growth: "Kuzamuka mu Kazi",
        matching: "Guhura n'Ubumenyi",
        employers: "Abakoresha b'Ingenzi"
      }
    },
    stats: {
      jobs: {
        value: "1,250+",
        label: "Akazi Gahari"
      },
      companies: {
        value: "450+",
        label: "Ibigo Dufatanyije"
      },
      seekers: {
        value: "8,900+",
        label: "Abashakisha Akazi"
      },
      success: {
        value: "95%",
        label: "Kugera ku Ntego"
      }
    },
    search: {
      title: "Shakisha Akazi Gakwiye",
      input: {
        placeholder: "Shakisha akazi ukurikije izina, ikigo, cyangwa amagambo y'ingenzi..."
      },
      category: {
        placeholder: "Icyiciro",
        all: "Ibyiciro Byose",
        healthcare: "Ubuzima",
        sales: "Ubucuruzi",
        education: "Uburezi",
        technology: "Ikoranabuhanga"
      },
      location: {
        placeholder: "Ahantu",
        all: "Hose",
        kigali: "Kigali",
        rubavu: "Rubavu",
        musanze: "Musanze",
        huye: "Huye"
      },
      button: "Shakisha Akazi"
    },
    featured: {
      title: "Amahirwe Yihariye",
      job: {
        title: "Umufasha w'Ubuzima bw'Abaturage",
        company: "Ivuriro rya Kigali",
        description: "Gufasha ibikorwa by'ubuzima mu baturage no gutanga inyigisho z'ibanze z'ubuzima ku miryango yo mu cyaro. Gukora n'abaturage mu guteza imbere ubuzima no guteza imbere ubuvuzi bwo kwirinda.",
        location: "Kigali",
        salary: "RWF 80,000 - 120,000",
        type: "Igihe Cyose",
        positions: "Imyanya 5+",
        badges: {
          new: "Gishya",
          healthcare: "Ubuzima",
          training: "Amahugurwa Atangwa"
        },
        buttons: {
          view: "Reba Birambuye",
          apply: "Iyandikishe"
        }
      }
    }
  }
} 