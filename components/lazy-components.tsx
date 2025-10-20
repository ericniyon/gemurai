'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Loading fallback component
const LoadingFallback = ({ className = "h-8 w-8" }: { className?: string }) => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className={`${className} animate-spin text-muted-foreground`} />
  </div>
)

// Lazy load heavy components
export const LazyApplicationsTable = dynamic(
  () => import('@/app/[lang]/dashboard/applications/applications-table').then(mod => ({ default: mod.default })),
  {
    loading: () => <LoadingFallback className="h-12 w-12" />,
    ssr: false // Disable SSR for better performance
  }
)

export const LazyInterviewQuestions = dynamic(
  () => import('@/components/interviews/InterviewQuestions').then(mod => ({ default: mod.InterviewQuestions })),
  {
    loading: () => <LoadingFallback />,
    ssr: false
  }
)

export const LazyWalletCard = dynamic(
  () => import('@/app/[lang]/dashboard/components/wallet-card').then(mod => ({ default: mod.WalletCard })),
  {
    loading: () => <LoadingFallback />,
    ssr: false
  }
)

export const LazyStockOrderDialog = dynamic(
  () => import('@/app/components/stock-order/StockOrderDialog').then(mod => ({ default: mod.StockOrderDialog })),
  {
    loading: () => <LoadingFallback />,
    ssr: false
  }
)

export const LazyAssignInterviewersModal = dynamic(
  () => import('@/components/interviews/AssignInterviewersModal').then(mod => ({ default: mod.AssignInterviewersModal })),
  {
    loading: () => <LoadingFallback />,
    ssr: false
  }
)

// Lazy load admin components
export const LazyAdminDashboard = dynamic(
  () => import('@/app/admin/dashboard/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <LoadingFallback className="h-16 w-16" />,
    ssr: false
  }
)

export const LazySuperAdminDashboard = dynamic(
  () => import('@/app/superadmin/dashboard/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <LoadingFallback className="h-16 w-16" />,
    ssr: false
  }
)

// Lazy load forms and modals
export const LazyApplicationForm = dynamic(
  () => import('@/app/application/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <LoadingFallback className="h-20 w-20" />,
    ssr: false
  }
)

export const LazyLoginForm = dynamic(
  () => import('@/app/[lang]/login/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <LoadingFallback />,
    ssr: false
  }
)

// Lazy load charts and analytics
export const LazyAnalyticsChart = dynamic(
  () => import('@/components/analytics/AnalyticsChart').then(mod => ({ default: mod.AnalyticsChart })),
  {
    loading: () => <LoadingFallback />,
    ssr: false
  }
)

// Generic lazy component wrapper
export function LazyComponent({ 
  component: Component, 
  fallback = <LoadingFallback />,
  ...props 
}: {
  component: React.ComponentType<any>
  fallback?: React.ReactNode
  [key: string]: any
}) {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  )
} 