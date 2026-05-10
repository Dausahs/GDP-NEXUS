'use client'

import { useState } from 'react'
import { upsertSchedule, deleteSchedule } from '@/app/actions/schedules'

export default function EventSchedule({
    eventId, schedules, teamMembers, userRole
}: {
    eventId: string, schedules: any[], teamMembers: any[], userRole?: string
}) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingSchedule, setEditingSchedule] = useState<any>(null)
    const [userId, setUserId] = useState('')
    const [jobScope, setJobScope] = useState<'Photographer' | 'Videographer'>('Photographer')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [location, setLocation] = useState('')

    const isMT = userRole === 'MT'

    function openModal(schedule?: any) {
        if (schedule) {
            setEditingSchedule(schedule)
            setUserId(schedule.user_id)
            setJobScope(schedule.job_scope)
            setStartTime(schedule.start_time.substring(0, 16))
            setEndTime(schedule.end_time.substring(0, 16))
            setLocation(schedule.location || '')
        } else {
            setEditingSchedule(null)
            setUserId(''); setJobScope('Photographer')
            setStartTime(''); setEndTime(''); setLocation('')
        }
        setIsModalOpen(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await upsertSchedule(eventId, userId, jobScope, startTime, endTime, location, editingSchedule?.id)
            setIsModalOpen(false)
        } catch { alert('Failed to save schedule') }
        finally { setIsSubmitting(false) }
    }

    async function handleDelete(id: string) {
        if (!confirm('Remove this schedule entry?')) return
        try { await deleteSchedule(id, eventId) }
        catch { alert('Failed to delete') }
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Working Schedule</h2>
                {isMT && (
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary border border-border bg-bg-subtle hover:text-text-primary hover:border-border-hover transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Assign shift
                    </button>
                )}
            </div>

            <div className="card overflow-hidden min-h-[100px]">
                {schedules.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-sm text-text-muted">No shifts assigned</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-4 py-3 text-xs font-medium text-text-muted">Time</th>
                                    <th className="px-4 py-3 text-xs font-medium text-text-muted">Personnel</th>
                                    <th className="px-4 py-3 text-xs font-medium text-text-muted">Role</th>
                                    <th className="px-4 py-3 text-xs font-medium text-text-muted">Location</th>
                                    {isMT && <th className="px-4 py-3 text-xs font-medium text-text-muted text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {schedules
                                    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                                    .map((item) => (
                                        <tr key={item.id} className="hover:bg-bg-subtle transition-colors group">
                                            <td className="px-4 py-3">
                                                <p className="text-xs text-text-muted mb-0.5">
                                                    {new Date(item.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </p>
                                                <p className="text-xs text-text-secondary">
                                                    {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {' – '}
                                                    {new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-text-primary font-medium">{item.profiles?.full_name}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                                                    item.job_scope === 'Photographer'
                                                    ? 'bg-accent/10 text-accent'
                                                    : 'bg-purple-500/10 text-purple-400'
                                                }`}>
                                                    {item.job_scope}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-text-secondary">{item.location || '—'}</td>
                                            {isMT && (
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openModal(item)} className="p-1.5 rounded-md hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                        </button>
                                                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-md hover:bg-danger/10 text-text-muted hover:text-danger transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-bg-elevated border border-border rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-semibold text-text-primary">
                                {editingSchedule ? 'Edit shift' : 'Assign shift'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1.5">Personnel</label>
                                <select required value={userId} onChange={e => setUserId(e.target.value)}
                                    className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors appearance-none">
                                    <option value="">Select member…</option>
                                    {teamMembers.map(m => (
                                        <option key={m.user_id} value={m.user_id}>{m.profiles?.full_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Role</label>
                                    <select required value={jobScope} onChange={e => setJobScope(e.target.value as any)}
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors appearance-none">
                                        <option value="Photographer">Photographer</option>
                                        <option value="Videographer">Videographer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Location</label>
                                    <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Stage Left"
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-muted" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Start</label>
                                    <input type="datetime-local" required value={startTime} onChange={e => setStartTime(e.target.value)}
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">End</label>
                                    <input type="datetime-local" required value={endTime} onChange={e => setEndTime(e.target.value)}
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting}
                                    className="flex-[2] bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                                    {isSubmitting ? 'Saving…' : editingSchedule ? 'Update shift' : 'Assign shift'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    )
}
