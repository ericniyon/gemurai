/** Centralized status → badge styling per UI/UX handoff */

export type StatusSeverity = "success" | "warning" | "critical" | "info" | "neutral"

const SUCCESS_LABELS = new Set([
  "connected",
  "healthy",
  "compliant",
  "verified",
  "active",
  "completed",
  "delivered",
  "pass",
  "ready",
  "on track",
  "approved",
  "closed",
])

const WARNING_LABELS = new Set([
  "partial",
  "pending",
  "in review",
  "in progress",
  "due soon",
  "warning",
  "medium",
  "at risk",
  "awaiting approval",
  "onboarding",
])

const CRITICAL_LABELS = new Set([
  "critical",
  "down",
  "non-compliant",
  "open",
  "failed",
  "not ready",
  "suspended",
  "high",
  "cancelled",
  "rejected",
  "recalled",
])

export function getStatusSeverity(status: string): StatusSeverity {
  const key = status.toLowerCase().trim()
  if (SUCCESS_LABELS.has(key)) return "success"
  if (WARNING_LABELS.has(key)) return "warning"
  if (CRITICAL_LABELS.has(key)) return "critical"
  if (["sent", "scheduled", "planned", "monitoring", "draft"].includes(key)) {
    return "info"
  }
  return "neutral"
}

export const STATUS_BADGE_CLASSES: Record<StatusSeverity, string> = {
  success: "sf-badge--success",
  warning: "sf-badge--warning",
  critical: "sf-badge--critical",
  info: "sf-badge--info",
  neutral: "sf-badge--neutral",
}

export const KPI_SEVERITY_ICON_CLASSES: Record<StatusSeverity, string> = {
  success: "sf-kpi-icon--success",
  warning: "sf-kpi-icon--warning",
  critical: "sf-kpi-icon--critical",
  info: "sf-kpi-icon--info",
  neutral: "sf-kpi-icon--neutral",
}
