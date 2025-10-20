'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, Zap, Database, Network, HardDrive } from 'lucide-react'

interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  databaseQueryTime: number
  cacheHitRate: number
  memoryUsage: number
  bundleSize: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    apiResponseTime: 0,
    databaseQueryTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    bundleSize: 0
  })

  const [isVisible, setIsVisible] = useState(false)

  // Measure page load time
  const measurePageLoad = useCallback(() => {
    if (typeof window !== 'undefined') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart
        setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }))
      }
    }
  }, [])

  // Measure API response time
  const measureApiPerformance = useCallback(async () => {
    const startTime = performance.now()
    try {
      const response = await fetch('/api/health')
      const endTime = performance.now()
      const responseTime = endTime - startTime
      setMetrics(prev => ({ ...prev, apiResponseTime: responseTime }))
    } catch (error) {
      console.error('API performance measurement failed:', error)
    }
  }, [])

  // Get memory usage
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const usedMemory = memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
      setMetrics(prev => ({ ...prev, memoryUsage: usedMemory }))
    }
  }, [])

  // Get cache statistics
  const getCacheStats = useCallback(async () => {
    try {
      const response = await fetch('/api/redis/stats')
      if (response.ok) {
        const stats = await response.json()
        const hitRate = stats.hitRate || 0
        setMetrics(prev => ({ ...prev, cacheHitRate: hitRate }))
      }
    } catch (error) {
      console.error('Cache stats measurement failed:', error)
    }
  }, [])

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        setIsVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Measure performance on mount
  useEffect(() => {
    measurePageLoad()
    measureApiPerformance()
    getMemoryUsage()
    getCacheStats()

    // Set up periodic measurements
    const interval = setInterval(() => {
      measureApiPerformance()
      getMemoryUsage()
      getCacheStats()
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [measurePageLoad, measureApiPerformance, getMemoryUsage, getCacheStats])

  if (!isVisible) return null

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600'
    if (value <= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-100 text-green-800'
    if (value <= thresholds.warning) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4" />
            Performance Monitor
            <Badge variant="outline" className="text-xs">
              Ctrl+Shift+P
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Page Load Time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Page Load</span>
              </div>
              <Badge className={getPerformanceBadge(metrics.pageLoadTime, { good: 1000, warning: 3000 })}>
                {metrics.pageLoadTime.toFixed(0)}ms
              </Badge>
            </div>
            <Progress 
              value={Math.min((metrics.pageLoadTime / 5000) * 100, 100)} 
              className="h-1" 
            />
          </div>

          {/* API Response Time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="h-3 w-3" />
                <span className="text-xs">API Response</span>
              </div>
              <Badge className={getPerformanceBadge(metrics.apiResponseTime, { good: 200, warning: 1000 })}>
                {metrics.apiResponseTime.toFixed(0)}ms
              </Badge>
            </div>
            <Progress 
              value={Math.min((metrics.apiResponseTime / 2000) * 100, 100)} 
              className="h-1" 
            />
          </div>

          {/* Cache Hit Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-3 w-3" />
                <span className="text-xs">Cache Hit Rate</span>
              </div>
              <Badge className={getPerformanceBadge(100 - metrics.cacheHitRate, { good: 20, warning: 50 })}>
                {metrics.cacheHitRate.toFixed(1)}%
              </Badge>
            </div>
            <Progress 
              value={metrics.cacheHitRate} 
              className="h-1" 
            />
          </div>

          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-3 w-3" />
                <span className="text-xs">Memory Usage</span>
              </div>
              <Badge className={getPerformanceBadge(metrics.memoryUsage, { good: 50, warning: 100 })}>
                {metrics.memoryUsage.toFixed(1)}MB
              </Badge>
            </div>
            <Progress 
              value={Math.min((metrics.memoryUsage / 200) * 100, 100)} 
              className="h-1" 
            />
          </div>

          {/* Performance Score */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Performance Score</span>
              <Badge className="bg-blue-100 text-blue-800">
                {calculatePerformanceScore(metrics)}/100
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  let score = 100

  // Deduct points for poor performance
  if (metrics.pageLoadTime > 3000) score -= 20
  else if (metrics.pageLoadTime > 1000) score -= 10

  if (metrics.apiResponseTime > 1000) score -= 20
  else if (metrics.apiResponseTime > 200) score -= 10

  if (metrics.cacheHitRate < 50) score -= 15
  else if (metrics.cacheHitRate < 80) score -= 5

  if (metrics.memoryUsage > 100) score -= 15
  else if (metrics.memoryUsage > 50) score -= 5

  return Math.max(0, score)
} 