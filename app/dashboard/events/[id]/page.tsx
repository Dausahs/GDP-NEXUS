// app/dashboard/events/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import KanbanBoard from '@/components/KanbanBoard'
import AddTaskModal from '@/components/AddTaskModal'
import ImportTasksModal from '@/components/ImportTasksModal'
import EventCalendar from '@/components/EventCalendar'
import EventSettingsModal from '@/components/EventSettingsModal'
import ManageMembersModal from '@/components/ManageMembersModal'
import UpcomingObjectives from '@/components/UpcomingObjectives'
import EventSchedule from '@/components/EventSchedule'

export const dynamic = 'force-dynamic'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  const supabase = await createClient()
  const adminSupabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: userProfile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()

  const [eventRes, tasksRes, membersRes, profilesRes, schedulesRes, organizerProfilesRes] = await Promise.all([
    supabase.from('events').select('*').eq('id', id).single(),
    supabase.from('tasks').select('*, task_assignees(user_id, profiles(full_name)), task_comments(id, content, created_at, profiles(full_name))').eq('event_id', id),
    supabase.from('event_members').select('*, profiles(full_name)').eq('event_id', id),
    supabase.from('profiles').select('id, full_name, role').in('role', ['MT', 'Penyelaras']),
    supabase.from('event_schedules').select('*, profiles(full_name)').eq('event_id', id),
    supabase.from('profiles').select('id, full_name').eq('role', 'organizer').order('full_name'),
  ])

  if (!eventRes.data) notFound()

  if (userProfile?.role === 'Penyelaras' || userProfile?.role === 'organizer') {
    const isMember = membersRes.data?.some((m: any) => m.user_id === user?.id)
    if (!isMember) notFound()
  }

  const uniqueMembersMap = new Map()
  if (membersRes.data) {
    membersRes.data.forEach((m: any) => {
      uniqueMembersMap.set(m.user_id, { user_id: m.user_id, profiles: m.profiles })
    })
  }
  if (profilesRes.data) {
    profilesRes.data.forEach((p: any) => {
      if (!uniqueMembersMap.has(p.id)) {
        uniqueMembersMap.set(p.id, { user_id: p.id, profiles: { full_name: p.full_name + ` (${p.role})` } })
      }
    })
  }
  const combinedMembers = Array.from(uniqueMembersMap.values())

  // Organizer data for settings modal
  const allOrganizers = organizerProfilesRes.data || []
  const currentOrganizerIds = (membersRes.data || [])
    .filter((m: any) => m.dept === 'Organizer')
    .map((m: any) => m.user_id)

  return (
    <div className="min-h-screen bg-bg text-text-primary p-4 md:p-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6">
        <div className="space-y-2 max-w-2xl w-full">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-text-primary tracking-tight leading-tight">
              {eventRes.data.title}
            </h1>
            <div className="flex items-center gap-1">
              {userProfile?.role === 'MT' && (
                <EventSettingsModal
                  event={eventRes.data}
                  allOrganizers={allOrganizers}
                  currentOrganizers={currentOrganizerIds}
                />
              )}
              {(userProfile?.role === 'MT' || userProfile?.role === 'Penyelaras') && (
                <ManageMembersModal
                  eventId={id}
                  allStaff={profilesRes.data || []}
                  currentMembers={(membersRes.data || [])
                    .filter((m: any) => m.dept === 'Member')
                    .map((m: any) => m.user_id)}
                />
              )}
            </div>
          </div>
          {eventRes.data.description && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {eventRes.data.description}
            </p>
          )}
        </div>
        <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
          {userProfile?.role === 'MT' && (
            <ImportTasksModal eventId={id} teamMembers={combinedMembers} />
          )}
          <AddTaskModal eventId={id} teamMembers={combinedMembers} userRole={userProfile?.role} />
        </div>
      </div>

      <div className="space-y-8">

        {/* Kanban */}
        <section>
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Kanban Board</h2>
          <div className="card p-4 md:p-6 overflow-x-auto">
            <KanbanBoard initialTasks={tasksRes.data || []} eventId={id} userRole={userProfile?.role} teamMembers={combinedMembers} />
          </div>
        </section>

        {/* Calendar */}
        <section>
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Project Calendar</h2>
          <div className="card overflow-hidden">
            <EventCalendar tasks={tasksRes.data || []} teamMembers={membersRes.data || []} currentUserId={user?.id} />
          </div>
        </section>

        {/* Upcoming Tasks */}
        <UpcomingObjectives
          tasks={tasksRes.data?.filter(t => t.status !== 'Delivered' && t.deadline).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()) || []}
          currentUserId={user?.id || ''}
        />

        {/* Working Schedule */}
        <EventSchedule
          eventId={id}
          schedules={schedulesRes.data || []}
          teamMembers={combinedMembers}
          userRole={userProfile?.role}
        />
      </div>
    </div>
  )
}
