'use client'

export default function GlobalSchedule({ schedules }: { schedules: any[] }) {
    if (schedules.length === 0) return null

    const sorted = [...schedules].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    return (
        <section>
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">GDP Schedule</h2>
            <div className="card overflow-hidden">

                {/* Mobile: stacked cards */}
                <div className="divide-y divide-border md:hidden">
                    {sorted.map((item) => (
                        <div key={item.id} className="px-4 py-3.5 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-text-primary">{item.events?.title}</p>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md flex-shrink-0 ${
                                    item.job_scope === 'Photographer' ? 'bg-accent/10 text-accent' : 'bg-purple-500/10 text-purple-400'
                                }`}>{item.job_scope}</span>
                            </div>
                            <p className="text-xs text-text-secondary">{item.profiles?.full_name}</p>
                            <p className="text-xs text-text-muted">
                                {new Date(item.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                {' · '}
                                {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {' – '}
                                {new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {item.location ? ` · ${item.location}` : ''}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Desktop: table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="px-4 py-3 text-xs font-medium text-text-muted">Project</th>
                                <th className="px-4 py-3 text-xs font-medium text-text-muted">Personnel</th>
                                <th className="px-4 py-3 text-xs font-medium text-text-muted">Role</th>
                                <th className="px-4 py-3 text-xs font-medium text-text-muted">Time &amp; Location</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {sorted.map((item) => (
                                <tr key={item.id} className="hover:bg-bg-subtle transition-colors">
                                    <td className="px-4 py-3"><span className="font-medium text-text-primary">{item.events?.title}</span></td>
                                    <td className="px-4 py-3"><span className="text-text-secondary">{item.profiles?.full_name}</span></td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                                            item.job_scope === 'Photographer' ? 'bg-accent/10 text-accent' : 'bg-purple-500/10 text-purple-400'
                                        }`}>{item.job_scope}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-xs text-text-muted mb-0.5">{new Date(item.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                        <p className="text-xs text-text-secondary">
                                            {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {' – '}
                                            {new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {item.location ? ` · ${item.location}` : ''}
                                        </p>
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
