// utils/supabase/admin.ts
// Admin client using @supabase/supabase-js (standard Node/backend pattern)
// ⚠️ Server-only — never import this in client components

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin credentials in environment variables')
}

// Use this client strictly for admin operations that need to bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
})

// Named factory function for consistency with the rest of the codebase
export function createAdminClient() {
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    })
}
