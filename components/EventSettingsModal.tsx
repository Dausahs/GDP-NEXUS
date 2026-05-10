// components/EventSettingsModal.tsx
'use client'

import React, { useState } from 'react'
import { updateEvent, deleteEvent, updateEventOrganizers } from '@/app/actions/events'

export default function EventSettingsModal({
    event,
    allOrganizers,      // all users with role === 'organizer'
    currentOrganizers,  // user_ids already assigned as organizer for this event
}: {
    event: any,
    allOrganizers: { id: string, full_name: string }[],
    currentOrganizers: string[],
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isUpdatingOrgs, setIsUpdatingOrgs] = useState(false)

    const [title, setTitle] = useState(event.title)
    const [description, setDescription] = useState(event.description || '')
    const [endDate, setEndDate] = useState(event.end_date || '')

    const [selectedOrgs, setSelectedOrgs] = useState<string[]>(currentOrganizers)

    const toggleOrg = (id: string) => {
        setSelectedOrgs(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)
        try {
            await updateEvent(event.id, title, description, endDate)
            setIsOpen(false)
        } catch { alert('Failed to update project') }
        finally { setIsUpdating(false) }
    }

    const handleUpdateOrgs = async () => {
        setIsUpdatingOrgs(true)
        try {
            await updateEventOrganizers(event.id, selectedOrgs)
        } catch { alert('Failed to update organizers') }
        finally { setIsUpdatingOrgs(false) }
    }

    const handleDelete = async () => {
        if (!confirm('This will permanently delete all tasks and data for this project. Continue?')) return
        setIsDeleting(true)
        try { await deleteEvent(event.id) }
        catch (err) { console.error('Delete failed', err) }
        finally { setIsDeleting(false) }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
                title="Project settings"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-bg-elevated border border-border rounded-xl max-w-md w-full p-6 shadow-2xl my-4"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-semibold text-text-primary">Project settings</h2>
                            <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        {/* General info form */}
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1.5">Project name</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1.5">Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1.5">Deadline</label>
                                <input
                                    type="date"
                                    value={endDate ? new Date(endDate).toISOString().split('T')[0] : ''}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="w-full bg-bg-subtle hover:bg-bg border border-border text-text-primary py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {isUpdating ? 'Saving…' : 'Save changes'}
                            </button>
                        </form>

                        {/* Organizers section */}
                        <div className="mt-6 pt-6 border-t border-border">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-xs font-semibold text-text-secondary">Organizers</p>
                                    <p className="text-[10px] text-text-muted mt-0.5">
                                        {selectedOrgs.length} assigned
                                    </p>
                                </div>
                                <button
                                    onClick={handleUpdateOrgs}
                                    disabled={isUpdatingOrgs}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-50"
                                >
                                    {isUpdatingOrgs ? 'Saving…' : 'Update'}
                                </button>
                            </div>

                            {allOrganizers.length === 0 ? (
                                <p className="text-xs text-text-muted py-2">No organizer accounts found</p>
                            ) : (
                                <div className="bg-bg-subtle border border-border rounded-lg p-3 max-h-[180px] overflow-y-auto custom-scrollbar space-y-1">
                                    {allOrganizers.map(org => {
                                        const isChecked = selectedOrgs.includes(org.id)
                                        return (
                                            <label
                                                key={org.id}
                                                className="flex items-center gap-2.5 p-2 rounded-md hover:bg-bg-elevated transition-colors cursor-pointer group"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleOrg(org.id)}
                                                    className="w-3.5 h-3.5 rounded accent-accent"
                                                />
                                                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors flex-1">
                                                    {org.full_name}
                                                </span>
                                                {isChecked && (
                                                    <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                                                        Assigned
                                                    </span>
                                                )}
                                            </label>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Danger zone */}
                        <div className="mt-6 pt-6 border-t border-border">
                            <p className="text-xs font-medium text-danger mb-3">Danger zone</p>
                            <p className="text-xs text-text-muted mb-4">
                                Deleting this project will permanently remove all tasks, logs, and data. This cannot be undone.
                            </p>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting…' : 'Delete project'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
