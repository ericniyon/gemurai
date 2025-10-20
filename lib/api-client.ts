import { toast } from "@/components/ui/use-toast"

interface ApiOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
  requiresAuth?: boolean
}

interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  total?: number
}

const TOKEN_KEY = "Gemurai_token"
const isBrowser = typeof window !== 'undefined'

export class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl = "/api/v1") {
    this.baseUrl = baseUrl
    // Try to get token from localStorage on initialization
    if (isBrowser) {
      this.token = localStorage.getItem(TOKEN_KEY)
    }
  }

  setToken(token: string) {
    this.token = token
    if (isBrowser) {
      localStorage.setItem(TOKEN_KEY, token)
    }
  }

  getToken(): string | null {
    if (!this.token && isBrowser) {
      this.token = localStorage.getItem(TOKEN_KEY)
    }
    return this.token
  }

  clearToken() {
    this.token = null
    if (isBrowser) {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    const { method = "GET", body, headers = {}, requiresAuth = true } = options

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    }

    if (requiresAuth) {
      const token = this.getToken()
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`
      } else if (endpoint !== "/auth/login" && endpoint !== "/auth/verify") {
        // If no token and endpoint requires auth, redirect to login
        if (isBrowser && !window.location.pathname.includes('/login')) {
          const locale = window.location.pathname.split('/')[1] || 'en'
          const currentPath = window.location.pathname
          const applicationId = currentPath.match(/\/applications\/([^\/\?]+)/)?.[1]
          const callbackUrl = applicationId 
            ? `/${locale}/dashboard/applications/${applicationId}`
            : currentPath
          window.location.href = `/${locale}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
          return {
            success: false,
            message: "Authentication required",
            error: "UNAUTHORIZED"
          }
        }
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle error responses
        if (response.status === 401 && requiresAuth) {
          // Only clear token if this wasn't a login attempt
          if (endpoint !== "/auth/login" && endpoint !== "/auth/verify") {
            this.clearToken()
            // Only redirect if we're not already on the login page and we're in the browser
            if (isBrowser && !window.location.pathname.includes('/login')) {
              const locale = window.location.pathname.split('/')[1] || 'en'
              const currentPath = window.location.pathname
              const applicationId = currentPath.match(/\/applications\/([^\/\?]+)/)?.[1]
              const callbackUrl = applicationId 
                ? `/${locale}/dashboard/applications/${applicationId}`
                : currentPath
              window.location.href = `/${locale}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
            }
          }
        }

        return {
          success: false,
          message: data.message || "An error occurred",
          error: `HTTP ${response.status}`,
        }
      }

      return data
    } catch (error: any) {
      console.error(`API Error (${endpoint}):`, error)

      // Only show toast for non-auth errors
      if (!endpoint.startsWith('/auth/')) {
        toast({
          title: "API Error",
          description: error.message || "An error occurred while communicating with the server",
          variant: "destructive",
        })
      }

      return {
        success: false,
        message: error.message || "An error occurred",
        error: error.name,
      }
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: { email, password },
      requiresAuth: false,
    })

    if (response.success && response.data) {
      this.setToken(response.data.token)
    }

    return response
  }

  async forgotPassword(email: string) {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: { email },
      requiresAuth: false,
    })
  }

  async resetPassword(email: string, token: string, password: string) {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: { email, token, password },
      requiresAuth: false,
    })
  }

  // User endpoints
  async getUsers(page = 1, limit = 10, search = "") {
    return this.request("/users", {
      method: "GET",
      headers: {
        "X-Page": page.toString(),
        "X-Limit": limit.toString(),
        ...(search ? { "X-Search": search } : {}),
      },
    })
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`)
  }

  async createUser(userData: any) {
    return this.request("/users", {
      method: "POST",
      body: userData,
    })
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: userData,
    })
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: "DELETE",
    })
  }

  // Application endpoints
  async getApplications(page = 1, limit = 10, status = "", search = "") {
    let endpoint = `/applications?page=${page}&limit=${limit}`
    if (status) endpoint += `&status=${status}`
    if (search) endpoint += `&search=${encodeURIComponent(search)}`

    const response = await this.request(endpoint)
    
    // Ensure we return the total count from the response
    if (response.success && !response.total && response.data) {
      response.total = parseInt(response.headers?.get('X-Total-Count') || '0') || response.data.length
    }
    
    return response
  }

  async getApplication(id: string) {
    return this.request(`/applications/${id}`)
  }

  async createApplication(applicationData: any) {
    return this.request("/applications", {
      method: "POST",
      body: applicationData,
    })
  }

  async updateApplication(id: string, applicationData: any) {
    return this.request(`/applications/${id}`, {
      method: "PUT",
      body: applicationData,
    })
  }

  async deleteApplication(id: string) {
    return this.request(`/applications/${id}`, {
      method: "DELETE",
    })
  }

  // DCC endpoints
  async getDCCs(page = 1, limit = 10, filters: any = {}) {
    let endpoint = `/dccs?page=${page}&limit=${limit}`
    Object.entries(filters).forEach(([key, value]) => {
      if (value) endpoint += `&${key}=${encodeURIComponent(value as string)}`
    })
    return this.request(endpoint)
  }

  async getDCC(id: string) {
    return this.request(`/dccs/${id}`)
  }
}

export const api = new ApiClient()
