'use client'

import React, { useState } from 'react'
import { updateEventMembers } from '@/app/actions/events'

export default function ManageMembersModal({
    eventId,
    allStaff,          // all users with role 'MT' or 'Penyelaras'
    currentMembers,    // user_ids currently assigned as 'Member'
}: {
    eventId: string,
    allStaff: { id: string, full_name: string, role: string }[],
    currentMembers: string[],
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [selectedMembers, setSelectedMembers] = useState<string[]>(currentMembers)

    const toggleMember = (id: string) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const handleUpdate = async () => {
        setIsUpdating(true)
        try {
            await updateEventMembers(eventId, selectedMembers)
            setIsOpen(false)
        } catch (err) { 
            alert('Failed to update project members')
        } finally { 
            setIsUpdating(false) 
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
                title="Manage team members"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
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
                            <h2 className="text-base font-semibold text-text-primary">Manage team members</h2>
                            <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-text-secondary mb-4">
                            Add additional MT or Penyelaras to this project so they can view the dashboard and help manage tasks.
                        </p>

                        {/* List */}
                        <div className="bg-bg-subtle border border-border rounded-lg p-3 max-h-[300px] overflow-y-auto custom-scrollbar space-y-1 mb-6">
                            {allStaff.length === 0 ? (
                                <p className="text-xs text-text-muted py-2 px-1">No staff members found.</p>
                            ) : (
                                allStaff.map(staff => {
                                    const isChecked = selectedMembers.includes(staff.id)
                                    return (
                                        <label
                                            key={staff.id}
                                            className="flex items-center gap-3 p-2 rounded-md hover:bg-bg-elevated transition-colors cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleMember(staff.id)}
                                                className="w-4 h-4 rounded accent-accent"
                                            />
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors truncate">
                                                    {staff.full_name}
                                                </span>
                                                <span className="text-[10px] text-text-muted">
                                                    {staff.role}
                                                </span>
                                            </div>
                                            {isChecked && (
                                                <span className="text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                                                    Added
                                                </span>
                                            )}
                                        </label>
                                    )
                                })
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={isUpdating}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-50"
                            >
                                {isUpdating ? 'Saving…' : 'Save members'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
