'use client'

import { useState } from 'react'
import { upsertSchedule, deleteSchedule } from '@/app/actions/schedules'

export default function EventSchedule({ 
    eventId, 
    schedules, 
    teamMembers, 
    userRole 
}: { 
    eventId: string, 
    schedules: any[], 
    teamMembers: any[], 
    userRole?: string 
}) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingSchedule, setEditingSchedule] = useState<any>(null)
    
    // Form State
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
            setUserId('')
            setJobScope('Photographer')
            setStartTime('')
            setEndTime('')
            setLocation('')
        }
        setIsModalOpen(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await upsertSchedule(eventId, userId, jobScope, startTime, endTime, location, editingSchedule?.id)
            setIsModalOpen(false)
        } catch (error) {
            alert('Failed to save schedule')
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Remove this schedule entry?')) return
        try {
            await deleteSchedule(id, eventId)
        } catch (error) {
            alert('Failed to delete schedule')
        }
    }

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest">Working Schedule</h2>
                </div>
                {isMT && (
                    <button 
                        onClick={() => openModal()}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-mono font-bold text-white/50 hover:text-amber-400 hover:bg-white/10 hover:border-amber-400/30 transition-all uppercase tracking-widest flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Assign Shift
                    </button>
                )}
            </div>

            <div className="glass rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden min-h-[200px]">
                {schedules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 opacity-20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <p className="text-xs font-mono uppercase tracking-widest">No Shifts Assigned Yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-5 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">Time Slot</th>
                                    <th className="px-8 py-5 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">Personnel</th>
                                    <th className="px-8 py-5 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">Job Scope</th>
                                    <th className="px-8 py-5 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">Location</th>
                                    {isMT && <th className="px-8 py-5 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()).map((item) => (
                                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1 text-white">
                                                <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">
                                                    {new Date(item.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 w-fit">
                                                    {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-white">{item.profiles?.full_name}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${item.job_scope === 'Photographer' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]'}`}>
                                                {item.job_scope}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-medium text-white/50">{item.location || 'Main Arena'}</span>
                                        </td>
                                        {isMT && (
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openModal(item)} className="p-2.5 bg-white/5 rounded-xl hover:text-amber-400 hover:bg-white/10 transition-all border border-white/5">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-white/5 rounded-xl hover:text-red-400 hover:bg-white/10 transition-all border border-white/5">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
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

            {/* Shift Assignment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}>
                    <div className="glass rounded-[3rem] max-w-lg w-full p-10 border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.1)]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">{editingSchedule ? 'Modify Shift' : 'Assign Shift'}</h3>
                                <p className="text-[10px] font-mono text-amber-400/60 uppercase tracking-[0.2em]">Deploy personnel to specific time slots</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2">
                                    <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Select Operative</label>
                                    <select 
                                        required
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-amber-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-[#161B22]">Select Member...</option>
                                        {teamMembers.map((m) => (
                                            <option key={m.user_id} value={m.user_id} className="bg-[#161B22]">{m.profiles?.full_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Job Scope</label>
                                    <select 
                                        required
                                        value={jobScope}
                                        onChange={(e) => setJobScope(e.target.value as any)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-amber-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Photographer" className="bg-[#161B22]">Photographer</option>
                                        <option value="Videographer" className="bg-[#161B22]">Videographer</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Deployment Location</label>
                                    <input 
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. Stage Left"
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-amber-500 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Start Time</label>
                                    <input 
                                        type="datetime-local"
                                        required
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-amber-500 transition-all cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">End Time</label>
                                    <input 
                                        type="datetime-local"
                                        required
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-amber-500 transition-all cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl font-mono font-bold text-[10px] text-white/30 hover:text-white transition-all uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] bg-amber-500 text-black px-6 py-4 rounded-2xl font-display font-bold text-sm shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
                                >
                                    {isSubmitting ? 'DEPLOYING...' : editingSchedule ? 'UPDATE SHIFT' : 'CONFIRM DEPLOYMENT'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    )
}
