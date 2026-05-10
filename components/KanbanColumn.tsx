'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableTask } from './DraggableTask'

const statusDots: Record<string, string> = {
  'Requested': 'bg-amber-400',
  'Rejected':  'bg-red-400',
  'Pending':   'bg-zinc-500',
  'Ongoing':   'bg-accent',
  'QC':        'bg-purple-400',
  'Delivered': 'bg-green-400',
}

export function KanbanColumn({ id, tasks, title, eventId, userRole, teamMembers }: {
  id: string, tasks: any[], title: string, eventId: string, userRole?: string, teamMembers: any[]
}) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusDots[id] || 'bg-zinc-600'}`} />
          <h3 className="text-xs font-semibold text-text-secondary">{title}</h3>
        </div>
        <span className="text-[10px] font-medium text-text-muted bg-bg-subtle border border-border px-1.5 py-0.5 rounded">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 space-y-2 min-h-[400px] p-2 rounded-lg bg-bg-subtle/50 transition-colors"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <DraggableTask key={task.id} task={task} eventId={eventId} userRole={userRole} teamMembers={teamMembers} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="h-24 border border-dashed border-border rounded-lg flex items-center justify-center">
            <span className="text-xs text-text-muted">Empty</span>
          </div>
        )}
      </div>
    </div>
  )
}
