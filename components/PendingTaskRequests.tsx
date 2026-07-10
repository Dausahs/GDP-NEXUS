'use client'

import { useState } from 'react'
import { updateTaskStatus } from '@/app/actions/tasks'
import Link from 'next/link'

type PendingTask = {
    id: string
    title: string
    description?: string | null
    department: string
    deadline?: string | null
    events: { id?: string; title: string; event_members: { user_id: string; dept: string; profiles: { full_name: string } | null }[] } | null
    task_assignees: { user_id: string }[]
}

type TeamMember = { user_id: string; profiles: { full_name: string } }

// ── Detail / action modal ─────────────────────────────────────────────────────
function TaskReviewModal({
    task,
    teamMembers,
    onClose,
    onActioned,
}: {
    task: PendingTask
    teamMembers: TeamMember[]
    onClose: () => void
    onActioned: (taskId: string) => void
}) {
    const [view, setView] = useState<'detail' | 'approve' | 'reject'>('detail')
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
    const [rejectionRemarks, setRejectionRemarks] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const eventId = (task.events as any)?.id ?? ''
    const requester = task.events?.event_members?.find(m => m.dept === 'Organizer')?.profiles?.full_name ?? 'Unknown'
    const allOrganizers = task.events?.event_members?.filter(m => m.dept === 'Organizer') ?? []

    async function handleApprove() {
        setIsSubmitting(true)
        try {
            await updateTaskStatus(task.id, 'Pending', eventId, undefined, selectedAssignees)
            onActioned(task.id)
            onClose()
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleReject() {
        if (!rejectionRemarks.trim()) return
        setIsSubmitting(true)
        try {
            await updateTaskStatus(task.id, 'Rejected', eventId, rejectionRemarks)
            onActioned(task.id)
            onClose()
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-bg-elevated border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* ── Modal header ── */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-[10px] font-mono font-semibold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                                Requested
                            </span>
                            <span className="text-[10px] text-text-muted bg-bg-subtle border border-border px-2 py-0.5 rounded">
                                {task.department}
                            </span>
                        </div>
                        <h2 className="text-base font-semibold text-text-primary leading-snug">
                            {task.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-5">

                    {/* Meta row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-bg-subtle border border-border rounded-xl p-3">
                            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Project</p>
                            {eventId ? (
                                <Link
                                    href={`/dashboard/events/${eventId}`}
                                    className="text-sm font-medium text-accent hover:underline"
                                    onClick={e => e.stopPropagation()}
                                >
                                    {task.events?.title ?? '—'}
                                </Link>
                            ) : (
                                <p className="text-sm font-medium text-text-primary">{task.events?.title ?? '—'}</p>
                            )}
                        </div>
                        <div className="bg-bg-subtle border border-border rounded-xl p-3">
                            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Due date</p>
                            <p suppressHydrationWarning className="text-sm font-medium text-text-primary">
                                {task.deadline
                                    ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                                    : 'No deadline'}
                            </p>
                        </div>
                        <div className="bg-bg-subtle border border-border rounded-xl p-3">
                            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Requested by</p>
                            <p className="text-sm font-medium text-text-primary">{requester}</p>
                        </div>
                        <div className="bg-bg-subtle border border-border rounded-xl p-3">
                            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Department</p>
                            <p className="text-sm font-medium text-text-primary">{task.department}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Description / Briefing</p>
                        <div className="bg-bg-subtle border border-border rounded-xl p-4">
                            {task.description ? (
                                <p className="text-sm text-text-secondary leading-relaxed">{task.description}</p>
                            ) : (
                                <p className="text-sm text-text-muted italic">No description provided.</p>
                            )}
                        </div>
                    </div>

                    {/* All organizers on this event */}
                    {allOrganizers.length > 0 && (
                        <div>
                            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Organizer(s) on this project</p>
                            <div className="flex flex-wrap gap-2">
                                {allOrganizers.map((m, i) => (
                                    <span key={i} className="text-xs bg-bg-subtle border border-border px-2.5 py-1 rounded-lg text-text-secondary">
                                        {m.profiles?.full_name ?? 'Unknown'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Approve panel ── */}
                    {view === 'approve' && (
                        <div className="border border-green-500/20 bg-green-500/5 rounded-xl p-4 space-y-3">
                            <p className="text-xs font-medium text-green-400">
                                Assign team members (optional) then confirm:
                            </p>
                            <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto custom-scrollbar">
                                {teamMembers.map(member => (
                                    <label key={member.user_id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-bg-subtle transition-colors cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedAssignees.includes(member.user_id)}
                                            onChange={e => {
                                                if (e.target.checked) setSelectedAssignees(p => [...p, member.user_id])
                                                else setSelectedAssignees(p => p.filter(id => id !== member.user_id))
                                            }}
                                            className="w-3.5 h-3.5 rounded accent-accent"
                                        />
                                        <span className="text-xs text-text-secondary truncate">{member.profiles?.full_name}</span>
                                    </label>
                                ))}
                                {teamMembers.length === 0 && (
                                    <p className="col-span-2 text-xs text-text-muted py-2">No team members available</p>
                                )}
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button onClick={() => setView('detail')} className="flex-1 py-2 rounded-lg text-xs text-text-muted hover:text-text-secondary transition-colors">
                                    Back
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={isSubmitting}
                                    className="flex-[2] bg-green-500 hover:bg-green-400 text-white py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Approving…' : 'Confirm & approve'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Reject panel ── */}
                    {view === 'reject' && (
                        <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-4 space-y-3">
                            <p className="text-xs font-medium text-red-400">
                                Provide a reason for rejection (required):
                            </p>
                            <textarea
                                value={rejectionRemarks}
                                onChange={e => setRejectionRemarks(e.target.value)}
                                placeholder="Explain to the organizer why this task was rejected…"
                                rows={4}
                                className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-danger transition-colors placeholder:text-text-muted resize-none"
                            />
                            <div className="flex gap-2">
                                <button onClick={() => setView('detail')} className="flex-1 py-2 rounded-lg text-xs text-text-muted hover:text-text-secondary transition-colors">
                                    Back
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={isSubmitting || !rejectionRemarks.trim()}
                                    className="flex-[2] bg-danger hover:bg-red-400 text-white py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Rejecting…' : 'Confirm rejection'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer actions (shown only on detail view) ── */}
                {view === 'detail' && (
                    <div className="px-6 pb-6 pt-4 border-t border-border flex gap-3 shrink-0">
                        <button
                            onClick={() => { setView('reject'); setRejectionRemarks('') }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Reject
                        </button>
                        <button
                            onClick={() => { setView('approve'); setSelectedAssignees([]) }}
                            className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/20 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Approve
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Main list component ───────────────────────────────────────────────────────
export default function PendingTaskRequests({
    pendingTasks,
    teamMembers,
}: {
    pendingTasks: PendingTask[]
    teamMembers: TeamMember[]
}) {
    const [tasks, setTasks] = useState(pendingTasks)
    const [selectedTask, setSelectedTask] = useState<PendingTask | null>(null)

    if (tasks.length === 0) return null

    function getEventId(task: PendingTask) { return (task.events as any)?.id ?? '' }
    function getRequester(task: PendingTask) {
        return task.events?.event_members?.find(m => m.dept === 'Organizer')?.profiles?.full_name ?? 'Unknown'
    }

    return (
        <>
            <section>
                {/* Section header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                            Pending Task Requests
                        </h2>
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-semibold">
                            {tasks.length}
                        </span>
                    </div>
                    <span className="text-xs text-text-muted">Click a request to review</span>
                </div>

                <div className="space-y-2">
                    {tasks.map(task => {
                        const eventId = getEventId(task)
                        const requester = getRequester(task)

                        return (
                            <button
                                key={task.id}
                                onClick={() => setSelectedTask(task)}
                                className="w-full text-left card p-4 border-l-2 border-l-amber-500/60 hover:border-accent hover:bg-bg-subtle transition-colors group"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Badges */}
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <span className="text-[10px] font-mono font-semibold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                                                Requested
                                            </span>
                                            <span className="text-[10px] text-text-muted bg-bg-subtle border border-border px-2 py-0.5 rounded">
                                                {task.department}
                                            </span>
                                            {task.deadline && (
                                                <span suppressHydrationWarning className="text-[10px] text-text-muted">
                                                    Due {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate mb-0.5">
                                            {task.title}
                                        </p>

                                        {/* Description preview */}
                                        {task.description && (
                                            <p className="text-xs text-text-muted line-clamp-1 mb-1.5">
                                                {task.description}
                                            </p>
                                        )}

                                        {/* Project + requester */}
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted shrink-0">
                                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                                            </svg>
                                            <span className="text-xs text-text-secondary font-medium">
                                                {task.events?.title ?? 'Unknown project'}
                                            </span>
                                            <span className="text-text-muted text-[10px]">·</span>
                                            <span className="text-[10px] text-text-muted">by {requester}</span>
                                        </div>
                                    </div>

                                    {/* Chevron hint */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[10px] text-text-muted group-hover:text-accent transition-colors hidden sm:block">
                                            Review
                                        </span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted group-hover:text-accent transition-colors">
                                            <polyline points="9 18 15 12 9 6"/>
                                        </svg>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </section>

            {/* Detail modal */}
            {selectedTask && (
                <TaskReviewModal
                    task={selectedTask}
                    teamMembers={teamMembers}
                    onClose={() => setSelectedTask(null)}
                    onActioned={id => setTasks(prev => prev.filter(t => t.id !== id))}
                />
            )}
        </>
    )
}
