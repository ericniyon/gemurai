import { hasPermission, hasAnyPermission, canAccessRoute } from '@/lib/auth'
import { ROLES } from '@/lib/permissions'

// Mock EMPLOYER user for testing
const mockEmployerUser = {
  id: "test-employer-id",
  name: "Test Employer",
  email: "employer@test.com",
  phone: "+250788123456",
  role: "EMPLOYER" as const,
  permissions: [
    "dashboard.view",
    "jobs.view", 
    "jobs.post", 
    "jobs.manage", 
    "users.view",
    "applications.view",
    "applications.review",
    "applications.manage",
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "products.manage",
    "orders.view",
    "orders.manage"
  ]
}

describe('EMPLOYER Product Management Access', () => {
  test('EMPLOYER should have products.view permission', () => {
    const hasViewPermission = hasPermission(mockEmployerUser, 'products.view')
    expect(hasViewPermission).toBe(true)
  })

  test('EMPLOYER should have products.create permission', () => {
    const hasCreatePermission = hasPermission(mockEmployerUser, 'products.create')
    expect(hasCreatePermission).toBe(true)
  })

  test('EMPLOYER should have products.edit permission', () => {
    const hasEditPermission = hasPermission(mockEmployerUser, 'products.edit')
    expect(hasEditPermission).toBe(true)
  })

  test('EMPLOYER should have products.delete permission', () => {
    const hasDeletePermission = hasPermission(mockEmployerUser, 'products.delete')
    expect(hasDeletePermission).toBe(true)
  })

  test('EMPLOYER should have products.manage permission', () => {
    const hasManagePermission = hasPermission(mockEmployerUser, 'products.manage')
    expect(hasManagePermission).toBe(true)
  })

  test('EMPLOYER should have orders.view permission', () => {
    const hasOrderViewPermission = hasPermission(mockEmployerUser, 'orders.view')
    expect(hasOrderViewPermission).toBe(true)
  })

  test('EMPLOYER should have orders.manage permission', () => {
    const hasOrderManagePermission = hasPermission(mockEmployerUser, 'orders.manage')
    expect(hasOrderManagePermission).toBe(true)
  })

  test('EMPLOYER should have all product-related permissions', () => {
    const hasAllProductPermissions = hasAnyPermission(mockEmployerUser, [
      'products.view',
      'products.create',
      'products.edit',
      'products.delete',
      'products.manage'
    ])
    expect(hasAllProductPermissions).toBe(true)
  })

  test('EMPLOYER role configuration should include all product permissions', () => {
    const employerRole = ROLES.find(role => role.id === 'employer')
    expect(employerRole).toBeDefined()
    expect(employerRole?.permissions).toContain('products.view')
    expect(employerRole?.permissions).toContain('products.create')
    expect(employerRole?.permissions).toContain('products.edit')
    expect(employerRole?.permissions).toContain('products.delete')
    expect(employerRole?.permissions).toContain('products.manage')
    expect(employerRole?.permissions).toContain('orders.view')
    expect(employerRole?.permissions).toContain('orders.manage')
  })

  test('EMPLOYER should be able to access /dashboard/marketplace route', () => {
    const canAccess = canAccessRoute(mockEmployerUser, '/dashboard/marketplace')
    expect(canAccess).toBe(true)
  })

  test('EMPLOYER should be able to access /dashboard route', () => {
    const canAccess = canAccessRoute(mockEmployerUser, '/dashboard')
    expect(canAccess).toBe(true)
  })

  test('EMPLOYER should still have previous job management permissions', () => {
    const hasJobsView = hasPermission(mockEmployerUser, 'jobs.view')
    const hasJobsPost = hasPermission(mockEmployerUser, 'jobs.post')
    const hasJobsManage = hasPermission(mockEmployerUser, 'jobs.manage')
    
    expect(hasJobsView).toBe(true)
    expect(hasJobsPost).toBe(true)
    expect(hasJobsManage).toBe(true)
  })

  test('EMPLOYER should still have application management permissions', () => {
    const hasAppsView = hasPermission(mockEmployerUser, 'applications.view')
    const hasAppsReview = hasPermission(mockEmployerUser, 'applications.review')
    const hasAppsManage = hasPermission(mockEmployerUser, 'applications.manage')
    
    expect(hasAppsView).toBe(true)
    expect(hasAppsReview).toBe(true)
    expect(hasAppsManage).toBe(true)
  })

  test('EMPLOYER should NOT have admin permissions', () => {
    const hasAdminUsers = hasPermission(mockEmployerUser, 'admin.users')
    const hasAdminSystem = hasPermission(mockEmployerUser, 'admin.system')
    
    expect(hasAdminUsers).toBe(false)
    expect(hasAdminSystem).toBe(false)
  })

  test('EMPLOYER should have comprehensive business management capabilities', () => {
    const businessPermissions = [
      'dashboard.view',
      'jobs.view', 'jobs.post', 'jobs.manage',
      'applications.view', 'applications.review', 'applications.manage',
      'products.view', 'products.create', 'products.edit', 'products.delete', 'products.manage',
      'orders.view', 'orders.manage',
      'users.view'
    ]

    const hasAllBusinessPermissions = businessPermissions.every(permission => 
      hasPermission(mockEmployerUser, permission)
    )

    expect(hasAllBusinessPermissions).toBe(true)
  })
}) 