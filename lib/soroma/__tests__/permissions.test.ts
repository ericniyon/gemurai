import {
  SOROMA_PERMISSIONS,
  hasAllPermissions,
  hasAnyPermission,
  permissionSatisfies,
} from "../permissions"

describe("soroma permissions", () => {
  it("treats manage as satisfying view checks", () => {
    const granted = [SOROMA_PERMISSIONS.PROCUREMENT_MANAGE]
    expect(permissionSatisfies(granted, SOROMA_PERMISSIONS.PROCUREMENT_VIEW)).toBe(true)
  })

  it("evaluates any-permission checks", () => {
    const granted = [SOROMA_PERMISSIONS.TENANT_VIEW]
    expect(
      hasAnyPermission(granted, [
        SOROMA_PERMISSIONS.REPORTS_VIEW,
        SOROMA_PERMISSIONS.TENANT_VIEW,
      ])
    ).toBe(true)
  })

  it("evaluates all-permission checks", () => {
    const granted = [
      SOROMA_PERMISSIONS.TENANT_VIEW,
      SOROMA_PERMISSIONS.REPORTS_VIEW,
      SOROMA_PERMISSIONS.FINANCE_VIEW,
    ]
    expect(
      hasAllPermissions(granted, [
        SOROMA_PERMISSIONS.TENANT_VIEW,
        SOROMA_PERMISSIONS.REPORTS_VIEW,
      ])
    ).toBe(true)
  })
})
