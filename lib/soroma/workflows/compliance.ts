import { SOROMA_PERMISSIONS as P } from "../permissions"
import type { WorkflowTransition } from "./types"

export const CAPA_TRANSITIONS: WorkflowTransition[] = [
  {
    action: "start_investigation",
    label: "Start Investigation",
    from: ["OPEN"],
    to: "INVESTIGATION",
    permission: P.COMPLIANCE_MANAGE,
  },
  {
    action: "start_corrective_action",
    label: "Corrective Action",
    from: ["INVESTIGATION"],
    to: "CORRECTIVE_ACTION",
    permission: P.COMPLIANCE_MANAGE,
  },
  {
    action: "start_verification",
    label: "Verification",
    from: ["CORRECTIVE_ACTION"],
    to: "VERIFICATION",
    permission: P.COMPLIANCE_MANAGE,
  },
  {
    action: "close_capa",
    label: "Close CAPA",
    from: ["VERIFICATION"],
    to: "CLOSED",
    permission: P.COMPLIANCE_MANAGE,
  },
  {
    action: "reopen_capa",
    label: "Reopen",
    from: ["CLOSED"],
    to: "INVESTIGATION",
    permission: P.COMPLIANCE_MANAGE,
  },
]
