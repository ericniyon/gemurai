import { SOROMA_PERMISSIONS as P } from "../permissions"
import type { WorkflowTransition } from "./types"

export const PRODUCTION_TRANSITIONS: WorkflowTransition[] = [
  {
    action: "start",
    label: "Start Batch",
    from: ["PLANNED"],
    to: "STARTED",
    permission: P.PRODUCTION_MANAGE,
  },
  {
    action: "progress",
    label: "Mark In Progress",
    from: ["STARTED"],
    to: "IN_PROGRESS",
    permission: P.PRODUCTION_MANAGE,
  },
  {
    action: "qc_review",
    label: "Send to QC Review",
    from: ["IN_PROGRESS"],
    to: "QC_REVIEW",
    permission: P.PRODUCTION_MANAGE,
  },
  {
    action: "complete",
    label: "Complete Batch",
    from: ["QC_REVIEW", "IN_PROGRESS"],
    to: "COMPLETED",
    permission: P.PRODUCTION_MANAGE,
  },
  {
    action: "archive",
    label: "Archive",
    from: ["COMPLETED"],
    to: "ARCHIVED",
    permission: P.PRODUCTION_MANAGE,
  },
  {
    action: "hold",
    label: "Put On Hold",
    from: ["PLANNED", "STARTED", "IN_PROGRESS", "QC_REVIEW"],
    to: "ON_HOLD",
    permission: P.PRODUCTION_MANAGE,
  },
  {
    action: "resume",
    label: "Resume",
    from: ["ON_HOLD"],
    to: "IN_PROGRESS",
    permission: P.PRODUCTION_MANAGE,
  },
  {
    action: "cancel",
    label: "Cancel Batch",
    from: ["PLANNED", "STARTED", "IN_PROGRESS", "QC_REVIEW", "ON_HOLD"],
    to: "CANCELLED",
    permission: P.PRODUCTION_MANAGE,
  },
]
