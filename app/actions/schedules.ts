'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertSchedule(
    eventId: string,
    userId: string,
    jobScope: 'Photographer' | 'Videographer',
    startTime: string,
    endTime: string,
    location?: string,
    scheduleId?: string
) {
    const supabase = await createClient()

    const data = {
        event_id: eventId,
        user_id: userId,
        job_scope: jobScope,
        start_time: startTime,
        end_time: endTime,
        location
    }

    let error
    if (scheduleId) {
        const { error: updateError } = await supabase
            .from('event_schedules')
            .update(data)
            .eq('id', scheduleId)
        error = updateError
    } else {
        const { error: insertError } = await supabase
            .from('event_schedules')
            .insert([data])
        error = insertError
    }

    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/events/${eventId}`)
}

export async function deleteSchedule(scheduleId: string, eventId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('event_schedules')
        .delete()
        .eq('id', scheduleId)

    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/events/${eventId}`)
}
