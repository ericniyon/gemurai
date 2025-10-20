"use client"

import React, { useEffect, useState } from 'react'

interface PerformanceMonitorProps {
  componentName: string
  children: React.ReactNode
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  componentName, 
  children 
}) => {
  const [renderTime, setRenderTime] = useState<number | null>(null)

  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      setRenderTime(duration)
      
      // Log performance metrics
      console.log(`🚀 ${componentName} render time: ${duration.toFixed(2)}ms`)
      
      // Send to analytics if needed
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'component_render', {
          component_name: componentName,
          render_time: duration,
          custom_parameter: 'performance_monitoring'
        })
      }
    }
  }, [componentName])

  return (
    <>
      {children}
      {process.env.NODE_ENV === 'development' && renderTime && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-2 py-1 rounded text-xs z-50">
          {componentName}: {renderTime.toFixed(2)}ms
        </div>
      )}
    </>
  )
}

export default PerformanceMonitor
