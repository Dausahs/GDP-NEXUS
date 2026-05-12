// app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import GlobalCalendar from '@/components/GlobalCalendar'
import UpcomingObjectives from '@/components/UpcomingObjectives'
import GlobalSchedule from '@/components/GlobalSchedule'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/')

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

    let eventsQuery = supabase
        .from('events')
        .select('id, title, description, end_date, event_members(user_id, dept, profiles(full_name))')
        .order('end_date', { ascending: true })

    if (profile?.role === 'Penyelaras' || profile?.role === 'organizer') {
        const { data: memberEvents } = await supabase
            .from('event_members')
            .select('event_id')
            .eq('user_id', user.id)
        const eventIds = memberEvents?.map(me => me.event_id) || []
        eventsQuery = eventsQuery.in('id', eventIds)
    }

    const { data: events } = await eventsQuery
    const eventIds = events?.map(e => e.id) || []

    const { data: tasks } = await supabase
        .from('tasks')
        .select('*, events(title, event_members(user_id, dept, profiles(full_name))), task_assignees(user_id)')
        .in('event_id', eventIds)

    const { data: teamMembers } = await supabase
        .from('profiles')
        .select('user_id:id, profiles:full_name')
        .in('role', ['MT', 'Penyelaras'])

    const combinedMembers = teamMembers?.map((m: any) => ({
        user_id: m.user_id,
        profiles: { full_name: m.profiles }
    })) || []

    const { data: globalSchedules } = await supabase
        .from('event_schedules')
        .select('*, profiles(full_name), events(title)')
        .in('event_id', eventIds)

    return (
        <div className="min-h-screen bg-bg text-text-primary">

            {/* Header */}
            <header className="border-b border-border bg-bg-elevated px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                            <circle cx="12" cy="12" r="3" fill="white" stroke="none" />
                        </svg>
                    </div>
                    <span className="font-display font-semibold text-base text-text-primary tracking-tight">GDP Nexus</span>
                </div>

                <div className="flex items-center gap-3">
                    {(profile?.role === 'MT' || profile?.role === 'Penyelaras') && (
                        <Link
                            href="/dashboard/assets"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            Inventory
                        </Link>
                    )}
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-xs font-medium text-text-primary">{profile?.full_name}</span>
                        <span className="text-[10px] text-text-muted">{profile?.role}</span>
                    </div>
                    <form action={signOut}>
                        <button type="submit" className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors" title="Sign out">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        </button>
                    </form>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">

                {/* Calendar */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Project Timeline</h2>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-success rounded-full" />
                            <span className="text-xs text-text-muted">Live</span>
                        </div>
                    </div>
                    <div className="card overflow-hidden">
                        <GlobalCalendar tasks={tasks || []} activeEvents={events || []} currentUserId={user.id} userRole={profile?.role} teamMembers={combinedMembers} />
                    </div>
                </section>

                {/* Upcoming Tasks */}
                <UpcomingObjectives
                    tasks={tasks?.filter(t => t.status !== 'Delivered' && t.deadline).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()) || []}
                    activeEvents={events || []}
                    currentUserId={user.id}
                    userRole={profile?.role}
                />

                {/* Global Schedule */}
                <GlobalSchedule schedules={globalSchedules || []} />

                {/* Active Projects */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">Active Projects</h2>
                            <p className="text-xs text-text-muted">{events?.length || 0} project{events?.length !== 1 ? 's' : ''}</p>
                        </div>
                        {profile?.role === 'MT' && (
                            <Link
                                href="/dashboard/events/create"
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-medium transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                New project
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {events?.map((event) => (
                            <Link key={event.id} href={`/dashboard/events/${event.id}`} className="group">
                                <div className="card p-5 hover:border-border-hover transition-colors h-full flex flex-col">
                                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-2 truncate">
                                        {event.title}
                                    </h3>
                                    <p className="text-xs text-text-secondary leading-relaxed flex-1 line-clamp-2">
                                        {event.description || 'No description provided.'}
                                    </p>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                        <div>
                                            <p className="text-[10px] text-text-muted mb-0.5">Deadline</p>
                                            <p suppressHydrationWarning className="text-xs font-medium text-text-secondary">
                                                {event.end_date ? new Date(event.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                            </p>
                                        </div>
                                        <div className="w-6 h-6 rounded-md bg-bg-subtle border border-border flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted group-hover:text-white transition-colors"><polyline points="9 18 15 12 9 6"/></svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {(!events || events.length === 0) && (
                        <div className="card p-16 text-center border-dashed">
                            <p className="text-sm text-text-muted">No active projects</p>
                            {profile?.role === 'MT' && (
                                <Link href="/dashboard/events/create" className="text-xs text-accent hover:underline mt-3 inline-block">
                                    Create your first project →
                                </Link>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
