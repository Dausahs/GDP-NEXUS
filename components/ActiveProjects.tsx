'use client'

import { useState } from 'react'
import Link from 'next/link'

type Event = {
    id: string
    title: string
    description?: string | null
    end_date?: string | null
}

export default function ActiveProjects({
    events,
    userRole,
}: {
    events: Event[]
    userRole?: string
}) {
    const [query, setQuery] = useState('')

    const filtered = query.trim()
        ? events.filter(e =>
            e.title.toLowerCase().includes(query.toLowerCase()) ||
            (e.description ?? '').toLowerCase().includes(query.toLowerCase())
        )
        : events

    return (
        <section>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                    <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">
                        Active Projects
                    </h2>
                    <p className="text-xs text-text-muted">
                        {filtered.length} of {events.length} project{events.length !== 1 ? 's' : ''}
                        {query && ` matching "${query}"`}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Search bar */}
                    <div className="relative">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search projects…"
                            className="pl-8 pr-8 py-1.5 rounded-lg text-xs bg-bg-subtle border border-border text-text-primary placeholder:text-text-muted outline-none focus:border-accent transition-colors w-48"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {userRole === 'MT' && (
                        <Link
                            href="/dashboard/events/create"
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-medium transition-colors shrink-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            New project
                        </Link>
                    )}
                </div>
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {filtered.map(event => (
                        <Link key={event.id} href={`/dashboard/events/${event.id}`} className="group">
                            <div className="card p-5 hover:border-border-hover transition-colors h-full flex flex-col">
                                <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-2 truncate">
                                    {event.title}
                                </h3>
                                <p className="text-xs text-text-secondary leading-relaxed flex-1 line-clamp-2">
                                    {event.description || 'No description provided.'}
                                </p>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                    <div>
                                        <p className="text-[10px] text-text-muted mb-0.5">Deadline</p>
                                        <p suppressHydrationWarning className="text-xs font-medium text-text-secondary">
                                            {event.end_date
                                                ? new Date(event.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                                                : '—'}
                                        </p>
                                    </div>
                                    <div className="w-6 h-6 rounded-md bg-bg-subtle border border-border flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted group-hover:text-white transition-colors">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="card p-16 text-center border-dashed">
                    {query ? (
                        <>
                            <p className="text-sm text-text-muted">No projects match <span className="text-text-secondary">"{query}"</span></p>
                            <button onClick={() => setQuery('')} className="text-xs text-accent hover:underline mt-3 inline-block">
                                Clear search
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-text-muted">No active projects</p>
                            {userRole === 'MT' && (
                                <Link href="/dashboard/events/create" className="text-xs text-accent hover:underline mt-3 inline-block">
                                    Create your first project →
                                </Link>
                            )}
                        </>
                    )}
                </div>
            )}
        </section>
    )
}
