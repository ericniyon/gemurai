import { useState, useEffect, useCallback, useMemo } from 'react'

export interface Application {
  id: string
  status: string
  currentStep?: string
  notes?: string
  dccCreated?: boolean
  applicationScore?: number
  vulnerabilityCategory?: string
  createdAt: string
  updatedAt: string
  formData: any
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  totalScore: number
  interviewScore: number
  user?: any
  evaluations: any[]
  interviewScores: any[]
  dccProfile?: any
}

export interface ApplicationsResponse {
  success: boolean
  data: Application[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  meta: {
    fetchedAt: string
    userRole: string
    totalApplications: number
  }
}

export interface UseApplicationsOptions {
  status?: string
  search?: string
  page?: number
  limit?: number
  autoFetch?: boolean
}

// Cache for storing API responses
const cache = new Map<string, { data: ApplicationsResponse; timestamp: number }>()
const CACHE_DURATION = 60000 // 1 minute

export function useApplications(options: UseApplicationsOptions = {}) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)
  const [meta, setMeta] = useState<any>(null)

  const {
    status,
    search = '',
    page = 1,
    limit = 50,
    autoFetch = true
  } = options

  // Memoize cache key to prevent unnecessary cache misses
  const cacheKey = useMemo(() => 
    `applications-${status || 'all'}-${search}-${page}-${limit}`, 
    [status, search, page, limit]
  )

  const fetchApplications = useCallback(async () => {
    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🚀 Using cached data for:', cacheKey)
      setApplications(cached.data.data)
      setPagination(cached.data.pagination)
      setMeta(cached.data.meta)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (search) params.append('search', search)
      params.append('page', page.toString())
      params.append('limit', limit.toString())

      const response = await fetch(`/api/v1/applications/dashboard?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=60'
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApplicationsResponse = await response.json()
      
      if (data.success) {
        // Cache the response
        cache.set(cacheKey, { data, timestamp: Date.now() })
        
        setApplications(data.data)
        setPagination(data.pagination)
        setMeta(data.meta)
      } else {
        throw new Error('Failed to fetch applications')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching applications:', err)
    } finally {
      setLoading(false)
    }
  }, [cacheKey, status, search, page, limit])

  const refetch = useCallback(() => {
    // Clear cache for this key to force fresh fetch
    cache.delete(cacheKey)
    fetchApplications()
  }, [cacheKey, fetchApplications])

  const refresh = useCallback(() => {
    setApplications([])
    setError(null)
    // Clear all cache
    cache.clear()
    fetchApplications()
  }, [fetchApplications])

  useEffect(() => {
    if (autoFetch) {
      fetchApplications()
    }
  }, [autoFetch, fetchApplications])

  return {
    applications,
    loading,
    error,
    pagination,
    meta,
    refetch,
    refresh
  }
}
