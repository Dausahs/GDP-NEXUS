// components/AddTaskModal.tsx
'use client'

import { useState } from 'react'
import { addTask } from '@/app/actions/tasks'

export default function AddTaskModal({ eventId, teamMembers, userRole }: {
    eventId: string, teamMembers: any[], userRole?: string
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const isRequestMode = userRole === 'organizer'

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        try {
            await addTask(formData)
            setIsOpen(false)
        } catch (error) {
            console.error('Failed to add task:', error)
            alert('Failed to add task. Please try again.')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-medium transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                {isRequestMode ? 'Add request' : 'Add task'}
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-bg-elevated border border-border rounded-xl max-w-lg w-full p-6 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-semibold text-text-primary">
                                {isRequestMode ? 'New request' : 'New task'}
                            </h2>
                            <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        <form action={handleSubmit} className="space-y-4">
                            <input type="hidden" name="eventId" value={eventId} />
                            <input type="hidden" name="status" value={isRequestMode ? 'Requested' : 'Pending'} />

                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1.5">Task name</label>
                                <input
                                    name="title"
                                    required
                                    placeholder="Enter task name…"
                                    className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-muted"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1.5">Description</label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    placeholder="Provide task details…"
                                    className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-muted resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Department</label>
                                    <select
                                        name="department"
                                        required
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors appearance-none"
                                    >
                                        <option value="Graphics">Graphics</option>
                                        <option value="Production">Production</option>
                                        <option value="Sculpture">Sculpture</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Due date</label>
                                    <input
                                        type="datetime-local"
                                        name="deadline"
                                        required
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
                                    />
                                </div>
                            </div>

                            {!isRequestMode && (
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Assign members</label>
                                    <div className="bg-bg-subtle border border-border rounded-lg p-3 max-h-[180px] overflow-y-auto custom-scrollbar space-y-1">
                                        {teamMembers.map((member) => (
                                            <label key={member.user_id} className="flex items-center gap-2.5 p-2 rounded-md hover:bg-bg-elevated transition-colors cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="assigneeIds"
                                                    value={member.user_id}
                                                    className="w-3.5 h-3.5 rounded accent-accent"
                                                />
                                                <span className="text-xs text-text-secondary">{member.profiles?.full_name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-[2] bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {isPending
                                        ? (isRequestMode ? 'Submitting…' : 'Creating…')
                                        : (isRequestMode ? 'Submit request' : 'Create task')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
