import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

// Register fonts for better typography (optional - uses built-in if not available)
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#1e40af",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  metricCard: {
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
    minWidth: 120,
  },
  metricLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
  },
  table: {
    marginTop: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 4,
    fontWeight: "bold",
    fontSize: 9,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
  },
})

function formatNumber(n: number): string {
  if (typeof n !== "number") return String(n)
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 })
}

function formatDate(s: string): string {
  try {
    return new Date(s).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return s
  }
}

function renderMetrics(obj: Record<string, unknown>, color?: string) {
  const entries = Object.entries(obj).filter(
    ([_, v]) => v !== null && v !== undefined && typeof v !== "object"
  )
  return (
    <View style={styles.metricsRow}>
      {entries.slice(0, 12).map(([key, value]) => (
        <View key={key} style={[styles.metricCard, color ? { borderLeftColor: color } : {}]}>
          <Text style={styles.metricLabel}>
            {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
          </Text>
          <Text style={styles.metricValue}>
            {typeof value === "number" && (key.includes("amount") || key.includes("revenue") || key.includes("payment") || key.includes("total") || key.includes("rate"))
              ? formatNumber(value)
              : String(value)}
          </Text>
        </View>
      ))}
    </View>
  )
}

function renderTable(data: unknown[], maxRows = 20) {
  if (!Array.isArray(data) || data.length === 0) return null
  try {
    const sample = data[0] as Record<string, unknown>
    const keys = Object.keys(sample).filter(
      (k) => sample[k] !== null && sample[k] !== undefined && typeof sample[k] !== "object"
    ).slice(0, 8) // Limit columns for PDF width
    if (keys.length === 0) return null
    const rows = data.slice(0, maxRows)

    return (
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          {keys.map((k) => (
            <Text key={k} style={[styles.tableCell, { flex: 1 }]}>
              {k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
            </Text>
          ))}
        </View>
        {rows.map((row, i) => (
          <View key={i} style={styles.tableRow}>
            {keys.map((k) => {
              const val = (row as Record<string, unknown>)[k]
              const str = val !== null && val !== undefined && typeof val !== "object"
                ? String(val)
                : "-"
              return (
                <Text key={k} style={styles.tableCell}>
                  {str.length > 30 ? str.slice(0, 27) + "..." : str}
                </Text>
              )
            })}
          </View>
        ))}
        {data.length > maxRows && (
          <Text style={[styles.tableCell, { marginTop: 8, fontStyle: "italic" }]}>
            ... and {data.length - maxRows} more rows
          </Text>
        )}
      </View>
    )
  } catch {
    return null
  }
}

export function ReportPDFDocument({
  report,
  reportType,
  generatedAt,
  startDate,
  endDate,
}: {
  report: Record<string, unknown>
  reportType: string
  generatedAt: string
  startDate?: string
  endDate?: string
}) {
  const title = reportType.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()) + " Report"

  const sections: { title: string; content: React.ReactNode }[] = []
  const metaKeys = ["reportId", "reportType", "format", "generatedAt", "mccId", "startDate", "endDate"]

  // Extract summary/financial/analytics/quality etc. objects for metric cards
  for (const key of Object.keys(report)) {
    if (metaKeys.includes(key)) continue
    const val = report[key]
    if (val && typeof val === "object" && !Array.isArray(val) && key !== "collections" && key !== "payments" && key !== "farmerStats" && key !== "dailyStats" && key !== "weeklyData" && key !== "monthlyData" && key !== "topFarmers" && key !== "topProducts" && key !== "monthlyTrend") {
      const obj = val as Record<string, unknown>
      if (Object.keys(obj).some((k) => typeof obj[k] !== "object")) {
        sections.push({
          title: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
          content: renderMetrics(obj),
        })
      }
    }
  }

  // Add monthly/weekly trend if present
  if (report.monthlyTrend && Array.isArray(report.monthlyTrend)) {
    sections.push({
      title: "Monthly Trend",
      content: renderTable(report.monthlyTrend as unknown[], 12),
    })
  }
  if (report.dailyStats && Array.isArray(report.dailyStats)) {
    sections.push({
      title: "Daily Stats",
      content: renderTable(report.dailyStats as unknown[], 15),
    })
  }
  if (report.weeklyData && Array.isArray(report.weeklyData)) {
    sections.push({
      title: "Weekly Data",
      content: renderTable(report.weeklyData as unknown[], 12),
    })
  }
  if (report.monthlyData && Array.isArray(report.monthlyData)) {
    sections.push({
      title: "Monthly Data",
      content: renderTable(report.monthlyData as unknown[], 12),
    })
  }

  // Add collections table
  if (report.collections && Array.isArray(report.collections)) {
    sections.push({
      title: "Collections",
      content: renderTable(report.collections as unknown[], 15),
    })
  }

  // Add payments table
  if (report.payments && Array.isArray(report.payments)) {
    sections.push({
      title: "Payments",
      content: renderTable(report.payments as unknown[], 15),
    })
  }

  // Farmer stats
  if (report.farmerStats && Array.isArray(report.farmerStats)) {
    sections.push({
      title: "Farmer Stats",
      content: renderTable(report.farmerStats as unknown[], 15),
    })
  }

  // Top farmers/products
  if (report.topFarmers && Array.isArray(report.topFarmers)) {
    sections.push({
      title: "Top Farmers",
      content: renderTable(report.topFarmers as unknown[], 10),
    })
  }
  if (report.topProducts && Array.isArray(report.topProducts)) {
    sections.push({
      title: "Top Products",
      content: renderTable(report.topProducts as unknown[], 10),
    })
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Period: {startDate ? formatDate(startDate) : "N/A"} — {endDate ? formatDate(endDate) : "N/A"}
          </Text>
          <Text style={styles.subtitle}>Generated: {formatDate(generatedAt)}</Text>
        </View>

        {sections.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            {s.content}
          </View>
        ))}

        <Text style={styles.footer}>
          MCC Report • YDEN Platform • Confidential
        </Text>
      </Page>
    </Document>
  )
}
