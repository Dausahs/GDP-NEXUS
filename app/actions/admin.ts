// app/actions/admin.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

const ADMIN_EMAIL = 'firdausrosalan24@gmail.com'

async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
        throw new Error('Unauthorized: Admin access only')
    }
    return user
}

export async function createUserAccount(formData: FormData) {
    await requireAdmin()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string
    const role = formData.get('role') as string

    if (!email || !password || !fullName || !role) {
        return { error: 'All fields are required' }
    }

    const validRoles = ['MT', 'Penyelaras', 'organizer']
    if (!validRoles.includes(role)) {
        return { error: 'Invalid role selected' }
    }

    const admin = createAdminClient()

    // 1. Create the auth user via admin API (bypasses email confirmation)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    })

    if (authError) {
        return { error: authError.message }
    }

    const userId = authData.user.id

    // 2. Upsert profile row
    const { error: profileError } = await admin
        .from('profiles')
        .upsert({
            id: userId,
            full_name: fullName,
            role,
        })

    if (profileError) {
        // Rollback auth user if profile insert fails
        await admin.auth.admin.deleteUser(userId)
        return { error: `Profile creation failed: ${profileError.message}` }
    }

    revalidatePath('/admin')
    return { success: true, userId }
}

export async function listAllUsers() {
    await requireAdmin()

    const admin = createAdminClient()

    const { data, error } = await admin
        .from('profiles')
        .select('id, full_name, role')
        .order('full_name', { ascending: true })

    if (error) return { error: error.message, users: [] }

    // Fetch emails from auth.users via admin API
    const { data: authUsers, error: authErr } = await admin.auth.admin.listUsers({
        perPage: 1000,
    })

    const emailMap: Record<string, string> = {}
    if (!authErr && authUsers?.users) {
        authUsers.users.forEach(u => {
            if (u.email) emailMap[u.id] = u.email
        })
    }

    const users = (data || []).map(p => ({
        id: p.id,
        full_name: p.full_name,
        role: p.role,
        email: emailMap[p.id] ?? '—',
    }))

    return { users, error: null }
}

export async function deleteUserAccount(userId: string) {
    await requireAdmin()

    const admin = createAdminClient()

    // Delete profile first (FK cascades or not — handle both)
    await admin.from('profiles').delete().eq('id', userId)

    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true }
}
