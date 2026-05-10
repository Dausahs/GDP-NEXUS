// components/EventForm.tsx
'use client'

import { useActionState } from 'react'
import { createEvent, type EventFormState } from '@/app/actions/events'

const initialState: EventFormState = {}

export default function EventForm({ users, mtId }: { users: any[], mtId?: string }) {
    const [state, formAction, isPending] = useActionState(createEvent, initialState)

    const departments = [
        { label: 'GDP Person in Charge', name: 'picId' },
        { label: 'Graphics Lead', name: 'graphicLeadId' },
        { label: 'Production Lead', name: 'productionLeadId' },
        { label: 'Videography Lead', name: 'videoLeadId' },
        { label: 'Photography Lead', name: 'photoLeadId' },
    ]

    return (
        <form action={formAction} className="space-y-8">
            {state?.error && (
                <div className="p-3.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {state.error}
                </div>
            )}

            {/* Event Details */}
            <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Event details</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Event name</label>
                        <input
                            name="title"
                            required
                            placeholder="e.g. Convocation Expo 2026"
                            className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-muted"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            placeholder="Core objectives and creative direction…"
                            className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-muted resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Event dates</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-[10px] text-text-muted mb-1">Start</p>
                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    required
                                    className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
                                />
                            </div>
                            <div>
                                <p className="text-[10px] text-text-muted mb-1">End</p>
                                <input
                                    type="datetime-local"
                                    name="endDate"
                                    required
                                    className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-px bg-border" />

            {/* Leadership */}
            <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Team leadership</h3>
                <p className="text-xs text-text-muted mb-4">Assign key personnel to lead the project</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">
                            Project organizers
                            <span className="ml-1.5 text-[10px] text-text-muted font-normal bg-bg-subtle border border-border px-1.5 py-0.5 rounded">optional</span>
                        </label>
                        <div className="bg-bg-subtle border border-border rounded-lg p-3 max-h-[200px] overflow-y-auto custom-scrollbar space-y-1">
                            {users.filter(u => u.role === 'organizer').length === 0 ? (
                                <p className="text-xs text-text-muted py-2 px-1">No organizers available</p>
                            ) : (
                                users.filter(u => u.role === 'organizer').map(u => (
                                    <label
                                        key={u.id}
                                        className="flex items-center gap-2.5 p-2 rounded-md hover:bg-bg-elevated transition-colors cursor-pointer group"
                                    >
                                        <input
                                            type="checkbox"
                                            name="organizerId"
                                            value={u.id}
                                            className="w-3.5 h-3.5 rounded accent-accent"
                                        />
                                        <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                                            {u.full_name}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                    {departments.map((dept) => (
                        <div key={dept.name}>
                            <label className="block text-xs font-medium text-text-secondary mb-1.5">{dept.label}</label>
                            <select
                                name={dept.name}
                                required
                                defaultValue={dept.name === 'picId' ? mtId : ''}
                                className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors appearance-none"
                            >
                                <option value="">Select lead…</option>
                                {users.filter(u => u.role === 'MT' || u.role === 'Penyelaras').map(u => (
                                    <option key={u.id} value={u.id}>{u.full_name}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
                {isPending ? 'Creating project…' : 'Create project'}
            </button>
        </form>
    )
}