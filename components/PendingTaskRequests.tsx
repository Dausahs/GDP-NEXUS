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

export default function PendingTaskRequests({
    pendingTasks,
    teamMembers,
}: {
    pendingTasks: PendingTask[]
    teamMembers: TeamMember[]
}) {
    const [tasks, setTasks] = useState(pendingTasks)
    const [activeApprove, setActiveApprove] = useState<string | null>(null)
    const [activeReject, setActiveReject] = useState<string | null>(null)
    const [rejectionRemarks, setRejectionRemarks] = useState('')
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (tasks.length === 0) return null

    async function handleApprove(taskId: string, eventId: string) {
        setIsSubmitting(true)
        try {
            await updateTaskStatus(taskId, 'Pending', eventId, undefined, selectedAssignees)
            setTasks(prev => prev.filter(t => t.id !== taskId))
            setActiveApprove(null)
            setSelectedAssignees([])
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleReject(taskId: string, eventId: string) {
        if (!rejectionRemarks.trim()) return
        setIsSubmitting(true)
        try {
            await updateTaskStatus(taskId, 'Rejected', eventId, rejectionRemarks)
            setTasks(prev => prev.filter(t => t.id !== taskId))
            setActiveReject(null)
            setRejectionRemarks('')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Extract event ID from event_members relation
    function getEventId(task: PendingTask): string {
        // The eventId is stored in the task's event relation; we join it via the tasks query
        return (task.events as any)?.id ?? ''
    }

    // Find who submitted the request (first organizer member with dept=Organizer)
    function getRequester(task: PendingTask): string {
        const organizer = task.events?.event_members?.find(m => m.dept === 'Organizer')
        return organizer?.profiles?.full_name ?? 'Unknown'
    }

    return (
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
                <span className="text-xs text-text-muted">Awaiting your approval</span>
            </div>

            <div className="space-y-3">
                {tasks.map(task => {
                    const eventId = getEventId(task)
                    const requester = getRequester(task)

                    return (
                        <div
                            key={task.id}
                            className="card p-4 border-l-2 border-l-amber-500/60 hover:border-border-hover transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                {/* Left: task info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
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

                                    <p className="text-sm font-semibold text-text-primary mb-0.5 truncate">
                                        {task.title}
                                    </p>

                                    {task.description && (
                                        <p className="text-xs text-text-muted line-clamp-1 mb-1.5">
                                            {task.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted shrink-0"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                        {eventId ? (
                                            <Link
                                                href={`/dashboard/events/${eventId}`}
                                                className="text-xs text-accent hover:underline font-medium"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                {task.events?.title ?? 'Unknown project'}
                                            </Link>
                                        ) : (
                                            <span className="text-xs text-text-secondary font-medium">
                                                {task.events?.title ?? 'Unknown project'}
                                            </span>
                                        )}
                                        <span className="text-text-muted text-[10px]">·</span>
                                        <span className="text-[10px] text-text-muted">by {requester}</span>
                                    </div>
                                </div>

                                {/* Right: actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => {
                                            setActiveApprove(task.id)
                                            setSelectedAssignees([])
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/20 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveReject(task.id)
                                            setRejectionRemarks('')
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                        Reject
                                    </button>
                                </div>
                            </div>

                            {/* Approve inline panel */}
                            {activeApprove === task.id && (
                                <div className="mt-4 pt-4 border-t border-border" onClick={e => e.stopPropagation()}>
                                    <p className="text-xs font-medium text-text-secondary mb-3">
                                        Assign team members before approving:
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                                        {teamMembers.map(member => (
                                            <label
                                                key={member.user_id}
                                                className="flex items-center gap-2 p-2 rounded-md hover:bg-bg-subtle transition-colors cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAssignees.includes(member.user_id)}
                                                    onChange={e => {
                                                        if (e.target.checked) setSelectedAssignees(p => [...p, member.user_id])
                                                        else setSelectedAssignees(p => p.filter(id => id !== member.user_id))
                                                    }}
                                                    className="w-3.5 h-3.5 rounded accent-accent"
                                                />
                                                <span className="text-xs text-text-secondary truncate">
                                                    {member.profiles?.full_name}
                                                </span>
                                            </label>
                                        ))}
                                        {teamMembers.length === 0 && (
                                            <p className="text-xs text-text-muted col-span-3 py-2">No team members available</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => setActiveApprove(null)}
                                            className="px-3 py-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleApprove(task.id, eventId)}
                                            disabled={isSubmitting}
                                            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-green-500 hover:bg-green-400 text-white transition-colors disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Approving…' : 'Confirm & approve'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Reject inline panel */}
                            {activeReject === task.id && (
                                <div className="mt-4 pt-4 border-t border-border" onClick={e => e.stopPropagation()}>
                                    <p className="text-xs font-medium text-text-secondary mb-2">
                                        Reason for rejection (required):
                                    </p>
                                    <textarea
                                        value={rejectionRemarks}
                                        onChange={e => setRejectionRemarks(e.target.value)}
                                        placeholder="Provide feedback for the organizer…"
                                        rows={3}
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-danger transition-colors placeholder:text-text-muted resize-none mb-3"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => setActiveReject(null)}
                                            className="px-3 py-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleReject(task.id, eventId)}
                                            disabled={isSubmitting || !rejectionRemarks.trim()}
                                            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-danger hover:bg-red-400 text-white transition-colors disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Rejecting…' : 'Confirm rejection'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
