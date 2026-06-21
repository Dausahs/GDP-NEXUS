// components/UpcomingObjectives.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function UpcomingObjectives({ tasks, activeEvents = [], currentUserId, userRole }: {
    tasks: any[], activeEvents?: any[], currentUserId: string, userRole?: string
}) {
    const [showOnlyMine, setShowOnlyMine] = useState(false)
    const [selectedEventId, setSelectedEventId] = useState<string>('all')
    const [selectedOrganizerId, setSelectedOrganizerId] = useState<string>('all')

    let filteredTasks = tasks

    if (showOnlyMine) {
        filteredTasks = filteredTasks.filter(t => t.task_assignees?.some((a: any) => a.user_id === currentUserId))
    }
    if (selectedEventId !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.event_id === selectedEventId)
    }
    if (selectedOrganizerId !== 'all') {
        filteredTasks = filteredTasks.filter(t =>
            t.events?.event_members?.some((em: any) => em.dept === 'Organizer' && em.user_id === selectedOrganizerId)
        )
    }

    const uniqueEvents = activeEvents.map(e => [e.id, e.title])
    const uniqueOrganizers = Array.from(new Map(
        activeEvents.flatMap(e => e.event_members || [])
            .filter((em: any) => em.dept === 'Organizer')
            .map((em: any) => [em.user_id, em.profiles?.full_name || 'Unknown'])
    ).entries())

    const deptDots: Record<string, string> = {
        'Graphic':    'bg-[#6366f1]',
        'Production': 'bg-[#22c55e]',
        'Sculpture':  'bg-[#f59e0b]',
    }

    return (
        <section>
            <div className="flex flex-col gap-3 mb-4">
                <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {userRole === 'organizer' ? 'Assigned Tasks' : 'Upcoming Tasks'}
                </h2>

                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 custom-scrollbar">
                    <select
                        value={selectedOrganizerId}
                        onChange={e => setSelectedOrganizerId(e.target.value)}
                        className="bg-bg-subtle border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent transition-colors flex-shrink-0"
                    >
                        <option value="all">All organizers</option>
                        {uniqueOrganizers.map(([id, name]) => (
                            <option key={id as string} value={id as string}>{name as string}</option>
                        ))}
                    </select>

                    <select
                        value={selectedEventId}
                        onChange={e => setSelectedEventId(e.target.value)}
                        className="bg-bg-subtle border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent transition-colors flex-shrink-0"
                    >
                        <option value="all">All projects</option>
                        {uniqueEvents.map(([id, title]) => (
                            <option key={id as string} value={id as string}>{title as string}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowOnlyMine(!showOnlyMine)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                            showOnlyMine
                            ? 'bg-accent text-white'
                            : 'bg-bg-subtle text-text-secondary border border-border hover:text-text-primary'
                        }`}
                    >
                        {showOnlyMine ? 'My tasks' : 'All tasks'}
                    </button>
                </div>
            </div>

            <div className="card overflow-hidden divide-y divide-border">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-bg-subtle transition-colors group">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${deptDots[task.department] || 'bg-text-muted'}`} />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                                        {task.title}
                                    </p>
                                    <p className="text-xs text-text-muted truncate">
                                        {task.events?.title || ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <p suppressHydrationWarning className="text-xs text-text-secondary">
                                    {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </p>
                                <Link
                                    href={`/dashboard/events/${task.event_id}`}
                                    className="p-1.5 rounded-md hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="px-4 py-10 text-center">
                        <p className="text-sm text-text-muted">No pending tasks</p>
                    </div>
                )}
            </div>
        </section>
    )
}
