// app/admin/page.tsx — Admin panel (firdausrosalan24@gmail.com only)
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { listAllUsers } from '@/app/actions/admin'
import AdminPanel from '@/components/AdminPanel'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'firdausrosalan24@gmail.com'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')
    if (user.email !== ADMIN_EMAIL) redirect('/dashboard')

    const { users, error } = await listAllUsers()

    return <AdminPanel users={users ?? []} listError={error ?? null} />
}
