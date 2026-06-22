import React from "react"
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: "Helvetica" },
  header: { marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#d1d5db", paddingBottom: 8 },
  title: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 9, color: "#6b7280", marginTop: 2 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 6, marginTop: 8, color: "#1f2937" },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", paddingVertical: 6, paddingHorizontal: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingVertical: 6, paddingHorizontal: 4 },
  cell: { flex: 1, fontSize: 8, marginRight: 4 },
})

function normalizeCell(value: unknown) {
  if (value === null || value === undefined) return "-"
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

export function SoromaExportPDFDocument({
  title,
  subtitle,
  columns,
  rows,
}: {
  title: string
  subtitle?: string
  columns: string[]
  rows: Array<Record<string, unknown>>
}) {
  const shownColumns = columns.slice(0, 6)
  const shownRows = rows.slice(0, 80)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <Text style={styles.sectionTitle}>Export Snapshot</Text>
        <View style={styles.tableHeader}>
          {shownColumns.map((column) => (
            <Text key={column} style={styles.cell}>
              {column}
            </Text>
          ))}
        </View>

        {shownRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.tableRow}>
            {shownColumns.map((column) => (
              <Text key={`${rowIndex}-${column}`} style={styles.cell}>
                {normalizeCell(row[column])}
              </Text>
            ))}
          </View>
        ))}

        {rows.length > shownRows.length ? (
          <Text style={styles.subtitle}>
            Showing {shownRows.length} of {rows.length} rows in PDF preview.
          </Text>
        ) : null}
      </Page>
    </Document>
  )
}
