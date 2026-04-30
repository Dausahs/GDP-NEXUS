'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskDetailsModal from './TaskDetailsModal'
import { updateTaskStatus } from '@/app/actions/tasks'

export function DraggableTask({ task, eventId, userRole }: { task: any, eventId: string, userRole?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
  }

  const statusAccents: Record<string, { color: string, glow: string, border: string, text: string }> = {
    'Pending': { color: 'bg-white/20', glow: 'shadow-[0_0_8px_rgba(255,255,255,0.3)]', border: 'hover:border-white/20', text: 'text-white/20' },
    'Ongoing': { color: 'bg-cyan-neon', glow: 'shadow-[0_0_8px_rgba(0,245,255,0.8)]', border: 'hover:border-cyan-neon/30', text: 'text-cyan-neon' },
    'QC': { color: 'bg-violet-neon', glow: 'shadow-[0_0_8px_rgba(138,43,226,0.8)]', border: 'hover:border-violet-neon/30', text: 'text-violet-neon' },
    'Delivered': { color: 'bg-emerald-500', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.8)]', border: 'hover:border-emerald-500/30', text: 'text-emerald-400' },
  }

  const accent = statusAccents[task.status] || statusAccents['Pending']

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => !isDragging && setIsModalOpen(true)}
        className={`bg-surface p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] shadow-none border border-white/5 ${accent.border} transition-all cursor-pointer active:cursor-grabbing z-10 relative group overflow-hidden`}
      >
        <div className="flex gap-3 md:gap-4">
          <div className={`w-1 h-full min-h-[30px] md:min-h-[40px] ${accent.color} rounded-full opacity-40 shrink-0 group-hover:opacity-100 transition-opacity`}></div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2 md:mb-3">
              <p className={`font-display font-bold text-white text-sm md:text-base leading-tight group-hover:text-white transition-colors truncate`}>{task.title}</p>
              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${accent.color} ${accent.glow} shrink-0 ml-2 mt-1`} />
            </div>
            
            <div className={`laser-line ${accent.color} opacity-30 mb-4`}></div>
            
            {task.description && (
              <p className="text-xs text-white/40 mb-4 line-clamp-2 leading-relaxed font-medium italic">
                  {task.description}
              </p>
            )}
          </div>
        </div>


        <div className="flex items-center justify-between mt-3 md:mt-auto pt-3 md:pt-4 border-t border-white/5">
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {task.task_assignees && task.task_assignees.length > 0 ? (
              task.task_assignees.slice(0, 2).map((assignee: any, i: number) => (
                <span key={i} className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg text-[8px] md:text-[9px] font-mono font-bold uppercase tracking-wider bg-white/5 text-white/50 border border-white/5">
                  {assignee.profiles?.full_name?.split(' ')[0] || '??'}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg text-[8px] md:text-[9px] font-mono font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                UNASSIGNED
              </span>
            )}
            {task.task_assignees?.length > 2 && (
              <span className="text-[8px] md:text-[9px] font-mono text-white/20">+{task.task_assignees.length - 2}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {task.task_comments && task.task_comments.length > 0 && (
                <div className={`flex items-center gap-1 md:gap-1.5 text-white/20 group-hover:${accent.text}/50 transition-colors`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-3 md:h-3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <span className="text-[9px] md:text-[10px] font-mono font-bold">{task.task_comments.length}</span>
                </div>
            )}
            <div className={`flex items-center gap-1 md:gap-2 ${accent.text} transition-colors`}>
                <span suppressHydrationWarning className="text-[8px] md:text-[9px] font-mono font-bold uppercase">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}
                </span>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <TaskDetailsModal 
          task={task} 
          eventId={eventId} 
          userRole={userRole}
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  )
}
