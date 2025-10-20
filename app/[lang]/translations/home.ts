interface Slide {
  id: number
  title: string
  subtitle: string
  description: string
  cta: string
  secondaryCta: string
  stats: {
    primary: string
    secondary: string
  }
}

interface Card {
  title: string
  description: string
  cta: string
}

interface Feature {
  title: string
  subtitle: string
}

interface Translation {
  hero: {
    slides: Slide[]
  }
  features: {
    title: string
    subtitle: string
    cards: Card[]
  }
  mission: {
    title: string
    subtitle: string
    mission: {
      title: string
      content: string
    }
    vision: {
      title: string
      content: string
    }
    features: {
      learn: Feature
      work: Feature
      serve: Feature
      connect: Feature
    }
  }
  testimonials: {
    badge: string
    title: string
    subtitle: string
    testimonial: {
      role: string
      subtitle: string
      content: string
    }
  }
  cta: {
    badge: string
    title: string
    subtitle: string
    primary: string
    secondary: string
  }
}

export const homeTranslations: Record<string, Translation> = {
  en: {
    hero: {
      slides: [
        {
          id: 1,
          title: "Empowering Digital Community Champions",
          subtitle: "Building Rwanda's Digital Future",
          description: "Join thousands of Digital Community Champions across Rwanda who are transforming their communities through technology, health education, and economic opportunities.",
          cta: "Become a DCC",
          secondaryCta: "Learn More",
          stats: { primary: "14,640", secondary: "Direct Jobs Created" }
        },
        {
          id: 2,
          title: "Good Health, Good Business",
          subtitle: "Health & Prosperity for All",
          description: "Connecting rural communities with essential health products while creating sustainable income opportunities for local champions.",
          cta: "Explore Products",
          secondaryCta: "Join Marketplace",
          stats: { primary: "29,360", secondary: "Indirect Opportunities" }
        },
        {
          id: 3,
          title: "Learn, Work, Succeed",
          subtitle: "Education for Economic Growth",
          description: "Access world-class digital skills training, find meaningful employment, and build a prosperous future in Rwanda's growing digital economy.",
          cta: "Start Learning",
          secondaryCta: "Find Jobs",
          stats: { primary: "100+", secondary: "Communities Served" }
        },
        {
          id: 4,
          title: "Community Innovation",
          subtitle: "Grassroots Technology Solutions",
          description: "Fostering local innovation and entrepreneurship through technology, creating solutions that address real community needs.",
          cta: "Join Community",
          secondaryCta: "Our Impact",
          stats: { primary: "5", secondary: "Provinces Covered" }
        }
      ]
    },
    features: {
      title: "How Gemurai Works",
      subtitle: "Our comprehensive platform provides everything you need to succeed as a Digital Community Champion.",
      cards: [
        {
          title: "Health Products",
          description: "Access quality health products from trusted providers and earn commissions on every sale while serving your community.",
          cta: "Explore Marketplace"
        },
        {
          title: "Skills Development",
          description: "Build your skills with comprehensive training programs and earn valuable certifications to advance your career.",
          cta: "Browse Courses"
        },
        {
          title: "Job Opportunities",
          description: "Find employment opportunities that match your skills and qualifications in your local community and beyond.",
          cta: "Find Jobs"
        }
      ]
    },
    mission: {
      title: "Our Mission & Vision",
      subtitle: "Empowering communities through technology and creating sustainable economic opportunities across Rwanda.",
      mission: {
        title: "Our Mission",
        content: "To bridge the digital divide by empowering communities with technology, skills, and economic opportunities across Rwanda, creating a network of Digital Community Champions who drive local development and prosperity."
      },
      vision: {
        title: "Our Vision",
        content: "A digitally inclusive Rwanda where every community champion has access to technology and opportunities for growth, contributing to the nation's vision of becoming a knowledge-based economy."
      },
      features: {
        learn: {
          title: "Learn",
          subtitle: "Digital Skills Training"
        },
        work: {
          title: "Work",
          subtitle: "Job Opportunities"
        },
        serve: {
          title: "Serve",
          subtitle: "Community Health"
        },
        connect: {
          title: "Connect",
          subtitle: "Community Network"
        }
      }
    },
    testimonials: {
      badge: "Testimonials",
      title: "What Our Community Says",
      subtitle: "Hear from our valued community members about their experiences with Gemurai",
      testimonial: {
        role: "Community Member",
        subtitle: "Digital Champion",
        content: "Gemurai has transformed the way we connect and collaborate within our community. The platform's tools and resources have been invaluable for our digital initiatives."
      }
    },
    cta: {
      badge: "Apply to become a DCC Today",
      title: "Ready to Join Our Digital Community?",
      subtitle: "Take the first step towards digital transformation. Join Gemurai and become part of a thriving community of digital champions.",
      primary: "Join Now",
      secondary: "Learn More"
    }
  },
  fr: {
    hero: {
    slides: [
      {
        id: 1,
          title: "Autonomiser les Champions Communautaires Numériques",
          subtitle: "Construire l'Avenir Numérique du Rwanda",
          description: "Rejoignez des milliers de Champions Communautaires Numériques à travers le Rwanda qui transforment leurs communautés grâce à la technologie, l'éducation à la santé et les opportunités économiques.",
          cta: "Devenir un DCC",
          secondaryCta: "En Savoir Plus",
          stats: { primary: "14,640", secondary: "Emplois Directs Créés" }
      },
      {
        id: 2,
          title: "Bonne Santé, Bonne Affaire",
          subtitle: "Santé et Prospérité pour Tous",
          description: "Connecter les communautés rurales avec des produits de santé essentiels tout en créant des opportunités de revenus durables pour les champions locaux.",
          cta: "Explorer les Produits",
          secondaryCta: "Rejoindre le Marché",
          stats: { primary: "29,360", secondary: "Opportunités Indirectes" }
      },
      {
        id: 3,
          title: "Apprendre, Travailler, Réussir",
          subtitle: "Éducation pour la Croissance Économique",
          description: "Accédez à une formation de classe mondiale en compétences numériques, trouvez un emploi significatif et construisez un avenir prospère dans l'économie numérique croissante du Rwanda.",
          cta: "Commencer à Apprendre",
          secondaryCta: "Trouver des Emplois",
          stats: { primary: "100+", secondary: "Communautés Servies" }
      },
      {
        id: 4,
          title: "Innovation Communautaire",
          subtitle: "Solutions Technologiques Locales",
          description: "Favoriser l'innovation locale et l'entrepreneuriat grâce à la technologie, créant des solutions qui répondent aux besoins réels de la communauté.",
          cta: "Rejoindre la Communauté",
          secondaryCta: "Notre Impact",
          stats: { primary: "5", secondary: "Provinces Couvertes" }
        }
      ]
    },
    features: {
      title: "Fonctionnalités de la Plateforme",
      subtitle: "Tout ce dont vous avez besoin pour réussir en tant que Champion Communautaire Numérique",
      cards: [
        {
          title: "Formation aux Compétences Numériques",
          description: "Accédez à des modules de formation complets conçus pour développer vos capacités numériques et vos compétences en leadership.",
          cta: "Explorer les Cours"
        },
        {
          title: "Marché des Produits de Santé",
          description: "Connectez-vous avec les fournisseurs et distribuez des produits de santé essentiels à votre communauté.",
          cta: "Visiter le Marché"
        },
        {
          title: "Gestion Communautaire",
          description: "Outils et ressources pour gérer et développer efficacement votre réseau communautaire.",
          cta: "Commencer"
        }
      ]
    },
    mission: {
      title: "Notre Mission & Vision",
      subtitle: "Autonomiser les communautés grâce à la technologie et créer des opportunités économiques durables à travers le Rwanda.",
      mission: {
        title: "Notre Mission",
        content: "Combler la fracture numérique en donnant aux communautés les moyens d'accéder à la technologie, aux compétences et aux opportunités économiques à travers le Rwanda, créant un réseau de Champions Communautaires Numériques qui stimulent le développement et la prospérité locale."
      },
      vision: {
        title: "Notre Vision",
        content: "Un Rwanda numériquement inclusif où chaque champion communautaire a accès à la technologie et aux opportunités de croissance, contribuant à la vision nationale de devenir une économie basée sur la connaissance."
      },
      features: {
        learn: {
          title: "Apprendre",
          subtitle: "Formation Numérique"
        },
        work: {
          title: "Travailler",
          subtitle: "Opportunités d'Emploi"
        },
        serve: {
          title: "Servir",
          subtitle: "Santé Communautaire"
        },
        connect: {
          title: "Connecter",
          subtitle: "Réseau Communautaire"
        }
      }
    },
    testimonials: {
      badge: "Témoignages",
      title: "Ce que Dit Notre Communauté",
      subtitle: "Écoutez nos membres de la communauté parler de leurs expériences avec Gemurai",
      testimonial: {
        role: "Membre de la Communauté",
        subtitle: "Champion Numérique",
        content: "Gemurai a transformé la façon dont nous nous connectons et collaborons au sein de notre communauté. Les outils et ressources de la plateforme ont été inestimables pour nos initiatives numériques."
      }
    },
    cta: {
      badge: "Commencez Aujourd'hui",
      title: "Prêt à Rejoindre Notre Communauté Numérique ?",
      subtitle: "Faites le premier pas vers la transformation numérique. Rejoignez Gemurai et faites partie d'une communauté florissante de champions numériques.",
      primary: "Rejoindre Maintenant",
      secondary: "En Savoir Plus"
    }
  },
  rw: {
    hero: {
      slides: [
        {
          id: 1,
          title: "Guha Ubushobozi Abayobozi b'Ikoranabuhanga mu Miryango",
          subtitle: "Kubaka Ejo Hazaza h'Ikoranabuhanga mu Rwanda",
          description: "Ifatanye n'ibihumbi by'Abayobozi b'Ikoranabuhanga mu Miryango mu Rwanda bari guhindura imiryango yabo binyuze mu ikoranabuhanga, uburezi bw'ubuzima, n'amahirwe y'ubukungu.",
          cta: "Ba DCC",
          secondaryCta: "Menya Byinshi",
          stats: { primary: "14,640", secondary: "Imirimo Itaziguye Yaremwe" }
        },
        {
          id: 2,
          title: "Ubuzima Bwiza, Ubucuruzi Bwiza",
          subtitle: "Ubuzima n'Ubukungu kuri Bose",
          description: "Guhuza imiryango yo mu cyaro n'ibicuruzwa by'ingenzi by'ubuzima mu gihe turema amahirwe y'ubukungu arambye ku bayobozi bo mu miryango.",
          cta: "Reba Ibicuruzwa",
          secondaryCta: "Injira mu Isoko",
          stats: { primary: "29,360", secondary: "Amahirwe Aziguye" }
        },
        {
          id: 3,
          title: "Kwiga, Gukora, Gutsinda",
          subtitle: "Uburezi ku Iterambere ry'Ubukungu",
          description: "Kubona amahugurwa y'ikoranabuhanga yo ku rwego rw'isi, kubona akazi gafite ireme, no kubaka ejo hazaza h'ubukungu mu bukungu bw'u Rwanda bwiyongera.",
          cta: "Saba kujya mumushinga Kwiga",
          secondaryCta: "Shakisha Akazi",
          stats: { primary: "100+", secondary: "Imiryango Dukorera" }
        },
        {
          id: 4,
          title: "Guhanga Mushya mu Muryango",
          subtitle: "Ibisubizo by'Ikoranabuhanga mu Miryango",
          description: "Guteza imbere ubuhanga n'ubucuruzi bwo mu miryango binyuze mu ikoranabuhanga, dukora ibisubizo bikemura ibibazo nyakuri by'imiryango.",
          cta: "Ifatanye n'Umuryango",
          secondaryCta: "Akamaro Kacu",
          stats: { primary: "5", secondary: "Intara Dukoreramo" }
        }
      ]
    },
    features: {
      title: "Uko Gemurai Ikora",
      subtitle: "Platform yacu itanga ibikenewe byose kugira ngo ubashe gutsinda nk'Umuyobozi w'Ikoranabuhanga mu Muryango.",
      cards: [
        {
          title: "Ibicuruzwa by'Ubuzima",
          description: "Kubona ibicuruzwa by'ubuzima by'ireme bivuye ku batanga serivisi bizewe no kubona amakomisiyo kuri buri kigurishijwe mu gihe ukorera umuryango wawe.",
          cta: "Reba Isoko"
        },
        {
          title: "Iterambere ry'Ubumenyi",
          description: "Ongera ubumenyi bwawe binyuze mu mahugurwa arambuye kandi ubone ibyemezo by'agaciro byo guteza imbere umwuga wawe.",
          cta: "Reba Amasomo"
        },
        {
          title: "Amahirwe y'Akazi",
          description: "Bona amahirwe y'akazi ahuje n'ubumenyi n'ubushobozi bwawe mu muryango wawe no hirya yawo.",
          cta: "Shakisha Akazi"
        }
      ]
    },
    mission: {
      title: "Intego n'Icyerekezo Cyacu",
      subtitle: "Guha ubushobozi imiryango binyuze mu ikoranabuhanga no kurema amahirwe arambye y'ubukungu mu Rwanda hose.",
      mission: {
        title: "Intego Yacu",
        content: "Kugabanya icyuho cy'ikoranabuhanga duha ubushobozi imiryango binyuze mu ikoranabuhanga, ubumenyi, n'amahirwe y'ubukungu mu Rwanda hose, dukora urusobe rw'Abayobozi b'Ikoranabuhanga mu Miryango bayobora iterambere n'ubukungu bw'ahantu."
      },
      vision: {
        title: "Icyerekezo Cyacu",
        content: "U Rwanda rufite ikoranabuhanga rigera kuri bose aho buri muyobozi w'umuryango afite uburyo bwo kubona ikoranabuhanga n'amahirwe yo gukura, atanga umusanzu ku cyerekezo cy'igihugu cyo kuba ubukungu bushingiye ku bumenyi."
      },
      features: {
        learn: {
          title: "Kwiga",
          subtitle: "Amahugurwa y'Ikoranabuhanga"
        },
        work: {
          title: "Gukora",
          subtitle: "Amahirwe y'Akazi"
        },
        serve: {
          title: "Gukorera",
          subtitle: "Ubuzima bw'Umuryango"
        },
        connect: {
          title: "Guhuza",
          subtitle: "Urusobe rw'Umuryango"
        }
      }
    },
    testimonials: {
      badge: "Ubuhamya",
      title: "Icyo Umuryango Wacu Uvuga",
      subtitle: "Umva ibyo abagize umuryango wacu bavuga ku byerekeye uburambe bwabo kuri Gemurai",
      testimonial: {
        role: "Umwe mu Muryango",
        subtitle: "Umuyobozi w'Ikoranabuhanga",
        content: "Gemurai yahinduriye uburyo duhuza kandi dukorana mu muryango wacu. Ibikoresho n'umutungo bya platform byagize akamaro kanini mu bikorwa byacu by'ikoranabuhanga."
      }
    },
    cta: {
      badge: "Saba kujya mumushinga Uyu Munsi",
      title: "Witeguye Kwifatanya n'Umuryango Wacu w'Ikoranabuhanga?",
      subtitle: "Kora intambwe ya mbere yerekeza ku ihinduka ry'ikoranabuhanga. Ifatanye na Gemurai ube umwe mu muryango utera imbere w'abayobozi b'ikoranabuhanga.",
      primary: "Ifatanye Natwe",
      secondary: "Menya Byinshi"
    }
  },
}