'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskDetailsModal from './TaskDetailsModal'
import { updateTaskStatus } from '@/app/actions/tasks'

export function DraggableTask({ task, eventId, userRole, teamMembers }: {
  task: any, eventId: string, userRole?: string, teamMembers: any[]
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [rejectionRemarks, setRejectionRemarks] = useState('')
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMT = userRole === 'MT'

  async function handleApprove() {
    setIsSubmitting(true)
    try { await updateTaskStatus(task.id, 'Pending', eventId, undefined, selectedAssignees); setIsApproveModalOpen(false) }
    finally { setIsSubmitting(false) }
  }

  async function handleReject() {
    if (!rejectionRemarks.trim()) return
    setIsSubmitting(true)
    try { await updateTaskStatus(task.id, 'Rejected', eventId, rejectionRemarks); setIsRejectModalOpen(false) }
    finally { setIsSubmitting(false) }
  }

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, touchAction: 'none' }

  const statusLeft: Record<string, string> = {
    'Requested': 'bg-amber-400',
    'Rejected':  'bg-red-400',
    'Pending':   'bg-zinc-500',
    'Ongoing':   'bg-accent',
    'QC':        'bg-purple-400',
    'Delivered': 'bg-green-400',
  }
  const leftBar = statusLeft[task.status] || 'bg-zinc-600'

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => !isDragging && setIsModalOpen(true)}
        className="bg-bg-elevated border border-border rounded-lg p-3.5 cursor-pointer hover:border-border-hover transition-colors group relative overflow-hidden"
      >
        {/* Left accent bar */}
        <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-r ${leftBar}`} />

        <div className="pl-3">
          <p className="text-sm font-medium text-text-primary leading-snug mb-1 group-hover:text-accent transition-colors">
            {task.title}
          </p>

          {task.status === 'Rejected' && task.rejection_remarks && (
            <div className="bg-red-500/5 border border-red-500/15 rounded-md p-2 mb-2 mt-2">
              <p className="text-[10px] text-red-400/70 mb-0.5">Feedback</p>
              <p className="text-[11px] text-red-400 italic">"{task.rejection_remarks}"</p>
            </div>
          )}

          {task.description && (
            <p className="text-xs text-text-muted line-clamp-1 mb-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex flex-wrap gap-1">
              {task.task_assignees && task.task_assignees.length > 0 ? (
                task.task_assignees.slice(0, 2).map((a: any, i: number) => (
                  <span key={i} className="text-[10px] bg-bg-subtle border border-border px-1.5 py-0.5 rounded text-text-secondary">
                    {a.profiles?.full_name?.split(' ')[0] || '?'}
                  </span>
                ))
              ) : (
                <span className="text-[10px] bg-red-500/8 border border-red-500/15 px-1.5 py-0.5 rounded text-red-400">
                  {task.status === 'Requested' ? 'Pending review' : 'Unassigned'}
                </span>
              )}
              {task.task_assignees?.length > 2 && (
                <span className="text-[10px] text-text-muted">+{task.task_assignees.length - 2}</span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {task.status === 'Requested' && isMT && (
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={e => { e.stopPropagation(); setIsApproveModalOpen(true) }}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-colors border border-green-500/20"
                  >Approve</button>
                  <button
                    onClick={e => { e.stopPropagation(); setIsRejectModalOpen(true) }}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20"
                  >Reject</button>
                </div>
              )}
              {task.deadline && (
                <span suppressHydrationWarning className="text-[10px] text-text-muted">
                  {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
              {task.task_comments?.length > 0 && (
                <div className="flex items-center gap-0.5 text-text-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span className="text-[10px]">{task.task_comments.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4" onClick={() => setIsApproveModalOpen(false)}>
          <div className="bg-bg-elevated border border-border rounded-xl max-w-sm w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary">Approve & assign</h3>
              <button onClick={() => setIsApproveModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p className="text-xs text-text-secondary mb-4">Select team members to assign to this task</p>
            <div className="bg-bg-subtle border border-border rounded-lg p-3 max-h-[200px] overflow-y-auto custom-scrollbar space-y-1 mb-4">
              {teamMembers.map(member => (
                <label key={member.user_id} className="flex items-center gap-2.5 p-2 rounded-md hover:bg-bg-elevated transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAssignees.includes(member.user_id)}
                    onChange={e => {
                      if (e.target.checked) setSelectedAssignees(p => [...p, member.user_id])
                      else setSelectedAssignees(p => p.filter(id => id !== member.user_id))
                    }}
                    className="w-3.5 h-3.5 rounded accent-accent"
                  />
                  <span className="text-xs text-text-secondary">{member.profiles?.full_name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsApproveModalOpen(false)} className="flex-1 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
              <button onClick={handleApprove} disabled={isSubmitting}
                className="flex-[2] bg-green-500 hover:bg-green-400 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {isSubmitting ? 'Approving…' : 'Approve & start'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4" onClick={() => setIsRejectModalOpen(false)}>
          <div className="bg-bg-elevated border border-border rounded-xl max-w-sm w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary">Reject request</h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p className="text-xs text-text-secondary mb-3">Provide feedback for the organizer</p>
            <textarea
              value={rejectionRemarks}
              onChange={e => setRejectionRemarks(e.target.value)}
              placeholder="Reason for rejection…"
              rows={4}
              className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-danger transition-colors placeholder:text-text-muted resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setIsRejectModalOpen(false)} className="flex-1 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
              <button onClick={handleReject} disabled={isSubmitting || !rejectionRemarks.trim()}
                className="flex-[2] bg-danger hover:bg-red-400 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {isSubmitting ? 'Rejecting…' : 'Confirm rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <TaskDetailsModal task={task} eventId={eventId} userRole={userRole} teamMembers={teamMembers} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  )
}
