export interface Endpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  description: string
  requiresAuth?: boolean
  request?: any
  response?: any
}

export interface EndpointCategory {
  category: string
  endpoints: Endpoint[]
}

export const endpoints: EndpointCategory[] = [
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
            permissions: ["dashboard.view"]
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/auth/forgot-password",
        description: "auth.forgotPassword",
        requiresAuth: false,
        request: {
          email: "user@example.com"
        },
        response: {
          success: true,
          message: "If your email exists, a reset link has been sent"
        }
      },
      {
        method: "POST",
        path: "/api/v1/auth/reset-password",
        description: "auth.resetPassword",
        requiresAuth: false,
        request: {
          email: "user@example.com",
          token: "reset_token",
          password: "new_password"
        },
        response: {
          success: true,
          message: "Password has been reset successfully"
        }
      },
      {
        method: "POST",
        path: "/api/v1/auth/password-reset-request",
        description: "auth.passwordResetRequest",
        requiresAuth: false,
        request: {
          nationalId: "1234567890123",
          email: "user@example.com",
          phone: "+250788123456"
        },
        response: {
          success: true,
          message: "Password reset instructions have been sent to your registered contact methods",
          resetToken: "secure_reset_token",
          expiresAt: "2024-01-01T12:15:00.000Z",
          contactMethods: {
            email: true,
            phone: true
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/auth/password-reset-verify",
        description: "auth.passwordResetVerify",
        requiresAuth: false,
        request: {
          email: "user@example.com",
          resetToken: "secure_reset_token",
          nationalId: "1234567890123",
          verificationCode: "123456"
        },
        response: {
          success: true,
          message: "National ID and reset token verified successfully",
          verificationToken: "base64_encoded_verification_token",
          user: {
            name: "User Name",
            email: "user@example.com"
          },
          nextStep: "set_new_password"
        }
      },
      {
        method: "POST",
        path: "/api/v1/auth/password-reset-complete",
        description: "auth.passwordResetComplete",
        requiresAuth: false,
        request: {
          verificationToken: "base64_encoded_verification_token",
          newPassword: "NewSecurePassword123!",
          confirmPassword: "NewSecurePassword123!"
        },
        response: {
          success: true,
          message: "Password has been reset successfully",
          user: {
            name: "User Name",
            email: "user@example.com"
          },
          resetAt: "2024-01-01T12:00:00.000Z"
        }
      }
    ]
  },
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
              id: "APP-123",
              status: "pending",
              formData: {
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                phone: "+250700000000"
              },
              createdAt: "2024-03-01T12:00:00Z",
              updatedAt: "2024-03-01T12:00:00Z"
            }
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 100,
            totalPages: 10
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/applications",
        description: "applications.create",
        requiresAuth: true,
        request: {
          formData: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            phone: "+250700000000",
            dateOfBirth: "1990-01-01",
            gender: "Male",
            nationalId: "1234567890123456",
            province: "Northern Province",
            district: "Musanze",
            sector: "Muhoza",
            cell: "Cyabararika",
            village: "Kagano"
          }
        },
        response: {
          success: true,
          application: {
            id: "APP-123",
            status: "pending",
            createdAt: "2024-03-01T12:00:00Z",
            updatedAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "GET",
        path: "/api/v1/applications/{id}",
        description: "applications.get",
        requiresAuth: true,
        response: {
          success: true,
          application: {
            id: "APP-123",
            status: "pending",
            formData: {
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com"
            },
            createdAt: "2024-03-01T12:00:00Z",
            updatedAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "PUT",
        path: "/api/v1/applications/{id}/status",
        description: "applications.updateStatus",
        requiresAuth: true,
        request: {
          status: "approved",
          reason: "Meets all requirements"
        },
        response: {
          success: true,
          message: "Application status updated",
          application: {
            id: "APP-123",
            status: "approved",
            updatedAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/applications/evaluate",
        description: "applications.evaluate",
        requiresAuth: true,
        request: {
          applicationId: "APP-123",
          score: 85,
          feedback: "Good application with all requirements met"
        },
        response: {
          success: true,
          message: "Application evaluated successfully",
          evaluation: {
            id: "EVAL-123",
            score: 85,
            feedback: "Good application with all requirements met",
            createdAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/applications/bulk-email",
        description: "applications.bulkEmail",
        requiresAuth: true,
        request: {
          applicationIds: ["app_123", "app_456"],
          subject: "Application Update",
          message: "Your application has been processed."
        },
        response: {
          success: true,
          message: "Bulk email sent successfully",
          data: {
            sent: 2,
            failed: 0
          }
        }
      },
      {
        method: "GET",
        path: "/api/v1/applications/all",
        description: "applications.all",
        requiresAuth: true,
        request: null,
        response: {
          success: true,
          data: [
            {
              id: "APP-1751889248174-lxmjpw0",
              userId: "user_123",
              phone: "+250788123456",
              email: "applicant@example.com",
              status: "SUBMITTED",
              formData: {
                personalInfo: {
                  firstName: "John",
                  lastName: "Doe",
                  nationalId: "1199000000000000"
                }
              },
              nationalId: "1199000000000000",
              currentStep: 1,
              notes: null,
              dccCreated: false,
              createdAt: "2024-03-01T12:00:00Z",
              updatedAt: "2024-03-01T12:00:00Z",
              user: {
                id: "user_123",
                email: "user@example.com",
                name: "John Doe",
                role: "APPLICANT"
              },
              evaluations: [
                {
                  id: "eval_123",
                  type: "VULNERABILITY",
                  score: 7.5,
                  totalScore: 10,
                  overallLevel: "MEDIUM",
                  createdAt: "2024-03-02T10:00:00Z",
                  evaluator: {
                    id: "evaluator_123",
                    email: "evaluator@example.com",
                    name: "Jane Smith"
                  }
                }
              ],
              dccProfile: null
            }
          ],
          meta: {
            page: 1,
            limit: 50,
            total: 150,
            totalPages: 3,
            hasNext: true,
            hasPrev: false,
            stats: {
              total: 150,
              byStatus: {
                SUBMITTED: 120,
                APPROVED: 20,
                REJECTED: 5,
                PENDING: 5
              },
              withEvaluations: 80,
              withDccProfile: 20,
              dccCreated: 15
            }
          },
          message: "Retrieved 50 applications out of 150 total"
        }
      },
      {
        method: "PATCH",
        path: "/api/v1/applications/{id}",
        description: "applications.patch",
        requiresAuth: true,
        request: {
          formData: {
            phone: "+250788123456"
          }
        },
        response: {
          success: true,
          message: "Application partially updated successfully",
          application: {
            id: "APP-123",
            status: "pending",
            formData: {
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com",
              phone: "+250788123456"
            },
            updatedAt: "2024-03-01T12:00:00Z"
          }
        }
      }
    ]
  },
  {
    category: "Users",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/users/profile",
        description: "users.profile",
        requiresAuth: true,
        response: {
          success: true,
          user: {
            id: "USR-123",
            name: "John Doe",
            email: "john@example.com",
            phone: "+250700000000",
            role: "CONSUMER",
            permissions: ["dashboard.view"],
            createdAt: "2024-03-01T12:00:00Z",
            updatedAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "PUT",
        path: "/api/v1/users/profile",
        description: "users.updateProfile",
        requiresAuth: true,
        request: {
          name: "John Doe",
          email: "john@example.com",
          phone: "+250700000000"
        },
        response: {
          success: true,
          message: "Profile updated successfully",
          user: {
            id: "USR-123",
            name: "John Doe",
            email: "john@example.com",
            phone: "+250700000000",
            role: "CONSUMER",
            updatedAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "PATCH",
        path: "/api/v1/users/profile",
        description: "users.patchProfile",
        requiresAuth: true,
        request: {
          name: "John Doe"
        },
        response: {
          success: true,
          message: "Profile partially updated successfully",
          user: {
            id: "USR-123",
            name: "John Doe",
            email: "john@example.com",
            phone: "+250700000000",
            role: "CONSUMER",
            updatedAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "GET",
        path: "/api/v1/users/preferences",
        description: "users.preferences",
        requiresAuth: true,
        response: {
          success: true,
          preferences: {
            id: "pref_123",
            userId: "USR-123",
            theme: "light",
            language: "en",
            notifications: {
              email: true,
              sms: false,
              push: true
            },
            privacy: {
              profileVisibility: "public",
              showEmail: true,
              showPhone: false
            },
            createdAt: "2024-03-01T12:00:00Z",
            updatedAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "PUT",
        path: "/api/v1/users/preferences",
        description: "users.updatePreferences",
        requiresAuth: true,
        request: {
          theme: "dark",
          language: "rw",
          notifications: {
            email: true,
            sms: true,
            push: false
          },
          privacy: {
            profileVisibility: "private",
            showEmail: false,
            showPhone: true
          }
        },
        response: {
          success: true,
          message: "Preferences updated successfully",
          preferences: {
            id: "pref_123",
            userId: "USR-123",
            theme: "dark",
            language: "rw",
            notifications: {
              email: true,
              sms: true,
              push: false
            },
            privacy: {
              profileVisibility: "private",
              showEmail: false,
              showPhone: true
            },
            updatedAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "PATCH",
        path: "/api/v1/users/preferences",
        description: "users.patchPreferences",
        requiresAuth: true,
        request: {
          theme: "dark"
        },
        response: {
          success: true,
          message: "Preferences partially updated successfully",
          preferences: {
            id: "pref_123",
            userId: "USR-123",
            theme: "dark",
            language: "en",
            notifications: {
              email: true,
              sms: false,
              push: true
            },
            privacy: {
              profileVisibility: "public",
              showEmail: true,
              showPhone: false
            },
            updatedAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "GET",
        path: "/api/v1/users/notifications",
        description: "users.notifications",
        requiresAuth: true,
        response: {
          success: true,
          notifications: [
            {
              id: "notif_123",
              userId: "USR-123",
              type: "system",
              title: "Welcome to TCP",
              message: "Welcome to the Trade Center Platform!",
              isRead: false,
              createdAt: "2024-03-01T12:00:00Z"
            },
            {
              id: "notif_124",
              userId: "USR-123",
              type: "transaction",
              title: "Payment Received",
              message: "You received RWF 1,000 from commission",
              isRead: true,
              createdAt: "2024-03-01T10:00:00Z"
            }
          ],
          meta: {
            total: 25,
            unread: 5,
            page: 1,
            limit: 10
          }
        }
      },
      {
        method: "PUT",
        path: "/api/v1/users/notifications",
        description: "users.updateNotifications",
        requiresAuth: true,
        request: {
          notificationId: "notif_123",
          isRead: true
        },
        response: {
          success: true,
          message: "Notification updated successfully",
          notification: {
            id: "notif_123",
            userId: "USR-123",
            type: "system",
            title: "Welcome to TCP",
            message: "Welcome to the Trade Center Platform!",
            isRead: true,
            updatedAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "PATCH",
        path: "/api/v1/users/notifications",
        description: "users.patchNotifications",
        requiresAuth: true,
        request: {
          markAllAsRead: true
        },
        response: {
          success: true,
          message: "All notifications marked as read",
          updatedCount: 5
        }
      },
      {
        method: "GET",
        path: "/api/v1/users/payments",
        description: "users.payments",
        requiresAuth: true,
        response: {
          success: true,
          payments: [
            {
              id: "pay_123",
              userId: "USR-123",
              type: "commission",
              amount: 1000.00,
              currency: "RWF",
              status: "completed",
              description: "Commission from product sale",
              transactionId: "txn_123",
              createdAt: "2024-03-01T12:00:00Z"
            },
            {
              id: "pay_124",
              userId: "USR-123",
              type: "withdrawal",
              amount: 500.00,
              currency: "RWF",
              status: "pending",
              description: "Wallet withdrawal request",
              transactionId: "txn_124",
              createdAt: "2024-03-01T10:00:00Z"
            }
          ],
          meta: {
            total: 15,
            totalAmount: 5000.00,
            page: 1,
            limit: 10
          }
        }
      },
      {
        method: "PUT",
        path: "/api/v1/users/payments",
        description: "users.updatePayment",
        requiresAuth: true,
        request: {
          paymentId: "pay_124",
          status: "approved"
        },
        response: {
          success: true,
          message: "Payment status updated successfully",
          payment: {
            id: "pay_124",
            userId: "USR-123",
            type: "withdrawal",
            amount: 500.00,
            currency: "RWF",
            status: "approved",
            description: "Wallet withdrawal request",
            transactionId: "txn_124",
            updatedAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "PATCH",
        path: "/api/v1/users/payments",
        description: "users.patchPayment",
        requiresAuth: true,
        request: {
          paymentId: "pay_124",
          notes: "Approved by admin"
        },
        response: {
          success: true,
          message: "Payment notes updated successfully",
          payment: {
            id: "pay_124",
            userId: "USR-123",
            type: "withdrawal",
            amount: 500.00,
            currency: "RWF",
            status: "pending",
            description: "Wallet withdrawal request",
            notes: "Approved by admin",
            transactionId: "txn_124",
            updatedAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/users/register",
        description: "users.register",
        requiresAuth: false,
        request: {
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
          phone: "+250700000000"
        },
        response: {
          success: true,
          message: "User registered successfully",
          user: {
            id: "USR-123",
            name: "John Doe",
            email: "john@example.com",
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
          users: [
            {
              id: "USR-123",
              name: "John Doe",
              email: "john@example.com",
              role: "CONSUMER",
              createdAt: "2024-03-01T12:00:00Z"
            }
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 100,
            totalPages: 10
          }
        }
      },
      {
        method: "PUT",
        path: "/api/v1/users/{id}/password",
        description: "users.updatePassword",
        requiresAuth: true,
        request: {
          currentPassword: "old_password",
          newPassword: "new_password"
        },
        response: {
          success: true,
          message: "Password updated successfully"
        }
      },
      {
        method: "GET",
        path: "/api/v1/users/dcc",
        description: "users.dcc.list",
        requiresAuth: true,
        request: null,
        response: {
          success: true,
          data: [
            {
              id: "user_123",
              email: "dcc@example.com",
              name: "John Doe",
              phone: "+250788123456",
              avatar: null,
              isActive: true,
              role: "DCC",
              roleDescription: "Digital Community Center staff",
              roleAssignedAt: "2024-03-01T12:00:00Z",
              roleActive: true,
              createdAt: "2024-03-01T12:00:00Z",
              updatedAt: "2024-03-15T08:30:00Z",
              dccProfile: {
                id: "profile_123",
                level: "LEVEL_C",
                rating: 4.5,
                totalSales: "RWF 150,000",
                monthlySales: "RWF 50,000",
                productsAvailable: 25,
                status: "active",
                location: "Kigali",
                specialties: ["electronics", "household"]
              }
            }
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3,
            hasNext: true,
            hasPrev: false
          },
          message: "Found 25 DCC users"
        }
      },
      {
        method: "POST",
        path: "/api/v1/users/avatar",
        description: "users.avatar.upload",
        requiresAuth: true,
        request: {
          avatar: "FormData with image file"
        },
        response: {
          success: true,
          message: "Avatar uploaded successfully",
          avatar: {
            id: "avatar_123",
            userId: "USR-123",
            url: "/uploads/avatars/user_123.jpg",
            filename: "user_123.jpg",
            size: 102400,
            mimeType: "image/jpeg",
            uploadedAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "DELETE",
        path: "/api/v1/users/avatar",
        description: "users.avatar.delete",
        requiresAuth: true,
        response: {
          success: true,
          message: "Avatar deleted successfully"
        }
      },
      {
        method: "POST",
        path: "/api/v1/users/check-uniqueness",
        description: "users.checkUniqueness",
        requiresAuth: false,
        request: {
          field: "email",
          value: "user@example.com"
        },
        response: {
          success: true,
          isUnique: true,
          message: "Email is available"
        }
      },
      {
        method: "POST",
        path: "/api/v1/users/upgrade-to-dcc",
        description: "users.upgradeToDcc",
        requiresAuth: true,
        request: {
          applicationId: "app_123",
          businessName: "My Business",
          businessType: "retail",
          location: "Kigali",
          specialties: ["electronics", "household"]
        },
        response: {
          success: true,
          message: "User upgraded to DCC successfully",
          user: {
            id: "USR-123",
            role: "DCC",
            dccProfile: {
              id: "profile_123",
              level: "LEVEL_C",
              status: "active",
              businessName: "My Business",
              businessType: "retail",
              location: "Kigali",
              specialties: ["electronics", "household"]
            }
          }
        }
      }
    ]
  },
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
          products: [
            {
              id: "PROD-123",
              name: "Health Kit",
              description: "Basic health monitoring kit",
              price: 50.00,
              currency: "RWF",
              category: "Health Equipment",
              inStock: true,
              quantity: 100
            }
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 50,
            totalPages: 5
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/products",
        description: "products.create",
        requiresAuth: true,
        request: {
          name: "Health Kit",
          description: "Basic health monitoring kit",
          price: 50.00,
          currency: "RWF",
          category: "Health Equipment",
          quantity: 100
        },
        response: {
          success: true,
          product: {
            id: "PROD-123",
            name: "Health Kit",
            description: "Basic health monitoring kit",
            price: 50.00,
            currency: "RWF",
            category: "Health Equipment",
            quantity: 100,
            createdAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "GET",
        path: "/api/v1/products/{id}",
        description: "products.get",
        requiresAuth: true,
        response: {
          success: true,
          product: {
            id: "PROD-123",
            name: "Health Kit",
            description: "Basic health monitoring kit",
            price: 50.00,
            currency: "RWF",
            category: "Health Equipment",
            quantity: 100,
            createdAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "PUT",
        path: "/api/v1/products/{id}",
        description: "products.update",
        requiresAuth: true,
        request: {
          name: "Advanced Health Kit",
          description: "Advanced health monitoring kit",
          price: 75.00,
          quantity: 150
        },
        response: {
          success: true,
          product: {
            id: "PROD-123",
            name: "Advanced Health Kit",
            description: "Advanced health monitoring kit",
            price: 75.00,
            currency: "RWF",
            category: "Health Equipment",
            quantity: 150,
            updatedAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "PATCH",
        path: "/api/v1/products/{id}",
        description: "products.patch",
        requiresAuth: true,
        request: {
          price: 75.00
        },
        response: {
          success: true,
          message: "Product partially updated successfully",
          product: {
            id: "PROD-123",
            name: "Health Kit",
            description: "Basic health monitoring kit",
            price: 75.00,
            currency: "RWF",
            category: "Health Equipment",
            quantity: 100,
            updatedAt: "2024-03-01T12:00:00Z"
          }
        }
      }
    ]
  },
  {
    category: "Wallet",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/wallet/balance",
        description: "wallet.balance",
        requiresAuth: true,
        response: {
          success: true,
          balance: {
            amount: 1000.00,
            currency: "RWF",
            lastUpdated: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "GET",
        path: "/api/v1/wallet/transactions",
        description: "wallet.transactions",
        requiresAuth: true,
        response: {
          success: true,
          transactions: [
            {
              id: "TXN-123",
              type: "credit",
              amount: 100.00,
              currency: "RWF",
              description: "Commission from sale",
              createdAt: "2024-03-01T12:00:00Z"
            }
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 50,
            totalPages: 5
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/wallet/withdraw",
        description: "wallet.withdraw",
        requiresAuth: true,
        request: {
          amount: 500.00,
          method: "mobile_money",
          phoneNumber: "+250700000000"
        },
        response: {
          success: true,
          message: "Withdrawal request submitted",
          withdrawalRequest: {
            id: "WDR-123",
            amount: 500.00,
            status: "pending",
            createdAt: "2024-03-01T12:00:00Z"
          }
        }
      }
    ]
  },
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
        path: "/api/v1/notifications/{id}",
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
        path: "/api/v1/notifications/{id}/read",
        description: "notifications.markRead",
        requiresAuth: true,
        response: {
          success: true,
          message: "Notification marked as read"
        }
      }
    ]
  },
  {
    category: "Stock",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/stock/inventory",
        description: "stock.inventory",
        requiresAuth: true,
        response: {
          success: true,
          inventory: [
            {
              productId: "PROD-123",
              productName: "Health Kit",
              quantity: 100,
              reserved: 10,
              available: 90,
              lastUpdated: "2024-03-01T12:00:00Z"
            }
          ]
        }
      },
      {
        method: "POST",
        path: "/api/v1/stock/orders",
        description: "stock.createOrder",
        requiresAuth: true,
        request: {
          items: [
            {
              productId: "PROD-123",
              quantity: 5
            }
          ],
          deliveryAddress: "Kigali, Rwanda",
          notes: "Urgent delivery required"
        },
        response: {
          success: true,
          order: {
            id: "ORD-123",
            status: "pending",
            totalAmount: 250.00,
            createdAt: "2024-03-01T12:00:00Z"
          }
        }
      },
      {
        method: "GET",
        path: "/api/v1/stock/orders",
        description: "stock.listOrders",
        requiresAuth: true,
        response: {
          success: true,
          orders: [
            {
              id: "ORD-123",
              status: "pending",
              totalAmount: 250.00,
              createdAt: "2024-03-01T12:00:00Z"
            }
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3
          }
        }
      }
    ]
  },
  {
    category: "Rwanda Divisions",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/rwanda-divisions/provinces",
        description: "rwandaDivisions.provinces",
        requiresAuth: false,
        response: {
          success: true,
          provinces: [
            {
              id: "northern",
              name: "Northern Province",
              nameRw: "Amajyaruguru"
            },
            {
              id: "western",
              name: "Western Province",
              nameRw: "Uburasirazuba"
            }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/v1/rwanda-divisions/districts",
        description: "rwandaDivisions.districts",
        requiresAuth: false,
        response: {
          success: true,
          districts: [
            {
              id: "musanze",
              name: "Musanze",
              province: "Northern Province"
            }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/v1/rwanda-divisions/sectors",
        description: "rwandaDivisions.sectors",
        requiresAuth: false,
        response: {
          success: true,
          sectors: [
            {
              id: "muhoza",
              name: "Muhoza",
              district: "Musanze"
            }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/v1/rwanda-divisions/cells",
        description: "rwandaDivisions.cells",
        requiresAuth: false,
        response: {
          success: true,
          cells: [
            {
              id: "cyabararika",
              name: "Cyabararika",
              sector: "Muhoza"
            }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/v1/rwanda-divisions/villages",
        description: "rwandaDivisions.villages",
        requiresAuth: false,
        response: {
          success: true,
          villages: [
            {
              id: "kagano",
              name: "Kagano",
              cell: "Cyabararika"
            }
          ]
        }
      }
    ]
  },
  {
    category: "Inventory Management",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/inventory/warehouses",
        description: "inventory.warehouses.list",
        requiresAuth: true,
        systemUserOnly: true, // Only SUPER_ADMIN
        response: {
          success: true,
          data: [
            {
              id: "wh_123",
              name: "Main Warehouse",
              code: "WH001",
              address: "123 Storage St",
              phone: "+1234567890",
              email: "warehouse@example.com",
              isActive: true,
              locations: [
                {
                  id: "loc_123",
                  name: "Aisle A1",
                  type: "SHELF",
                  isActive: true
                }
              ]
            }
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 5,
            totalPages: 1
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/inventory/warehouses",
        description: "inventory.warehouses.create",
        requiresAuth: true,
        systemUserOnly: true, // Only SUPER_ADMIN
        request: {
          name: "Main Warehouse",
          code: "WH001",
          address: "123 Storage St",
          phone: "+1234567890",
          email: "warehouse@example.com"
        },
        response: {
          success: true,
          data: {
            id: "wh_123",
            name: "Main Warehouse",
            code: "WH001",
            address: "123 Storage St",
            phone: "+1234567890",
            email: "warehouse@example.com",
            isActive: true,
            createdAt: "2024-03-01T12:00:00Z"
          },
          message: "Warehouse created successfully"
        }
      },
      {
        method: "GET",
        path: "/api/v1/inventory/stock",
        description: "inventory.stock.list",
        requiresAuth: true,
        systemUserOnly: true, // Only SUPER_ADMIN
        response: {
          success: true,
          data: [
            {
              id: "stock_123",
              productId: "prod_123",
              product: {
                id: "prod_123",
                name: "Health Kit",
                sku: "HK001",
                description: "Basic health supplies"
              },
              warehouse: {
                id: "wh_123",
                name: "Main Warehouse",
                code: "WH001"
              },
              location: {
                id: "loc_123",
                name: "Aisle A1",
                type: "SHELF"
              },
              quantity: 100,
              reservedQuantity: 10,
              available: 90,
              unitCost: 25.00,
              minQuantity: 20,
              isLowStock: false,
              lastUpdated: "2024-03-01T12:00:00Z"
            }
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 50,
            totalPages: 5
          },
          summary: {
            totalItems: 50,
            totalQuantity: 5000,
            totalReserved: 500,
            totalAvailable: 4500
          }
        }
      },
      {
        method: "GET",
        path: "/api/v1/inventory/moves",
        description: "inventory.moves.list",
        requiresAuth: true,
        systemUserOnly: true, // Only SUPER_ADMIN
        response: {
          success: true,
          data: [
            {
              id: "move_123",
              type: "TRANSFER",
              reference: "TRF001",
              status: "PENDING",
              product: {
                id: "prod_123",
                name: "Health Kit",
                sku: "HK001"
              },
              quantity: 10,
              fromWarehouse: {
                id: "wh_001",
                name: "Main Warehouse",
                code: "WH001"
              },
              toWarehouse: {
                id: "wh_002",
                name: "Branch Warehouse",
                code: "WH002"
              },
              user: {
                id: "user_123",
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com"
              },
              createdAt: "2024-03-01T12:00:00Z"
            }
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/inventory/moves",
        description: "inventory.moves.create",
        requiresAuth: true,
        systemUserOnly: true, // Only SUPER_ADMIN
        request: {
          type: "TRANSFER",
          productId: "prod_123",
          quantity: 10,
          fromWarehouseId: "wh_001",
          toWarehouseId: "wh_002",
          reference: "TRF001",
          description: "Stock transfer between warehouses"
        },
        response: {
          success: true,
          data: {
            id: "move_123",
            type: "TRANSFER",
            reference: "TRF001",
            status: "PENDING",
            quantity: 10,
            createdAt: "2024-03-01T12:00:00Z"
          },
          message: "Stock move created successfully"
        }
      },
      {
        method: "PUT",
        path: "/api/v1/inventory/moves/{id}/confirm",
        description: "inventory.moves.confirm",
        requiresAuth: true,
        systemUserOnly: true, // Only SUPER_ADMIN
        response: {
          success: true,
          data: {
            id: "move_123",
            type: "TRANSFER",
            reference: "TRF001",
            status: "CONFIRMED",
            executedAt: "2024-03-01T12:00:00Z"
          },
          message: "Stock move confirmed successfully"
        }
      },
      {
        method: "GET",
        path: "/api/v1/inventory/adjustments",
        description: "inventory.adjustments.list",
        requiresAuth: true,
        systemUserOnly: true, // Only SUPER_ADMIN
        response: {
          success: true,
          data: [
            {
              id: "adj_123",
              type: "CORRECTION",
              reference: "ADJ001",
              status: "PENDING",
              product: {
                id: "prod_123",
                name: "Health Kit",
                sku: "HK001"
              },
              warehouse: {
                id: "wh_123",
                name: "Main Warehouse",
                code: "WH001"
              },
              quantityBefore: 100,
              quantityAfter: 95,
              adjustmentQuantity: -5,
              reason: "Damaged goods",
              user: {
                id: "user_123",
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com"
              },
              createdAt: "2024-03-01T12:00:00Z"
            }
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 15,
            totalPages: 2
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/inventory/adjustments",
        description: "inventory.adjustments.create",
        requiresAuth: true,
        systemUserOnly: true, // Only SUPER_ADMIN
        request: {
          type: "CORRECTION",
          productId: "prod_123",
          warehouseId: "wh_123",
          quantityBefore: 100,
          quantityAfter: 95,
          reason: "Damaged goods"
        },
        response: {
          success: true,
          data: {
            id: "adj_123",
            type: "CORRECTION",
            status: "PENDING",
            quantityBefore: 100,
            quantityAfter: 95,
            adjustmentQuantity: -5,
            reason: "Damaged goods",
            createdAt: "2024-03-01T12:00:00Z"
          },
          message: "Inventory adjustment created successfully"
        }
      },
      {
        method: "PUT",
        path: "/api/v1/inventory/adjustments/{id}/approve",
        description: "inventory.adjustments.approve",
        requiresAuth: true,
        systemUserOnly: true, // Only SUPER_ADMIN
        response: {
          success: true,
          data: {
            id: "adj_123",
            type: "CORRECTION",
            status: "APPROVED",
            approvedAt: "2024-03-01T12:00:00Z",
            approvedBy: {
              id: "user_456",
              firstName: "Jane",
              lastName: "Smith",
              email: "jane@example.com"
            }
          },
          message: "Inventory adjustment approved successfully"
        }
      },
      {
        method: "GET",
        path: "/api/v1/inventory/cycle-counts",
        description: "inventory.cycleCounts.list",
        requiresAuth: true,
        systemUserOnly: true, // Only SUPER_ADMIN
        response: {
          success: true,
          data: [
            {
              id: "cc_123",
              name: "Monthly Count - Warehouse A",
              reference: "CC001",
              status: "SCHEDULED",
              warehouse: {
                id: "wh_123",
                name: "Main Warehouse",
                code: "WH001"
              },
              scheduledDate: "2024-03-15T00:00:00Z",
              user: {
                id: "user_123",
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com"
              },
              createdAt: "2024-03-01T12:00:00Z"
            }
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 8,
            totalPages: 1
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/inventory/cycle-counts",
        description: "inventory.cycleCounts.create",
        requiresAuth: true,
        systemUserOnly: true, // Only SUPER_ADMIN
        request: {
          name: "Monthly Count - Warehouse A",
          warehouseId: "wh_123",
          scheduledDate: "2024-03-15",
          items: [
            {
              productId: "prod_123",
              expectedQuantity: 100
            }
          ]
        },
        response: {
          success: true,
          data: {
            id: "cc_123",
            name: "Monthly Count - Warehouse A",
            status: "SCHEDULED",
            scheduledDate: "2024-03-15T00:00:00Z",
            items: [
              {
                id: "cci_123",
                productId: "prod_123",
                expectedQuantity: 100,
                actualQuantity: null,
                status: "PENDING"
              }
            ],
            createdAt: "2024-03-01T12:00:00Z"
          },
          message: "Cycle count created successfully"
        }
      },
      {
        method: "GET",
        path: "/api/v1/inventory/reports",
        description: "inventory.reports.generate",
        requiresAuth: true,
        systemUserOnly: true, // Only SUPER_ADMIN
        response: {
          success: true,
          data: {
            summary: {
              totalItems: 150,
              totalQuantity: 5000,
              totalValue: 125000.00,
              lowStockItems: 15,
              outOfStockItems: 3
            },
            items: [
              {
                productId: "prod_123",
                productName: "Health Kit",
                sku: "HK001",
                quantity: 100,
                reserved: 10,
                available: 90,
                unitCost: 25.00,
                totalValue: 2500.00,
                warehouse: "Main Warehouse",
                location: "Aisle A1"
              }
            ]
          }
        }
      }
    ]
  },

  // DCC Sales Management
  {
    category: "DCC Sales",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/dcc/sales",
        description: "dcc.sales.create",
        requiresAuth: true,
        request: {
          productId: "product_id",
          quantity: 2,
          salePrice: 3000,
          customerName: "John Doe",
          customerPhone: "+250780000000",
          customerEmail: "customer@example.com",
          notes: "Customer requested delivery"
        },
        response: {
          success: true,
          data: {
            sale: {
              id: "sale_id",
              dccId: "dcc_id",
              productId: "product_id",
              productName: "Product Name",
              quantity: 2,
              salePrice: 3000,
              totalRevenue: 6000,
              profit: 875,
              customerName: "John Doe",
              customerPhone: "+250780000000",
              customerEmail: "customer@example.com",
              notes: "Customer requested delivery",
              createdAt: "2024-01-01T00:00:00Z"
            },
            transaction: {
              id: "transaction_id",
              walletId: "wallet_id",
              type: "SALE",
              amount: 6000,
              description: "Sale of Product Name (2 units)",
              balance: 15000,
              createdAt: "2024-01-01T00:00:00Z"
            },
            stockUpdate: {
              previousStock: 5,
              newStock: 3,
              deductedQuantity: 2
            }
          }
        }
      },
      {
        method: "GET",
        path: "/api/v1/dcc/sales",
        description: "dcc.sales.list",
        requiresAuth: true,
        request: {
          page: 1,
          limit: 10,
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          productId: "product_id"
        },
        response: {
          success: true,
          data: {
            sales: [
              {
                id: "sale_id",
                dccId: "dcc_id",
                productId: "product_id",
                productName: "Product Name",
                quantity: 2,
                salePrice: 3000,
                totalRevenue: 6000,
                profit: 875,
                customerName: "John Doe",
                customerPhone: "+250780000000",
                customerEmail: "customer@example.com",
                notes: "Customer requested delivery",
                createdAt: "2024-01-01T00:00:00Z"
              }
            ],
            summary: {
              totalSales: 25,
              totalRevenue: 75000,
              totalProfit: 12500,
              totalUnits: 50,
              averageSalePrice: 3000,
              averageProfit: 500
            },
            pagination: {
              page: 1,
              limit: 10,
              total: 25,
              pages: 3
            }
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
                    productBusinessPrice: 2000,
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
        description: "dcc.users.basic",
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
                avatar: null,
                isActive: true,
                role: "DCC",
                roleAssignedAt: "2024-01-01T00:00:00Z",
                roleExpiresAt: null
              }
            ]
          },
          message: "Successfully retrieved 4 DCC users"
        }
      },
      {
        method: "GET",
        path: "/api/v1/dcc-users?includeProducts=true",
        description: "dcc.users.withProducts",
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
                avatar: null,
                isActive: true,
                role: "DCC",
                roleAssignedAt: "2024-01-01T00:00:00Z",
                roleExpiresAt: null,
                products: [
                  {
                    id: "product_id",
                    name: "Product Name",
                    description: "Product description",
                    price: 2500,
                    image: "/product-image.jpg",
                    images: [],
                    category: "Electronics",
                    subcategory: "Mobile",
                    stock: 10,
                    status: "active",
                    isActive: true,
                    commission: 15,
                    brand: {
                      id: "brand_id",
                      name: "Brand Name"
                    },
                    averageRating: 4.2,
                    reviewCount: 8,
                    createdAt: "2024-01-01T00:00:00Z",
                    updatedAt: "2024-01-01T00:00:00Z"
                  }
                ],
                productStats: {
                  totalProducts: 1,
                  activeProducts: 1,
                  totalStock: 10,
                  averagePrice: 2500,
                  totalValue: 25000
                }
              }
            ]
          },
          message: "Successfully retrieved 4 DCC users"
        }
      },
      {
        method: "GET",
        path: "/api/v1/dcc-users?includeDCCStock=true",
        description: "dcc.users.withStock",
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
                avatar: null,
                isActive: true,
                role: "DCC",
                roleAssignedAt: "2024-01-01T00:00:00Z",
                roleExpiresAt: null,
                dccStock: [
                  {
                    id: "stock_id",
                    quantity: 5,
                    product: {
                      id: "product_id",
                      name: "Employer Product",
                      description: "Product from employer",
                      price: 1800,
                      image: "/product-image.jpg",
                      images: [],
                      category: "Household",
                      subcategory: null,
                      status: "active",
                      isActive: true,
                      commission: 12,
                      brand: null,
                      averageRating: 4.0,
                      reviewCount: 5,
                      createdAt: "2024-01-01T00:00:00Z",
                      updatedAt: "2024-01-01T00:00:00Z"
                    },
                    totalValue: 9000,
                    updatedAt: "2024-01-01T00:00:00Z"
                  }
                ],
                dccStockStats: {
                  totalItems: 1,
                  totalQuantity: 5,
                  totalValue: 9000,
                  averagePrice: 1800
                }
              }
            ]
          },
          message: "Successfully retrieved 4 DCC users"
        }
      },
      {
        method: "GET",
        path: "/api/v1/dcc-users?includeDCCProfile=true",
        description: "dcc.users.withProfile",
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
                avatar: null,
                isActive: true,
                role: "DCC",
                roleAssignedAt: "2024-01-01T00:00:00Z",
                roleExpiresAt: null,
                dccProfile: {
                  id: "profile_id",
                  level: "BRONZE",
                  rating: 4.5,
                  totalSales: 150,
                  monthlySales: 25,
                  productsAvailable: 12
                }
              }
            ]
          },
          message: "Successfully retrieved 4 DCC users"
        }
      },
      {
        method: "GET",
        path: "/api/v1/dcc-users?includeDCCStock=true&includeDCCProfile=true",
        description: "dcc.users.complete",
        requiresAuth: true,
        request: {
          search: "DCC",
          includeProducts: true,
          includeDCCStock: true,
          includeDCCProfile: true
        },
        response: {
          success: true,
          data: {
            users: [
              {
                id: "user_id",
                name: "DCC User",
                email: "dcc@example.com",
                phone: "+250780000000",
                avatar: null,
                isActive: true,
                role: "DCC",
                roleAssignedAt: "2024-01-01T00:00:00Z",
                roleExpiresAt: null,
                dccProfile: {
                  id: "profile_id",
                  level: "BRONZE",
                  rating: 4.5,
                  totalSales: 150,
                  monthlySales: 25,
                  productsAvailable: 12
                },
                products: [
                  {
                    id: "product_id",
                    name: "Product Name",
                    description: "Product description",
                    price: 2500,
                    image: "/product-image.jpg",
                    images: [],
                    category: "Electronics",
                    subcategory: "Mobile",
                    stock: 10,
                    status: "active",
                    isActive: true,
                    commission: 15,
                    brand: {
                      id: "brand_id",
                      name: "Brand Name"
                    },
                    averageRating: 4.2,
                    reviewCount: 8,
                    createdAt: "2024-01-01T00:00:00Z",
                    updatedAt: "2024-01-01T00:00:00Z"
                  }
                ],
                productStats: {
                  totalProducts: 1,
                  activeProducts: 1,
                  totalStock: 10,
                  averagePrice: 2500,
                  totalValue: 25000
                },
                dccStock: [
                  {
                    id: "stock_id",
                    quantity: 5,
                    product: {
                      id: "product_id",
                      name: "Employer Product",
                      description: "Product from employer",
                      price: 1800,
                      image: "/product-image.jpg",
                      images: [],
                      category: "Household",
                      subcategory: null,
                      status: "active",
                      isActive: true,
                      commission: 12,
                      brand: null,
                      averageRating: 4.0,
                      reviewCount: 5,
                      createdAt: "2024-01-01T00:00:00Z",
                      updatedAt: "2024-01-01T00:00:00Z"
                    },
                    totalValue: 9000,
                    updatedAt: "2024-01-01T00:00:00Z"
                  }
                ],
                dccStockStats: {
                  totalItems: 1,
                  totalQuantity: 5,
                  totalValue: 9000,
                  averagePrice: 1800
                }
              }
            ]
          },
          message: "Successfully retrieved 4 DCC users"
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

  {
    category: "Form Configuration",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/form-config",
        description: "formConfig.get",
        requiresAuth: true,
        response: {
          success: true,
          config: {
            sections: [
              {
                id: "personalInfo",
                title: "Personal Information",
                fields: [
                  {
                    id: "firstName",
                    type: "text",
                    label: "First Name",
                    required: true
                  }
                ]
              }
            ]
          }
        }
      },
      {
        method: "PUT",
        path: "/api/v1/form-config",
        description: "formConfig.update",
        requiresAuth: true,
        request: {
          sections: [
            {
              id: "personalInfo",
              title: "Personal Information",
              fields: [
                {
                  id: "firstName",
                  type: "text",
                  label: "First Name",
                  required: true
                }
              ]
            }
          ]
        },
        response: {
          success: true,
          message: "Form configuration updated successfully",
          config: {
            sections: [
              {
                id: "personalInfo",
                title: "Personal Information",
                fields: [
                  {
                    id: "firstName",
                    type: "text",
                    label: "First Name",
                    required: true
                  }
                ]
              }
            ]
          }
        }
      }
    ]
  },

  {
    category: "Customer Purchase",
    endpoints: [
      {
        method: "GET",
        path: "/api/customer/cart",
        description: "customer.cart.get",
        requiresAuth: true,
        response: {
          success: true,
          cart: {
            items: [
              {
                id: "cart-item-id",
                productId: "product-id",
                dccId: "dcc-id",
                quantity: 2,
                createdAt: "2024-01-01T12:00:00Z",
                updatedAt: "2024-01-01T12:00:00Z",
                product: {
                  id: "product-id",
                  name: "Product Name",
                  price: 1000,
                  image: "product-image-url",
                  stock: 50,
                  category: "Electronics"
                },
                dcc: {
                  id: "dcc-id",
                  name: "DCC Name",
                  email: "dcc@example.com"
                }
              }
            ],
            subtotal: 2000,
            totalItems: 2,
            itemCount: 1
          }
        }
      },
      {
        method: "POST",
        path: "/api/customer/cart",
        description: "customer.cart.add",
        requiresAuth: true,
        request: {
          productId: "product-id",
          dccId: "dcc-id (optional)",
          quantity: 2
        },
        response: {
          success: true,
          message: "Item added to cart successfully",
          item: {
            id: "cart-item-id",
            productId: "product-id",
            dccId: "dcc-id",
            quantity: 2,
            product: {
              id: "product-id",
              name: "Product Name",
              price: 1000,
              image: "product-image-url",
              stock: 50,
              category: "Electronics"
            }
          }
        }
      },
      {
        method: "PUT",
        path: "/api/customer/cart",
        description: "customer.cart.update",
        requiresAuth: true,
        request: {
          cartItemId: "cart-item-id",
          quantity: 3
        },
        response: {
          success: true,
          message: "Cart item updated successfully",
          item: {
            id: "cart-item-id",
            productId: "product-id",
            quantity: 3,
            product: {
              id: "product-id",
              name: "Product Name",
              price: 1000,
              image: "product-image-url",
              stock: 50,
              category: "Electronics"
            }
          }
        }
      },
      {
        method: "DELETE",
        path: "/api/customer/cart?cartItemId=cart-item-id",
        description: "customer.cart.remove",
        requiresAuth: true,
        response: {
          success: true,
          message: "Item removed from cart successfully"
        }
      },
      {
        method: "POST",
        path: "/api/customer/checkout",
        description: "customer.checkout.process",
        requiresAuth: true,
        request: {
          shippingAddress: {
            street: "123 Main St",
            city: "Kigali",
            province: "Kigali",
            postalCode: "12345",
            country: "Rwanda"
          },
          billingAddress: {
            street: "123 Main St",
            city: "Kigali",
            province: "Kigali",
            postalCode: "12345",
            country: "Rwanda"
          },
          customerNotes: "Please deliver in the morning",
          paymentMethod: "CASH",
          estimatedDelivery: "2024-01-08T12:00:00Z"
        },
        response: {
          success: true,
          message: "Order created successfully",
          order: {
            id: "order-id",
            orderNumber: "ORD-1704067200000-ABC123DEF",
            status: "PENDING",
            totalAmount: 2360,
            subtotal: 2000,
            taxAmount: 360,
            shippingAmount: 500,
            estimatedDelivery: "2024-01-08T12:00:00Z",
            createdAt: "2024-01-01T12:00:00Z"
          },
          items: [
            {
              id: "order-item-id",
              productId: "product-id",
              quantity: 2,
              unitPrice: 1000,
              totalPrice: 2000
            }
          ],
          payment: {
            id: "payment-id",
            amount: 2360,
            method: "CASH",
            status: "PENDING",
            reference: "PAY-1704067200000"
          }
        }
      },
      {
        method: "GET",
        path: "/api/customer/orders",
        description: "customer.orders.list",
        requiresAuth: true,
        response: {
          success: true,
          orders: [
            {
              id: "order-id",
              orderNumber: "ORD-1704067200000-ABC123DEF",
              status: "PENDING",
              totalAmount: 2360,
              createdAt: "2024-01-01T12:00:00Z",
              items: [
                {
                  id: "order-item-id",
                  product: {
                    id: "product-id",
                    name: "Product Name",
                    price: 1000,
                    image: "product-image-url"
                  }
                }
              ],
              payments: [
                {
                  id: "payment-id",
                  amount: 2360,
                  method: "CASH",
                  status: "PENDING"
                }
              ],
              tracking: [
                {
                  id: "tracking-id",
                  status: "ORDER_CREATED",
                  description: "Order has been created",
                  timestamp: "2024-01-01T12:00:00Z"
                }
              ]
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3,
            hasNext: true,
            hasPrev: false
          }
        }
      },
      {
        method: "GET",
        path: "/api/customer/orders?orderId=order-id",
        description: "customer.orders.get",
        requiresAuth: true,
        response: {
          success: true,
          order: {
            id: "order-id",
            orderNumber: "ORD-1704067200000-ABC123DEF",
            status: "PENDING",
            totalAmount: 2360,
            subtotal: 2000,
            taxAmount: 360,
            shippingAmount: 500,
            discountAmount: 0,
            currency: "RWF",
            shippingAddress: {
              street: "123 Main St",
              city: "Kigali",
              province: "Kigali",
              postalCode: "12345",
              country: "Rwanda"
            },
            billingAddress: {
              street: "123 Main St",
              city: "Kigali",
              province: "Kigali",
              postalCode: "12345",
              country: "Rwanda"
            },
            customerNotes: "Please deliver in the morning",
            estimatedDelivery: "2024-01-08T12:00:00Z",
            createdAt: "2024-01-01T12:00:00Z",
            items: [
              {
                id: "order-item-id",
                productId: "product-id",
                dccId: "dcc-id",
                quantity: 2,
                unitPrice: 1000,
                totalPrice: 2000,
                discount: 0,
                product: {
                  id: "product-id",
                  name: "Product Name",
                  price: 1000,
                  image: "product-image-url",
                  category: "Electronics"
                },
                dcc: {
                  id: "dcc-id",
                  name: "DCC Name",
                  email: "dcc@example.com"
                }
              }
            ],
            payments: [
              {
                id: "payment-id",
                amount: 2360,
                method: "CASH",
                status: "PENDING",
                reference: "PAY-1704067200000",
                createdAt: "2024-01-01T12:00:00Z"
              }
            ],
            tracking: [
              {
                id: "tracking-id",
                status: "ORDER_CREATED",
                description: "Order has been created and is pending confirmation",
                location: "System",
                timestamp: "2024-01-01T12:00:00Z"
              }
            ]
          }
        }
      },
      {
        method: "POST",
        path: "/api/customer/orders",
        description: "customer.orders.cancel",
        requiresAuth: true,
        request: {
          orderId: "order-id",
          reason: "Changed my mind"
        },
        response: {
          success: true,
          message: "Order cancelled successfully",
          order: {
            id: "order-id",
            status: "CANCELLED",
            cancelledAt: "2024-01-01T13:00:00Z",
            cancelledBy: "user-id",
            cancelledReason: "Changed my mind"
          }
        }
      },
      {
        method: "GET",
        path: "/api/customer/orders/{orderId}/tracking",
        description: "customer.tracking.get",
        requiresAuth: true,
        response: {
          success: true,
          tracking: {
            orderId: "order-id",
            orderNumber: "ORD-1704067200000-ABC123DEF",
            status: "PENDING",
            currentStatus: "ORDER_CREATED",
            currentDescription: "Order has been created and is pending confirmation",
            currentLocation: "System",
            lastUpdate: "2024-01-01T12:00:00Z",
            estimatedDelivery: "2024-01-08T12:00:00Z",
            deliveredAt: null,
            cancelledAt: null,
            cancelledReason: null,
            timeline: [
              {
                id: "tracking-id",
                status: "ORDER_CREATED",
                description: "Order has been created and is pending confirmation",
                location: "System",
                timestamp: "2024-01-01T12:00:00Z"
              }
            ],
            payment: {
              id: "payment-id",
              amount: 2360,
              method: "CASH",
              status: "PENDING",
              reference: "PAY-1704067200000",
              processedAt: null
            },
            orderSummary: {
              totalItems: 1,
              totalQuantity: 2,
              subtotal: 2000,
              taxAmount: 360,
              shippingAmount: 500,
              totalAmount: 2360,
              currency: "RWF"
            },
            items: [
              {
                id: "order-item-id",
                productId: "product-id",
                productName: "Product Name",
                productImage: "product-image-url",
                quantity: 2,
                unitPrice: 1000,
                totalPrice: 2000
              }
            ]
          }
        }
      },
      {
        method: "POST",
        path: "/api/customer/orders/{orderId}/tracking",
        description: "customer.tracking.update",
        requiresAuth: true,
        request: {
          status: "ORDER_SHIPPED",
          description: "Order has been shipped and is in transit",
          location: "Kigali Distribution Center"
        },
        response: {
          success: true,
          message: "Tracking update added successfully",
          tracking: {
            id: "tracking-id",
            orderId: "order-id",
            status: "ORDER_SHIPPED",
            description: "Order has been shipped and is in transit",
            location: "Kigali Distribution Center",
            timestamp: "2024-01-01T14:00:00Z"
          }
        }
      }
    ]
  },
  {
    category: "Voucher",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/vouchers",
        description: "voucher.list",
        requiresAuth: true,
        response: {
          success: true,
          data: {
            vouchers: [
              {
                id: "voucher-id",
                code: "DCCVOUCHER-123456",
                value: 30000,
                remainingBalance: 25000,
                status: "ACTIVE",
                dccId: "dcc-user-id",
                createdBy: "admin-user-id",
                expiresAt: "2024-12-31T23:59:59Z",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
              }
            ],
            summary: {
              totalVouchers: 1,
              totalValue: 30000,
              totalRemainingBalance: 25000,
              activeVouchers: 1,
              usedVouchers: 0,
              expiredVouchers: 0
            }
          }
        }
      },
      {
        method: "POST",
        path: "/api/v1/vouchers",
        description: "voucher.create",
        requiresAuth: true,
        request: {
          dccId: "dcc-user-id",
          value: 30000,
          expiresAt: "2024-12-31T23:59:59Z"
        },
        response: {
          success: true,
          data: {
            voucher: {
              id: "voucher-id",
              code: "DCCVOUCHER-123456",
              value: 30000,
              remainingBalance: 30000,
              status: "ACTIVE",
              dccId: "dcc-user-id",
              createdBy: "admin-user-id",
              expiresAt: "2024-12-31T23:59:59Z",
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: "2024-01-01T00:00:00Z"
            }
          },
          message: "Voucher created successfully"
        }
      },
      {
        method: "POST",
        path: "/api/v1/vouchers/validate",
        description: "voucher.validate",
        requiresAuth: true,
        request: {
          voucherCode: "DCCVOUCHER-123456"
        },
        response: {
          success: true,
          data: {
            voucher: {
              id: "voucher-id",
              code: "DCCVOUCHER-123456",
              value: 30000,
              remainingBalance: 25000,
              status: "ACTIVE",
              dccId: "dcc-user-id",
              expiresAt: "2024-12-31T23:59:59Z"
            },
            isValid: true,
            message: "Voucher is valid and can be used"
          }
        }
      },
      {
        method: "GET",
        path: "/api/v1/vouchers/{voucherId}",
        description: "voucher.get",
        requiresAuth: true,
        response: {
          success: true,
          data: {
            voucher: {
              id: "voucher-id",
              code: "DCCVOUCHER-123456",
              value: 30000,
              remainingBalance: 25000,
              status: "ACTIVE",
              dccId: "dcc-user-id",
              createdBy: "admin-user-id",
              expiresAt: "2024-12-31T23:59:59Z",
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: "2024-01-01T00:00:00Z"
            },
            transactions: [
              {
                id: "transaction-id",
                voucherId: "voucher-id",
                type: "USED",
                amount: 5000,
                remainingBalance: 25000,
                description: "Used for stock order #order-id",
                stockOrderId: "order-id",
                createdAt: "2024-01-01T12:00:00Z"
              }
            ]
          }
        }
      },
      {
        method: "PATCH",
        path: "/api/v1/vouchers/{voucherId}",
        description: "voucher.update",
        requiresAuth: true,
        request: {
          value: 35000,
          expiresAt: "2024-12-31T23:59:59Z",
          status: "ACTIVE"
        },
        response: {
          success: true,
          data: {
            voucher: {
              id: "voucher-id",
              code: "DCCVOUCHER-123456",
              value: 35000,
              remainingBalance: 30000,
              status: "ACTIVE",
              dccId: "dcc-user-id",
              createdBy: "admin-user-id",
              expiresAt: "2024-12-31T23:59:59Z",
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: "2024-01-01T12:00:00Z"
            }
          },
          message: "Voucher updated successfully"
        }
      },
      {
        method: "DELETE",
        path: "/api/v1/vouchers/{voucherId}",
        description: "voucher.delete",
        requiresAuth: true,
        response: {
          success: true,
          message: "Voucher deleted successfully"
        }
      }
    ]
  }
] 