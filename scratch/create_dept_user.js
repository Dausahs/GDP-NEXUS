
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

async function createDeptUser() {
  const email = 'graphic@gdp.com';
  const password = 'password123';
  const fullName = 'Graphic Dept';
  const role = 'department';
  const department = 'Graphic';

  console.log(`Creating user: ${email}...`);

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError) {
    console.error('Error creating auth user:', authError.message);
    return;
  }

  const userId = authData.user.id;
  console.log(`Auth user created: ${userId}`);

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      full_name: fullName, 
      role: role,
      department: department
    })
    .eq('id', userId);

  if (profileError) {
    console.error('Error updating profile:', profileError.message);
    // If update fails, try insert (in case trigger didn't run)
    const { error: insertError } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId,
        full_name: fullName, 
        role: role,
        department: department
      });
    if (insertError) console.error('Error upserting profile:', insertError.message);
    else console.log('Profile upserted successfully.');
  } else {
    console.log('Profile updated successfully.');
  }
}

createDeptUser();
