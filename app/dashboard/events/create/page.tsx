// app/dashboard/events/create/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EventForm from '@/components/EventForm'

export default async function CreateEventPage() {
    const supabase = await createClient()

    // 1. Get current user profile and role
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    // 2. Security Check: Only MT can create events
    if (profile?.role !== 'MT') {
        redirect('/dashboard')
    }

    // 3. Fetch all users to populate the Lead dropdowns
    const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .order('full_name', { ascending: true })

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
            <EventForm users={users || []} mtId={user?.id} />
        </div>
    )
}