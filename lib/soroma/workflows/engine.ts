import type { SoromaSession } from "../auth"
import { permissionSatisfies } from "../permissions"
import type { WorkflowTransition } from "./types"

export function getAvailableActions(
  currentStatus: string,
  transitions: WorkflowTransition[],
  session: SoromaSession
) {
  return transitions
    .filter((t) => t.from.includes(currentStatus))
    .filter(
      (t) => !t.permission || permissionSatisfies(session.permissions, t.permission)
    )
    .map((t) => ({
      action: t.action,
      label: t.label,
      permission: t.permission,
    }))
}

export function resolveTransition(
  currentStatus: string,
  action: string,
  transitions: WorkflowTransition[]
): { ok: true; to: string; transition: WorkflowTransition } | { ok: false; error: string } {
  const transition = transitions.find(
    (t) => t.action === action && t.from.includes(currentStatus)
  )
  if (!transition) {
    return {
      ok: false,
      error: `Action "${action}" is not allowed from status ${currentStatus}`,
    }
  }
  return { ok: true, to: transition.to, transition }
}
