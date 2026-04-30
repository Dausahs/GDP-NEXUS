
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic env parser
const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function listUsers() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log('--- AUTH USERS ---');
  users.forEach(u => console.log(`${u.id}: ${u.email}`));

  const { data: profiles } = await supabase.from('profiles').select('*');
  console.log('\n--- PROFILES ---');
  console.table(profiles);
}

listUsers();
