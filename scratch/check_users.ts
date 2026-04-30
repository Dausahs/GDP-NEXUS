
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function listUsers() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers()
  if (error) {
    console.error('Error fetching users:', error)
    return
  }

  console.log('--- AUTH USERS ---')
  users.forEach(u => console.log(`${u.id}: ${u.email}`))

  const { data: profiles } = await supabase.from('profiles').select('*')
  console.log('\n--- PROFILES ---')
  console.table(profiles)
}

listUsers()
