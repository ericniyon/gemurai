import { SoromaWorkflowBoard, type WorkflowBoardItem } from "./workflow-board"
import { SoromaWorkflowTimeline, type WorkflowTimelineEvent } from "./workflow-timeline"

export function SoromaOperationalModule({
  dashboard,
  workflowTitle,
  workflowItems,
  recentEvents,
  tenantId,
}: {
  dashboard: React.ReactNode
  workflowTitle: string
  workflowItems: WorkflowBoardItem[]
  recentEvents: WorkflowTimelineEvent[]
  tenantId: string
}) {
  return (
    <div className="space-y-6">
      {dashboard}
      <div className="sf-dashboard-grid">
        <div className="sf-col-8">
          <SoromaWorkflowBoard
            tenantId={tenantId}
            title={workflowTitle}
            items={workflowItems}
          />
        </div>
        <div className="sf-col-4">
          <div className="sf-card sf-card-elevated h-full p-5">
            <SoromaWorkflowTimeline events={recentEvents} />
          </div>
        </div>
      </div>
    </div>
  )
}
