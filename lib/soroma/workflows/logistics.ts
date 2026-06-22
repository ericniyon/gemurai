import { SOROMA_PERMISSIONS as P } from "../permissions"
import type { WorkflowTransition } from "./types"

export const LOGISTICS_TRANSITIONS: WorkflowTransition[] = [
  {
    action: "assign",
    label: "Assign Route",
    from: ["PLANNED"],
    to: "ASSIGNED",
    permission: P.LOGISTICS_MANAGE,
  },
  {
    action: "dispatch",
    label: "Dispatch",
    from: ["ASSIGNED", "PLANNED"],
    to: "IN_TRANSIT",
    permission: P.LOGISTICS_MANAGE,
  },
  {
    action: "deliver",
    label: "Mark Delivered",
    from: ["IN_TRANSIT"],
    to: "DELIVERED",
    permission: P.LOGISTICS_MANAGE,
  },
  {
    action: "pod_received",
    label: "POD Received",
    from: ["DELIVERED"],
    to: "POD_RECEIVED",
    permission: P.LOGISTICS_MANAGE,
  },
  {
    action: "close",
    label: "Close Shipment",
    from: ["POD_RECEIVED", "DELIVERED"],
    to: "CLOSED",
    permission: P.LOGISTICS_MANAGE,
  },
  {
    action: "cancel",
    label: "Cancel",
    from: ["PLANNED", "ASSIGNED", "IN_TRANSIT"],
    to: "CANCELLED",
    permission: P.LOGISTICS_MANAGE,
  },
]
