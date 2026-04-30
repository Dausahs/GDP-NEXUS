'use client'

export default function GlobalSchedule({ schedules }: { schedules: any[] }) {
    if (schedules.length === 0) return null

    return (
        <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-widest">GDP Schedule</h2>
            </div>

            <div className="glass rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">Project</th>
                                <th className="px-8 py-5 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">Personnel</th>
                                <th className="px-8 py-5 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">Job Scope</th>
                                <th className="px-8 py-5 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">Time & Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()).map((item) => (
                                <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-4 bg-cyan-neon/30 rounded-full"></div>
                                            <span className="text-sm font-bold text-white tracking-tight">{item.events?.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-medium text-white/80">{item.profiles?.full_name}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${item.job_scope === 'Photographer' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'}`}>
                                            {item.job_scope}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-widest">
                                                {new Date(item.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                            <div className="flex items-center gap-2 text-white/60">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                <span className="text-[10px] font-mono font-bold uppercase">
                                                    {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white/30">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                <span className="text-[9px] font-mono font-bold uppercase truncate">{item.location || 'Main Arena'}</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}
