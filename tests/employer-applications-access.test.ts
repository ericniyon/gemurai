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
    "applications.manage"
  ]
}

describe('EMPLOYER Applications Access', () => {
  test('EMPLOYER should have applications.view permission', () => {
    const hasViewPermission = hasPermission(mockEmployerUser, 'applications.view')
    expect(hasViewPermission).toBe(true)
  })

  test('EMPLOYER should have applications.review permission', () => {
    const hasReviewPermission = hasPermission(mockEmployerUser, 'applications.review')
    expect(hasReviewPermission).toBe(true)
  })

  test('EMPLOYER should have applications.manage permission', () => {
    const hasManagePermission = hasPermission(mockEmployerUser, 'applications.manage')
    expect(hasManagePermission).toBe(true)
  })

  test('EMPLOYER should have all application-related permissions', () => {
    const hasAllAppPermissions = hasAnyPermission(mockEmployerUser, [
      'applications.view',
      'applications.review',
      'applications.manage'
    ])
    expect(hasAllAppPermissions).toBe(true)
  })

  test('EMPLOYER role configuration should include all applications permissions', () => {
    const employerRole = ROLES.find(role => role.id === 'employer')
    expect(employerRole).toBeDefined()
    expect(employerRole?.permissions).toContain('applications.view')
    expect(employerRole?.permissions).toContain('applications.review')
    expect(employerRole?.permissions).toContain('applications.manage')
  })

  test('EMPLOYER should be able to access /dashboard/applications route', () => {
    const canAccess = canAccessRoute(mockEmployerUser, '/dashboard/applications')
    expect(canAccess).toBe(true)
  })

  test('EMPLOYER should be able to access /dashboard route', () => {
    const canAccess = canAccessRoute(mockEmployerUser, '/dashboard')
    expect(canAccess).toBe(true)
  })

  test('EMPLOYER should NOT be able to access /dashboard/my-application (DCC only)', () => {
    const canAccess = canAccessRoute(mockEmployerUser, '/dashboard/my-application')
    expect(canAccess).toBe(false)
  })
}) 