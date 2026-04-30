// scripts/seed-users.mjs
// Run with: node scripts/seed-users.mjs
//
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
// Get it from: Supabase Dashboard → Project Settings → API → service_role key

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Parse .env.local manually
const envPath = resolve(process.cwd(), '.env.local')
const envVars = {}
readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.trim().split('=')
    if (key && vals.length) envVars[key] = vals.join('=')
})

const SUPABASE_URL = envVars['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_ROLE_KEY = envVars['SUPABASE_SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

// Admin client — uses service role key, bypasses RLS
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
})

const accounts = [
    {
        email: 'mt@mediateam.com',
        password: 'MediaTeam2026!',
        full_name: 'Media Team Lead',
        role: 'MT',
    },
    {
        email: 'penyelaras@mediateam.com',
        password: 'Penyelaras2026!',
        full_name: 'Penyelaras',
        role: 'Penyelaras',
    },
]

console.log('🚀 Creating accounts...\n')

for (const account of accounts) {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,   // skip email verification
    })

    if (authError) {
        console.error(`❌ Failed to create auth user for ${account.email}:`, authError.message)
        continue
    }

    const userId = authData.user.id

    // 2. Insert profile row
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            full_name: account.full_name,
            role: account.role,
        })

    if (profileError) {
        console.error(`⚠️  Auth user created but profile insert failed for ${account.email}:`, profileError.message)
        continue
    }

    console.log(`✅ Created [${account.role}]  ${account.email}  /  ${account.password}`)
}

console.log('\n✨ Done! You can now sign in at http://localhost:3000')
