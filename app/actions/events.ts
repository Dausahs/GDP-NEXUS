// app/actions/events.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type EventFormState = {
    error?: string
}

export async function createEvent(
    _prevState: EventFormState,
    formData: FormData
): Promise<EventFormState> {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string

    // Leads — map dept name to user selection
    const leads = [
        { userId: formData.get('picId') as string,            dept: 'PIC' },
        { userId: formData.get('graphicLeadId') as string,    dept: 'Graphics' },
        { userId: formData.get('productionLeadId') as string, dept: 'Production' },
        { userId: formData.get('videoLeadId') as string,      dept: 'Video' },
        { userId: formData.get('photoLeadId') as string,      dept: 'Photo' },
    ]
    
    const organizerIds = formData.getAll('organizerId') as string[]
    
    // 1. Insert Event
    const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([{ title, description, start_date: startDate, end_date: endDate }])
        .select()
        .single()

    if (eventError) return { error: eventError.message }

    // 2. Prepare member entries
    const memberEntries = []

    // Add all selected Organizers
    for (const organizerId of organizerIds) {
        if (organizerId) {
            memberEntries.push({
                event_id: event.id,
                user_id: organizerId,
                dept: 'Organizer',
                is_lead: false,
            })
        }
    }

    // Add Leads
    leads.forEach(lead => {
        if (lead.userId) {
            memberEntries.push({
                event_id: event.id,
                user_id: lead.userId,
                dept: lead.dept,
                is_lead: true,
            })
        }
    })

    if (memberEntries.length > 0) {
        const { error: memberError } = await supabase
            .from('event_members')
            .insert(memberEntries)

        if (memberError) return { error: memberError.message }
    }
    revalidatePath('/dashboard')
    redirect('/dashboard')
}

export async function updateEvent(eventId: string, title: string, description: string, endDate: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('events')
        .update({ title, description, end_date: endDate })
        .eq('id', eventId)

    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/events/${eventId}`)
    revalidatePath('/dashboard')
}

export async function deleteEvent(eventId: string) {
    const supabase = await createClient()
    const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // 1. Server-side security check
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
    
    if (profile?.role !== 'MT') {
        throw new Error("Only MT (Majlis Tertinggi) members can delete events.")
    }

    // 2. Unset assets currently locked to this event
    await adminSupabase.from('assets')
        .update({ current_event_id: null, current_user_id: null, status: 'Available' })
        .eq('current_event_id', eventId)

    // 3. Delete asset logs
    await adminSupabase.from('asset_logs').delete().eq('event_id', eventId)

    // 4. Fetch all task IDs for this event
    const { data: tasks } = await adminSupabase.from('tasks').select('id').eq('event_id', eventId)
    const taskIds = tasks?.map(t => t.id) || []

    if (taskIds.length > 0) {
        // 5. Delete task comments and assignees
        await adminSupabase.from('task_comments').delete().in('task_id', taskIds)
        await adminSupabase.from('task_assignees').delete().in('task_id', taskIds)
        // 6. Delete tasks
        await adminSupabase.from('tasks').delete().in('id', taskIds)
    }

    // 7. Delete event members
    await adminSupabase.from('event_members').delete().eq('event_id', eventId)

    // 8. Finally delete the event using the admin client to bypass RLS issues
    const { error } = await adminSupabase
        .from('events')
        .delete()
        .eq('id', eventId)

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard')
    redirect('/dashboard')
}

/** Replace the full set of organizers for an existing event */
export async function updateEventOrganizers(eventId: string, organizerIds: string[]) {
    const supabase = await createClient()

    // Security check
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
    if (profile?.role !== 'MT') throw new Error('Unauthorized')

    // Remove all existing organizer entries for this event
    const { error: delError } = await supabase
        .from('event_members')
        .delete()
        .eq('event_id', eventId)
        .eq('dept', 'Organizer')

    if (delError) throw new Error(delError.message)

    // Insert the new set
    if (organizerIds.length > 0) {
        const entries = organizerIds.map(userId => ({
            event_id: eventId,
            user_id: userId,
            dept: 'Organizer',
            is_lead: false,
        }))
        const { error: insertError } = await supabase.from('event_members').insert(entries)
        if (insertError) throw new Error(insertError.message)
    }

    revalidatePath(`/dashboard/events/${eventId}`)
}


