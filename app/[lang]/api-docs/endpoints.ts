export const endpointDescriptions = {
  en: {
    auth: {
      login: "Authenticate user and get JWT token",
      logout: "Logout user and invalidate token",
      verify: "Verify authentication token and get user details"
    },
    notifications: {
      list: "List notifications for the authenticated user",
      get: "Get a single notification by ID",
      markRead: "Mark a notification as read"
    },
    dcc: {
      stock: "List DCC users with their products in stock",
      approvedStockRequests: "Get approved stock requests for DCC users",
      users: "List DCC users with their products and profiles"
    },
    notifications: {
      list: "Lister les notifications de l'utilisateur authentifié",
      get: "Obtenir une notification par ID",
      markRead: "Marquer une notification comme lue"
    },
    subscriptions: {
      list: "List user subscriptions",
      create: "Subscribe to a DCC user",
      delete: "Unsubscribe from a DCC user"
    },
    notifications: {
      list: "Kwerekana amatangazo y'umukoresha winjiye",
      get: "Kubona itangazo ukoresheje ID",
      markRead: "Gushyira itangazo mu byasomwe"
    },
    users: {
      register: "Register a new user account",
      list: "Get list of users (admin only)",
      get: "Get user details by ID",
      update: "Update user details",
      delete: "Delete user account"
    },
    products: {
      list: "Get list of products",
      create: "Create new product",
      get: "Get product details",
      update: "Update product details",
      delete: "Delete product"
    },
    applications: {
      list: "Get list of applications",
      submit: "Submit new application",
      get: "Get application details",
      updateStatus: "Update application status",
      getOwn: "Get user's own application",
      evaluate: "Evaluate an application",
      bulkEmail: "Send bulk email to applicants",
      bulkEvaluate: "Perform bulk evaluation of applications"
    },
    rwandaDivisions: {
      provinces: "Get Rwanda administrative divisions",
      districts: "Get districts by province",
      sectors: "Get sectors by district",
      cells: "Get cells by sector",
      villages: "Get villages by cell",
      search: "Search across all administrative divisions"
    },
    wallet: {
      transactions: "Get wallet transactions",
      balance: "Get wallet balance",
      withdraw: "Request wallet withdrawal"
    },
    stock: {
      orders: "Manage stock orders",
      list: "Get stock inventory",
      create: "Create stock order",
      update: "Update stock order status",
      dccStock: "List DCC users with their products in stock"
    },
    formConfig: {
      get: "Get form configuration",
      update: "Update form configuration (admin only)"
    }
  },
  fr: {
    auth: {
      login: "Authentifier l'utilisateur et obtenir un jeton JWT",
      logout: "Déconnecter l'utilisateur et invalider le jeton",
      verify: "Vérifier le jeton d'authentification et obtenir les détails de l'utilisateur"
    },
    dcc: {
      stock: "Lister les utilisateurs DCC avec leurs produits en stock",
      approvedStockRequests: "Obtenir les demandes de stock approuvées pour les utilisateurs DCC",
      users: "Lister les utilisateurs DCC avec leurs produits et profils"
    },
    subscriptions: {
      list: "Lister les abonnements utilisateur",
      create: "S'abonner à un utilisateur DCC",
      delete: "Se désabonner d'un utilisateur DCC"
    },
    users: {
      register: "Créer un nouveau compte utilisateur",
      list: "Obtenir la liste des utilisateurs (admin uniquement)",
      get: "Obtenir les détails d'un utilisateur",
      update: "Mettre à jour les détails d'un utilisateur",
      delete: "Supprimer un compte utilisateur"
    },
    products: {
      list: "Obtenir la liste des produits",
      create: "Créer un nouveau produit",
      get: "Obtenir les détails d'un produit",
      update: "Mettre à jour les détails d'un produit",
      delete: "Supprimer un produit"
    },
    applications: {
      list: "Obtenir la liste des candidatures",
      submit: "Soumettre une nouvelle candidature",
      get: "Obtenir les détails d'une candidature",
      updateStatus: "Mettre à jour le statut d'une candidature",
      getOwn: "Obtenir sa propre candidature",
      evaluate: "Évaluer une candidature",
      bulkEmail: "Envoyer un email groupé aux candidats",
      bulkEvaluate: "Effectuer une évaluation groupée des candidatures"
    },
    rwandaDivisions: {
      provinces: "Obtenir les divisions administratives du Rwanda",
      districts: "Obtenir les districts par province",
      sectors: "Obtenir les secteurs par district",
      cells: "Obtenir les cellules par secteur",
      villages: "Obtenir les villages par cellule",
      search: "Rechercher dans toutes les divisions administratives"
    },
    wallet: {
      transactions: "Obtenir les transactions du portefeuille",
      balance: "Obtenir le solde du portefeuille",
      withdraw: "Demander un retrait du portefeuille"
    },
    stock: {
      orders: "Gérer les commandes de stock",
      list: "Obtenir l'inventaire du stock",
      create: "Créer une commande de stock",
      update: "Mettre à jour le statut de la commande",
      dccStock: "Lister les utilisateurs DCC avec leurs produits en stock"
    },
    formConfig: {
      get: "Obtenir la configuration du formulaire",
      update: "Mettre à jour la configuration du formulaire (admin uniquement)"
    }
  },
  rw: {
    auth: {
      login: "Kwemeza ukoresha no kubona token ya JWT",
      logout: "Gusohoka no guhagarika token",
      verify: "Kugenzura token y'uburenganzira no kubona amakuru y'ukoresha"
    },
    dcc: {
      stock: "Gukurikirana abakoresha DCC n'ibicuruzwa byabo bihari",
      approvedStockRequests: "Kubona ibisabwe by'ibicuruzwa byemejwe kuri abakoresha DCC",
      users: "Gukurikirana abakoresha DCC n'ibicuruzwa byabo n'amakuru yabo"
    },
    subscriptions: {
      list: "Gukurikirana abanyamuryango",
      create: "Kwiyandikisha kuri ukoresha DCC",
      delete: "Gusiba kwiyandikisha kuri ukoresha DCC"
    },
    users: {
      register: "Kwiyandikisha konti nshya",
      list: "Kubona urutonde rw'abakoresha (admin gusa)",
      get: "Kubona amakuru y'ukoresha",
      update: "Guhindura amakuru y'ukoresha",
      delete: "Gusiba konti y'ukoresha"
    },
    products: {
      list: "Kubona urutonde rw'ibicuruzwa",
      create: "Gushyiraho igicuruzwa gishya",
      get: "Kubona amakuru y'igicuruzwa",
      update: "Guhindura amakuru y'igicuruzwa",
      delete: "Gusiba igicuruzwa"
    },
    applications: {
      list: "Kubona urutonde rw'ubusabe",
      submit: "Gutanga ubusabe bushya",
      get: "Kubona amakuru y'ubusabe",
      updateStatus: "Guhindura imiterere y'ubusabe",
      getOwn: "Kubona ubusabe bwawe",
      evaluate: "Gusuzuma ubusabe",
      bulkEmail: "Kohereza imeyili ku basaba benshi",
      bulkEvaluate: "Gukora isuzuma ry'ubusabe bwinshi"
    },
    rwandaDivisions: {
      provinces: "Kubona imirenge ya Rwanda",
      districts: "Kubona uturere dushingiye ku ntara",
      sectors: "Kubona imirenge ishingiye ku karere",
      cells: "Kubona utugari dushingiye ku murenge",
      villages: "Kubona imidugudu ishingiye ku kagari",
      search: "Gushakisha mu nzego z'ubuyobozi zose"
    },
    wallet: {
      transactions: "Kubona ibikorwa by'amafaranga",
      balance: "Kubona amafaranga asigaye",
      withdraw: "Gusaba kubikuza amafaranga"
    },
    stock: {
      orders: "Gucunga ibicuruzwa byasabwe",
      list: "Kubona urutonde rw'ibicuruzwa",
      create: "Gushyiraho gahunda y'ibicuruzwa",
      update: "Kuvugurura imiterere y'ibicuruzwa byasabwe",
      dccStock: "Gukurikirana abakoresha DCC n'ibicuruzwa byabo bihari"
    },
    formConfig: {
      get: "Kubona ibikubiye mu inyandiko",
      update: "Kuvugurura ibikubiye mu inyandiko (admin gusa)"
    }
  }
}

export const endpoints = [
  // Authentication
  {
    category: "Authentication",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/login",
        description: "auth.login",
        requiresAuth: false,
        request: {
          email: "user@example.com",
          password: "password123"
        },
        response: {
          success: true,
          message: "Login successful",
          user: {
            id: "user_id",
            email: "user@example.com",
            name: "User Name",
            role: "CONSUMER",
            permissions: ["dashboard.view"]
          },
          token: "jwt_token_here"
        }
      },
      {
        method: "POST",
        path: "/api/v1/auth/logout",
        description: "auth.logout",
        requiresAuth: true,
        response: {
          success: true,
          message: "Logged out successfully"
        }
      },
      {
        method: "GET",
        path: "/api/v1/auth/verify",
        description: "auth.verify",
        requiresAuth: true,
        response: {
          success: true,
          user: {
            id: "user_id",
            email: "user@example.com",
            name: "User Name",
            role: "CONSUMER",
            permissions: ["dashboard.view"],
            avatar: "avatar_url"
          }
        }
      }
    ]
  },

  // User Registration & Management
  {
    category: "User Management",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/users/register",
        description: "users.register",
        requiresAuth: false,
        request: {
          email: "newuser@example.com",
          name: "New User",
          password: "securepass123",
          phone: "+250780123456"
        },
        response: {
          success: true,
          message: "User registered successfully",
          user: {
            id: "user_id",
            email: "newuser@example.com",
            name: "New User",
            role: "CONSUMER"
          }
        }
      },
      {
        method: "GET",
        path: "/api/v1/users",
        description: "users.list",
        requiresAuth: true,
        response: {
          success: true,
          data: [
            {
              id: "user_id",
              email: "user@example.com",
              name: "User Name",
              role: "CONSUMER"
            }
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 100
          }
        }
      },
      {
        method: "GET",
        path: "/api/v1/users/:id",
        description: "users.get",
        requiresAuth: true,
        response: {
          success: true,
          data: {
            id: "user_id",
            email: "user@example.com",
            name: "User Name",
            role: "CONSUMER",
            permissions: ["dashboard.view"]
          }
        }
      },
      {
        method: "PUT",
        path: "/api/v1/users/:id",
        description: "users.update",
        requiresAuth: true,
        request: {
          name: "Updated Name",
          email: "updated@example.com",
          role: "DCC",
          permissions: ["dashboard.view", "products.view"]
        },
        response: {
          success: true,
          message: "User updated successfully"
        }
      },
      {
        method: "DELETE",
        path: "/api/v1/users/:id",
        description: "users.delete",
        requiresAuth: true,
        response: {
          success: true,
          message: "User deleted successfully"
        }
      }
    ]
  },

  // Products Management
  {
    category: "Products",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/products",
        description: "products.list",
        requiresAuth: true,
        response: {
          success: true,
          data: [
            {
              id: "product_id",
              name: "Product Name",
              description: "Product description",
              price: 1000,
              category: "Category",
              createdAt: "2024-01-01T00:00:00Z"
            }
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 50
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/products",
        description: "products.create",
        requiresAuth: true,
        request: {
          name: "New Product",
          description: "Product description",
          price: 1000,
          category: "Category",
          images: ["image_url"]
        },
        response: {
          success: true,
          message: "Product created successfully",
          data: {
            id: "product_id",
            name: "New Product",
            description: "Product description",
            price: 1000
          }
        }
      },
      {
        method: "GET",
        path: "/api/v1/products/:id",
        description: "products.get",
        requiresAuth: true,
        response: {
          success: true,
          data: {
            id: "product_id",
            name: "Product Name",
            description: "Product description",
            price: 1000,
            category: "Category",
            images: ["image_url"],
            createdAt: "2024-01-01T00:00:00Z"
          }
        }
      },
      {
        method: "PUT",
        path: "/api/v1/products/:id",
        description: "products.update",
        requiresAuth: true,
        request: {
          name: "Updated Product",
          description: "Updated description",
          price: 1500
        },
        response: {
          success: true,
          message: "Product updated successfully"
        }
      },
      {
        method: "DELETE",
        path: "/api/v1/products/:id",
        description: "products.delete",
        requiresAuth: true,
        response: {
          success: true,
          message: "Product deleted successfully"
        }
      }
    ]
  },

  // Applications
  {
    category: "Applications",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/applications",
        description: "applications.list",
        requiresAuth: true,
        response: {
          success: true,
          applications: [
            {
              id: "app_id",
              email: "applicant@example.com",
              phone: "+250780123456",
              status: "PENDING",
              createdAt: "2024-01-01T00:00:00Z",
              currentStep: "Document Verification",
              score: 85,
              level: "ADVANCED"
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 50,
            pages: 5
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/applications",
        description: "applications.submit",
        requiresAuth: false,
        request: {
          email: "applicant@example.com",
          phone: "+250780123456",
          formData: {
            personalInfo: {
              firstName: "John",
              lastName: "Doe",
              idNumber: "1199080123456789"
            },
            businessInfo: {
              name: "Business Name",
              type: "Type",
              location: "Location"
            }
          }
        },
        response: {
          success: true,
          message: "Application submitted successfully",
          applicationId: "app_id"
        }
      },
      {
        method: "GET",
        path: "/api/v1/applications/:id",
        description: "applications.get",
        requiresAuth: true,
        response: {
          success: true,
          data: {
            id: "app_id",
            email: "applicant@example.com",
            phone: "+250780123456",
            status: "PENDING",
            currentStep: "Document Verification",
            score: 85,
            level: "ADVANCED",
            formData: {},
            createdAt: "2024-01-01T00:00:00Z",
            evaluations: [
              {
                id: "eval_id",
                score: 85,
                level: "ADVANCED",
                evaluator: {
                  id: "user_id",
                  name: "Evaluator Name",
                  email: "evaluator@example.com"
                },
                createdAt: "2024-01-01T00:00:00Z"
              }
            ]
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/applications/:id/evaluate",
        description: "applications.evaluate",
        requiresAuth: true,
        request: {
          totalScore: 85,
          metrics: {
            technical: { score: 80, comment: "Good technical skills" },
            communication: { score: 90, comment: "Excellent communication" }
          },
          overallComment: "Strong candidate overall"
        },
        response: {
          success: true,
          data: {
            id: "eval_id",
            applicationId: "app_id",
            score: 85,
            level: "ADVANCED",
            questionScores: {
              technical: { score: 80, comment: "Good technical skills" },
              communication: { score: 90, comment: "Excellent communication" }
            },
            metadata: {
              summary: "Strong candidate overall",
              overallLevel: "ADVANCED",
              evaluatedBy: "user_id",
              evaluatedAt: "2024-01-01T00:00:00Z"
            }
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/applications/bulk-email",
        description: "applications.bulkEmail",
        requiresAuth: true,
        request: {
          applicationIds: ["app_id1", "app_id2"],
          subject: "Application Update",
          message: "Your application has been reviewed"
        },
        response: {
          success: true,
          message: "Bulk email sent successfully",
          sent: 2,
          failed: 0
        }
      }
    ]
  },

  // Wallet Management
  {
    category: "Wallet",
    endpoints: [
      {
        method: "GET",
        path: "/api/wallet",
        description: "wallet.balance",
        requiresAuth: true,
        response: {
          success: true,
          data: {
            id: "wallet_id",
            userId: "user_id",
            balance: 5000,
            minimumBalance: 1000,
            status: "ACTIVE",
            lastWithdrawal: "2024-01-01T00:00:00Z"
          }
        }
      },
      {
        method: "GET",
        path: "/api/wallet/transactions",
        description: "wallet.transactions",
        requiresAuth: true,
        response: {
          success: true,
          data: [
            {
              id: "tx_id",
              type: "CREDIT",
              amount: 1000,
              description: "Payment received",
              status: "COMPLETED",
              createdAt: "2024-01-01T00:00:00Z"
            }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/wallet/transactions/totals",
        description: "wallet.transactions",
        requiresAuth: true,
        response: {
          success: true,
          data: {
            totalDeposits: 5000,
            totalWithdrawals: 2000,
            totalEarnings: 3000
          }
        }
      },
      {
        method: "POST",
        path: "/api/wallet",
        description: "wallet.withdraw",
        requiresAuth: true,
        request: {
          amount: 1000,
          reason: "Business expenses"
        },
        response: {
          success: true,
          data: {
            transaction: {
              id: "tx_id",
              type: "WITHDRAWAL",
              amount: 1000,
              status: "PENDING",
              description: "Business expenses"
            },
            wallet: {
              balance: 4000,
              lastWithdrawal: "2024-01-01T00:00:00Z"
            }
          }
        }
      }
    ]
  },

  // Stock Management
  {
    category: "Stock",
    endpoints: [
      {
        method: "GET",
        path: "/api/stock-orders",
        description: "stock.orders",
        requiresAuth: true,
        response: {
          success: true,
          data: [
            {
              id: "order_id",
              status: "PENDING",
              items: [
                {
                  productId: "prod_id",
                  quantity: 5,
                  price: 1000
                }
              ],
              total: 5000,
              createdAt: "2024-01-01T00:00:00Z",
              dcc: {
                id: "dcc_id",
                name: "DCC Name",
                email: "dcc@example.com"
              }
            }
          ]
        }
      },
      {
        method: "POST",
        path: "/api/v1/stock-orders",
        description: "stock.create",
        requiresAuth: true,
        request: {
          productId: "prod_id",
          quantity: 5,
          comment: "Urgent order"
        },
        response: {
          success: true,
          stockOrder: {
            id: "order_id",
            status: "pending",
            totalAmount: 4400,
            createdAt: "2024-01-01T00:00:00Z"
          },
          pricing: {
            originalPrice: 1000,
            commissionPercentage: 12,
            commissionAmount: 120,
            priceAfterCommission: 880,
            quantity: 5,
            totalAmount: 4400
          }
        }
      },
      {
        method: "PATCH",
        path: "/api/stock-orders/:id",
        description: "stock.update",
        requiresAuth: true,
        request: {
          action: "confirm_payment",
          note: "Payment confirmed via mobile money"
        },
        response: {
          success: true,
          message: "Stock order updated successfully"
        }
      },
      {
        method: "GET",
        path: "/api/dcc/stock",
        description: "stock.list",
        requiresAuth: true,
        response: {
          success: true,
          dccStock: [
            {
              productId: "prod_id",
              name: "Product Name",
              quantity: 10,
              lastUpdated: "2024-01-01T00:00:00Z"
            }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/stock/analytics",
        description: "stock.analytics",
        requiresAuth: true,
        response: {
          success: true,
          data: {
            totalProducts: 10,
            lowStockItems: 2,
            totalOrders: 50,
            pendingOrders: 5
          }
        }
      }
    ]
  },

  // DCC Stock Management
  {
    category: "DCC Stock",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/dcc/stock",
        description: "dcc.stock",
        requiresAuth: true,
        response: {
          success: true,
          data: {
            dccUsers: [
              {
                dccId: "dcc_id",
                dccName: "DCC User",
                dccEmail: "dcc@example.com",
                dccPhone: "+250780000000",
                productsInStock: [
                  {
                    productId: "product_id",
                    productName: "Product Name",
                    productPrice: 2500,
                    productCommission: 15,
                    stockQuantity: 5,
                    priceAfterCommission: 2125,
                    totalValue: 10625
                  }
                ],
                stockSummary: {
                  totalProducts: 1,
                  totalQuantity: 5,
                  totalValue: 10625,
                  averagePrice: 2125
                }
              }
            ],
            summary: {
              totalDCCUsers: 1,
              totalProductsInStock: 1,
              totalQuantityInStock: 5,
              totalValueInStock: 10625
            },
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              pages: 1
            }
          }
        }
      },
      {
        method: "GET",
        path: "/api/v1/dcc/approved-stock-requests",
        description: "dcc.approvedStockRequests",
        requiresAuth: true,
        response: {
          success: true,
          data: [
            {
              orderId: "order_id",
              orderStatus: "payment_confirmed",
              totalAmount: 5000,
              requestDate: "2024-01-01T00:00:00Z",
              products: [
                {
                  productId: "product_id",
                  productName: "Product Name",
                  quantity: 2,
                  orderPrice: 2500,
                  totalValue: 5000
                }
              ],
              payment: {
                status: "CONFIRMED",
                amount: 5000,
                method: "BANK_TRANSFER"
              }
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            pages: 1
          }
        }
      },
      {
        method: "GET",
        path: "/api/v1/dcc-users",
        description: "dcc.users",
        requiresAuth: true,
        response: {
          success: true,
          data: {
            users: [
              {
                id: "user_id",
                name: "DCC User",
                email: "dcc@example.com",
                phone: "+250780000000",
                role: "DCC",
                products: [
                  {
                    id: "product_id",
                    name: "Product Name",
                    price: 2500,
                    stock: 10,
                    commission: 15
                  }
                ],
                productStats: {
                  totalProducts: 1,
                  activeProducts: 1,
                  totalStock: 10,
                  totalValue: 25000
                }
              }
            ]
          }
        }
      }
    ]
  },

  // Notifications
  {
    category: "Notifications",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/notifications",
        description: "notifications.list",
        requiresAuth: true,
        response: {
          success: true,
          data: [
            {
              id: "notif_123",
              type: "PAYMENT_REMINDER",
              title: "Payment pending for order",
              orderId: "order_123",
              read: false,
              createdAt: "2025-01-01T00:00:00Z"
            }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/v1/notifications/:id",
        description: "notifications.get",
        requiresAuth: true,
        response: {
          success: true,
          data: {
            id: "notif_123",
            type: "PAYMENT_REMINDER",
            title: "Payment pending for order",
            orderId: "order_123",
            read: false,
            createdAt: "2025-01-01T00:00:00Z"
          }
        }
      },
      {
        method: "PATCH",
        path: "/api/v1/notifications/:id/read",
        description: "notifications.markRead",
        requiresAuth: true,
        response: {
          success: true,
          message: "Notification marked as read"
        }
      }
    ]
  },

  // Subscriptions
  {
    category: "Subscriptions",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/subscriptions",
        description: "subscriptions.list",
        requiresAuth: true,
        response: {
          success: true,
          data: {
            subscriptions: [
              {
                id: "sub_id",
                subscriberId: "user_id",
                dccId: "dcc_id",
                status: "ACTIVE",
                createdAt: "2024-01-01T00:00:00Z",
                dcc: {
                  id: "dcc_id",
                  name: "DCC Name",
                  email: "dcc@example.com"
                }
              }
            ]
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/subscriptions",
        description: "subscriptions.create",
        requiresAuth: true,
        request: {
          dccId: "dcc_user_id"
        },
        response: {
          success: true,
          message: "Subscription created successfully",
          subscription: {
            id: "sub_id",
            subscriberId: "user_id",
            dccId: "dcc_id",
            status: "ACTIVE",
            createdAt: "2024-01-01T00:00:00Z"
          }
        }
      },
      {
        method: "DELETE",
        path: "/api/v1/subscriptions",
        description: "subscriptions.delete",
        requiresAuth: true,
        request: {
          dccId: "dcc_user_id"
        },
        response: {
          success: true,
          message: "Subscription deleted successfully"
        }
      }
    ]
  },

  // Form Configuration
  {
    category: "Form Configuration",
    endpoints: [
      {
        method: "GET",
        path: "/api/form-config",
        description: "formConfig.get",
        requiresAuth: false,
        response: {
          success: true,
          data: {
            id: "config_id",
            title: "Application Form",
            description: "DCC Application Form",
            sections: [
              {
                id: "section1",
                title: "Personal Information",
                fields: []
              }
            ],
            isActive: true
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/form/config",
        description: "formConfig.update",
        requiresAuth: true,
        request: {
          config: {
            title: "Updated Form",
            description: "Updated form configuration",
            sections: []
          }
        },
        response: {
          success: true,
          config: {
            id: "config_id",
            title: "Updated Form",
            description: "Updated form configuration",
            sections: [],
            isActive: true,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
          }
        }
      }
    ]
  }
]