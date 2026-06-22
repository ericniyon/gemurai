import { getRoutePermissionRule } from "../route-permissions"

describe("soroma route permission mapping", () => {
  it("resolves platform route requirements", () => {
    const rule = getRoutePermissionRule("/soroma/platform/alerts")
    expect(rule?.workspace).toBe("platform")
    expect(rule?.permissions.length).toBeGreaterThan(0)
  })

  it("resolves tenant route requirements", () => {
    const rule = getRoutePermissionRule("/soroma/tenant/tnt_1/orders")
    expect(rule?.workspace).toBe("tenant")
    expect(rule?.permissions.length).toBeGreaterThan(0)
  })

  it("returns null for unknown non-soroma routes", () => {
    expect(getRoutePermissionRule("/dashboard")).toBeNull()
  })
})
