interface RecordSaleTranslation {
  title: string
  subtitle: string
  backToDashboard: string
  pointsSystem: {
    title: string
    regularSale: string
    highValueSale: string
    dailyBonus: string
    points: string
  }
  dccLevels: {
    title: string
    levelA: {
      title: string
      subtitle: string
      badge: string
      benefits: {
        priority: string
        commission: string
        recognition: string
      }
    }
    levelB: {
      title: string
      subtitle: string
      badge: string
      benefits: {
        allocation: string
        leadership: string
        training: string
      }
    }
    levelC: {
      title: string
      subtitle: string
      badge: string
      benefits: {
        access: string
        commission: string
        training: string
      }
    }
  }
  priorityBenefits: {
    title: string
    earlyAccess: string
    higherCommission: string
    recognition: string
  }
  form: {
    title: string
    product: {
      label: string
      placeholder: string
    }
    quantity: {
      label: string
      placeholder: string
    }
    date: {
      label: string
    }
    customer: {
      label: string
      placeholder: string
    }
    location: {
      label: string
      placeholder: string
    }
    notes: {
      label: string
      placeholder: string
    }
    submit: {
      default: string
      loading: string
    }
  }
  rewards: {
    title: string
    subtitle: string
    backToRecordSale: string
    pointsSystem: {
      title: string
      sales: {
        title: string
        regular: string
        highValue: string
        dailyBonus: string
      }
      performance: {
        title: string
        perfectWeek: string
        monthlyGoal: string
        customerRating: string
      }
      bonus: {
        title: string
        newCustomer: string
        referral: string
        training: string
      }
    }
  }
  toast: {
    success: {
      title: string
      description: string
    }
    error: {
      title: string
      description: string
    }
  }
}

export const recordSaleTranslations: Record<string, RecordSaleTranslation> = {
  en: {
    title: "Record Physical Sale",
    subtitle: "Record your physical sales and earn points",
    backToDashboard: "Back to Dashboard",
    pointsSystem: {
      title: "Points System",
      regularSale: "Regular Sale",
      highValueSale: "High Value Sale",
      dailyBonus: "Daily Bonus",
      points: "pts"
    },
    dccLevels: {
      title: "DCC Levels",
      levelA: {
        title: "Level A (2000+ points)",
        subtitle: "Elite DCC Status",
        badge: "Premium",
        benefits: {
          priority: "Priority product access",
          commission: "Highest commission rates",
          recognition: "Monthly recognition rewards"
        }
      },
      levelB: {
        title: "Level B (501-2000 points)",
        subtitle: "Advanced DCC Status",
        badge: "Advanced",
        benefits: {
          allocation: "Increased product allocation",
          leadership: "Team leadership opportunities",
          training: "Enhanced training access"
        }
      },
      levelC: {
        title: "Level C (0-500 points)",
        subtitle: "Standard DCC Status",
        badge: "Standard",
        benefits: {
          access: "Basic product access",
          commission: "Standard commission rates",
          training: "Regular training programs"
        }
      }
    },
    priorityBenefits: {
      title: "Priority Benefits",
      earlyAccess: "Early Product Access",
      higherCommission: "Higher Commission",
      recognition: "Special Recognition"
    },
    form: {
      title: "Record Physical Sale",
      product: {
        label: "Product",
        placeholder: "Select a product"
      },
      quantity: {
        label: "Quantity",
        placeholder: "Enter quantity sold"
      },
      date: {
        label: "Sale Date"
      },
      customer: {
        label: "Customer Name (Optional)",
        placeholder: "Enter customer name"
      },
      location: {
        label: "Sale Location",
        placeholder: "Enter sale location"
      },
      notes: {
        label: "Additional Notes",
        placeholder: "Any additional information about the sale"
      },
      submit: {
        default: "Record Sale",
        loading: "Recording Sale..."
      }
    },
    rewards: {
      title: "DCC Rewards Program",
      subtitle: "Earn points and unlock exclusive benefits by recording your physical sales and maintaining high performance.",
      backToRecordSale: "Back to Record Sale",
      pointsSystem: {
        title: "Points System",
        sales: {
          title: "Sales Points",
          regular: "Regular Sale",
          highValue: "High Value Sale",
          dailyBonus: "Daily Bonus"
        },
        performance: {
          title: "Performance Points",
          perfectWeek: "Perfect Week",
          monthlyGoal: "Monthly Goal",
          customerRating: "Customer Rating"
        },
        bonus: {
          title: "Bonus Points",
          newCustomer: "New Customer",
          referral: "Referral",
          training: "Training"
        }
      }
    },
    toast: {
      success: {
        title: "Sale Recorded Successfully",
        description: "Your physical sale has been recorded and points have been added to your account."
      },
      error: {
        title: "Error Recording Sale",
        description: "There was a problem recording your sale. Please try again."
      }
    }
  },
  rw: {
    title: "Andika Ibicuruzwa Byagurishijwe",
    subtitle: "Andika ibicuruzwa byagurishijwe kandi ubone amanota",
    backToDashboard: "Garuka ku Kibaho",
    pointsSystem: {
      title: "Uburyo bw'Amanota",
      regularSale: "Kugurisha Gisanzwe",
      highValueSale: "Kugurisha Byinshi",
      dailyBonus: "Ibihembo bya Buri Munsi",
      points: "amanota"
    },
    dccLevels: {
      title: "Inzego za DCC",
      levelA: {
        title: "Urwego A (Amanota 2000+)",
        subtitle: "DCC y'Ikirenga",
        badge: "Ikirenga",
        benefits: {
          priority: "Kubona ibicuruzwa mbere y'abandi",
          commission: "Amafaranga menshi y'ubwumvikane",
          recognition: "Ibihembo bya buri kwezi"
        }
      },
      levelB: {
        title: "Urwego B (Amanota 501-2000)",
        subtitle: "DCC Yateye Imbere",
        badge: "Yateye Imbere",
        benefits: {
          allocation: "Kongera ibicuruzwa",
          leadership: "Amahirwe yo kuyobora itsinda",
          training: "Amahugurwa yiyongereye"
        }
      },
      levelC: {
        title: "Urwego C (Amanota 0-500)",
        subtitle: "DCC Isanzwe",
        badge: "Isanzwe",
        benefits: {
          access: "Kubona ibicuruzwa bisanzwe",
          commission: "Amafaranga asanzwe y'ubwumvikane",
          training: "Gahunda z'amahugurwa asanzwe"
        }
      }
    },
    priorityBenefits: {
      title: "Inyungu z'Ibanze",
      earlyAccess: "Kubona Ibicuruzwa Mbere",
      higherCommission: "Amafaranga Menshi",
      recognition: "Gushimwa Byihariye"
    },
    form: {
      title: "Andika Ibicuruzwa Byagurishijwe",
      product: {
        label: "Igicuruzwa",
        placeholder: "Hitamo igicuruzwa"
      },
      quantity: {
        label: "Umubare",
        placeholder: "Andika umubare wagurishijwe"
      },
      date: {
        label: "Itariki yo Kugurisha"
      },
      customer: {
        label: "Izina ry'Umukiriya (Ntibisabwa)",
        placeholder: "Andika izina ry'umukiriya"
      },
      location: {
        label: "Aho Byagurishijwe",
        placeholder: "Andika aho byagurishijwe"
      },
      notes: {
        label: "Andi Makuru",
        placeholder: "Andi makuru yose yerekeye ibyo wagurishije"
      },
      submit: {
        default: "Andika Ibyagurishijwe",
        loading: "Kwandika Ibyagurishijwe..."
      }
    },
    rewards: {
      title: "Gahunda y'Ibihembo bya DCC",
      subtitle: "Bona amanota kandi ubona inyungu zidasanzwe mu kwandika ibicuruzwa byawe no kugira imikorere myiza.",
      backToRecordSale: "Garuka ku Kwandika Ibyagurishijwe",
      pointsSystem: {
        title: "Uburyo bw'Amanota",
        sales: {
          title: "Amanota y'Ibyagurishijwe",
          regular: "Kugurisha Gisanzwe",
          highValue: "Kugurisha Byinshi",
          dailyBonus: "Ibihembo bya Buri Munsi"
        },
        performance: {
          title: "Amanota y'Imikorere",
          perfectWeek: "Icyumweru Cyiza",
          monthlyGoal: "Intego ya Buri Kwezi",
          customerRating: "Uko Abakiriya Babibona"
        },
        bonus: {
          title: "Amanota y'Inyongera",
          newCustomer: "Umukiriya Mushya",
          referral: "Kwohereza Abandi",
          training: "Amahugurwa"
        }
      }
    },
    toast: {
      success: {
        title: "Ibyagurishijwe Byanditswe Neza",
        description: "Ibyagurishijwe byawe byanditswe kandi amanota yongerewe kuri konti yawe."
      },
      error: {
        title: "Ikosa mu Kwandika Ibyagurishijwe",
        description: "Habaye ikibazo mu kwandika ibyagurishijwe byawe. Nyamuneka ongera ugerageze."
      }
    }
  }
} as const 