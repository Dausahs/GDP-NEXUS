import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
    // We can query pg_policies using postgres sql via rpc, or we can just try to insert a task as anon to see if it works.
    // Actually, I can just use a raw postgres query if I have postgres string, but I don't.
    // I will write a simple fetch to get policies if possible, or I can just tell the user to run the policy SQL.
    console.log("Just testing");
}

test();
