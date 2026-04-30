// components/AddTaskModal.tsx
'use client'

import { useState } from 'react'
import { addTask } from '@/app/actions/tasks'

export default function AddTaskModal({ eventId, teamMembers }: { eventId: string, teamMembers: any[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

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
                className="bg-cyan-neon text-black px-8 py-4 rounded-2xl font-display font-bold text-sm hover:scale-[1.05] active:scale-95 transition-all shadow-[0_0_30px_rgba(0,245,255,0.2)] flex items-center gap-3 uppercase tracking-widest"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Task
            </button>

            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl"
                    onClick={() => setIsOpen(false)}
                >
                    <div 
                        className="glass rounded-[3rem] max-w-xl w-full p-10 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HUD Header */}
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 bg-cyan-neon rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">New Task</h2>
                                <p className="text-[10px] font-mono text-cyan-neon uppercase tracking-[0.2em]">Create a new task for this project</p>
                            </div>
                        </div>

                        <form action={handleSubmit} className="space-y-8">
                            <input type="hidden" name="eventId" value={eventId} />
                            
                            <div className="space-y-2">
                                <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Task Name</label>
                                <input 
                                    name="title" 
                                    required 
                                    placeholder="Enter task name..."
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all placeholder:text-white/10 font-medium" 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Task Description</label>
                                <textarea 
                                    name="description" 
                                    rows={3}
                                    placeholder="Provide task details..."
                                    className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all placeholder:text-white/10 resize-none font-medium" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Department</label>
                                    <select 
                                        name="department" 
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all appearance-none cursor-pointer font-medium"
                                    >
                                        <option value="Graphic" className="bg-[#161B22]">Graphic</option>
                                        <option value="Production" className="bg-[#161B22]">Production</option>
                                        <option value="Sculpture" className="bg-[#161B22]">Sculpture</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Due Date</label>
                                    <input 
                                        type="date" 
                                        name="deadline" 
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all cursor-pointer font-medium" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Assign Team Members</label>
                                <div className="grid grid-cols-2 gap-3 max-h-[150px] overflow-y-auto p-2 custom-scrollbar border border-white/5 rounded-2xl">
                                    {teamMembers.map((member: any) => (
                                        <label key={member.user_id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                name="assigneeIds" 
                                                value={member.user_id} 
                                                className="w-4 h-4 rounded border-white/10 bg-transparent text-cyan-neon focus:ring-cyan-neon/50"
                                            />
                                            <span className="text-xs font-bold text-white/50 group-hover:text-white transition-colors uppercase tracking-wider">{member.profiles?.full_name || '??'}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-8 py-4 rounded-2xl font-mono font-bold text-[11px] text-white/30 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isPending}
                                    className="flex-[2] bg-cyan-neon text-black px-8 py-4 rounded-2xl font-display font-bold text-sm shadow-[0_0_30px_rgba(0,245,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPending ? 'CREATING...' : 'CREATE TASK'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
