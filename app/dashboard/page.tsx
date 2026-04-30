// app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import GlobalCalendar from '@/components/GlobalCalendar'
import UpcomingObjectives from '@/components/UpcomingObjectives'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/')

    // 1. Fetch the user's profile to check their role
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

    // 2. Determine which events the user can see
    let eventsQuery = supabase
        .from('events')
        .select('id, title, description, end_date')
        .order('end_date', { ascending: true })

    // If Penyelaras, only show events they are members of
    if (profile?.role === 'Penyelaras') {
        const { data: memberEvents } = await supabase
            .from('event_members')
            .select('event_id')
            .eq('user_id', user.id)
        
        const eventIds = memberEvents?.map(me => me.event_id) || []
        eventsQuery = eventsQuery.in('id', eventIds)
    }

    const { data: events } = await eventsQuery

    // 3. Determine which tasks to show
    let tasksQuery = supabase
        .from('tasks')
        .select('*, events(title), task_assignees(user_id)')

    if (profile?.role === 'Penyelaras') {
        const { data: memberEvents } = await supabase
            .from('event_members')
            .select('event_id')
            .eq('user_id', user.id)
        
        const eventIds = memberEvents?.map(me => me.event_id) || []
        tasksQuery = tasksQuery.in('event_id', eventIds)
    }

    const { data: tasks } = await tasksQuery

    // 4. Filter for upcoming tasks (incomplete and has deadline)
    const upcomingTasks = tasks
        ?.filter(t => t.status !== 'Delivered' && t.deadline)
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 10) || []

    const deptColors: Record<string, string> = {
        'Graphic': 'text-[#00F5FF]',
        'Production': 'text-[#10B981]',
        'Sculpture': 'text-[#8A2BE2]',
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-cyan-neon/30">
            {/* HUD Header */}
            <header className="glass border-b border-white/5 px-8 py-6 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-neon rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.4)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            <circle cx="12" cy="12" r="3" fill="currentColor" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-display font-bold tracking-tight text-white">GDP <span className="text-cyan-neon">NEXUS</span></h1>
                        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">Media Management Dashboard</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    {(profile?.role === 'MT' || profile?.role === 'Penyelaras') && (
                        <Link 
                            href="/dashboard/assets" 
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-mono font-bold text-white/50 hover:text-cyan-neon hover:bg-white/10 hover:border-cyan-neon/30 transition-all uppercase tracking-widest"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            Inventory
                        </Link>
                    )}
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-medium text-white/70">{profile?.full_name}</p>
                        <p className="text-[10px] font-mono text-cyan-neon uppercase tracking-wider">{profile?.role}</p>
                    </div>
                    <form action={signOut}>
                        <button type="submit" className="p-2.5 rounded-xl hover:bg-white/5 transition-colors group text-white/50 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        </button>
                    </form>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-12">
                {/* Global Timeline */}
                <section className="mb-16">
                    <div className="flex items-baseline justify-between mb-8">
                        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                            <span className="w-2 h-8 bg-cyan-neon rounded-full"></span>
                            PROJECT TIMELINE
                        </h2>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">System Status: Online</span>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="glass rounded-[2rem] p-1 border border-white/5 shadow-2xl overflow-hidden">
                        <GlobalCalendar tasks={tasks || []} currentUserId={user.id} />
                    </div>
                </section>

                {/* Upcoming Objectives HUD */}
                <UpcomingObjectives 
                    tasks={tasks?.filter(t => t.status !== 'Delivered' && t.deadline).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()) || []} 
                    currentUserId={user.id} 
                />

                {/* Active Events */}
                <section>
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-2xl font-display font-bold text-white mb-2">ACTIVE PROJECTS</h2>
                            <p className="text-sm text-white/40 font-medium tracking-wide">Managing {events?.length} active media projects</p>
                        </div>
                        {profile?.role === 'MT' && (
                            <Link 
                                href="/dashboard/events/create" 
                                className="bg-cyan-neon text-black px-8 py-4 rounded-2xl font-display font-bold text-sm hover:scale-[1.05] active:scale-95 transition-all shadow-[0_0_30px_rgba(0,245,255,0.2)] flex items-center gap-3 uppercase tracking-widest"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                New Project
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events?.map((event) => (
                            <Link 
                                key={event.id} 
                                href={`/dashboard/events/${event.id}`}
                                className="group relative"
                            >
                                <div className="glass rounded-[2rem] p-8 border border-white/5 group-hover:border-cyan-neon/30 transition-all duration-500 relative overflow-hidden h-full flex flex-col">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-neon"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-1.5 h-6 bg-cyan-neon/40 rounded-full group-hover:bg-cyan-neon transition-colors"></div>
                                        <h3 className="text-xl font-display font-bold text-white group-hover:text-cyan-neon transition-colors truncate">{event.title}</h3>
                                    </div>
                                    
                                    <p className="text-sm text-white/40 mb-8 line-clamp-2 leading-relaxed flex-grow">
                                        {event.description || "Project details pending..."}
                                    </p>
                                    
                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest mb-1">Project Deadline</span>
                                            <span suppressHydrationWarning className="text-xs font-bold text-white/60">
                                                {event.end_date ? new Date(event.end_date).toLocaleDateString() : "TBD"}
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-cyan-neon group-hover:border-cyan-neon transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 group-hover:text-black transition-colors"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {(!events || events.length === 0) && (
                        <div className="text-center py-24 glass rounded-[3rem] border border-dashed border-white/10">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/10"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            </div>
                            <h3 className="text-lg font-display font-bold text-white mb-2">NO ACTIVE PROJECTS</h3>
                            <p className="text-sm text-white/30 max-w-xs mx-auto">There are no active projects to display at the moment.</p>
                            {profile?.role === 'MT' && (
                                <Link href="/dashboard/events/create" className="text-cyan-neon text-xs font-mono uppercase tracking-[0.2em] mt-8 inline-block hover:underline">
                                    Create Your First Project +
                                </Link>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
