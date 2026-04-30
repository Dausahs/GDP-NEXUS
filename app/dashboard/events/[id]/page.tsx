// app/dashboard/events/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import KanbanBoard from '@/components/KanbanBoard'
import AddTaskModal from '@/components/AddTaskModal'
import EventCalendar from '@/components/EventCalendar'
import EventSettingsModal from '@/components/EventSettingsModal'
import UpcomingObjectives from '@/components/UpcomingObjectives'

export const dynamic = 'force-dynamic'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  const supabase = await createClient()
  const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Fetch current user and their role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: userProfile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()

  // 2. Fetch Event, Tasks, Members, and global profiles in parallel
  const [eventRes, tasksRes, membersRes, profilesRes] = await Promise.all([
    supabase.from('events').select('*').eq('id', id).single(),
    supabase.from('tasks').select('*, task_assignees(user_id, profiles(full_name)), task_comments(id, content, created_at, profiles(full_name))').eq('event_id', id),
    supabase.from('event_members').select('*, profiles(full_name)').eq('event_id', id),
    adminSupabase.from('profiles').select('id, full_name, role').in('role', ['MT', 'Penyelaras'])
  ])

  if (!eventRes.data) notFound()

  // Combine event members and MT/Penyelaras into a single unique list for the dropdown
  const uniqueMembersMap = new Map()
  
  // Add direct event members first
  if (membersRes.data) {
      membersRes.data.forEach((m: any) => {
          uniqueMembersMap.set(m.user_id, { user_id: m.user_id, profiles: m.profiles })
      })
  }

  // Add global MT and Penyelaras
  if (profilesRes.data) {
      profilesRes.data.forEach((p: any) => {
          if (!uniqueMembersMap.has(p.id)) {
              uniqueMembersMap.set(p.id, { user_id: p.id, profiles: { full_name: p.full_name + ` (${p.role})` } })
          }
      })
  }

  const combinedMembers = Array.from(uniqueMembersMap.values())

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-cyan-neon/30 p-4 md:p-8 space-y-8 md:space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8">
        <div className="space-y-4 max-w-2xl w-full">
          <div className="flex items-center gap-4 md:gap-6">
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white leading-tight">
              {eventRes.data.title}
            </h1>
            {userProfile?.role === 'MT' && (
              <div className="pt-2">
                <EventSettingsModal event={eventRes.data} />
              </div>
            )}
          </div>
          <div className="laser-line opacity-20"></div>
          <p className="text-sm md:text-base text-white/50 leading-relaxed font-medium italic">
            {eventRes.data.description || 'Project details not specified.'}
          </p>
        </div>
        <div className="w-full md:w-auto md:sticky md:top-8 z-20">
          <AddTaskModal eventId={id} teamMembers={combinedMembers} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:gap-12">
        {/* Kanban Board Container */}
        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-1.5 h-6 bg-cyan-neon rounded-full shadow-[0_0_10px_rgba(0,245,255,0.5)]"></div>
            <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest text-sm md:text-lg">Project Kanban</h2>
          </div>
          <div className="glass rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8 border border-white/5 shadow-2xl overflow-x-auto">
            <KanbanBoard initialTasks={tasksRes.data || []} eventId={id} userRole={userProfile?.role} />
          </div>
        </section>

        {/* Calendar View Container */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-violet-neon rounded-full shadow-[0_0_10px_rgba(138,43,226,0.5)]"></div>
            <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest">Project Calendar</h2>
          </div>
          <div className="glass rounded-[2.5rem] p-2 border border-white/5 shadow-2xl overflow-hidden">
            <EventCalendar tasks={tasksRes.data || []} teamMembers={membersRes.data || []} currentUserId={user?.id} />
          </div>
        </section>

        {/* Project Specific Upcoming Tasks */}
        <UpcomingObjectives 
          tasks={tasksRes.data?.filter(t => t.status !== 'Delivered' && t.deadline).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()) || []} 
          currentUserId={user?.id || ''} 
        />
      </div>
    </div>
  )
}
