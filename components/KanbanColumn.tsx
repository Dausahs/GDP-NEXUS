'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableTask } from './DraggableTask'

export function KanbanColumn({ id, tasks, title, eventId, userRole }: { id: string, tasks: any[], title: string, eventId: string, userRole?: string }) {
  const { setNodeRef } = useDroppable({ id })

  const statusColors: Record<string, string> = {
    'Pending': 'bg-white/20',
    'Ongoing': 'bg-cyan-neon shadow-[0_0_10px_rgba(0,245,255,0.3)]',
    'QC': 'bg-violet-neon shadow-[0_0_10px_rgba(138,43,226,0.3)]',
    'Delivered': 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
  }

  return (
    <div className="flex flex-col w-full md:min-w-[300px] h-full">
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="font-display font-bold text-sm text-white/40 uppercase tracking-[0.2em] flex items-center gap-3">
          <span className={`w-1.5 h-6 rounded-full ${statusColors[id] || 'bg-white/10'}`}></span>
          {title}
        </h3>
        <span className="text-[10px] font-mono font-bold text-white/20 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
          {tasks.length}
        </span>
      </div>
      
      <div 
        ref={setNodeRef} 
        className="flex-1 space-y-4 min-h-[500px] p-2 rounded-[2rem] bg-white/[0.01] transition-colors"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <DraggableTask key={task.id} task={task} eventId={eventId} userRole={userRole} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="h-32 border border-dashed border-white/5 rounded-[2rem] flex items-center justify-center">
            <span className="text-[10px] font-mono text-white/10 uppercase tracking-widest">Sector Empty</span>
          </div>
        )}
      </div>
    </div>
  )
}
