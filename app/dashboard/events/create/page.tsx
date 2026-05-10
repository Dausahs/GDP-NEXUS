// app/dashboard/events/create/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EventForm from '@/components/EventForm'

export default async function CreateEventPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    if (profile?.role !== 'MT') redirect('/dashboard')

    const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .order('full_name', { ascending: true })

    return (
        <div className="min-h-screen bg-bg text-text-primary">
            <div className="max-w-2xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        Back to dashboard
                    </Link>
                    <h1 className="text-2xl font-display font-semibold text-text-primary tracking-tight">New project</h1>
                    <p className="text-sm text-text-secondary mt-1">Set up a new media project and assign your team.</p>
                </div>
                <EventForm users={users || []} mtId={user?.id} />
            </div>
        </div>
    )
}