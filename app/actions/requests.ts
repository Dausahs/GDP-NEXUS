'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

// ── Submit a new project request (organizer / Penyelaras) ────────────────────
export async function submitEventRequest(
    _prevState: { error?: string; success?: boolean },
    formData: FormData
): Promise<{ error?: string; success?: boolean }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'You must be signed in.' }

    const title       = (formData.get('title') as string)?.trim()
    const description = (formData.get('description') as string)?.trim()
    const startDate   = formData.get('startDate') as string
    const endDate     = formData.get('endDate') as string

    if (!title || !startDate || !endDate)
        return { error: 'Event name and both dates are required.' }

    const { error } = await supabase.from('event_requests').insert([{
        requester_id: user.id,
        title,
        description,
        start_date: startDate,
        end_date:   endDate,
        status:     'pending',
    }])

    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    return { success: true }
}

// ── Approve a pending request (MT only) ──────────────────────────────────────
export async function approveEventRequest(requestId: string): Promise<{ error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'MT') return { error: 'Only MT can approve requests.' }

    // Fetch the request
    const { data: req, error: fetchErr } = await supabase
        .from('event_requests')
        .select('*')
        .eq('id', requestId)
        .single()

    if (fetchErr || !req) return { error: 'Request not found.' }

    const admin = createAdminClient()

    // Create the actual event
    const { data: event, error: eventErr } = await admin.from('events').insert([{
        title:       req.title,
        description: req.description,
        start_date:  req.start_date,
        end_date:    req.end_date,
    }]).select().single()

    if (eventErr || !event) return { error: eventErr?.message ?? 'Failed to create event.' }

    // Add requester as an organizer member
    await admin.from('event_members').insert([{
        event_id: event.id,
        user_id:  req.requester_id,
        dept:     'Organizer',
        is_lead:  false,
    }])

    // Mark request as approved
    await admin.from('event_requests').update({ status: 'approved', reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq('id', requestId)

    revalidatePath('/dashboard')
    return {}
}

// ── Reject a pending request (MT only) ───────────────────────────────────────
export async function rejectEventRequest(requestId: string): Promise<{ error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'MT') return { error: 'Only MT can reject requests.' }

    const admin = createAdminClient()
    await admin.from('event_requests').update({ status: 'rejected', reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq('id', requestId)

    revalidatePath('/dashboard')
    return {}
}
