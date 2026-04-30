'use client'

import React, { useState } from 'react'
import { updateEvent, deleteEvent } from '@/app/actions/events'

export default function EventSettingsModal({ event }: { event: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [title, setTitle] = useState(event.title)
    const [description, setDescription] = useState(event.description || '')
    const [endDate, setEndDate] = useState(event.end_date || '')

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)
        try {
            await updateEvent(event.id, title, description, endDate)
            setIsOpen(false)
        } catch (err) {
            alert("Failed to update event")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you absolutely sure? This will delete all tasks and logs associated with this event.")) return
        setIsDeleting(true)
        try {
            await deleteEvent(event.id)
        } catch (err) {
            console.error("Delete failed", err)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="p-3 bg-white/5 text-white/40 hover:text-cyan-neon hover:bg-white/10 rounded-2xl transition-all border border-white/5"
                title="Event Settings"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>

            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-6 backdrop-blur-2xl"
                    onClick={() => setIsOpen(false)}
                >
                    <div 
                        className="glass rounded-[3rem] max-w-xl w-full p-10 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HUD Header */}
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 text-white/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Operation Config</h2>
                                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Deployment Overhaul</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="space-y-10">
                            {/* Update Form */}
                            <form onSubmit={handleUpdate} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Operation Title</label>
                                    <input 
                                        name="title" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)}
                                        required 
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all font-medium" 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Mission Parameters</label>
                                    <textarea 
                                        name="description" 
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3} 
                                        className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all resize-none font-medium" 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Final Deployment Date</label>
                                    <input 
                                        type="date" 
                                        name="end_date" 
                                        value={endDate ? new Date(endDate).toISOString().split('T')[0] : ''} 
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all font-medium cursor-pointer" 
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isUpdating}
                                    className="w-full bg-white/10 text-white px-8 py-4 rounded-2xl font-display font-bold text-sm border border-white/10 hover:bg-white/20 transition-all uppercase tracking-widest"
                                >
                                    {isUpdating ? 'SYNCING...' : 'SYNC PARAMETERS'}
                                </button>
                            </form>

                            {/* Danger Zone */}
                            <div className="pt-10 border-t border-white/5">
                                <div className="bg-red-500/5 rounded-[2rem] p-8 border border-red-500/10 space-y-4">
                                    <div className="flex items-center gap-3 text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                        <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em]">Critical: Termination Zone</h3>
                                    </div>
                                    <p className="text-[11px] text-red-500/60 leading-relaxed font-medium">
                                        Initiating deletion will permanently wipe all task logs, asset histories, and operational data associated with this event. This action is irreversible.
                                    </p>
                                    <button 
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="w-full bg-red-500 text-white px-8 py-4 rounded-2xl font-display font-bold text-sm shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                                    >
                                        {isDeleting ? 'TERMINATING...' : 'TERMINATE OPERATION'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
