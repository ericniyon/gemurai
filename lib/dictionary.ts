type Dictionary = {
  apiDocs: {
    title: string
    description: string
    header: {
      title: string
      subtitle: string
      searchPlaceholder: string
      allCategories: string
    }
    categories: {
      authentication: string
      userManagement: string
      products: string
      applications: string
      rwandaDivisions: string
    }
    common: {
      requestBody: string
      response: string
      authRequired: string
      method: {
        get: string
        post: string
        put: string
        delete: string
      }
    }
  }
}

const en: Dictionary = {
  apiDocs: {
    title: "API Documentation",
    description: "Complete API documentation for the Gemurai Platform",
    header: {
      title: "Gemurai Platform API",
      subtitle: "Explore our comprehensive API endpoints and learn how to integrate with the Gemurai Platform.",
      searchPlaceholder: "Search endpoints...",
      allCategories: "All"
    },
    categories: {
      authentication: "Authentication",
      userManagement: "User Management",
      products: "Products",
      applications: "Applications",
      rwandaDivisions: "Rwanda Divisions"
    },
    common: {
      requestBody: "Request Body",
      response: "Response",
      authRequired: "Auth Required",
      method: {
        get: "GET",
        post: "POST",
        put: "PUT",
        delete: "DELETE"
      }
    }
  }
}

const fr: Dictionary = {
  apiDocs: {
    title: "Documentation API",
    description: "Documentation complète de l'API pour la plateforme Gemurai",
    header: {
      title: "API de la Plateforme Gemurai",
      subtitle: "Explorez nos points de terminaison API et apprenez à intégrer la plateforme Gemurai.",
      searchPlaceholder: "Rechercher les endpoints...",
      allCategories: "Tous"
    },
    categories: {
      authentication: "Authentification",
      userManagement: "Gestion des utilisateurs",
      products: "Produits",
      applications: "Applications",
      rwandaDivisions: "Divisions du Rwanda"
    },
    common: {
      requestBody: "Corps de la requête",
      response: "Réponse",
      authRequired: "Authentification requise",
      method: {
        get: "GET",
        post: "POST",
        put: "PUT",
        delete: "DELETE"
      }
    }
  }
}

const rw: Dictionary = {
  apiDocs: {
    title: "Inyandiko za API",
    description: "Inyandiko zuzuye za API ya Gemurai Platform",
    header: {
      title: "API ya Gemurai Platform",
      subtitle: "Reba endpoints zacu za API kandi wige uko wakoresha Platform ya Gemurai.",
      searchPlaceholder: "Shakisha endpoints...",
      allCategories: "Zose"
    },
    categories: {
      authentication: "Kwemeza",
      userManagement: "Gucunga Abakoresha",
      products: "Ibicuruzwa",
      applications: "Ubusabe",
      rwandaDivisions: "Imirenge ya Rwanda"
    },
    common: {
      requestBody: "Ibisabwa",
      response: "Igisubizo",
      authRequired: "Bisaba Kwemeza",
      method: {
        get: "GET",
        post: "POST",
        put: "PUT",
        delete: "DELETE"
      }
    }
  }
}

const dictionaries = {
  en,
  fr,
  rw
}

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  return dictionaries[locale as keyof typeof dictionaries] || dictionaries.en
}