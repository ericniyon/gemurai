export type WorkflowEntityType =
  | "SoromaPurchaseOrder"
  | "SoromaProductionBatch"
  | "SoromaShipment"
  | "SoromaCAPA"
  | "SoromaOrder"

export type WorkflowTransition = {
  action: string
  label: string
  from: string[]
  to: string
  permission?: string
}

export type WorkflowActionOption = {
  action: string
  label: string
  permission?: string
}

export type WorkflowItem = {
  id: string
  label: string
  status: string
  entityType: WorkflowEntityType
  actions: WorkflowActionOption[]
}
