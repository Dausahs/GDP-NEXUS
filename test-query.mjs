import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
    const { data, error } = await supabase
        .from('tasks')
        .select('*, events(title, event_members(user_id, dept, profiles(full_name)))')
        .limit(1);
    console.dir(data, { depth: null });
    console.error(error);
}

test();
