import {
  formatSoromaCompact,
  formatSoromaCurrency,
  formatSoromaPercent,
} from "../formatters"

describe("soroma formatters", () => {
  it("formats currency using configured currency", () => {
    expect(formatSoromaCurrency(120000, "RWF")).toContain("RWF")
  })

  it("formats compact large numbers", () => {
    expect(formatSoromaCompact(3_200_000, "RWF")).toBe("3.2M RWF")
  })

  it("formats percentage labels", () => {
    expect(formatSoromaPercent(86.234, 1)).toBe("86.2%")
  })
})
