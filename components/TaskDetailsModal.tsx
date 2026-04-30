'use client'

import { useState } from 'react'
import { addTaskComment, updateTask, deleteTask } from '@/app/actions/tasks'

export default function TaskDetailsModal({ task, eventId, userRole, onClose, teamMembers }: { task: any, eventId: string, userRole?: string, onClose: () => void, teamMembers: any[] }) {
    const [isPending, setIsPending] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState(task.title)
    const [description, setDescription] = useState(task.description || '')
    const [deadline, setDeadline] = useState(task.deadline ? task.deadline.split('T')[0] : '')
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>(task.task_assignees?.map((a: any) => a.user_id) || [])

    async function handleComment(formData: FormData) {
        setIsPending(true)
        try {
            await addTaskComment(formData)
        } catch (error) {
            console.error('Failed to post comment', error)
            alert('Failed to post comment')
        } finally {
            setIsPending(false)
        }
    }

    async function handleUpdateTask() {
        setIsPending(true)
        try {
            await updateTask(task.id, eventId, title, task.department, description, deadline, selectedAssignees)
            setIsEditing(false)
        } catch (error) {
            alert('Failed to update task')
        } finally {
            setIsPending(false)
        }
    }

    async function handleDeleteTask() {
        if (!confirm("Are you sure you want to delete this task?")) return
        setIsPending(true)
        try {
            await deleteTask(task.id, eventId)
            onClose()
        } catch (error) {
            alert('Failed to delete task')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-xl"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onClose}
        >
            <div 
                className="glass rounded-[3rem] max-w-2xl w-full p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative border border-white/10 flex flex-col max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header HUD */}
                <div className="flex justify-between items-start mb-10">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-cyan-neon rounded-full"></div>
                            <span className="text-[10px] font-mono font-bold text-cyan-neon uppercase tracking-[0.3em]">Task Objective</span>
                        </div>
                        {isEditing ? (
                            <input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-3xl font-display font-bold w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2 outline-none focus:border-cyan-neon transition-all text-white"
                            />
                        ) : (
                            <h2 className="text-3xl font-display font-bold text-white tracking-tight leading-tight">{task.title}</h2>
                        )}
                        <div className="flex gap-4">
                            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-cyan-neon/10 text-cyan-neon border border-cyan-neon/20 shadow-[0_0_15px_rgba(0,245,255,0.1)]">
                                {task.status}
                            </span>
                            {task.deadline && !isEditing && (
                                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-white/5 text-white/40 border border-white/5">
                                    EXPIRY: {new Date(task.deadline).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <>
                                <button onClick={handleUpdateTask} disabled={isPending} className="p-3 bg-cyan-neon text-black rounded-2xl hover:scale-110 transition-all shadow-[0_0_20px_rgba(0,245,255,0.3)]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </button>
                                <button onClick={() => setIsEditing(false)} className="p-3 bg-white/5 text-white/50 rounded-2xl hover:bg-white/10 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsEditing(true)} className="p-3 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button onClick={handleDeleteTask} className="p-3 bg-red-500/5 text-red-500/40 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all border border-red-500/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                                <button onClick={onClose} className="p-3 bg-white/5 text-white/40 hover:text-white rounded-2xl transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="mb-10">
                    {isEditing ? (
                        <div className="space-y-6">
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                placeholder="Task Briefing..."
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-sm text-white/80 outline-none focus:border-cyan-neon transition-all resize-none"
                            />
                            <div>
                                <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] mb-3">Deadline Parameters</label>
                                <input 
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-cyan-neon transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] mb-3">Assign Team Members</label>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-h-[150px] overflow-y-auto custom-scrollbar space-y-1">
                                    {teamMembers?.map((member) => (
                                        <label key={member.user_id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedAssignees.includes(member.user_id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedAssignees(prev => [...prev, member.user_id])
                                                    } else {
                                                        setSelectedAssignees(prev => prev.filter(id => id !== member.user_id))
                                                    }
                                                }}
                                                className="w-4 h-4 rounded border-white/10 bg-transparent text-cyan-neon focus:ring-cyan-neon/50"
                                            />
                                            <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">{member.profiles?.full_name}</span>
                                        </label>
                                    ))}
                                    {(!teamMembers || teamMembers.length === 0) && (
                                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest text-center py-4">No team data found</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
                                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-background px-3 text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Briefing</div>
                                <p className="text-base text-white/70 leading-relaxed font-medium italic">
                                    {task.description || <span className="opacity-30">No briefing data available for this objective.</span>}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {task.task_assignees?.length > 0 ? (
                                    task.task_assignees.map((assignee: any) => (
                                        <span key={assignee.user_id} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest">
                                            {assignee.profiles?.full_name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">No assigned personnel.</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex-1 flex flex-col min-h-0">
                    <h3 className="font-display font-bold text-lg text-white mb-6 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-neon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        COMM LOGS
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-4 custom-scrollbar">
                        {(!task.task_comments || task.task_comments.length === 0) ? (
                            <div className="text-center py-12 border border-dashed border-white/5 rounded-[2rem] opacity-30">
                                <p className="text-xs font-mono uppercase tracking-widest">No active communications found.</p>
                            </div>
                        ) : (
                            [...task.task_comments].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((comment: any) => (
                                <div key={comment.id} className="bg-white/5 p-6 rounded-[1.5rem] border border-white/5 relative group hover:bg-white/[0.08] transition-colors">
                                    <div className="flex justify-between items-baseline mb-3">
                                        <span className="text-xs font-bold text-cyan-neon/70 uppercase tracking-wider">{comment.profiles?.full_name || 'UNKNOWN OPERATIVE'}</span>
                                        <span className="text-[9px] font-mono text-white/20 uppercase">{new Date(comment.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-white/70 leading-snug">{comment.content}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <form action={handleComment} className="pt-6 border-t border-white/5">
                        <input type="hidden" name="taskId" value={task.id} />
                        <input type="hidden" name="eventId" value={eventId} />
                        <div className="flex gap-4">
                            <input 
                                name="content" 
                                required 
                                autoComplete="off"
                                placeholder="Establish communication..." 
                                className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-violet-neon transition-all placeholder:text-white/20" 
                            />
                            <button 
                                type="submit" 
                                disabled={isPending} 
                                className="px-8 bg-violet-neon text-white rounded-2xl font-bold text-sm shadow-[0_0_20px_rgba(138,43,226,0.3)] hover:scale-105 active:scale-95 transition-all"
                            >
                                {isPending ? '...' : 'SEND'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
