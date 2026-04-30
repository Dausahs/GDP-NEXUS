'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskDetailsModal from './TaskDetailsModal'
import { updateTaskStatus, deleteTask } from '@/app/actions/tasks'

export function DraggableTask({ task, eventId, userRole, teamMembers }: { task: any, eventId: string, userRole?: string, teamMembers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [rejectionRemarks, setRejectionRemarks] = useState('')
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMT = userRole === 'MT'

  async function handleApprove() {
    setIsSubmitting(true)
    try {
      await updateTaskStatus(task.id, 'Pending', eventId, undefined, selectedAssignees)
      setIsApproveModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleReject() {
    if (!rejectionRemarks.trim()) return
    setIsSubmitting(true)
    try {
      await updateTaskStatus(task.id, 'Rejected', eventId, rejectionRemarks)
      setIsRejectModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

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
    'Requested': { color: 'bg-amber-500', glow: 'shadow-[0_0_8px_rgba(245,158,11,0.5)]', border: 'hover:border-amber-500/30', text: 'text-amber-500' },
    'Rejected': { color: 'bg-red-500', glow: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]', border: 'hover:border-red-500/30', text: 'text-red-500' },
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
              <div className="flex flex-col min-w-0">
                <p className={`font-display font-bold text-white text-sm md:text-base leading-tight group-hover:text-white transition-colors truncate`}>{task.title}</p>
                {task.status === 'Rejected' && (
                  <span className="text-[8px] font-mono font-bold text-red-500 uppercase tracking-widest mt-1">Status: Rejected</span>
                )}
              </div>
              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${accent.color} ${accent.glow} shrink-0 ml-2 mt-1`} />
            </div>
            
            <div className={`laser-line ${accent.color} opacity-30 mb-4`}></div>
            
            {task.description && (
              <p className="text-xs text-white/40 mb-4 line-clamp-2 leading-relaxed font-medium italic">
                  {task.description}
              </p>
            )}

            {task.status === 'Rejected' && task.rejection_remarks && (
              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 mb-4">
                <p className="text-[9px] font-mono font-bold text-red-400/50 uppercase tracking-widest mb-1">MT Feedback</p>
                <p className="text-[10px] text-red-400 italic leading-relaxed">"{task.rejection_remarks}"</p>
              </div>
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
                {task.status === 'Requested' ? 'PENDING REVIEW' : 'UNASSIGNED'}
              </span>
            )}
            {task.task_assignees?.length > 2 && (
              <span className="text-[8px] md:text-[9px] font-mono text-white/20">+{task.task_assignees.length - 2}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {task.status === 'Requested' && isMT && (
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsApproveModalOpen(true)
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-wider hover:bg-emerald-500 hover:text-black transition-all"
                >
                  Approve
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsRejectModalOpen(true)
                  }}
                  className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-[9px] font-mono font-bold uppercase tracking-wider hover:bg-red-500 hover:text-black transition-all"
                >
                  Reject
                </button>
              </div>
            )}
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

      {/* Approve & Assign Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6 backdrop-blur-xl" onClick={() => setIsApproveModalOpen(false)}>
          <div className="glass rounded-[2rem] max-w-md w-full p-8 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">Review & Assign</h3>
                <p className="text-[10px] font-mono text-emerald-400/60 uppercase tracking-[0.2em]">Select personnel to handle this task</p>
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Available Team Members</label>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-h-[250px] overflow-y-auto custom-scrollbar space-y-2">
                {teamMembers.map((member) => (
                  <label key={member.user_id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedAssignees.includes(member.user_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAssignees(prev => [...prev, member.user_id])
                        } else {
                          setSelectedAssignees(prev => prev.filter(id => id !== member.user_id))
                        }
                      }}
                      className="w-4 h-4 rounded border-white/10 bg-transparent text-emerald-500 focus:ring-emerald-500/50"
                    />
                    <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">{member.profiles?.full_name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setIsApproveModalOpen(false)}
                className="flex-1 px-6 py-3 rounded-xl font-mono font-bold text-[10px] text-white/30 hover:text-white transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex-[2] bg-emerald-500 text-black px-6 py-3 rounded-xl font-display font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
              >
                {isSubmitting ? 'PROCESSING...' : 'APPROVE & START'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Rejection Remarks Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6 backdrop-blur-xl" onClick={() => setIsRejectModalOpen(false)}>
          <div className="glass rounded-[2rem] max-w-md w-full p-8 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">Reject Request</h3>
                <p className="text-[10px] font-mono text-red-400/60 uppercase tracking-[0.2em]">Provide feedback for the organizer</p>
              </div>
            </div>

            <textarea 
              value={rejectionRemarks}
              onChange={(e) => setRejectionRemarks(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-red-500 transition-all placeholder:text-white/10 resize-none font-medium mb-6"
            />

            <div className="flex gap-4">
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 px-6 py-3 rounded-xl font-mono font-bold text-[10px] text-white/30 hover:text-white transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject}
                disabled={isSubmitting || !rejectionRemarks.trim()}
                className="flex-[2] bg-red-500 text-white px-6 py-3 rounded-xl font-display font-bold text-xs shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
              >
                {isSubmitting ? 'REJECTING...' : 'CONFIRM REJECTION'}
              </button>
            </div>
          </div>
        </div>
      )}


      {isModalOpen && (
        <TaskDetailsModal 
          task={task} 
          eventId={eventId} 
          userRole={userRole}
          teamMembers={teamMembers}
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  )
}
