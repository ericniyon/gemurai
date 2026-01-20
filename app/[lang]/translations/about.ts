interface AboutTranslation {
  hero: {
    backToHome: string
    title: string
    subtitle: string
    badges: {
      impact: string
      trusted: string
      innovation: string
    }
  }
  mission: {
    title: string
    description: {
      primary: string
      secondary: string
    }
  }
  vision: {
    title: string
    content: string
  }
  values: {
    title: string
    subtitle: string
    list: {
      community: {
        title: string
        description: string
      }
      innovation: {
        title: string
        description: string
      }
      empowerment: {
        title: string
        description: string
      }
      integrity: {
        title: string
        description: string
      }
    }
  }
  impact: {
    title: string
    stats: {
      directWork: {
        value: string
        label: string
      }
      indirectWork: {
        value: string
        label: string
      }
      champions: {
        value: string
        label: string
      }
      partners: {
        value: string
        label: string
      }
    }
  }
  team: {
    title: string
    subtitle: string
    roles: {
      ceo: string
      cto: string
      coo: string
      manager: string
    }
  }
  partners: {
    title: string
    mastercard: {
      title: string
      role: string
      description: string
    }
    commons: {
      title: string
      role: string
      description: string
    }
    ict: {
      title: string
      role: string
      description: string
    }
  }
  features: {
    title: string
    marketplace: {
      title: string
      description: string
    }
    training: {
      title: string
      description: string
    }
  }
  cta: {
    title: string
    description: string
    button: string
  }
  contact: {
    title: string
    subtitle: string
    address: string
    email: string
    phone: string
    social: {
      follow: string
      connect: string
    }
  }
}

export const aboutTranslations: Record<string, AboutTranslation> = {
  en: {
    hero: {
      backToHome: "Back to Home",
      title: "About HarvestPlus Platform",
      subtitle: "Empowering Digital Community Champions across Rwanda through innovative technology, comprehensive training, and sustainable opportunities.",
      badges: {
        impact: "Community Impact",
        trusted: "Trusted Platform",
        innovation: "Innovation Driven"
      }
    },
    mission: {
      title: "Our Mission",
      description: {
        primary: "HarvestPlus Platform is a collaborative effort between The Commons Project Foundation, ICT Chamber, and the Mastercard Foundation to advance education and relieve poverty for financially disadvantaged youth in Rwanda.",
        secondary: "We empower Digital Community Champions to create sustainable livelihoods through health product sales, comprehensive training programs, and meaningful job opportunities that transform communities."
      }
    },
    vision: {
      title: "Our Vision",
      content: "A digitally empowered Rwanda where every community has access to and benefits from digital technologies and opportunities."
    },
    values: {
      title: "Our Values",
      subtitle: "The principles that guide our work",
      list: {
        community: {
          title: "Community First",
          description: "We prioritize community needs and ensure our solutions create lasting positive impact."
        },
        innovation: {
          title: "Innovation",
          description: "We embrace creative solutions and new technologies to address community challenges."
        },
        empowerment: {
          title: "Empowerment",
          description: "We believe in enabling individuals and communities to drive their own digital transformation."
        },
        integrity: {
          title: "Integrity",
          description: "We maintain the highest standards of honesty, transparency, and ethical conduct."
        }
      }
    },
    impact: {
      title: "Program Impact",
      stats: {
        directWork: {
          value: "14,640",
          label: "Direct work opportunities created"
        },
        indirectWork: {
          value: "29,360",
          label: "Indirect work opportunities"
        },
        champions: {
          value: "2,847",
          label: "Active Digital Community Champions"
        },
        partners: {
          value: "156",
          label: "Partner organizations"
        }
      }
    },
    team: {
      title: "Our Team",
      subtitle: "Meet the people behind our mission",
      roles: {
        ceo: "Chief Executive Officer",
        cto: "Chief Technology Officer",
        coo: "Chief Operations Officer",
        manager: "Program Manager"
      }
    },
    partners: {
      title: "Our Strategic Partners",
      mastercard: {
        title: "Mastercard Foundation",
        role: "Funding and strategic support",
        description: "Providing financial support and strategic guidance to advance education and relieve poverty for financially disadvantaged youth in Rwanda. Their commitment drives our mission forward."
      },
      commons: {
        title: "The Commons Project Foundation",
        role: "Technology and platform development",
        description: "Leading the development of digital health solutions and platform infrastructure to support Digital Community Champions with cutting-edge technology and innovation."
      },
      ict: {
        title: "ICT Chamber",
        role: "Local implementation and support",
        description: "Providing local expertise, implementation support, and ensuring alignment with Rwanda's digital transformation goals and national development strategies."
      }
    },
    features: {
      title: "Platform Features",
      marketplace: {
        title: "Health Products Marketplace",
        description: "Access to quality health products from trusted providers like ADMIN (ADMIN). DCCs can manage inventory, process sales, and earn commissions while serving their communities with essential healthcare solutions."
      },
      training: {
        title: "Digital Skills Training",
        description: "Comprehensive training modules covering digital literacy, business management, and leadership skills. DCCs receive certifications and ongoing support to enhance their capabilities and grow their impact."
      }
    },
    cta: {
      title: "Join Our Community",
      description: "Ready to make a difference in your community? Join HarvestPlus Platform as a Digital Community Champion and be part of Rwanda's digital transformation journey.",
      button: "Apply Now"
    },
    contact: {
      title: "Contact Us",
      subtitle: "Get in touch with our team",
      address: "Kigali, Rwanda",
      email: "info@example.com",
      phone: "+250 XXX XXX XXX",
      social: {
        follow: "Follow Us",
        connect: "Connect With Us"
      }
    }
  },
  rw: {
    hero: {
      backToHome: "Subira ku Rugo",
      title: "Ibyerekeye HarvestPlus",
      subtitle: "Guha ubushobozi Intumwa z'Ikoranabuhanga mu Midugudu yo mu Rwanda binyuze mu ikoranabuhanga rishya, amahugurwa akwiye n'amahirwe arambye.",
      badges: {
        impact: "Ingaruka ku Baturage",
        trusted: "Ihuriro Ryizewe",
        innovation: "Rishingiye ku Buhanga"
      }
    },
    mission: {
      title: "Intego Yacu",
      description: {
        primary: "Ihuriro HarvestPlus ni umushinga uhuriweho na The Commons Project Foundation, ICT Chamber na Mastercard Foundation wo guteza imbere uburezi no kurwanya ubukene mu rubyiruko rufite ibibazo by'ubukungu mu Rwanda.",
        secondary: "Duha ubushobozi Intumwa z'Ikoranabuhanga mu Midugudu kugira ngo zishobore kubona imibereho myiza binyuze mu kugurisha ibikoresho by'ubuzima, gahunda z'amahugurwa akwiye n'amahirwe y'akazi afite ireme ahindura imidugudu."
      }
    },
    vision: {
      title: "Icyerekezo Cyacu",
      content: "U Rwanda rufite ubushobozi bw'ikoranabuhanga aho buri muryango ufite uburyo bwo kubona no kungukirwa n'ikoranabuhanga n'amahirwe."
    },
    values: {
      title: "Indangagaciro Zacu",
      subtitle: "Amahame atugenga mu kazi kacu",
      list: {
        community: {
          title: "Umuryango Mbere",
          description: "Dushyira imbere ibyifuzo by'umuryango kandi tukareba ko ibisubizo byacu bigira ingaruka nziza zirambye."
        },
        innovation: {
          title: "Guhanga Udushya",
          description: "Twakira ibisubizo bishya n'ikoranabuhanga rishya mu gukemura ibibazo by'umuryango."
        },
        empowerment: {
          title: "Guha Ubushobozi",
          description: "Twizera ko guha ubushobozi abantu n'imiryango bituma bayobora ihinduka ryabo ry'ikoranabuhanga."
        },
        integrity: {
          title: "Ubunyangamugayo",
          description: "Dukurikiza ibipimo byo hejuru by'ukuri, gukorera mu mucyo, no kwifata neza."
        }
      }
    },
    impact: {
      title: "Ingaruka za Gahunda",
      stats: {
        directWork: {
          value: "14,640",
          label: "Amahirwe y'akazi ataziguye yaremwe"
        },
        indirectWork: {
          value: "29,360",
          label: "Amahirwe y'akazi aziguye"
        },
        champions: {
          value: "2,847",
          label: "Intumwa z'Ikoranabuhanga mu Midugudu zikora"
        },
        partners: {
          value: "156",
          label: "Imiryango ifatanyije natwe"
        }
      }
    },
    team: {
      title: "Ikipe Yacu",
      subtitle: "Menya abantu bari inyuma y'intego yacu",
      roles: {
        ceo: "Umuyobozi Mukuru",
        cto: "Umuyobozi w'Ikoranabuhanga",
        coo: "Umuyobozi w'Ibikorwa",
        manager: "Umuyobozi wa Gahunda"
      }
    },
    partners: {
      title: "Abafatanyabikorwa bacu b'Ingenzi",
      mastercard: {
        title: "Mastercard Foundation",
        role: "Inkunga n'ubufasha bw'ingenzi",
        description: "Gutanga inkunga y'amafaranga n'ubuyobozi bw'ingenzi mu guteza imbere uburezi no kurwanya ubukene mu rubyiruko rufite ibibazo by'ubukungu mu Rwanda. Ubwitange bwabo butuma intego yacu igenda imbere."
      },
      commons: {
        title: "The Commons Project Foundation",
        role: "Iterambere ry'ikoranabuhanga n'ihuriro",
        description: "Kuyobora iterambere ry'ibisubizo by'ubuzima bw'ikoranabuhanga n'ibikorwa remezo by'ihuriro kugira ngo dufashe Intumwa z'Ikoranabuhanga mu Midugudu n'ikoranabuhanga n'ubuhanga bushya."
      },
      ict: {
        title: "ICT Chamber",
        role: "Ishyirwa mu bikorwa n'ubufasha bw'ahantu",
        description: "Gutanga ubumenyi bw'ahantu, ubufasha mu ishyirwa mu bikorwa no kureba ko bihuje n'intego z'ihinduka ry'ikoranabuhanga mu Rwanda n'ingamba z'iterambere ry'igihugu."
      }
    },
    features: {
      title: "Ibiranga Ihuriro",
      marketplace: {
        title: "Isoko ry'Ibikoresho by'Ubuzima",
        description: "Kugera ku bikoresho by'ubuzima by'ireme biturutse ku batanga serivisi bizewe nka ADMIN (ADMIN). DCC zishobora gucunga ibicuruzwa, gukora ubucuruzi no kubona amafaranga mu gihe zifasha imidugudu yazo n'ibisubizo by'ingenzi by'ubuzima."
      },
      training: {
        title: "Amahugurwa y'Ubumenyi bw'Ikoranabuhanga",
        description: "Moduli z'amahugurwa akwiye zirimo ubumenyi bw'ikoranabuhanga, imicungire y'ubucuruzi n'ubumenyi bw'ubuyobozi. DCC zihabwa ibyemezo n'ubufasha buhoraho kugira ngo zongere ubushobozi bwazo kandi zongere ingaruka zazo."
      }
    },
    cta: {
      title: "Injira muri Umuryango Wacu",
      description: "Witeguye guhindura imidugudu yawe? Injira mu Ihuriro HarvestPlus nk'Intumwa y'Ikoranabuhanga mu Mudugudu kandi ube umwe mu rugendo rwo guhindura u Rwanda mu ikoranabuhanga.",
      button: "Iyandikishe Ubu"
    },
    contact: {
      title: "Twandikire",
      subtitle: "Vugisha ikipe yacu",
      address: "Kigali, Rwanda",
      email: "info@example.com",
      phone: "+250 XXX XXX XXX",
      social: {
        follow: "Dukurikire",
        connect: "Dukomeze Umubano"
      }
    }
  }
} 