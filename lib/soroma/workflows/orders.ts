import { SOROMA_PERMISSIONS as P } from "../permissions"
import type { WorkflowTransition } from "./types"

export const ORDER_TRANSITIONS: WorkflowTransition[] = [
  {
    action: "send_quote",
    label: "Send Quote",
    from: ["DRAFT"],
    to: "QUOTED",
    permission: P.ORDERS_MANAGE,
  },
  {
    action: "confirm",
    label: "Confirm Order",
    from: ["QUOTED", "DRAFT"],
    to: "CONFIRMED",
    permission: P.ORDERS_MANAGE,
  },
  {
    action: "reserve_inventory",
    label: "Reserve Inventory",
    from: ["CONFIRMED"],
    to: "IN_FULFILLMENT",
    permission: P.ORDERS_MANAGE,
  },
  {
    action: "dispatch",
    label: "Dispatch",
    from: ["IN_FULFILLMENT"],
    to: "SHIPPED",
    permission: P.ORDERS_MANAGE,
  },
  {
    action: "invoice",
    label: "Generate Invoice",
    from: ["SHIPPED", "IN_FULFILLMENT"],
    to: "SHIPPED",
    permission: P.ORDERS_MANAGE,
  },
  {
    action: "mark_receivable",
    label: "Record Receivable",
    from: ["SHIPPED", "DELIVERED"],
    to: "DELIVERED",
    permission: P.FINANCE_MANAGE,
  },
  {
    action: "deliver",
    label: "Mark Delivered",
    from: ["SHIPPED"],
    to: "DELIVERED",
    permission: P.ORDERS_MANAGE,
  },
  {
    action: "cancel",
    label: "Cancel",
    from: ["DRAFT", "QUOTED", "CONFIRMED"],
    to: "CANCELLED",
    permission: P.ORDERS_MANAGE,
  },
]
