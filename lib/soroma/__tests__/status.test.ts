import { getStatusSeverity } from "../status"

describe("soroma status severity mapping", () => {
  it("maps success labels", () => {
    expect(getStatusSeverity("COMPLETED")).toBe("success")
  })

  it("maps warning labels", () => {
    expect(getStatusSeverity("IN_PROGRESS")).toBe("warning")
  })

  it("maps critical labels", () => {
    expect(getStatusSeverity("FAILED")).toBe("critical")
  })

  it("falls back to neutral for unknown statuses", () => {
    expect(getStatusSeverity("UNSPECIFIED_STATE")).toBe("neutral")
  })
})
