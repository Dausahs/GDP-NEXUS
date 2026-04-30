// components/UpcomingObjectives.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function UpcomingObjectives({ tasks, currentUserId, userRole }: { tasks: any[], currentUserId: string, userRole?: string }) {
    const [showOnlyMine, setShowOnlyMine] = useState(false)
    const [selectedEventId, setSelectedEventId] = useState<string>('all')

    let filteredTasks = tasks

    if (userRole === 'organizer') {
        if (selectedEventId !== 'all') {
            filteredTasks = tasks.filter(t => t.event_id === selectedEventId)
        }
    } else {
        if (showOnlyMine) {
            filteredTasks = tasks.filter(t => t.task_assignees?.some((a: any) => a.user_id === currentUserId))
        }
    }

    // Get unique events for the organizer filter
    const uniqueEvents = Array.from(new Map(tasks.map(t => [t.event_id, t.events?.title])).entries())

    const deptColors: Record<string, string> = {
        'Graphic': 'text-[#00F5FF]',
        'Production': 'text-[#10B981]',
        'Sculpture': 'text-[#8A2BE2]',
    }

    return (
        <section className="mb-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-violet-neon rounded-full"></div>
                    <h2 className="text-xl font-display font-bold text-white uppercase tracking-wider">
                        {userRole === 'organizer' ? 'Assigned Project Tasks' : 'Upcoming Tasks'}
                    </h2>
                </div>

                {userRole === 'organizer' ? (
                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-2 flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-neon"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
                            <select 
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                className="bg-transparent text-[11px] font-mono font-bold text-white outline-none cursor-pointer uppercase tracking-widest"
                            >
                                <option value="all" className="bg-[#161B22]">All Assigned Projects</option>
                                {uniqueEvents.map(([id, title]) => (
                                    <option key={id} value={id} className="bg-[#161B22]">{title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => setShowOnlyMine(!showOnlyMine)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
                            showOnlyMine 
                            ? 'bg-violet-neon text-white shadow-[0_0_20px_rgba(138,43,226,0.4)]' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        {showOnlyMine ? 'MY TASKS' : 'ALL TASKS'}
                    </button>
                )}
            </div>
            
            <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
                <div className="divide-y divide-white/5 max-h-[460px] overflow-y-auto custom-scrollbar">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                            <div key={task.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors group">
                                <div className="flex items-center gap-6">
                                    <div className="w-2 h-10 bg-white/5 rounded-full overflow-hidden shrink-0">
                                        <div className={`w-full h-full ${deptColors[task.department] || 'bg-white/20'} opacity-40 group-hover:opacity-100 transition-opacity`}></div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${deptColors[task.department] || 'text-white/40'}`}>
                                                {task.department || 'General'}
                                            </span>
                                            <span className="text-[9px] font-mono text-white/10 uppercase tracking-widest">•</span>
                                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest truncate max-w-[200px]">
                                                PROJECT: {task.events?.title || 'Unknown'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-neon transition-colors">
                                            {task.title}
                                        </h3>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between md:justify-end gap-10">
                                    <div className="text-right">
                                        <p className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-widest mb-1">Due Date</p>
                                        <p suppressHydrationWarning className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">
                                            {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <Link 
                                        href={`/dashboard/events/${task.event_id}`}
                                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-cyan-neon hover:border-cyan-neon transition-all group/btn"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 group-hover/btn:text-black transition-colors"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-20 text-center">
                            <p className="text-sm text-white/20 font-mono uppercase tracking-[0.2em]">No pending tasks found</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
