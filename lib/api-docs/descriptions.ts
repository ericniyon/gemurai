export const endpointDescriptions = {
  en: {
    auth: {
      login: "Authenticate user and get JWT token",
      logout: "Logout user and invalidate token",
      verify: "Verify authentication token and get user details",
      forgotPassword: "Send password reset email to user",
      resetPassword: "Reset user password with token"
    },
    applications: {
      list: "Get a list of all applications with pagination",
      create: "Create a new application with form data",
      get: "Get a specific application by ID",
      updateStatus: "Update application status (approved/rejected/pending)",
      patch: "Partially update application form data",
      evaluate: "Evaluate an application with score and feedback",
      bulkEmail: "Send bulk email to multiple applicants",
      all: "Get all applications with full details (superadmin only)"
    },
    users: {
      profile: "Get the current user's profile information",
      updateProfile: "Update the current user's profile information",
      patchProfile: "Partially update the current user's profile information",
      preferences: "Get the current user's preferences and settings",
      updatePreferences: "Update the current user's preferences and settings",
      patchPreferences: "Partially update the current user's preferences",
      notifications: "Get the current user's notifications",
      updateNotifications: "Update a specific notification (e.g., mark as read)",
      patchNotifications: "Partially update notifications (e.g., mark all as read)",
      payments: "Get the current user's payment history",
      updatePayment: "Update a specific payment status",
      patchPayment: "Partially update payment information (e.g., add notes)",
      register: "Register a new user account",
      list: "Get a list of all users (admin only)",
      updatePassword: "Update user password with current password verification",
      avatar: {
        upload: "Upload user avatar image",
        delete: "Delete user avatar image"
      },
      checkUniqueness: "Check if a field value is unique (email, phone, etc.)",
      upgradeToDcc: "Upgrade user account to DCC role with business information",
      dcc: {
        list: "Get a list of users with DCC role (any authenticated user can access)"
      }
    },
    products: {
      list: "Get a list of all products with pagination",
      create: "Create a new product in the catalog",
      get: "Get a specific product by ID",
      update: "Update product information and pricing",
      patch: "Partially update product information"
    },
    wallet: {
      balance: "Get current wallet balance",
      transactions: "Get wallet transaction history with pagination",
      withdraw: "Request a withdrawal from wallet balance"
    },
    stock: {
      inventory: "Get current stock inventory levels",
      createOrder: "Create a new stock order",
      listOrders: "Get a list of all stock orders with pagination"
    },
    dcc: {
      stock: "List DCC users with their products in stock",
      approvedStockRequests: "Get approved stock requests for DCC users",
      users: {
        basic: "Get basic DCC user information",
        withProducts: "Get DCC users with their own created products (usually empty as DCC users don't create products)",
        withStock: "Get DCC users with their stock from employers",
        withProfile: "Get DCC users with profile information",
        complete: "Get complete DCC user information with all data"
      },
      sales: {
        create: "Record a new sale transaction for DCC user",
        list: "Get DCC sales history with filtering and pagination"
      }
    },
    subscriptions: {
      list: "List user subscriptions",
      create: "Subscribe to a DCC user",
      delete: "Unsubscribe from a DCC user"
    },
    rwandaDivisions: {
      provinces: "Get all provinces in Rwanda",
      districts: "Get all districts in Rwanda",
      sectors: "Get all sectors in Rwanda",
      cells: "Get all cells in Rwanda",
      villages: "Get all villages in Rwanda"
    },
    formConfig: {
      get: "Get the current form configuration",
      update: "Update form configuration (admin only)"
    },
    customer: {
      cart: {
        get: "Get customer's shopping cart items",
        add: "Add item to customer's shopping cart",
        update: "Update cart item quantity",
        remove: "Remove item from shopping cart"
      },
      checkout: {
        process: "Process checkout and create new order"
      },
      orders: {
        list: "Get customer's order history with pagination",
        get: "Get detailed information about a specific order",
        cancel: "Cancel an existing order (if not delivered)"
      },
      tracking: {
        get: "Get order tracking information and timeline",
        update: "Add tracking update to order (admin/DCC only)"
      }
    }
  },
  fr: {
    auth: {
      login: "Authentifier l'utilisateur et obtenir un jeton JWT",
      logout: "Déconnecter l'utilisateur et invalider le jeton",
      verify: "Vérifier le jeton d'authentification et obtenir les détails de l'utilisateur",
      forgotPassword: "Envoyer un email de réinitialisation de mot de passe",
      resetPassword: "Réinitialiser le mot de passe utilisateur avec le jeton"
    },
    applications: {
      list: "Obtenir la liste de toutes les applications avec pagination",
      create: "Créer une nouvelle application avec les données du formulaire",
      get: "Obtenir une application spécifique par ID",
      updateStatus: "Mettre à jour le statut de l'application (approuvé/rejeté/en attente)",
      patch: "Mettre à jour partiellement les données du formulaire d'application",
      evaluate: "Évaluer une application avec une note et des commentaires",
      bulkEmail: "Envoyer un email en masse à plusieurs candidats"
    },
    users: {
      profile: "Obtenir les informations de profil de l'utilisateur actuel",
      updateProfile: "Mettre à jour les informations de profil de l'utilisateur actuel",
      patchProfile: "Mettre à jour partiellement les informations de profil de l'utilisateur actuel",
      preferences: "Obtenir les préférences et paramètres de l'utilisateur actuel",
      updatePreferences: "Mettre à jour les préférences et paramètres de l'utilisateur actuel",
      patchPreferences: "Mettre à jour partiellement les préférences de l'utilisateur",
      notifications: "Obtenir les notifications de l'utilisateur actuel",
      updateNotifications: "Mettre à jour une notification spécifique (ex: marquer comme lu)",
      patchNotifications: "Mettre à jour partiellement les notifications (ex: marquer tout comme lu)",
      payments: "Obtenir l'historique des paiements de l'utilisateur actuel",
      updatePayment: "Mettre à jour le statut d'un paiement spécifique",
      patchPayment: "Mettre à jour partiellement les informations de paiement (ex: ajouter des notes)",
      register: "Enregistrer un nouveau compte utilisateur",
      list: "Obtenir la liste de tous les utilisateurs (admin uniquement)",
      updatePassword: "Mettre à jour le mot de passe utilisateur avec vérification",
      avatar: {
        upload: "Télécharger l'image d'avatar de l'utilisateur",
        delete: "Supprimer l'image d'avatar de l'utilisateur"
      },
      checkUniqueness: "Vérifier si une valeur de champ est unique (email, téléphone, etc.)",
      upgradeToDcc: "Mettre à niveau le compte utilisateur vers le rôle DCC avec les informations commerciales",
      dcc: {
        list: "Obtenir la liste des utilisateurs avec le rôle DCC (tout utilisateur authentifié peut accéder)"
      }
    },
    products: {
      list: "Obtenir la liste de tous les produits avec pagination",
      create: "Créer un nouveau produit dans le catalogue",
      get: "Obtenir un produit spécifique par ID",
      update: "Mettre à jour les informations et prix du produit",
      patch: "Mettre à jour partiellement les informations du produit"
    },
    wallet: {
      balance: "Obtenir le solde actuel du portefeuille",
      transactions: "Obtenir l'historique des transactions du portefeuille avec pagination",
      withdraw: "Demander un retrait du solde du portefeuille"
    },
    stock: {
      inventory: "Obtenir les niveaux d'inventaire actuels",
      createOrder: "Créer une nouvelle commande de stock",
      listOrders: "Obtenir la liste de toutes les commandes de stock avec pagination"
    },
    dcc: {
      stock: "Lister les utilisateurs DCC avec leurs produits en stock",
      approvedStockRequests: "Obtenir les demandes de stock approuvées pour les utilisateurs DCC",
      users: {
        basic: "Obtenir les informations de base des utilisateurs DCC",
        withProducts: "Obtenir les utilisateurs DCC avec leurs propres produits créés (généralement vide car les DCC ne créent pas de produits)",
        withStock: "Obtenir les utilisateurs DCC avec leur stock des employeurs",
        withProfile: "Obtenir les utilisateurs DCC avec les informations de profil",
        complete: "Obtenir les informations complètes des utilisateurs DCC avec toutes les données"
      },
      sales: {
        create: "Enregistrer une nouvelle transaction de vente pour l'utilisateur DCC",
        list: "Obtenir l'historique des ventes DCC avec filtrage et pagination"
      }
    },
    subscriptions: {
      list: "Lister les abonnements utilisateur",
      create: "S'abonner à un utilisateur DCC",
      delete: "Se désabonner d'un utilisateur DCC"
    },
    rwandaDivisions: {
      provinces: "Obtenir toutes les provinces du Rwanda",
      districts: "Obtenir tous les districts du Rwanda",
      sectors: "Obtenir tous les secteurs du Rwanda",
      cells: "Obtenir toutes les cellules du Rwanda",
      villages: "Obtenir tous les villages du Rwanda"
    },
    formConfig: {
      get: "Obtenir la configuration actuelle du formulaire",
      update: "Mettre à jour la configuration du formulaire (admin uniquement)"
    },
    customer: {
      cart: {
        get: "Obtenir les articles du panier d'achat du client",
        add: "Ajouter un article au panier d'achat du client",
        update: "Mettre à jour la quantité d'un article du panier",
        remove: "Supprimer un article du panier d'achat"
      },
      checkout: {
        process: "Traiter la commande et créer une nouvelle commande"
      },
      orders: {
        list: "Obtenir l'historique des commandes du client avec pagination",
        get: "Obtenir des informations détaillées sur une commande spécifique",
        cancel: "Annuler une commande existante (si non livrée)"
      },
      tracking: {
        get: "Obtenir les informations de suivi de commande et la chronologie",
        update: "Ajouter une mise à jour de suivi à la commande (admin/DCC uniquement)"
      }
    }
  },
  rw: {
    auth: {
      login: "Kwemeza ukoresha no kubona token ya JWT",
      logout: "Gusohoka no guhagarika token",
      verify: "Kugenzura token y'uburenganzira no kubona amakuru y'ukoresha",
      forgotPassword: "Kohereza imeyili yo guhindura ijambo ry'ibanga",
      resetPassword: "Guhindura ijambo ry'ibanga ukoresha token"
    },
    applications: {
      list: "Kubona urutonde rw'ubusabe bwose hamwe n'urutonde rw'impapuro",
      create: "Gukora ubusabe bushya hamwe n'amakuru y'ifishi",
      get: "Kubona ubusabe runaka ukoresha ID",
      updateStatus: "Guhindura imiterere y'ubusabe (byemewe/byanze/bitegereje)",
      patch: "Kuvugurura amakuru y'ifishi y'ubusabe gusa",
      evaluate: "Gusuzuma ubusabe hamwe n'amanota n'ibitekerezo",
      bulkEmail: "Kohereza imeyili ku basaba benshi"
    },
    users: {
      profile: "Kubona amakuru y'umwirondoro w'ukoresha ubu",
      updateProfile: "Kuvugurura amakuru y'umwirondoro w'ukoresha ubu",
      patchProfile: "Kuvugurura amakuru y'umwirondoro w'ukoresha ubu gusa",
      preferences: "Kubona ibyifuzo n'ibikubiye by'ukoresha ubu",
      updatePreferences: "Kuvugurura ibyifuzo n'ibikubiye by'ukoresha ubu",
      patchPreferences: "Kuvugurura ibyifuzo by'ukoresha gusa",
      notifications: "Kubona ubutumwa bw'ukoresha ubu",
      updateNotifications: "Kuvugurura ubutumwa runaka (urugero: kumvisha ko byasomwe)",
      patchNotifications: "Kuvugurura ubutumwa gusa (urugero: kumvisha ko byose byasomwe)",
      payments: "Kubona amateka y'amafaranga y'ukoresha ubu",
      updatePayment: "Kuvugurura imiterere y'amafaranga runaka",
      patchPayment: "Kuvugurura amakuru y'amafaranga gusa (urugero: kongeramo ibitekerezo)",
      register: "Kwiyandikisha konti nshya y'ukoresha",
      list: "Kubona urutonde rw'abakoresha bose (admin gusa)",
      updatePassword: "Kuvugurura ijambo ry'ibanga ry'ukoresha hamwe n'ikizamini",
      avatar: {
        upload: "Kohereza ifoto y'ukoresha",
        delete: "Gusiba ifoto y'ukoresha"
      },
      checkUniqueness: "Kugenzura ko agaciro ka kintu nta kindi kihari (imeyili, telefoni, etc.)",
      upgradeToDcc: "Kuvugurura konti y'ukoresha kuri DCC hamwe n'amakuru y'ubucuruzi",
      dcc: {
        list: "Kubona urutonde rw'abakoresha bafite DCC (ukoresha yose yemewe ashobora kujya)"
      }
    },
    products: {
      list: "Kubona urutonde rw'ibicuruzwa byose hamwe n'urutonde rw'impapuro",
      create: "Gushyiraho igicuruzwa gishya mu rutonde",
      get: "Kubona igicuruzwa runaka ukoresha ID",
      update: "Kuvugurura amakuru y'igicuruzwa n'ibiciro",
      patch: "Kuvugurura amakuru y'igicuruzwa gusa"
    },
    wallet: {
      balance: "Kubona amafaranga asigaye muri wallet",
      transactions: "Kubona amateka y'ibikorwa by'amafaranga hamwe n'urutonde rw'impapuro",
      withdraw: "Gusaba kubikura amafaranga muri wallet"
    },
    stock: {
      inventory: "Kubona urwego rw'ibicuruzwa bihari",
      createOrder: "Gushyiraho gahunda nshya y'ibicuruzwa",
      listOrders: "Kubona urutonde rw'ibicuruzwa byasabwe hamwe n'urutonde rw'impapuro"
    },
    dcc: {
      stock: "Gukurikirana abakoresha DCC n'ibicuruzwa byabo bihari",
      approvedStockRequests: "Kubona ibisabwe by'ibicuruzwa byemejwe kuri abakoresha DCC",
      users: {
        basic: "Kubona amakuru y'ibanze ya bakoresha DCC",
        withProducts: "Kubona abakoresha DCC n'ibicuruzwa byabo byakozwe (kenshi ari empty kuko DCC ntibakora ibicuruzwa)",
        withStock: "Kubona abakoresha DCC n'ibicuruzwa byabo biva kuri ba employer",
        withProfile: "Kubona abakoresha DCC n'amakuru yabo y'uburyo",
        complete: "Kubona amakuru yose ya bakoresha DCC hamwe n'amakuru yose"
      },
      sales: {
        create: "Kwiyandikisha ibicuruzwa bishya kuri ukoresha DCC",
        list: "Kubona amateka y'ibicuruzwa bya DCC hamwe no gutunganya"
      }
    },
    subscriptions: {
      list: "Gukurikirana abanyamuryango",
      create: "Kwiyandikisha kuri ukoresha DCC",
      delete: "Gusiba kwiyandikisha kuri ukoresha DCC"
    },
    rwandaDivisions: {
      provinces: "Kubona intara zose za Rwanda",
      districts: "Kubona uturere twose twa Rwanda",
      sectors: "Kubona imirenge yose ya Rwanda",
      cells: "Kubona utugari twose twa Rwanda",
      villages: "Kubona imidugudu yose ya Rwanda"
    },
    formConfig: {
      get: "Kubona ibikubiye mu inyandiko y'ubu",
      update: "Kuvugurura ibikubiye mu inyandiko (admin gusa)"
    },
    customer: {
      cart: {
        get: "Kubona ibintu by'ububiko bw'umukeruzi",
        add: "Kongeramo ikintu mu bubiko bw'umukeruzi",
        update: "Kuvugurura umubare w'ikintu mu bubiko",
        remove: "Gusiba ikintu mu bubiko bw'umukeruzi"
      },
      checkout: {
        process: "Gucunga gahunda yo gucuruza no gukora gahunda nshya"
      },
      orders: {
        list: "Kubona amateka y'amagahunda y'umukeruzi hamwe n'urutonde rw'impapuro",
        get: "Kubona amakuru yuzuye kuri gahunda runaka",
        cancel: "Guhagarika gahunda ihari (iyo itarashyirwa)"
      },
      tracking: {
        get: "Kubona amakuru yo gukurikirana gahunda n'igihe",
        update: "Kongeramo uko gahunda ikomeje (admin/DCC gusa)"
      }
    }
  },
  inventory: {
    warehouses: {
      list: {
        en: "List all warehouses with pagination and filtering",
        rw: "Urutonde rw'ububiko bwose hamwe no gutunganya",
        fr: "Liste de tous les entrepôts avec pagination et filtrage"
      },
      create: {
        en: "Create a new warehouse",
        rw: "Gushinga ububiko bushya",
        fr: "Créer un nouvel entrepôt"
      },
      get: {
        en: "Get warehouse details by ID",
        rw: "Gushaka amakuru y'ububiko ukurikije ID",
        fr: "Obtenir les détails de l'entrepôt par ID"
      },
      update: {
        en: "Update warehouse information",
        rw: "Guhindura amakuru y'ububiko",
        fr: "Mettre à jour les informations de l'entrepôt"
      },
      delete: {
        en: "Delete warehouse (if no dependencies)",
        rw: "Gusiba ububiko (niba nta bintu biterwa)",
        fr: "Supprimer l'entrepôt (si aucune dépendance)"
      }
    },
    locations: {
      list: {
        en: "List storage locations within warehouses",
        rw: "Urutonde rw'aho bibikwa mu bubiko",
        fr: "Liste des emplacements de stockage dans les entrepôts"
      },
      create: {
        en: "Create a new storage location",
        rw: "Gushinga aho bibikwa gishya",
        fr: "Créer un nouvel emplacement de stockage"
      }
    },
    stock: {
      list: {
        en: "Get stock levels across all locations",
        rw: "Gushaka urwego rw'ibicuruzwa mu bice byose",
        fr: "Obtenir les niveaux de stock dans tous les emplacements"
      }
    },
    moves: {
      list: {
        en: "List all stock movements with filtering",
        rw: "Urutonde rw'ibicuruzwa byimuke hamwe no gutunganya",
        fr: "Liste de tous les mouvements de stock avec filtrage"
      },
      create: {
        en: "Create a new stock movement (transfer, in, out)",
        rw: "Gushinga ibicuruzwa byimuke (kwimura, kwinjiza, gusohora)",
        fr: "Créer un nouveau mouvement de stock (transfert, entrée, sortie)"
      },
      confirm: {
        en: "Confirm and execute a pending stock move",
        rw: "Kwemeza no gukora ibicuruzwa byimuke bitegereje",
        fr: "Confirmer et exécuter un mouvement de stock en attente"
      }
    },
    adjustments: {
      list: {
        en: "List inventory adjustments and corrections",
        rw: "Urutonde rw'ihindurwa n'ibyakosorejwe mu bicuruzwa",
        fr: "Liste des ajustements et corrections d'inventaire"
      },
      create: {
        en: "Create inventory adjustment for stock corrections",
        rw: "Gushinga ihindurwa ry'ibicuruzwa ryo gukosora",
        fr: "Créer un ajustement d'inventaire pour les corrections de stock"
      },
      approve: {
        en: "Approve an inventory adjustment",
        rw: "Kwemeza ihindurwa ry'ibicuruzwa",
        fr: "Approuver un ajustement d'inventaire"
      }
    },
    cycleCounts: {
      list: {
        en: "List cycle counts for inventory verification",
        rw: "Urutonde rw'ibara by'ibicuruzwa ryo kugenzura",
        fr: "Liste des comptages cycliques pour vérification d'inventaire"
      },
      create: {
        en: "Create a new cycle count schedule",
        rw: "Gushinga gahunda y'ibara ry'ibicuruzwa",
        fr: "Créer un nouveau programme de comptage cyclique"
      }
    },
    reports: {
      generate: {
        en: "Generate inventory reports and analytics",
        rw: "Gukora raporo z'ibicuruzwa n'isesengura",
        fr: "Générer des rapports d'inventaire et analyses"
      }
    },
    voucher: {
      list: {
        en: "Get a list of all vouchers with pagination and filtering",
        rw: "Urutonde rw'ibyemezo byose hamwe no gutunganya",
        fr: "Liste de tous les bons d'achat avec pagination et filtrage"
      },
      create: {
        en: "Create a new voucher for a DCC user",
        rw: "Gushinga icyemezo gishya kwa mukoresha wa DCC",
        fr: "Créer un nouveau bon d'achat pour un utilisateur DCC"
      },
      validate: {
        en: "Validate a voucher code and check if it can be used",
        rw: "Kugenzura kode y'icyemezo kandi kureba ko kishobora gukoreshwa",
        fr: "Valider un code de bon d'achat et vérifier s'il peut être utilisé"
      },
      get: {
        en: "Get voucher details by ID with transaction history",
        rw: "Gushaka amakuru y'icyemezo ukurikije ID hamwe n'amateka y'ubucuruzi",
        fr: "Obtenir les détails du bon d'achat par ID avec l'historique des transactions"
      },
      update: {
        en: "Update voucher information (value, expiry, status)",
        rw: "Guhindura amakuru y'icyemezo (agaciro, igihe kiraheze, imiterere)",
        fr: "Mettre à jour les informations du bon d'achat (valeur, expiration, statut)"
      },
      delete: {
        en: "Delete a voucher (admin only)",
        rw: "Gusiba icyemezo (admin gusa)",
        fr: "Supprimer un bon d'achat (admin uniquement)"
      }
    }
  }
} 