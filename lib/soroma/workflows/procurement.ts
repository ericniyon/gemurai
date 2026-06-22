import { SOROMA_PERMISSIONS as P } from "../permissions"
import type { WorkflowTransition } from "./types"

export const PROCUREMENT_TRANSITIONS: WorkflowTransition[] = [
  {
    action: "send_rfq",
    label: "Send RFQ",
    from: ["REQUESTED"],
    to: "RFQ_SENT",
    permission: P.PROCUREMENT_MANAGE,
  },
  {
    action: "submit_approval",
    label: "Submit for Approval",
    from: ["RFQ_SENT", "REQUESTED"],
    to: "AWAITING_APPROVAL",
    permission: P.PROCUREMENT_MANAGE,
  },
  {
    action: "approve",
    label: "Approve PO",
    from: ["AWAITING_APPROVAL"],
    to: "APPROVED",
    permission: P.PO_APPROVE,
  },
  {
    action: "reject",
    label: "Reject",
    from: ["AWAITING_APPROVAL"],
    to: "CANCELLED",
    permission: P.PO_APPROVE,
  },
  {
    action: "receive_partial",
    label: "Partial Receipt",
    from: ["APPROVED"],
    to: "PARTIALLY_RECEIVED",
    permission: P.PROCUREMENT_MANAGE,
  },
  {
    action: "close",
    label: "Close PO",
    from: ["APPROVED", "PARTIALLY_RECEIVED"],
    to: "CLOSED",
    permission: P.PROCUREMENT_MANAGE,
  },
  {
    action: "cancel",
    label: "Cancel",
    from: ["REQUESTED", "RFQ_SENT", "AWAITING_APPROVAL", "APPROVED"],
    to: "CANCELLED",
    permission: P.PROCUREMENT_MANAGE,
  },
]
